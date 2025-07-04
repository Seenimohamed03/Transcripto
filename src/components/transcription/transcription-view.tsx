'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Square, Download, Save, Upload, Languages } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useTranscriptionHistory } from '@/contexts/transcription-history-context';
import { redactPii } from '@/ai/flows/redact-pii';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const languages = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'es-ES', label: 'Spanish' },
    { value: 'fr-FR', label: 'French' },
    { value: 'de-DE', label: 'German' },
    { value: 'it-IT', label: 'Italian' },
    { value: 'ja-JP', label: 'Japanese' },
    { value: 'ko-KR', label: 'Korean' },
    { value: 'pt-BR', label: 'Portuguese (Brazil)' },
    { value: 'ru-RU', label: 'Russian' },
    { value: 'zh-CN', label: 'Chinese (Mandarin)' },
];

export default function TranscriptionView() {
    const [transcript, setTranscript] = useState('');
    const [title, setTitle] = useState('New Transcription');
    const [isRedacting, setIsRedacting] = useState(false);
    const { selectedTranscript, saveTranscript, setSelectedTranscriptId } = useTranscriptionHistory();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    const handleFinalTranscript = useCallback(async (newChunk: string) => {
        setIsRedacting(true);
        try {
            const { redactedText } = await redactPii({ text: newChunk });
            const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setTranscript(prev => `${prev}${prev ? '\n' : ''}[${timestamp}] ${redactedText}`);
        } catch (error) {
            console.error("PII redaction failed:", error);
            const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setTranscript(prev => `${prev}${prev ? '\n' : ''}[${timestamp}] ${newChunk} (PII redaction failed)`);
        } finally {
            setIsRedacting(false);
        }
    }, []);

    const { isListening, interimTranscript, startListening, stopListening, setLanguage } = useSpeechRecognition(handleFinalTranscript);

    useEffect(() => {
        if (selectedTranscript) {
            setTranscript(selectedTranscript.text);
            setTitle(selectedTranscript.title);
            if (isListening) stopListening();
        } else {
            setTranscript('');
            setTitle('New Transcription');
        }
    }, [selectedTranscript, stopListening]);
    
    useEffect(() => {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript, interimTranscript]);

    const handleSave = () => {
        if (!transcript.trim()) {
            toast({ title: "Cannot Save", description: "Transcription is empty.", variant: "destructive" });
            return;
        }
        saveTranscript({ id: selectedTranscript?.id, title: title.trim() || 'Untitled Transcription', text: transcript });
        toast({ title: "Success", description: "Transcription saved." });
    };

    const handleDownload = () => {
        const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[\s/]/g, '_') || 'transcription'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            toast({ title: "File Upload", description: `"${file.name}" uploaded. Transcription from file is a demo feature.` });
            setSelectedTranscriptId(null);
            setTitle(`Transcription of ${file.name}`);
            setTranscript(`This is a dummy transcription for the uploaded file "${file.name}". Actual audio file transcription is not implemented in this demo.`);
        }
    };

    return (
        <div className="p-4 md:p-6 h-full flex flex-col">
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                    <div className="flex-1 min-w-0">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 h-auto w-full"
                            placeholder="Untitled Transcription"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                         <Select onValueChange={setLanguage} defaultValue="en-US">
                            <SelectTrigger className="w-auto md:w-[180px]">
                                <Languages className="h-4 w-4 mr-0 md:mr-2" />
                                <SelectValue className="hidden md:inline" placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map(lang => (
                                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" onClick={handleSave}><Save className="h-4 w-4" /><span className="sr-only">Save</span></Button>
                        <Button variant="outline" size="icon" onClick={handleDownload}><Download className="h-4 w-4" /><span className="sr-only">Export</span></Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                    <div className="h-full overflow-auto p-6">
                        <pre className="whitespace-pre-wrap font-sans text-sm">
                            {transcript || <span className="text-muted-foreground">Start speaking or upload an audio file to begin...</span>}
                            {interimTranscript && <span className="text-muted-foreground">{`\n...${interimTranscript}`}</span>}
                        </pre>
                        <div ref={transcriptEndRef} />
                    </div>
                </CardContent>
                <CardFooter className="flex-col items-start gap-4 border-t pt-4">
                    <div className="flex gap-2 items-center w-full">
                        {!isListening ? (
                            <Button onClick={() => startListening()} className="bg-primary hover:bg-primary/90">
                                <Mic className="mr-2 h-4 w-4" /> Start
                            </Button>
                        ) : (
                            <Button onClick={() => stopListening()} variant="destructive">
                                <Square className="mr-2 h-4 w-4" /> Stop
                            </Button>
                        )}
                        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" /> Upload
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept="audio/*,video/*,text/*"
                        />
                        <div className="flex-1" />
                        {(isListening || isRedacting) && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                                {isListening && !isRedacting && <Mic className="h-4 w-4 text-destructive" />}
                                {isListening && !isRedacting && <span>Listening...</span>}
                                {isRedacting && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
                                {isRedacting && <span>Processing...</span>}
                            </div>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
