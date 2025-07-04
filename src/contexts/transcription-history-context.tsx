'use client';

import React, { createContext, useContext } from 'react';
import { useTranscriptionHistory as useTranscriptionHistoryHook } from '@/hooks/use-transcription-history';

type TranscriptionHistoryContextType = ReturnType<typeof useTranscriptionHistoryHook>;

const TranscriptionHistoryContext = createContext<TranscriptionHistoryContextType | undefined>(undefined);

export function TranscriptionHistoryProvider({ children }: { children: React.ReactNode }) {
  const history = useTranscriptionHistoryHook();
  return (
    <TranscriptionHistoryContext.Provider value={history}>
      {children}
    </TranscriptionHistoryContext.Provider>
  );
}

export function useTranscriptionHistory() {
  const context = useContext(TranscriptionHistoryContext);
  if (context === undefined) {
    throw new Error('useTranscriptionHistory must be used within a TranscriptionHistoryProvider');
  }
  return context;
}
