'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Project, ProjectSummary, WorkflowStage } from '@/types';
import { toast } from 'sonner';

interface LoadedProjectData {
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
  const latestDataRef = useRef<Record<string, unknown>>({});
  const projectIdRef = useRef<string | null>(null);

  // Keep ref in sync
  useEffect(() => {
    projectIdRef.current = projectId;
  }, [projectId]);

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
    refreshList();
  }, [refreshList]);

  const createNewProject = useCallback(async (title?: string): Promise<string | null> => {
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
  }, [refreshList]);

  const loadProject = useCallback(async (id: string): Promise<LoadedProjectData | null> => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error('Failed to load project');
      const data = await res.json();
      const project: Project = data.project;
      setProjectId(project.id);
      projectIdRef.current = project.id;
      return {
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
  }, []);

  const saveProject = useCallback((data: Record<string, unknown>) => {
    latestDataRef.current = { ...latestDataRef.current, ...data };

    // Debounce 500ms
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      const pid = projectIdRef.current;
      if (!pid) return;

      try {
        // Build the update payload from latest data
        const updateData: Record<string, unknown> = {
          ...latestDataRef.current,
          updatedAt: new Date().toISOString(),
        };

        // Strip isGenerating and other non-persistable fields
        delete updateData.isGenerating;
        delete updateData.language;

        await fetch(`/api/projects/${pid}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });
        // Refresh list silently
        refreshList();
      } catch {
        // Silent fail on auto-save
      }
    }, 500);
  }, [refreshList]);

  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
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
  }, [refreshList]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        // Final save on unmount
        const pid = projectIdRef.current;
        if (pid) {
          fetch(`/api/projects/${pid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...latestDataRef.current,
              updatedAt: new Date().toISOString(),
            }),
          }).catch(() => {});
        }
      }
    };
  }, []);

  return {
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
