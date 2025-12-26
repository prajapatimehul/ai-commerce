"use client";

import { useState } from "react";
import type { DesignGenerationResponse } from "lib/types/design";

interface UseDesignGenerationProps {
  tshirtImageUrl: string;
  onSuccess?: (designUrl: string, prompt: string) => void;
  onError?: (error: string) => void;
}

export function useDesignGeneration({
  tshirtImageUrl,
  onSuccess,
  onError,
}: UseDesignGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedDesignUrl, setGeneratedDesignUrl] = useState<string | null>(
    null,
  );
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const generateDesign = async (prompt: string) => {
    if (!prompt.trim()) {
      const errorMsg = "Please enter a design description";
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (isGenerating) {
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setGeneratedDesignUrl(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        return prev + Math.random() * 2;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("tshirtImageUrl", tshirtImageUrl);

      const response = await fetch("/api/generate-design", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData: DesignGenerationResponse = await response.json();
        throw new Error(errorData.error || "Failed to generate design");
      }

      const data: DesignGenerationResponse = await response.json();

      if (!data.success || !data.designUrl) {
        throw new Error(data.error || "Failed to generate design");
      }

      setProgress(100);
      setGeneratedDesignUrl(data.designUrl);
      onSuccess?.(data.designUrl, prompt);
    } catch (err) {
      clearInterval(progressInterval);

      if (err instanceof Error && err.name === "AbortError") {
        setError("Generation cancelled");
        return;
      }

      const errorMsg =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  const cancelGeneration = () => {
    if (abortController) {
      abortController.abort();
      setIsGenerating(false);
      setProgress(0);
      setAbortController(null);
    }
  };

  const reset = () => {
    setIsGenerating(false);
    setProgress(0);
    setError(null);
    setGeneratedDesignUrl(null);
    setAbortController(null);
  };

  return {
    generateDesign,
    cancelGeneration,
    reset,
    isGenerating,
    progress,
    error,
    generatedDesignUrl,
  };
}
