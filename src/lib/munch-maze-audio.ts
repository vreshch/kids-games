import { playGobble, playMunch, playOops, playSuper, unlockWiggleAudio } from './wiggle-audio';

export {
  playGobble,
  playMunch as playBerry,
  playOops as playCaught,
  playSuper as playStar,
  unlockWiggleAudio as unlockMazeAudio,
};

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six'];

/** Says the step number out loud so kids count along. */
export function sayNumber(n: number) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(WORDS[n] ?? String(n));
  utterance.rate = 1.1;
  utterance.pitch = 1.3;
  synth.speak(utterance);
}
