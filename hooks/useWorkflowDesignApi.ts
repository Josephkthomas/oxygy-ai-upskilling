import { useState, useRef } from 'react';
import type { WorkflowDesignPayload, WorkflowGenerateResult, WorkflowFeedbackResult } from '../types';

export function useWorkflowDesignApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastCallRef = useRef(0);

  const clearError = () => setError(null);

  const designWorkflow = async (
    payload: WorkflowDesignPayload,
  ): Promise<WorkflowGenerateResult | WorkflowFeedbackResult | null> => {
    // Rate limit: 1 request per 8 seconds
    const now = Date.now();
    if (now - lastCallRef.current < 8000) {
      setError('Please wait a few seconds before trying again.');
      return null;
    }

    setIsLoading(true);
    setError(null);
    lastCallRef.current = now;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch('/api/design-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.status === 503) {
        setError('The workflow design service is temporarily unavailable. Please try again later.');
        return null;
      }

      if (!res.ok) {
        setError('Something went wrong designing your workflow. Please try again.');
        return null;
      }

      const data = await res.json();

      if (payload.mode === 'auto_generate') {
        if (!data.workflow_name || !data.nodes || !Array.isArray(data.nodes)) {
          setError('Received an unexpected response format. Please try again.');
          return null;
        }
        return data as WorkflowGenerateResult;
      } else {
        if (!data.suggested_workflow || !Array.isArray(data.suggested_workflow) || !data.changes) {
          setError('Received an unexpected response format. Please try again.');
          return null;
        }
        return data as WorkflowFeedbackResult;
      }
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('This is taking longer than expected. Please try again.');
      } else {
        setError('Something went wrong designing your workflow. Please try again.');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { designWorkflow, isLoading, error, clearError };
}
