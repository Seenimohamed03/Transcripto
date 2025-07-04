'use client';

import React from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarContent } from "@/components/ui/sidebar";
import HistorySidebar from "@/components/transcription/history-sidebar";
import TranscriptionView from "@/components/transcription/transcription-view";
import { Button } from "@/components/ui/button";
import { FileAudio } from 'lucide-react';
import { useTranscriptionHistory } from '@/contexts/transcription-history-context';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

export default function AppLayout() {
  const { setSelectedTranscriptId } = useTranscriptionHistory();

  return (
    <SidebarProvider>
      <div className="grid grid-rows-[auto_1fr] min-h-screen w-full bg-background">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                    <span className="sr-only">Toggle history sidebar</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-sm p-0">
                  <HistorySidebar />
                </SheetContent>
              </Sheet>
            </div>
            <FileAudio className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline">AudioScribe</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setSelectedTranscriptId(null)}>New Transcription</Button>
          </div>
        </header>

        <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] flex-1">
          <aside className="hidden md:block border-r">
            <HistorySidebar />
          </aside>
          <main>
            <TranscriptionView />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
