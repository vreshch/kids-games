type AudioSessionType =
  'auto' | 'playback' | 'transient' | 'transient-solo' | 'ambient' | 'play-and-record';

type NavigatorWithAudioSession = Navigator & { audioSession?: { type: AudioSessionType } };

/** iOS mutes WebAudio under the ring/silent switch unless the page declares a session type. */
export function declareAudioSession(type: 'playback' | 'play-and-record') {
  const session = (navigator as NavigatorWithAudioSession).audioSession;
  if (session) session.type = type;
}
