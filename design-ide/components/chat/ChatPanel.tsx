'use client';

import { useRef, useEffect } from 'react';
import { useChat, type Message as AIMessage } from 'ai/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Message } from './Message';
import { InterviewQuestion } from './InterviewQuestion';
import { Send, Loader2, StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VariantData } from '@/components/prototype/VariantCard';
import type {
  AskQuestionResult,
  GenerateVariantResult,
  ToolResult,
} from '@/lib/ai/tools';

interface ChatPanelProps {
  projectId: string;
  onVariantsGenerated: (variants: VariantData[]) => void;
  onPhaseChange: (phase: 'describe' | 'prototype' | 'iterate' | 'build' | 'export') => void;
  className?: string;
}

export function ChatPanel({
  projectId,
  onVariantsGenerated,
  onPhaseChange,
  className,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    append,
  } = useChat({
    api: '/api/chat',
    body: { projectId },
    onFinish: (message) => {
      // Process tool results from the message
      processToolResults(message);
    },
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Process tool results to extract variants and other data
  const processToolResults = (message: AIMessage) => {
    if (!message.toolInvocations) return;

    const variants: VariantData[] = [];

    for (const invocation of message.toolInvocations) {
      if (invocation.state !== 'result') continue;

      const result = invocation.result as ToolResult;

      if (result.type === 'variant') {
        const variantResult = result as GenerateVariantResult;
        variants.push({
          id: variantResult.id,
          name: variantResult.name,
          description: variantResult.description,
          focusArea: variantResult.focusArea,
          code: variantResult.code,
          rationale: variantResult.rationale,
        });
      }

      if (result.type === 'feedback_processed' && result.action === 'approve') {
        onPhaseChange('build');
      }

      if (result.type === 'build_complete') {
        onPhaseChange('export');
      }
    }

    if (variants.length > 0) {
      onVariantsGenerated(variants);
      onPhaseChange('prototype');
    }
  };

  // Handle interview question answers
  const handleQuestionAnswer = (answer: string) => {
    append({
      role: 'user',
      content: answer,
    });
  };

  // Render messages with special handling for tool invocations
  const renderMessage = (message: AIMessage, index: number) => {
    // Check for pending questions in tool invocations
    const pendingQuestion = message.toolInvocations?.find(
      (inv) =>
        inv.state === 'result' &&
        (inv.result as ToolResult).type === 'question'
    );

    const isLastMessage = index === messages.length - 1;

    return (
      <div key={message.id} className="space-y-3">
        {/* Regular message content */}
        {message.content && (
          <Message
            role={message.role as 'user' | 'assistant'}
            content={message.content}
          />
        )}

        {/* Interview question UI */}
        {pendingQuestion && isLastMessage && (
          <InterviewQuestion
            question={(pendingQuestion.result as AskQuestionResult).question}
            options={(pendingQuestion.result as AskQuestionResult).options}
            allowFreeform={
              (pendingQuestion.result as AskQuestionResult).allowFreeform
            }
            onAnswer={handleQuestionAnswer}
          />
        )}

        {/* Variant generation indicator */}
        {message.toolInvocations?.some(
          (inv) =>
            inv.state === 'result' &&
            (inv.result as ToolResult).type === 'variant'
        ) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pl-11">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Generated variants - check the preview panel
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-lg font-medium">What would you like to build?</p>
              <p className="text-sm mt-2">
                Describe your idea and I&apos;ll create 5 design variants for you to
                choose from.
              </p>
            </div>
          )}

          {messages.map((message, index) => renderMessage(message, index))}

          {isLoading && (
            <Message role="assistant" content="" isLoading />
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            placeholder="Describe what you want to build..."
            className="min-h-[60px] max-h-[200px] resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="flex flex-col gap-2">
            {isLoading ? (
              <Button
                type="button"
                size="icon"
                variant="destructive"
                onClick={stop}
              >
                <StopCircle className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" size="icon" disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
