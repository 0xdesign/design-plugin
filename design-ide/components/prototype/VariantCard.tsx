'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SandpackPreview } from './SandpackPreview';
import { Check, Code, Expand, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VariantFocusArea } from '@/lib/db/types';

export interface VariantData {
  id: string;
  name: string;
  description: string;
  focusArea: VariantFocusArea;
  code: string;
  rationale: string;
  isApproved?: boolean;
}

interface VariantCardProps {
  variant: VariantData;
  isSelected: boolean;
  onSelect: () => void;
  onExpand: () => void;
  onFeedback: () => void;
  onApprove: () => void;
  compact?: boolean;
}

const focusAreaColors: Record<VariantFocusArea, string> = {
  layout: 'bg-blue-100 text-blue-800',
  hierarchy: 'bg-purple-100 text-purple-800',
  density: 'bg-green-100 text-green-800',
  interaction: 'bg-orange-100 text-orange-800',
  expression: 'bg-pink-100 text-pink-800',
};

const focusAreaLabels: Record<VariantFocusArea, string> = {
  layout: 'Layout',
  hierarchy: 'Hierarchy',
  density: 'Density',
  interaction: 'Interaction',
  expression: 'Expression',
};

export function VariantCard({
  variant,
  isSelected,
  onSelect,
  onExpand,
  onFeedback,
  onApprove,
  compact = false,
}: VariantCardProps) {
  const [showCode, setShowCode] = useState(false);

  return (
    <Card
      className={cn(
        'variant-card cursor-pointer transition-all duration-200 overflow-hidden',
        isSelected && 'ring-2 ring-primary shadow-lg',
        variant.isApproved && 'ring-2 ring-green-500'
      )}
      onClick={onSelect}
    >
      <CardHeader className="p-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-muted-foreground">
                {variant.id}
              </span>
              <CardTitle className="text-sm font-medium truncate">
                {variant.name}
              </CardTitle>
            </div>
            {!compact && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {variant.description}
              </p>
            )}
          </div>
          <Badge
            className={cn(
              'text-[10px] shrink-0',
              focusAreaColors[variant.focusArea]
            )}
          >
            {focusAreaLabels[variant.focusArea]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Preview area */}
        <div
          className={cn(
            'relative bg-gray-50',
            compact ? 'h-32' : 'h-48'
          )}
        >
          <SandpackPreview
            code={variant.code}
            showCode={showCode}
            className="h-full"
          />

          {/* Overlay actions */}
          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCode(!showCode);
                    }}
                  >
                    <Code className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle code view</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExpand();
                    }}
                  >
                    <Expand className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Expand preview</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Actions */}
        {!compact && (
          <div className="p-3 pt-2 flex items-center justify-between gap-2 border-t">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7"
              onClick={(e) => {
                e.stopPropagation();
                onFeedback();
              }}
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              Feedback
            </Button>

            <Button
              size="sm"
              variant={variant.isApproved ? 'default' : 'outline'}
              className={cn(
                'text-xs h-7',
                variant.isApproved && 'bg-green-600 hover:bg-green-700'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onApprove();
              }}
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              {variant.isApproved ? 'Approved' : 'Approve'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
