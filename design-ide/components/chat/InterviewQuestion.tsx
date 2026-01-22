'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check, MessageSquare } from 'lucide-react';

interface QuestionOption {
  label: string;
  value: string;
}

interface InterviewQuestionProps {
  question: string;
  options?: QuestionOption[];
  allowFreeform?: boolean;
  onAnswer: (answer: string) => void;
  isAnswered?: boolean;
}

export function InterviewQuestion({
  question,
  options,
  allowFreeform = true,
  onAnswer,
  isAnswered = false,
}: InterviewQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [freeformText, setFreeformText] = useState('');
  const [showFreeform, setShowFreeform] = useState(!options || options.length === 0);

  const handleSubmit = () => {
    const answer = showFreeform ? freeformText : selectedOption;
    if (answer) {
      onAnswer(answer);
    }
  };

  if (isAnswered) {
    return null;
  }

  return (
    <Card className="bg-muted/50 border-dashed">
      <CardContent className="p-4">
        <div className="space-y-4">
          <p className="text-sm font-medium">{question}</p>

          {/* Options */}
          {options && options.length > 0 && !showFreeform && (
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedOption === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedOption(option.value)}
                  className="text-sm"
                >
                  {option.label}
                  {selectedOption === option.value && (
                    <Check className="ml-1 h-3 w-3" />
                  )}
                </Button>
              ))}

              {allowFreeform && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFreeform(true)}
                  className="text-sm text-muted-foreground"
                >
                  <MessageSquare className="mr-1 h-3 w-3" />
                  Other
                </Button>
              )}
            </div>
          )}

          {/* Freeform input */}
          {showFreeform && (
            <div className="flex gap-2">
              <Input
                value={freeformText}
                onChange={(e) => setFreeformText(e.target.value)}
                placeholder="Type your answer..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && freeformText.trim()) {
                    handleSubmit();
                  }
                }}
              />
              {options && options.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowFreeform(false);
                    setFreeformText('');
                  }}
                >
                  Back
                </Button>
              )}
            </div>
          )}

          {/* Submit button */}
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={showFreeform ? !freeformText.trim() : !selectedOption}
            >
              Answer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
