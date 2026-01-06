# AI Calling - Debug Steps & Current Status

## Current Issue
**Symptom**: AI is listening but not responding - no `response.*` messages from OpenAI

## What's Working ✅
1. ✅ WebSocket connection established
2. ✅ Session created and configured
3. ✅ Audio is being captured (non-zero values: `25, 0, 18, 0, 7...`)
4. ✅ Audio chunks being sent to backend (400+ chunks)
5. ✅ Backend forwarding audio to OpenAI

## What's NOT Working ❌
1. ❌ OpenAI not detecting speech (no `input_audio_buffer.speech_started` messages)
2. ❌ OpenAI not generating responses (no `response.*` messages)
3. ⚠️ Backend sometimes receiving JSON as binary (lines 977, 982 in logs)

## Root Cause Analysis

### Most Likely Issue: Audio Level Too Low
- Audio samples are very small (e.g., `25` out of `32768` max = 0.08%)
- VAD threshold is 0.1 (very sensitive), but still not detecting
- OpenAI's VAD might need louder audio to trigger

### Possible Issues:
1. **Microphone gain too low** - Browser/system microphone volume
2. **Audio format issue** - Sample rate mismatch or conversion error
3. **VAD threshold still too high** - Even 0.1 might not be sensitive enough
4. **Audio chunks too small** - 4096 samples = ~170ms, might need larger chunks

## Fixes Applied

### 1. Lowered VAD Threshold
- Changed from `0.3` to `0.1` (very sensitive)
- Should detect quieter speech

### 2. Added Comprehensive Logging
- All message types now logged
- Audio level monitoring added
- Better error detection

### 3. Fixed Audio Conversion
- Proper PCM16 conversion: `Math.round(sample * 32768)`
- Audio level monitoring added

## Next Steps to Debug

### Step 1: Check Microphone Volume
1. **System Settings**: Check OS microphone volume (should be 50%+)
2. **Browser Settings**: Check browser microphone permissions and volume
3. **Test in another app**: Verify microphone works elsewhere

### Step 2: Increase Audio Gain
If audio level is consistently low (< 5%), we may need to:
- Add gain amplification in frontend
- Or adjust microphone input level

### Step 3: Test with Louder Speech
- Speak directly into microphone
- Speak louder than normal
- Check if OpenAI detects speech

### Step 4: Check Backend Logs
Look for these messages:
- `[REALTIME] 👤 User started speaking` - Should appear when you speak
- `[REALTIME] 👤 User audio committed` - Should appear after speech
- `[REALTIME] 🤖 AI started responding` - Should appear after silence

### Step 5: Try Different VAD Settings
If still not working, try:
- `threshold: 0.05` (extremely sensitive)
- Or switch to `client_vad` instead of `server_vad`

## Code Changes Made

### Backend (`websocketProxy.ts`)
1. ✅ Lowered VAD threshold to 0.1
2. ✅ Added comprehensive message logging
3. ✅ Added audio level monitoring
4. ✅ Better error handling

### Frontend (`call-with-ai.tsx`)
1. ✅ Fixed PCM16 conversion formula
2. ✅ Added session ready check
3. ✅ Added audio level monitoring
4. ✅ Better error messages

## Testing Checklist

- [ ] Microphone volume is adequate (50%+)
- [ ] Speaking clearly and loudly
- [ ] Backend logs show audio chunks being sent
- [ ] Backend logs show `input_audio_buffer.speech_started`
- [ ] Backend logs show `response.created`
- [ ] Frontend receives `response.audio.delta` messages
- [ ] Audio plays in browser

## If Still Not Working

### Option 1: Add Audio Gain
```typescript
// In frontend audio processing
const gain = 2.0; // Amplify audio by 2x
const amplified = inputData.map(sample => Math.max(-1, Math.min(1, sample * gain)));
```

### Option 2: Use Client-Side VAD
Switch from `server_vad` to `client_vad` and send explicit events:
```typescript
// When speech detected
ws.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
```

### Option 3: Check OpenAI API Status
- Verify API key has Realtime API access
- Check OpenAI status page
- Test with OpenAI's official examples

---

**Last Updated**: 2024-12-29
**Status**: Debugging in progress

