import { Howl, Howler } from 'howler'
import { asset } from './stage'

export type Track = 'title' | 'cottage' | 'map' | 'breathing' | 'games'
export type Sfx = 'tap' | 'page' | 'emotion-select' | 'correct' | 'try-again' | 'card-flip' | 'card-match' | 'island-unlock' | 'breathe' | 'complete'

// Mixing from AUDIO.md: music ~35%, SFX ~70%, 400 ms fades between screens.
export const MUSIC_VOL = 0.35
const SFX_VOL = 0.7
const FADE = 400
const MUTE_KEY = 'asta.muted'

// Web Audio (Howler's default) loops seamlessly; music loads lazily, one track per screen.
const tracks = new Map<Track, Howl>()
const track = (t: Track) => {
  let h = tracks.get(t)
  if (!h) tracks.set(t, (h = new Howl({ src: [asset(`audio/music/${t}.mp3`)], loop: true, volume: 0 })))
  return h
}
let current: Track | null = null
let currentVol = MUSIC_VOL

// iPhone: Web Audio follows the ring/silent switch, so a phone on silent plays nothing. The 'playback' audio
// session (Safari 17+) makes the game play like a media app. Older Safaris ignore this.
try {
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession
  if (session) session.type = 'playback'
} catch {
  /* not supported */
}

// Browsers keep audio locked until the first tap, and a track started before that never begins. On the first
// tap anywhere, start the current screen's track if it isn't playing yet (e.g. the title music on Home).
const startOnFirstTap = () => {
  document.removeEventListener('pointerdown', startOnFirstTap, true)
  const h = current && tracks.get(current)
  if (h && !h.playing()) {
    h.play()
    h.fade(0, currentVol, FADE)
  }
}
document.addEventListener('pointerdown', startOnFirstTap, true)

export function playMusic(t: Track, vol = MUSIC_VOL) {
  currentVol = vol
  const h = track(t)
  if (current === t) {
    h.fade(h.volume(), vol, FADE)
    return
  }
  if (current) {
    const prev = current
    const old = track(prev)
    old.fade(old.volume(), 0, FADE)
    old.once('fade', () => current !== prev && old.stop())
  }
  current = t
  if (!h.playing()) h.play()
  h.fade(0, vol, FADE)
}

const sounds = new Map<Sfx, Howl>()
export function sfx(name: Sfx) {
  let h = sounds.get(name)
  if (!h) sounds.set(name, (h = new Howl({ src: [asset(`audio/sfx/${name}.mp3`)], volume: SFX_VOL })))
  h.play()
}

/** Short haptic tick; Android only (iOS Safari has no Vibration API). */
export const buzz = (ms = 25) => navigator.vibrate?.(ms)

const read = () => {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}
let muted = read()
Howler.mute(muted)
export const isMuted = () => muted
export function setMuted(m: boolean) {
  muted = m
  Howler.mute(m)
  try {
    localStorage.setItem(MUTE_KEY, m ? '1' : '0')
  } catch {
    /* private mode: setting lasts for this visit only */
  }
}
