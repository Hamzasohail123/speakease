# Audio Files for Call with AI

## Required Audio Files

Place the following audio files in this directory:

1. **ring-tone.mp3** - Classic phone ring sound
   - Duration: 2-3 seconds
   - Format: MP3, 44.1kHz
   - Should loop seamlessly

2. **call-connect.mp3** - Connection beep sound
   - Duration: 0.5 seconds
   - Format: MP3
   - Played when AI answers

3. **call-end.mp3** - Call end sound
   - Duration: 0.5 seconds
   - Format: MP3
   - Played when call ends

## Quick Download Guide

See **[DOWNLOAD_GUIDE.md](./DOWNLOAD_GUIDE.md)** for detailed instructions on where to download these files.

### Quick Start:
1. **Freesound.org** (Recommended) - https://freesound.org
   - Search "phone ring" → Download → Rename to `ring-tone.mp3`
   - Search "beep" → Download → Rename to `call-connect.mp3` and `call-end.mp3`

2. **Alternative Sources:**
   - Zapsplat.com
   - Mixkit.co
   - Pixabay.com

## Note

**The app works without these files!** It uses beep sounds as fallback. But adding proper audio files improves the user experience.

## File Placement

```
frontend/public/audio/
├── ring-tone.mp3
├── call-connect.mp3
└── call-end.mp3
```

