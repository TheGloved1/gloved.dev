import React from 'react';

export function useTextToSpeech(): readonly [speak: (text: string) => void, stop: () => void, isSpeaking: boolean] {
  const synth = window.speechSynthesis;
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const speak = React.useCallback(
    (text: string) => {
      if (!synth) {
        console.warn('Speech synthesis not supported');
        return;
      }

      // Cancel any ongoing speech
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
      };
      utterance.onpause = () => {
        setIsSpeaking(false);
      };
      utterance.onresume = () => {
        setIsSpeaking(true);
      };

      synth.speak(utterance);
    },
    [synth],
  );

  const stop = React.useCallback(() => {
    if (!synth) {
      console.warn('Speech synthesis not supported');
      return;
    }
    synth.cancel();
  }, [synth]);

  return [speak, stop, isSpeaking] as const;
}
