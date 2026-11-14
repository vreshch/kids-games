import { playGobble, playMunch, playOops, playSuper, unlockWiggleAudio } from './wiggle-audio';

export {
  playGobble,
  playMunch as playBerry,
  playOops as playCaught,
  playSuper as playStar,
  unlockWiggleAudio as unlockMazeAudio,
};

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six'];

/** Speaks a line; step numbers cut in, cheers wait their turn. */
export function say(text: string, interrupt = false) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  if (interrupt) synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.1;
  utterance.pitch = 1.3;
  synth.speak(utterance);
}

export const sayNumber = (n: number) => say(WORDS[n] ?? String(n), true);

const CHEERS = {
  star: ['Super power!', 'Star power!'],
  gobble: ['Yum!', 'Gotcha!', 'Bye bye, cloud!'],
  clear: ['Hooray! You did it!', 'Wow! All gone!'],
  caught: ['Oopsie!', 'Uh oh!'],
};

export function cheer(kind: keyof typeof CHEERS) {
  const lines = CHEERS[kind];
  say(lines[Math.floor(Math.random() * lines.length)]);
}
