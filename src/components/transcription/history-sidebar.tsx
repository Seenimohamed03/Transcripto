'use client';

import React from 'react';
import { useTranscriptionHistory, Transcript } from '@/contexts/transcription-history-context';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, MessageSquareText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function HistorySidebar() {
  const { transcripts, selectedTranscriptId, setSelectedTranscriptId, deleteTranscript, isLoading } = useTranscriptionHistory();

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this transcription?')) {
      deleteTranscript(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        <h2 className="text-lg font-semibold tracking-tight px-2">History</h2>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold tracking-tight">History</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {transcripts.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-10">
              <MessageSquareText className="mx-auto h-10 w-10 mb-2" />
              <p className="font-semibold">No transcriptions yet</p>
              <p>Start a new transcription to see it here.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {transcripts.map((transcript: Transcript) => (
                <div key={transcript.id} className="relative group">
                  <Button
                    variant='ghost'
                    className={cn(
                      "w-full h-auto justify-start p-3 text-left flex items-start gap-3",
                      selectedTranscriptId === transcript.id && 'bg-secondary'
                    )}
                    onClick={() => setSelectedTranscriptId(transcript.id)}
                  >
                    <MessageSquareText className="h-5 w-5 mt-1 shrink-0 text-primary" />
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold truncate">{transcript.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transcript.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 shrink-0 absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100" 
                    onClick={(e) => handleDelete(e, transcript.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
