'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FolderOpen, Trash2, FileText, Plus, Loader2 } from 'lucide-react';
import { ProjectSummary, WorkflowStage } from '@/types';

interface ProjectListProps {
  projectList: ProjectSummary[];
  isLoading: boolean;
  onOpenProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onNewProject: () => void;
}

const STAGE_LABELS: Record<WorkflowStage, string> = {
  'need-sensing': '需求感知',
  'input': '灵感输入',
  'initial-idea': '初步构想',
  'expert-review': '专家考验',
  'synthesis': '终极熔铸',
};

const STAGE_COLORS: Record<WorkflowStage, string> = {
  'need-sensing': 'bg-slate-600',
  'input': 'bg-blue-500/30 text-blue-300 border-blue-500/30',
  'initial-idea': 'bg-cyan-500/30 text-cyan-300 border-cyan-500/30',
  'expert-review': 'bg-orange-500/30 text-orange-300 border-orange-500/30',
  'synthesis': 'bg-green-500/30 text-green-300 border-green-500/30',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(dateStr).toLocaleDateString('zh-CN');
}

export function ProjectList({
  projectList,
  isLoading,
  onOpenProject,
  onDeleteProject,
  onNewProject,
}: ProjectListProps) {
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpen = (id: string) => {
    onOpenProject(id);
    setOpen(false);
  };

  const handleDelete = () => {
    if (deletingId) {
      onDeleteProject(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm"
          >
            <FolderOpen className="w-4 h-4" />
            我的项目
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[420px] sm:max-w-[420px] bg-slate-900 border-slate-700 text-white p-0">
          <SheetHeader className="p-5 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-white flex items-center gap-2 text-base">
                <FolderOpen className="w-4 h-4 text-orange-400" />
                我的项目
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { onNewProject(); setOpen(false); }}
                className="text-xs text-orange-400 hover:text-orange-300 h-7"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                新建项目
              </Button>
            </div>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-80px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
              </div>
            ) : projectList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 px-6">
                <FileText className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">暂无项目</p>
                <p className="text-xs mt-1 text-center">开始一个新的需求分析，系统会自动创建项目并保存全部过程数据</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { onNewProject(); setOpen(false); }}
                  className="mt-4 border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  新建项目
                </Button>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {projectList.map(project => (
                  <div
                    key={project.id}
                    className={`rounded-lg border p-3 transition-colors cursor-pointer group ${
                      project.isCompleted
                        ? 'border-green-500/20 bg-slate-800/50 hover:border-green-500/40'
                        : 'border-orange-500/20 bg-slate-800/50 hover:border-orange-500/40'
                    }`}
                    onClick={() => handleOpen(project.id)}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-medium truncate">{project.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 h-4 ${STAGE_COLORS[project.currentStage] || 'bg-slate-600'}`}
                          >
                            {STAGE_LABELS[project.currentStage] || project.currentStage}
                          </Badge>
                          <span className="text-slate-500 text-[10px]">{timeAgo(project.updatedAt)}</span>
                          {project.isCompleted && (
                            <span className="text-green-500 text-[10px]">✓ 已完成</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(project.id);
                          }}
                          className="h-7 w-7 p-0 text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    {/* Progress bar */}
                    {project.progress > 0 && (
                      <div className="w-full h-1 bg-slate-700 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(v) => { if (!v) setDeletingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除项目？</AlertDialogTitle>
            <AlertDialogDescription>
              删除后项目数据将无法恢复。此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingId(null)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
