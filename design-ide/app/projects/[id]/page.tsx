'use client';

import { use, useState, useCallback } from 'react';
import { useProject } from '@/hooks/useProject';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { VariantGrid } from '@/components/prototype/VariantGrid';
import { FeedbackPanel } from '@/components/feedback/FeedbackPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Palette,
  FolderOpen,
  Download,
  Github,
  PanelLeftClose,
  PanelRightClose,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VariantData } from '@/components/prototype/VariantCard';
import type { ProjectPhase } from '@/lib/db/types';

const phaseLabels: Record<ProjectPhase, string> = {
  describe: 'Describe',
  prototype: 'Prototype',
  iterate: 'Iterate',
  build: 'Build',
  export: 'Export',
};

const phaseDescriptions: Record<ProjectPhase, string> = {
  describe: 'Describe what you want to build',
  prototype: 'Review and compare variants',
  iterate: 'Refine based on feedback',
  build: 'Generate full implementation',
  export: 'Export your project',
};

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const project = useProject(id);

  const [showChat, setShowChat] = useState(true);
  const [showFeedback, setShowFeedback] = useState(true);

  const handleVariantsGenerated = useCallback(
    (variants: VariantData[]) => {
      project.setVariants(variants);
    },
    [project]
  );

  const handlePhaseChange = useCallback(
    (phase: ProjectPhase) => {
      project.setPhase(phase);
    },
    [project]
  );

  const handleFeedback = useCallback(
    (variantId: string) => {
      project.selectVariant(variantId);
      setShowFeedback(true);
    },
    [project]
  );

  const handleSubmitFeedback = useCallback(() => {
    // This would send feedback to the AI for processing
    // For now, we'll just log it
    console.log('Submitting feedback:', project.feedback);
    project.clearFeedback();
  }, [project]);

  const isDescribePhase = project.phase === 'describe';
  const hasVariants = project.variants.length > 0;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <span className="font-semibold">Design IDE</span>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <Badge variant="outline">{phaseLabels[project.phase]}</Badge>
            <span className="text-sm text-muted-foreground">
              {phaseDescriptions[project.phase]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>My Projects</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Github className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Push to GitHub</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Chat */}
        <div
          className={cn(
            'border-r flex flex-col transition-all duration-300',
            showChat ? 'w-96' : 'w-0'
          )}
        >
          {showChat && (
            <ChatPanel
              projectId={id}
              onVariantsGenerated={handleVariantsGenerated}
              onPhaseChange={handlePhaseChange}
              className="flex-1"
            />
          )}
        </div>

        {/* Toggle chat button */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 -left-3 z-10 h-6 w-6 rounded-full border bg-background shadow-sm"
            onClick={() => setShowChat(!showChat)}
          >
            {showChat ? (
              <PanelLeftClose className="h-3 w-3" />
            ) : (
              <MessageSquare className="h-3 w-3" />
            )}
          </Button>
        </div>

        {/* Main content - Variants */}
        <div className="flex-1 flex flex-col min-w-0">
          {isDescribePhase && !hasVariants ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center max-w-md">
                <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-semibold mb-2">
                  Ready to create something amazing?
                </h2>
                <p className="text-sm">
                  Describe what you want to build in the chat, and I&apos;ll generate
                  5 different design variants for you to explore.
                </p>
              </div>
            </div>
          ) : (
            <VariantGrid
              variants={project.variants}
              selectedVariantId={project.selectedVariantId}
              onSelectVariant={project.selectVariant}
              onApproveVariant={project.approveVariant}
              onFeedback={handleFeedback}
              className="flex-1"
            />
          )}
        </div>

        {/* Toggle feedback button */}
        {hasVariants && (
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 -right-3 z-10 h-6 w-6 rounded-full border bg-background shadow-sm"
              onClick={() => setShowFeedback(!showFeedback)}
            >
              {showFeedback ? (
                <PanelRightClose className="h-3 w-3" />
              ) : (
                <MessageSquare className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}

        {/* Right sidebar - Feedback */}
        {hasVariants && (
          <div
            className={cn(
              'border-l transition-all duration-300',
              showFeedback ? 'w-80' : 'w-0'
            )}
          >
            {showFeedback && (
              <FeedbackPanel
                feedback={project.feedback}
                onAddFeedback={project.addFeedback}
                onRemoveFeedback={project.removeFeedback}
                onSubmitAllFeedback={handleSubmitFeedback}
                selectedVariantId={project.selectedVariantId}
                className="h-full"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
