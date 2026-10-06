'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Project, ProjectSummary, WorkflowStage, ProblemType } from '@/types';
import { toast } from 'sonner';
import { getSavedProblemType } from '@/config/problem-types';

interface LoadedProjectData {
  isLegacy: boolean;
  problemType: ProblemType;
  isCompleted: boolean;
  userInput: string;
  initialIdea: string;
  finalDocument: string;
  expertReports: Project['expertReports'];
  needSensingData: Project['needSensingData'];
  showAdviceSummary: boolean;
  selectedDirection: string | null;
  currentStage: WorkflowStage;
}

interface UseProjectReturn {
  resetProject: () => void;
  projectId: string | null;
  projectList: ProjectSummary[];
  isLoadingList: boolean;
  createNewProject: (title?: string) => Promise<string | null>;
  loadProject: (id: string) => Promise<LoadedProjectData | null>;
  saveProject: (data: Record<string, unknown>) => void;
  deleteProject: (id: string) => Promise<boolean>;
  refreshList: () => Promise<void>;
}

export function useProject(): UseProjectReturn {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectList, setProjectList] = useState<ProjectSummary[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<(() => Promise<void>) | null>(null);
  const projectIdRef = useRef<string | null>(null);

  const flushSave = useCallback(async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = null;
    const pending = pendingSaveRef.current;
    pendingSaveRef.current = null;
    await pending?.();
  }, []);

  const resetProject = useCallback(() => {
    void flushSave();
    projectIdRef.current = null;
    setProjectId(null);
  }, [flushSave]);

  const refreshList = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjectList(data.projects || []);
      }
    } catch {
      // silent fail
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  // Load project list on mount
  useEffect(() => {
    void Promise.resolve().then(refreshList);
  }, [refreshList]);

  const createNewProject = useCallback(async (title?: string): Promise<string | null> => {
    await flushSave();
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || '' }),
      });
      if (!res.ok) throw new Error('Failed to create project');
      const data = await res.json();
      const id = data.project.id;
      setProjectId(id);
      projectIdRef.current = id;
      // Refresh list in background
      refreshList();
      return id;
    } catch {
      toast.error('创建项目失败');
      return null;
    }
  }, [refreshList, flushSave]);

  const loadProject = useCallback(async (id: string): Promise<LoadedProjectData | null> => {
    await flushSave();
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error('Failed to load project');
      const data = await res.json();
      const project: Project = data.project;
      setProjectId(project.id);
      projectIdRef.current = project.id;
      return {
        problemType: getSavedProblemType(project.problemType),
        isLegacy: project.workflowVersion !== 2,
        isCompleted: project.workflowVersion === 2 && project.isCompleted,
        userInput: project.userInput,
        initialIdea: project.initialIdea,
        finalDocument: project.finalDocument,
        expertReports: project.expertReports,
        needSensingData: project.needSensingData,
        showAdviceSummary: project.showAdviceSummary,
        selectedDirection: project.selectedDirection,
        currentStage: project.currentStage,
      };
    } catch {
      toast.error('加载项目失败');
      return null;
    }
  }, [flushSave]);

  const saveProject = useCallback((data: Record<string, unknown>) => {
    const pid = projectIdRef.current;
    if (!pid) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    // Capture the project and payload together so a delayed save cannot cross projects.
    const updateData = { ...data, updatedAt: new Date().toISOString() };
    pendingSaveRef.current = async () => {
      try {
        await fetch(`/api/projects/${pid}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });
        void refreshList();
      } catch { /* preserve the current UI if automatic save fails */ }
    };
    saveTimerRef.current = setTimeout(() => { void flushSave(); }, 500);
  }, [refreshList, flushSave]);

  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    await flushSave();
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      // If deleting current project, clear projectId
      if (projectIdRef.current === id) {
        setProjectId(null);
        projectIdRef.current = null;
      }
      await refreshList();
      toast.success('项目已删除');
      return true;
    } catch {
      toast.error('删除项目失败');
      return false;
    }
  }, [refreshList, flushSave]);

  useEffect(() => () => { void flushSave(); }, [flushSave]);

  return {
    resetProject,
    projectId,
    projectList,
    isLoadingList,
    createNewProject,
    loadProject,
    saveProject,
    deleteProject,
    refreshList,
  };
}
