'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Send, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FeedbackItem {
  id: string;
  variantId: string;
  elementSelector?: string;
  comment: string;
  createdAt: Date;
}

interface FeedbackPanelProps {
  feedback: FeedbackItem[];
  onAddFeedback: (variantId: string, comment: string, elementSelector?: string) => void;
  onRemoveFeedback: (id: string) => void;
  onSubmitAllFeedback: () => void;
  selectedVariantId: string | null;
  className?: string;
}

export function FeedbackPanel({
  feedback,
  onAddFeedback,
  onRemoveFeedback,
  onSubmitAllFeedback,
  selectedVariantId,
  className,
}: FeedbackPanelProps) {
  const [newComment, setNewComment] = useState('');

  const handleAddFeedback = () => {
    if (newComment.trim() && selectedVariantId) {
      onAddFeedback(selectedVariantId, newComment.trim());
      setNewComment('');
    }
  };

  const groupedFeedback = feedback.reduce((acc, item) => {
    if (!acc[item.variantId]) {
      acc[item.variantId] = [];
    }
    acc[item.variantId].push(item);
    return acc;
  }, {} as Record<string, FeedbackItem[]>);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Feedback
          </h3>
          <Badge variant="secondary">{feedback.length}</Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {feedback.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">No feedback yet</p>
            <p className="text-xs mt-1">
              Select a variant and add your thoughts
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedFeedback).map(([variantId, items]) => (
              <Card key={variantId}>
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="font-bold">Variant {variantId}</span>
                    <Badge variant="outline" className="text-xs">
                      {items.length} comment{items.length !== 1 && 's'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-3">
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-2 group"
                      >
                        <div className="flex-1 text-sm bg-muted rounded px-2 py-1">
                          {item.comment}
                          {item.elementSelector && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({item.elementSelector})
                            </span>
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => onRemoveFeedback(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      <Separator />

      {/* Add new feedback */}
      <div className="p-4 space-y-3">
        {selectedVariantId ? (
          <>
            <div className="text-xs text-muted-foreground">
              Adding feedback for{' '}
              <span className="font-medium">Variant {selectedVariantId}</span>
            </div>
            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What do you think about this variant?"
                className="min-h-[60px] resize-none text-sm"
                rows={2}
              />
              <Button
                size="icon"
                onClick={handleAddFeedback}
                disabled={!newComment.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-xs text-muted-foreground text-center">
            Select a variant to add feedback
          </div>
        )}

        {feedback.length > 0 && (
          <Button
            className="w-full"
            onClick={onSubmitAllFeedback}
          >
            Submit All Feedback
          </Button>
        )}
      </div>
    </div>
  );
}
