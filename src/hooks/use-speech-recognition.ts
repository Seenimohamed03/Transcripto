"use client";

import { useState, useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useSpeechRecognition(
  onFinalTranscript: (transcript: string) => void
) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const isComponentMounted = useRef(true);

  const onResult = useCallback(
    (event: any) => {
      let finalTranscript = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInterimTranscript(interim);
      if (finalTranscript) {
        onFinalTranscript(finalTranscript.trim());
      }
    },
    [onFinalTranscript]
  );

  const onEnd = useCallback(() => {
    if (
      isComponentMounted.current &&
      recognitionRef.current &&
      recognitionRef.current.continuous
    ) {
      recognitionRef.current.start();
    } else {
      setIsListening(false);
    }
  }, []);

  useEffect(() => {
    isComponentMounted.current = true;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("SpeechRecognition API not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.addEventListener("result", onResult);
    recognition.addEventListener("end", onEnd);

    return () => {
      isComponentMounted.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.removeEventListener("result", onResult);
        recognitionRef.current.removeEventListener("end", onEnd);
        recognitionRef.current.stop();
      }
    };
  }, [onResult, onEnd]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setInterimTranscript("");
      setIsListening(true);
      recognitionRef.current.continuous = true;
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      setIsListening(false);
      recognitionRef.current.continuous = false;
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const setLanguage = useCallback(
    (lang: string) => {
      if (recognitionRef.current) {
        const wasListening = isListening;
        if (wasListening) stopListening();
        recognitionRef.current.lang = lang;
        if (wasListening) startListening();
      }
    },
    [isListening, startListening, stopListening]
  );

  return {
    isListening,
    interimTranscript,
    startListening,
    stopListening,
    setLanguage,
  };
}
