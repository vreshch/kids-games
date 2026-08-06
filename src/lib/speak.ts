/** Speaks a line out loud, lower and slower the scarier the face gets. */
export function speakHint(text: string, level: number) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = Math.max(0.1, 1.3 - level * 0.22);
  utterance.rate = Math.max(0.5, 1 - level * 0.07);
  synth.speak(utterance);
}

/** Cuts off whatever is being spoken - used when the roar takes over. */
export function stopSpeech() {
  window.speechSynthesis?.cancel();
}
