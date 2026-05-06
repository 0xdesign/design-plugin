'use client';

import { useRef, useEffect, useMemo, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Message } from './Message';
import { InterviewQuestion } from './InterviewQuestion';
import { Send, StopCircle } from 'lucide-react';
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

type ToolOutputPart = UIMessage['parts'][number] & {
  state: 'output-available';
  output: unknown;
};

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

function isToolOutputPart(part: UIMessage['parts'][number]): part is ToolOutputPart {
  return (
    part.type.startsWith('tool-') &&
    'state' in part &&
    part.state === 'output-available' &&
    'output' in part
  );
}

function isToolResult(output: unknown): output is ToolResult {
  return (
    typeof output === 'object' &&
    output !== null &&
    'type' in output &&
    typeof (output as { type: unknown }).type === 'string'
  );
}

function getToolResults(message: UIMessage): ToolResult[] {
  return message.parts
    .filter(isToolOutputPart)
    .map((part) => part.output)
    .filter(isToolResult);
}

export function ChatPanel({
  projectId,
  onVariantsGenerated,
  onPhaseChange,
  className,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');

  // Process tool results to extract variants and other data
  const processToolResults = (message: UIMessage) => {
    const variants: VariantData[] = [];

    for (const result of getToolResults(message)) {
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

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: { projectId },
      }),
    [projectId]
  );

  const {
    messages,
    status,
    stop,
    sendMessage,
  } = useChat({
    transport,
    onFinish: ({ message }) => {
      // Process tool results from the message
      processToolResults(message);
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInput(event.target.value);
  };

  const handleSubmit = (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();

    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    setInput('');
    void sendMessage({ text: trimmedInput });
  };

  // Handle interview question answers
  const handleQuestionAnswer = (answer: string) => {
    void sendMessage({ text: answer });
  };

  // Render messages with special handling for tool invocations
  const renderMessage = (message: UIMessage, index: number) => {
    const content = getMessageText(message);

    // Check for pending questions in tool invocations
    const pendingQuestion = getToolResults(message).find(
      (result): result is AskQuestionResult => result.type === 'question'
    );

    const isLastMessage = index === messages.length - 1;

    return (
      <div key={message.id} className="space-y-3">
        {/* Regular message content */}
        {content && (
          <Message
            role={message.role === 'assistant' ? 'assistant' : 'user'}
            content={content}
          />
        )}

        {/* Interview question UI */}
        {pendingQuestion && isLastMessage && (
          <InterviewQuestion
            question={pendingQuestion.question}
            options={pendingQuestion.options}
            allowFreeform={pendingQuestion.allowFreeform}
            onAnswer={handleQuestionAnswer}
          />
        )}

        {/* Variant generation indicator */}
        {getToolResults(message).some((result) => result.type === 'variant') && (
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
