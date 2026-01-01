# Audio Files Download Guide

## Required Files

You need 3 audio files for the "Call with AI" feature:

1. **ring-tone.mp3** - Classic phone ring sound (2-3 seconds, loops)
2. **call-connect.mp3** - Connection beep (0.5 seconds)
3. **call-end.mp3** - Call end sound (0.5 seconds)

---

## Option 1: Free Audio Libraries (Recommended)

### 1. Freesound.org (Best Option)
**Website:** https://freesound.org

**Steps:**
1. Create a free account
2. Search for:
   - "phone ring" or "telephone ring" → Download a 2-3 second loop
   - "beep" or "notification beep" → Download a short beep
   - "call end" or "hang up" → Download a short sound
3. Filter by:
   - License: CC0 (Public Domain) or CC BY (Attribution)
   - Format: MP3
   - Duration: Match the requirements above
4. Download and rename files

**Example searches:**
- Ring tone: https://freesound.org/search/?q=phone+ring
- Beep: https://freesound.org/search/?q=beep+notification
- Call end: https://freesound.org/search/?q=hang+up

---

### 2. Zapsplat.com
**Website:** https://www.zapsplat.com

**Steps:**
1. Create a free account
2. Search for:
   - "phone ring"
   - "beep"
   - "call end"
3. Download MP3 files
4. Free account requires attribution (add to your README)

---

### 3. Mixkit.co
**Website:** https://mixkit.co/free-sound-effects/

**Steps:**
1. Browse "Notification" or "UI" sounds
2. Download MP3 files
3. All sounds are free, no attribution required

---

### 4. Pixabay
**Website:** https://pixabay.com/music/search/ring/

**Steps:**
1. Search for "phone ring" or "notification"
2. Filter by: Free, MP3
3. Download and use (no attribution required)

---

## Option 2: Generate Simple Beeps (Quick Solution)

If you can't find files, you can generate simple beeps using online tools:

### Online Tone Generators:
1. **Online Tone Generator:** https://onlinetonegenerator.com/
   - Generate a 800Hz tone for 2 seconds → Save as ring-tone.mp3
   - Generate a 1000Hz tone for 0.5 seconds → Save as call-connect.mp3
   - Generate a 600Hz tone for 0.5 seconds → Save as call-end.mp3

2. **AudioMass:** https://audiomass.co/
   - Create simple tones
   - Export as MP3

---

## Option 3: Use System Sounds (Mac/Windows)

### Mac:
1. System sounds are in `/System/Library/Sounds/`
2. Copy:
   - `Glass.aiff` → Convert to ring-tone.mp3
   - `Ping.aiff` → Convert to call-connect.mp3
   - `Basso.aiff` → Convert to call-end.mp3
3. Use online converter: https://cloudconvert.com/aiff-to-mp3

### Windows:
1. System sounds are in `C:\Windows\Media\`
2. Copy:
   - `Ring01.wav` → Convert to ring-tone.mp3
   - `Notify.wav` → Convert to call-connect.mp3
   - `Windows Logoff.wav` → Convert to call-end.mp3
3. Use online converter: https://cloudconvert.com/wav-to-mp3

---

## Recommended Downloads (Direct Links)

### Ring Tone:
- **Freesound:** https://freesound.org/people/InspectorJ/sounds/345680/
  - Search: "Phone Ring" by InspectorJ
  - License: CC BY 3.0

### Beep/Connect:
- **Freesound:** https://freesound.org/people/InspectorJ/sounds/411790/
  - Search: "Beep" by InspectorJ
  - License: CC BY 3.0

### Call End:
- **Freesound:** https://freesound.org/people/InspectorJ/sounds/411790/
  - Search: "Hang Up" or use a short beep

---

## File Placement

Once downloaded, place files here:
```
frontend/public/audio/
├── ring-tone.mp3
├── call-connect.mp3
└── call-end.mp3
```

---

## File Specifications

- **Format:** MP3
- **Sample Rate:** 44.1kHz (standard)
- **Bitrate:** 128kbps or higher
- **Ring Tone:** 2-3 seconds, should loop seamlessly
- **Connect/End:** 0.5 seconds each

---

## Quick Start (If You Just Want It Working)

1. Go to https://freesound.org
2. Search "phone ring" → Download a 2-3 second file → Rename to `ring-tone.mp3`
3. Search "beep" → Download a short beep → Rename to `call-connect.mp3`
4. Use the same beep file → Copy and rename to `call-end.mp3`
5. Place all 3 files in `frontend/public/audio/`

**Note:** The app will work without these files (uses beep fallback), but having proper audio files improves the user experience!

---

## License Notes

- **CC0 (Public Domain):** No attribution required ✅
- **CC BY:** Requires attribution (add to your app's credits)
- **Commercial Use:** Check license before using in production

Most free sound libraries allow commercial use, but always verify the license!

