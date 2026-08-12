function utter(text: string, rate = 0.8, pitch = 1.15) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  utterance.pitch = pitch;
  return utterance;
}

/** Call from the start tap - a user gesture is required before iOS lets speech through. */
export function primeSpeech() {
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  void synth.getVoices();
}

/** Says the letter's English name ("A", "B"...) right after the pickup chime. */
export function speakLetter(letter: string) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  synth.speak(utter(letter));
}

/** Spells the whole word letter by letter, then says it: "C, A, T. Cat!" */
export function speakWord(word: string) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  synth.speak(utter(word.split('').join(', ') + '.'));
  synth.speak(utter(word[0] + word.slice(1).toLowerCase() + '!', 0.75, 1.2));
}
