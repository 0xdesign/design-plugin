'use client';

import { useState } from 'react';
import { VariantCard, type VariantData } from './VariantCard';
import { VariantExpanded } from './VariantExpanded';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Grid3X3, LayoutGrid, Rows } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list' | 'tabs';

interface VariantGridProps {
  variants: VariantData[];
  selectedVariantId: string | null;
  onSelectVariant: (id: string) => void;
  onApproveVariant: (id: string) => void;
  onFeedback: (variantId: string) => void;
  className?: string;
}

export function VariantGrid({
  variants,
  selectedVariantId,
  onSelectVariant,
  onApproveVariant,
  onFeedback,
  className,
}: VariantGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [expandedVariantId, setExpandedVariantId] = useState<string | null>(null);

  const expandedVariant = expandedVariantId
    ? variants.find((v) => v.id === expandedVariantId)
    : null;

  if (variants.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full text-muted-foreground',
          className
        )}
      >
        <div className="text-center">
          <p className="text-lg font-medium">No variants yet</p>
          <p className="text-sm">Describe what you want to build to generate variants</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* View mode controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {variants.length} variant{variants.length !== 1 && 's'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <Rows className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={viewMode === 'tabs' ? 'secondary' : 'ghost'}
            className="h-8 w-8"
            onClick={() => setViewMode('tabs')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Variants display */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {variants.map((variant) => (
              <VariantCard
                key={variant.id}
                variant={variant}
                isSelected={selectedVariantId === variant.id}
                onSelect={() => onSelectVariant(variant.id)}
                onExpand={() => setExpandedVariantId(variant.id)}
                onFeedback={() => onFeedback(variant.id)}
                onApprove={() => onApproveVariant(variant.id)}
                compact
              />
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="flex flex-col gap-4">
            {variants.map((variant) => (
              <VariantCard
                key={variant.id}
                variant={variant}
                isSelected={selectedVariantId === variant.id}
                onSelect={() => onSelectVariant(variant.id)}
                onExpand={() => setExpandedVariantId(variant.id)}
                onFeedback={() => onFeedback(variant.id)}
                onApprove={() => onApproveVariant(variant.id)}
              />
            ))}
          </div>
        )}

        {viewMode === 'tabs' && (
          <Tabs
            value={selectedVariantId || variants[0]?.id}
            onValueChange={onSelectVariant}
            className="h-full flex flex-col"
          >
            <TabsList className="w-full justify-start">
              {variants.map((variant) => (
                <TabsTrigger key={variant.id} value={variant.id}>
                  <span className="font-bold mr-1">{variant.id}</span>
                  <span className="text-muted-foreground">{variant.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 mt-4">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  className={cn(
                    'h-full',
                    selectedVariantId === variant.id ? 'block' : 'hidden'
                  )}
                >
                  <VariantCard
                    variant={variant}
                    isSelected
                    onSelect={() => {}}
                    onExpand={() => setExpandedVariantId(variant.id)}
                    onFeedback={() => onFeedback(variant.id)}
                    onApprove={() => onApproveVariant(variant.id)}
                  />
                </div>
              ))}
            </div>
          </Tabs>
        )}
      </div>

      {/* Expanded variant modal */}
      {expandedVariant && (
        <VariantExpanded
          variant={expandedVariant}
          onClose={() => setExpandedVariantId(null)}
          onApprove={() => onApproveVariant(expandedVariant.id)}
          onFeedback={() => onFeedback(expandedVariant.id)}
        />
      )}
    </div>
  );
}
