'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SandpackPreview } from './SandpackPreview';
import { Check, Code, Eye, MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VariantData } from './VariantCard';
import type { VariantFocusArea } from '@/lib/db/types';

interface VariantExpandedProps {
  variant: VariantData;
  onClose: () => void;
  onApprove: () => void;
  onFeedback: () => void;
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

export function VariantExpanded({
  variant,
  onClose,
  onApprove,
  onFeedback,
}: VariantExpandedProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-muted-foreground">
                {variant.id}
              </span>
              <DialogTitle className="text-xl">{variant.name}</DialogTitle>
              <Badge className={cn(focusAreaColors[variant.focusArea])}>
                {focusAreaLabels[variant.focusArea]}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={onFeedback}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Feedback
              </Button>
              <Button
                size="sm"
                variant={variant.isApproved ? 'default' : 'outline'}
                className={cn(
                  variant.isApproved && 'bg-green-600 hover:bg-green-700'
                )}
                onClick={onApprove}
              >
                <Check className="h-4 w-4 mr-2" />
                {variant.isApproved ? 'Approved' : 'Approve'}
              </Button>
              <Button size="icon" variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Main content area */}
          <div className="flex-1 flex flex-col">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as 'preview' | 'code')}
              className="flex-1 flex flex-col"
            >
              <div className="px-6 py-2 border-b bg-muted/30">
                <TabsList>
                  <TabsTrigger value="preview">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="code">
                    <Code className="h-4 w-4 mr-2" />
                    Code
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="preview" className="flex-1 m-0 p-4">
                <SandpackPreview code={variant.code} className="h-full" />
              </TabsContent>

              <TabsContent value="code" className="flex-1 m-0 p-4">
                <SandpackPreview
                  code={variant.code}
                  showCode
                  className="h-full"
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar with details */}
          <div className="w-80 border-l bg-muted/20">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {variant.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Rationale</h3>
                  <p className="text-sm text-muted-foreground">
                    {variant.rationale}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Focus Area</h3>
                  <div className="space-y-2">
                    <Badge className={cn('text-xs', focusAreaColors[variant.focusArea])}>
                      {focusAreaLabels[variant.focusArea]}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {variant.focusArea === 'layout' &&
                        'Explores different structural and organizational approaches'}
                      {variant.focusArea === 'hierarchy' &&
                        'Explores different ways to prioritize and emphasize information'}
                      {variant.focusArea === 'density' &&
                        'Explores the balance between content density and whitespace'}
                      {variant.focusArea === 'interaction' &&
                        'Explores different interactive patterns and micro-interactions'}
                      {variant.focusArea === 'expression' &&
                        'Explores different visual personalities and emotional tones'}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
