# OpenAI Realtime API Connection Issue - Root Cause Analysis

## Problem Summary
The "Call with AI" feature connects successfully but immediately disconnects with error "OpenAI connection closed" (code 1011).

## Research Findings

### Root Causes (Priority Order)

#### 1. **Invalid Session Configuration Format** ⚠️ HIGHEST PROBABILITY

**Issue:**
The `session.update` message format is likely incorrect or incomplete.

**Current Implementation:**
```typescript
{
  type: 'session.update',
  session: {
    modalities: ['audio', 'text'],
    instructions: systemPrompt,
    voice: 'nova',
    input_audio_format: 'pcm16',
    output_audio_format: 'pcm16',
    turn_detection: { ... },
    temperature: 0.7,
    max_response_output_tokens: 4096,
  }
}
```

**Potential Problems:**
- Missing required fields
- Invalid field values
- Wrong message structure
- Fields in wrong location (some might need to be at root level, not in `session`)

**Evidence:**
- Connection closes immediately after sending `session.update`
- Code 1011 = Server-side rejection
- Connection establishes (auth works) but closes after config

#### 2. **Incorrect Connection Method** ⚠️ HIGH PROBABILITY

**Issue:**
Using raw WebSocket might not be the correct approach. OpenAI likely expects:
- Official SDK usage
- Specific WebSocket subprotocols
- Different connection sequence

**Evidence:**
- OpenAI documentation emphasizes using SDK
- Other developers report similar issues with raw WebSocket
- SDK handles connection complexity automatically

#### 3. **Missing Server Event Handling** ⚠️ MEDIUM PROBABILITY

**Issue:**
Not properly handling OpenAI's server events:
- Not waiting for `session.created` event
- Not handling `session.updated` confirmation
- Missing required event responses

**Evidence:**
- We send config but don't wait for confirmation
- OpenAI might expect acknowledgment

#### 4. **Audio Format/Timing Issues** ⚠️ MEDIUM PROBABILITY

**Issue:**
- Sending audio before session is ready
- Wrong audio format
- Incorrect sample rate or encoding

**Evidence:**
- Audio decoding errors in console
- Connection might close when receiving audio

#### 5. **API Key Permissions** ⚠️ LOW PROBABILITY

**Issue:**
- API key might not have Realtime API access
- Key valid but lacks required permissions

**Evidence:**
- Connection establishes (suggests auth works)
- But closes immediately (might be permission issue)

## Recommended Solutions

### Solution 1: Use OpenAI Official SDK ⭐ RECOMMENDED

**Why:**
- Handles all complexity correctly
- Official support and updates
- Better error messages
- Built-in reconnection

**Implementation:**
```typescript
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
const session = await client.beta.realtime.connect({
  model: 'gpt-4o-realtime-preview-2024-12-17',
  voice: 'nova',
  instructions: systemPrompt,
  modalities: ['audio', 'text'],
  input_audio_format: 'pcm16',
  output_audio_format: 'pcm16',
});
```

**Pros:**
- ✅ Official support
- ✅ Handles edge cases
- ✅ Future-proof
- ✅ Better error handling

**Cons:**
- ⚠️ Need to refactor current code
- ⚠️ Different API surface

### Solution 2: Fix Raw WebSocket (If keeping current approach)

**Required Changes:**

1. **Fix Session Update Format**
   - Verify exact message structure from OpenAI docs
   - Check if fields should be at root level
   - Validate all parameter values

2. **Add Event Handling**
   - Wait for `session.created` before sending config
   - Handle `session.updated` confirmation
   - Respond to required server events

3. **Fix Connection Sequence**
   ```typescript
   // Correct sequence:
   // 1. Connect WebSocket
   // 2. Wait for connection ready
   // 3. Wait for session.created event
   // 4. Send session.update
   // 5. Wait for session.updated confirmation
   // 6. Start sending audio
   ```

4. **Add Keep-Alive**
   - Implement ping/pong messages
   - Handle idle timeouts

### Solution 3: Switch to Alternative Platform

**Options:**
- **ElevenLabs Conversational AI** - Easier, better docs
- **Deepgram Aura** - Good real-time STT
- **WebRTC + OpenAI APIs** - More control

## Immediate Debugging Steps

### Step 1: Capture OpenAI's Error Message
Add logging to capture ALL messages from OpenAI:
```typescript
openaiWs.on('message', (data) => {
  logger.info('OpenAI message (raw):', data);
  // Log everything before parsing
});
```

### Step 2: Test Minimal Configuration
Try sending minimal session.update:
```json
{
  "type": "session.update",
  "session": {
    "modalities": ["text"],  // Text only first
    "instructions": "Hello"
  }
}
```

### Step 3: Check API Key Permissions
Verify the API key has Realtime API access enabled.

### Step 4: Review Backend Logs
Check for:
- Exact error messages from OpenAI
- Close code and reason
- Timing of closure (immediately after what event?)

## Critical Questions

1. **Does OpenAI send an error message before closing?**
   - Check backend logs for `error` type messages
   - Look for any server events before close

2. **What is the exact close reason?**
   - Code 1011 = Internal server error
   - Need the actual reason string

3. **When exactly does it close?**
   - Immediately after `session.update`?
   - After receiving first audio?
   - After timeout?

4. **Does text-only mode work?**
   - Test without audio to isolate issue

## Expected vs Actual Behavior

**Expected Flow:**
1. ✅ WebSocket connects (WORKING)
2. ✅ Send session.update (WORKING)
3. ❓ OpenAI accepts config (UNKNOWN - likely failing here)
4. ❌ Connection stays open (FAILING)
5. ❌ Audio exchange (NOT REACHED)

**Actual Flow:**
1. ✅ WebSocket connects
2. ✅ Send session.update
3. ❌ Connection closes immediately (Code 1011)
4. ❌ No error message captured (or not logged)

## Next Steps

1. **Enable maximum logging** - Capture all OpenAI messages
2. **Test with minimal config** - Text-only mode first
3. **Try OpenAI SDK** - See if it works
4. **Check API key** - Verify Realtime API access
5. **Review logs** - Find exact error from OpenAI

## Decision Matrix

| Scenario | Action |
|----------|--------|
| SDK works | Use OpenAI SDK ✅ |
| SDK fails, API key issue | Fix API key permissions |
| SDK fails, same error | Check OpenAI status, consider alternative |
| Raw WebSocket can be fixed | Fix session.update format |
| Too complex to fix | Switch to ElevenLabs/Deepgram |

## Conclusion

**Most Likely Root Cause:**
The `session.update` message format is incorrect or incomplete, causing OpenAI to reject the connection immediately after receiving it.

**Recommended Action:**
1. First, try using OpenAI's official SDK
2. If SDK works → Use it
3. If SDK fails → Check API key and permissions
4. If still failing → Consider alternative platform

The raw WebSocket approach is complex and error-prone. The SDK is the recommended path.

