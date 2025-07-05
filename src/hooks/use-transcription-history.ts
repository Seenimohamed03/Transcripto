"use client";

import { useState, useEffect, useCallback } from "react";

export type Transcript = {
  id: string;
  title: string;
  text: string;
  createdAt: string;
};

const HISTORY_KEY = "transcripto_history";

export function useTranscriptionHistory() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        setTranscripts(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load transcription history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveTranscript = useCallback(
    (transcript: Omit<Transcript, "createdAt"> & { id?: string }) => {
      let newTranscripts;
      const now = new Date().toISOString();

      const existingIndex = transcripts.findIndex(
        (t) => t.id === transcript.id
      );

      if (transcript.id && existingIndex > -1) {
        newTranscripts = transcripts.map((t) =>
          t.id === transcript.id
            ? {
                ...t,
                ...transcript,
                text: transcript.text,
                title: transcript.title,
              }
            : t
        );
      } else {
        const newId = `transcript_${Date.now()}`;
        const newTranscript = {
          ...transcript,
          id: newId,
          createdAt: now,
        };
        newTranscripts = [newTranscript, ...transcripts];
        setSelectedTranscriptId(newId);
      }

      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newTranscripts));
        setTranscripts(newTranscripts);
      } catch (error) {
        console.error("Failed to save transcript:", error);
      }
    },
    [transcripts]
  );

  const deleteTranscript = useCallback(
    (id: string) => {
      const newTranscripts = transcripts.filter((t) => t.id !== id);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newTranscripts));
        setTranscripts(newTranscripts);
        if (selectedTranscriptId === id) {
          setSelectedTranscriptId(null);
        }
      } catch (error) {
        console.error("Failed to delete transcript:", error);
      }
    },
    [transcripts, selectedTranscriptId]
  );

  const selectedTranscript =
    transcripts.find((t) => t.id === selectedTranscriptId) || null;

  return {
    transcripts,
    selectedTranscript,
    selectedTranscriptId,
    setSelectedTranscriptId,
    saveTranscript,
    deleteTranscript,
    isLoading,
  };
}
