import React from 'react';

/**
 * Returns a tuple of three values:
 *  - A `speak` function that takes a string and uses the Web Speech API to
 *    read it aloud.
 *  - A `stop` function that stops any ongoing speech.
 *  - A boolean `isSpeaking` value that indicates whether speech is currently
 *    happening.
 *
 * If the Web Speech API is not supported in the current environment, the `speak` and `stop` functions will
 * do nothing, and `isSpeaking` will always be false.
 */
export function useTextToSpeech(): [speak: (text: string) => void, stop: () => void, isSpeaking: boolean] {
  const speech = window.speechSynthesis;
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const speak = React.useCallback(
    (text: string) => {
      if (!speech) {
        console.warn('Speech synthesis not supported');
        return;
      }

      // Cancel any ongoing speech
      speech.cancel();

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

      speech.speak(utterance);
    },
    [speech],
  );

  const stop = React.useCallback(() => {
    if (!speech) {
      console.warn('Speech synthesis not supported');
      return;
    }
    speech.cancel();
  }, [speech]);

  return [speak, stop, isSpeaking] as const;
}
