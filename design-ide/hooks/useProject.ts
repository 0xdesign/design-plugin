'use client';

import { useState, useCallback } from 'react';
import type { ProjectPhase } from '@/lib/db/types';
import type { VariantData } from '@/components/prototype/VariantCard';
import type { FeedbackItem } from '@/components/feedback/FeedbackPanel';

interface ProjectState {
  id: string;
  name: string;
  description: string;
  phase: ProjectPhase;
  variants: VariantData[];
  feedback: FeedbackItem[];
  selectedVariantId: string | null;
  approvedVariantId: string | null;
}

const initialState: ProjectState = {
  id: '',
  name: '',
  description: '',
  phase: 'describe',
  variants: [],
  feedback: [],
  selectedVariantId: null,
  approvedVariantId: null,
};

export function useProject(projectId: string) {
  const [state, setState] = useState<ProjectState>({
    ...initialState,
    id: projectId,
  });

  const setPhase = useCallback((phase: ProjectPhase) => {
    setState((prev) => ({ ...prev, phase }));
  }, []);

  const setVariants = useCallback((variants: VariantData[]) => {
    setState((prev) => ({
      ...prev,
      variants,
      selectedVariantId: variants[0]?.id || null,
    }));
  }, []);

  const addVariant = useCallback((variant: VariantData) => {
    setState((prev) => ({
      ...prev,
      variants: [...prev.variants, variant],
    }));
  }, []);

  const selectVariant = useCallback((variantId: string) => {
    setState((prev) => ({ ...prev, selectedVariantId: variantId }));
  }, []);

  const approveVariant = useCallback((variantId: string) => {
    setState((prev) => ({
      ...prev,
      approvedVariantId: variantId,
      variants: prev.variants.map((v) => ({
        ...v,
        isApproved: v.id === variantId,
      })),
    }));
  }, []);

  const addFeedback = useCallback(
    (variantId: string, comment: string, elementSelector?: string) => {
      const newFeedback: FeedbackItem = {
        id: `feedback-${Date.now()}`,
        variantId,
        comment,
        elementSelector,
        createdAt: new Date(),
      };
      setState((prev) => ({
        ...prev,
        feedback: [...prev.feedback, newFeedback],
      }));
    },
    []
  );

  const removeFeedback = useCallback((feedbackId: string) => {
    setState((prev) => ({
      ...prev,
      feedback: prev.feedback.filter((f) => f.id !== feedbackId),
    }));
  }, []);

  const clearFeedback = useCallback(() => {
    setState((prev) => ({ ...prev, feedback: [] }));
  }, []);

  const reset = useCallback(() => {
    setState({ ...initialState, id: projectId });
  }, [projectId]);

  return {
    ...state,
    setPhase,
    setVariants,
    addVariant,
    selectVariant,
    approveVariant,
    addFeedback,
    removeFeedback,
    clearFeedback,
    reset,
  };
}
