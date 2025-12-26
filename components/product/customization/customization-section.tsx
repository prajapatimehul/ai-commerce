'use client';

import { useState } from 'react';
import { DesignStudio } from './design-studio';
import { useProduct } from '../product-context';
import type { CustomDesign } from 'lib/types/design';

interface CustomizationSectionProps {
  tshirtImageUrl: string;
}

export function CustomizationSection({ tshirtImageUrl }: CustomizationSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setCustomDesign } = useProduct();

  const handleDesignComplete = (design: CustomDesign) => {
    setCustomDesign(design);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          aria-label="Customize T-shirt with AI design"
          className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-blue-600 bg-white px-6 py-3 text-sm font-semibold text-blue-600 transition-all hover:bg-blue-50 dark:bg-transparent dark:hover:bg-blue-950"
        >
          <svg
            className="h-5 w-5"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
          Customize with AI
        </button>
      </div>

      <DesignStudio
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tshirtImageUrl={tshirtImageUrl}
        onDesignComplete={handleDesignComplete}
      />
    </>
  );
}
