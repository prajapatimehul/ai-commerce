"use client";

import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment, useState } from "react";
import { useDesignGeneration } from "./use-design-generation";
import type { CustomDesign } from "lib/types/design";

interface DesignStudioProps {
  isOpen: boolean;
  onClose: () => void;
  tshirtImageUrl: string;
  onDesignComplete: (design: CustomDesign) => void;
}

export function DesignStudio({
  isOpen,
  onClose,
  tshirtImageUrl,
  onDesignComplete,
}: DesignStudioProps) {
  const [prompt, setPrompt] = useState("");

  const {
    generateDesign,
    cancelGeneration,
    isGenerating,
    progress,
    error,
    generatedDesignUrl,
  } = useDesignGeneration({
    tshirtImageUrl,
    onSuccess: (designUrl, userPrompt) => {
      // Design generated successfully
    },
    onError: (errorMsg) => {
      console.error("Design generation error:", errorMsg);
    },
  });

  const handleGenerate = () => {
    generateDesign(prompt);
  };

  const handleAddToCart = () => {
    if (!generatedDesignUrl) return;

    const design: CustomDesign = {
      designUrl: generatedDesignUrl,
      prompt: prompt,
      createdAt: new Date().toISOString(),
    };

    onDesignComplete(design);
    onClose();
  };

  const handleClose = () => {
    if (isGenerating) {
      cancelGeneration();
    }
    setPrompt("");
    onClose();
  };

  return (
    <Transition show={isOpen}>
      <Dialog onClose={handleClose} className="relative z-50">
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="transition-all ease-in-out duration-300"
          enterFrom="opacity-0 backdrop-blur-none"
          enterTo="opacity-100 backdrop-blur-[.5px]"
          leave="transition-all ease-in-out duration-200"
          leaveFrom="opacity-100 backdrop-blur-[.5px]"
          leaveTo="opacity-0 backdrop-blur-none"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>

        {/* Modal Panel */}
        <Transition.Child
          as={Fragment}
          enter="transition-all ease-in-out duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transition-all ease-in-out duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <Dialog.Panel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-neutral-200 bg-white/80 p-6 text-black backdrop-blur-xl md:w-[480px] dark:border-neutral-700 dark:bg-black/80 dark:text-white">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">
                Design Your T-Shirt with AI
              </Dialog.Title>
              <button
                onClick={handleClose}
                aria-label="Close modal"
                className="flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
              >
                <XMarkIcon className="h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-4 overflow-auto">
              {/* Prompt Input */}
              <div>
                <label
                  htmlFor="design-prompt"
                  className="mb-2 block text-sm font-medium"
                >
                  Describe your design
                </label>
                <textarea
                  id="design-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Add a mountain landscape logo in the center"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-black placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-400"
                  disabled={isGenerating}
                  rows={4}
                  maxLength={500}
                />
                <div className="mt-1 text-right text-xs text-neutral-500">
                  {prompt.length}/500
                </div>
              </div>

              {/* Progress Bar */}
              {isGenerating && (
                <div
                  className="space-y-2"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                    <div
                      className="h-full bg-blue-600 transition-all duration-200 ease-out"
                      style={{ width: `${progress}%` }}
                      role="progressbar"
                      aria-valuenow={Math.round(progress)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Design generation progress"
                    />
                  </div>
                  <p className="text-center text-xs text-neutral-600 dark:text-neutral-400">
                    Generating your design... {Math.round(progress)}%
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
                >
                  {error}
                </div>
              )}

              {/* Preview */}
              {generatedDesignUrl && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Preview</label>
                  <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <img
                      src={generatedDesignUrl}
                      alt={`AI-generated design: ${prompt}`}
                      className="h-auto w-full"
                    />
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Design: {prompt}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 space-y-3 border-t border-neutral-200 pt-4 dark:border-neutral-700">
              {!generatedDesignUrl ? (
                <>
                  <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className={clsx(
                      "block w-full rounded-full p-3 text-center text-sm font-medium text-white transition-opacity",
                      !prompt.trim() || isGenerating
                        ? "cursor-not-allowed bg-blue-600 opacity-60"
                        : "bg-blue-600 hover:opacity-90",
                    )}
                  >
                    {isGenerating ? "Generating Design..." : "Generate Design"}
                  </button>
                  {isGenerating && (
                    <button
                      onClick={cancelGeneration}
                      className="block w-full rounded-full border border-neutral-300 p-3 text-center text-sm font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
                    >
                      Cancel
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="block w-full rounded-full bg-blue-600 p-3 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
                  >
                    Add to Cart with This Design
                  </button>
                  <button
                    onClick={() => {
                      generateDesign(prompt);
                    }}
                    className="block w-full rounded-full border border-neutral-300 p-3 text-center text-sm font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
                  >
                    Regenerate Design
                  </button>
                </>
              )}
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
