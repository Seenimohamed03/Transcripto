import AppLayout from "@/components/layout/app-layout";
import { TranscriptionHistoryProvider } from "@/contexts/transcription-history-context";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <TranscriptionHistoryProvider>
      <AppLayout />
      <Toaster />
    </TranscriptionHistoryProvider>
  );
}
