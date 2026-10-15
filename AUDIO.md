# ASTA — Audio Sources

**License:** every pick below is **CC0 (public domain)**. That means no attribution and no fee, and it's safe in a commercial web app. Credit is optional; a "Music: MintoDog · SFX: Kenney.nl" line in the credits is a nice touch.

**Don't use Canva's audio in the app.** Canva's license bars Pro Music outside a Canva design and lists software applications as a restricted use. Popular Music is personal use only.

## In the project (`public/audio/`, all MP3, ~16 MB)

| File | Source |
|---|---|
| `music/title.mp3` | MintoDog — Cozy Puzzle Title |
| `music/cottage.mp3` | MintoDog — Cozy Puzzle In-Game 2 |
| `music/map.mp3` | MintoDog — Cozy Puzzle Stage Select |
| `music/breathing.mp3` | isaiah658 — Heavenly Loop (converted from OGG) |
| `music/games.mp3` | MintoDog — Cozy Puzzle In-Game 1 |
| `sfx/tap.mp3` | Kenney UI Audio `click3` |
| `sfx/page.mp3` | Kenney RPG Audio `bookFlip1` |
| `sfx/emotion-select.mp3` | Kenney Interface `pluck_001` |
| `sfx/correct.mp3` | Kenney Interface `confirmation_001` (rising) |
| `sfx/try-again.mp3` | Kenney Interface `question_002` (soft, not a buzzer) |
| `sfx/card-flip.mp3` | Kenney Casino `card-slide-2` |
| `sfx/card-match.mp3` | Kenney Music Jingles `jingles_PIZZI10` (rising) |
| `sfx/island-unlock.mp3` | Kenney Music Jingles `jingles_STEEL02` (rising steel drum) |
| `sfx/breathe.mp3` | Kenney Interface `glass_004` |
| `sfx/complete.mp3` | MintoDog — Cozy Puzzle Clear (Jingle) |

The SFX were chosen by measuring them (loudness, length, rising vs falling pitch), not by listening. Give them a listen and swap any that feel off. Every Kenney pack has 50–100 alternatives.

**Looping:** MP3 adds a few ms of silence at the start and end. For a seamless loop, play the music through Web Audio (e.g. Howler.js) rather than `<audio loop>`, or trim with `loopStart`/`loopEnd`.

---

## Music loops (5)

All by **MintoDog** except #4. They belong to one "Cozy Puzzle" set, so the soundtrack sounds consistent.

| # | Screen(s) | Track | Feel | Link |
|---|---|---|---|---|
| 1 | Title / "Mulai" | Cozy Puzzle Title (95 bpm) | brass + flute, warm and welcoming | https://opengameart.org/content/cozy-puzzle-title |
| 2 | Cottage chat + Emotional Check | Cozy Puzzle In-Game 2 (90 bpm) | piano + soft synth, relaxing | https://opengameart.org/content/cozy-puzzle-in-game-2 |
| 3 | Island map | Cozy Puzzle Stage Select (100 bpm) | sax + synth, written for level select | https://opengameart.org/content/cozy-puzzle-stage-select |
| 4 | Tataati (breathing) | Heavenly Loop by isaiah658 | dreamy ambient pad, no beat | https://opengameart.org/content/heavenly-loop |
| 5 | Reronce / Srawung / Titen | Cozy Puzzle In-Game 1 (118 bpm) | bossa nova, sax/flute/mallets, playful | https://opengameart.org/content/cozy-puzzle-in-game-1 |

- **#4: listen to it first.** It's tagged "choir/angel," which may read oddly here. **Alt:** *Morning Sky* by Centurion_of_war (CC0, loopable, has a piano version) — https://opengameart.org/node/179462
- **Bonus (CC0):** *Cozy Puzzle Jingle & Result* has a Clear jingle and loop and a Failure jingle and loop that match the set — https://opengameart.org/content/cozy-puzzle-jingle-result

## Sound effects (10)

Final picks are listed under "In the project" above.

| # | Moment | Source pack (CC0) | What to pick |
|---|---|---|---|
| 1 | Button tap (Mulai, →, Lanjut) | [UI Audio](https://kenney.nl/assets/ui-audio) | soft click |
| 2 | Next page / panel change | [RPG Audio](https://kenney.nl/assets/rpg-audio) | book / page flip |
| 3 | Emotion card select | [Interface Sounds](https://kenney.nl/assets/interface-sounds) | select / pluck pop |
| 4 | Correct answer (Titen) | [Interface Sounds](https://kenney.nl/assets/interface-sounds) | confirmation chime |
| 5 | "Try again" (Titen) | [Interface Sounds](https://kenney.nl/assets/interface-sounds) | softest question/error tone. **No buzzer**; this is a kids' wellbeing app |
| 6 | Card flip (Srawung) | [Casino Audio](https://kenney.nl/assets/casino-audio) | card slide / place |
| 7 | Card match (Srawung) | [Music Jingles](https://kenney.nl/assets/music-jingles) | short pizzicato jingle |
| 8 | Island unlocked / reward | [Music Jingles](https://kenney.nl/assets/music-jingles) | steel-drum jingle (tropical, fits the islands) |
| 9 | Breathe in / out cue (Tataati) | [Interface Sounds](https://kenney.nl/assets/interface-sounds) | glass / bong chime, quiet |
| 10 | Activity complete | MintoDog *Cozy Puzzle Clear (Jingle)* | from the bonus pack above |

Optional extras: mascot speech-bubble pop (Interface Sounds → drop/pluck) and a map-travel swoosh (Interface Sounds → maximize).

**Optional upgrade for #9:** a real singing-bowl recording. On Freesound, search "singing bowl" with the **license filter = CC0**, and check the license on the sound's page.

## Optional: Indonesian flavour

To add an angklung or gamelan color, search Pixabay Music/SFX for "angklung" or "gamelan". Pixabay's license is free, needs no attribution, and allows modification. It only bans *standalone* redistribution, and bundling the audio inside the app isn't standalone. Keep a note of each file's URL and download date.

## Mixing notes
- Music at about 30–40% volume and SFX at about 70%. Fade 400 ms between screens.
- Tataati: fade the music to about 15% so the breathing cues lead.
- The first sound only plays after the user taps **Mulai**, because browsers block autoplay. That works well.
- Add a mute toggle that remembers its setting.
