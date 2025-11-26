'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStage {
  time: number;
  message: string;
}

const stages: LoadingStage[] = [
  { time: 0, message: '질문을 분석하고 있어요...' },
  { time: 7000, message: '관련 정보를 찾고 있어요...' },
  { time: 14000, message: '답변을 생성하고 있어요...' },
  { time: 21000, message: '내용을 정리하고 있어요...' },
  { time: 28000, message: '최종 검토 중이에요...' },
];

export interface AiLoadingProgressProps {
  className?: string;
}

export function AiLoadingProgress({ className }: AiLoadingProgressProps) {
  const [currentStage, setCurrentStage] = React.useState(0);

  React.useEffect(() => {
    // Stage progression
    const stageTimers = stages.map((stage, index) => {
      if (index === 0) return null; // Skip first stage as it starts immediately

      return setTimeout(() => {
        setCurrentStage(index);
      }, stage.time);
    });

    return () => {
      stageTimers.forEach((timer) => timer && clearTimeout(timer));
    };
  }, []);

  const stage = stages[currentStage];

  return (
    <div className={cn('py-1', className)} aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-coral-500 animate-pulse" />
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStage}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="text-sm text-slate-400"
          >
            {stage.message}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
