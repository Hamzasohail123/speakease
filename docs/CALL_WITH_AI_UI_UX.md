# Call with AI - UI/UX Design Document

**Date:** January 2025  
**Feature:** Real-time voice call interface with phone-like experience

---

## Tab Structure

### Current Tabs
```
Session Page
├── 📝 Text Chat (existing)
└── 🎤 Voice Call (existing - standard mode)
```

### New Structure
```
Session Page
├── 📝 Text Chat
├── 🎤 Voice Call (standard mode)
└── 📞 Call with AI (NEW - real-time phone call)
```

---

## Visual Mockups

### Tab 1: Text Chat (Existing)
```
┌─────────────────────────────────────┐
│  [Text Chat] [Voice Call] [Call AI] │
├─────────────────────────────────────┤
│                                     │
│  Chat messages...                   │
│  [Input field]                      │
│                                     │
└─────────────────────────────────────┘
```

### Tab 2: Voice Call (Existing - Standard Mode)
```
┌─────────────────────────────────────┐
│  [Text Chat] [Voice Call] [Call AI] │
├─────────────────────────────────────┤
│                                     │
│  Voice messages...                │
│  [🎤 Record Button]                 │
│                                     │
└─────────────────────────────────────┘
```

### Tab 3: Call with AI (NEW - Real-Time Phone Call)

---

## State 1: Idle (Ready to Call)

```
┌─────────────────────────────────────────────┐
│  [Text Chat] [Voice Call] [📞 Call with AI]│
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│              ┌───────────┐                  │
│              │           │                  │
│              │    📞     │                  │
│              │  (Large)  │                  │
│              │           │                  │
│              └───────────┘                  │
│                                             │
│         "Tap to start a call"              │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

**Design Details:**
- Large circular phone button (green/primary color)
- Centered on screen
- Phone icon (📞) - 64px size
- Subtle shadow/elevation
- Hover effect: slight scale up
- Text below: "Tap to start a call"

---

## State 2: Ringing (Calling AI)

```
┌─────────────────────────────────────────────┐
│  [Text Chat] [Voice Call] [📞 Call with AI]│
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│         ┌───────────┐                        │
│         │           │                        │
│         │    📞     │  (Pulsing animation)   │
│         │  (Large)  │                        │
│         │           │                        │
│         └───────────┘                        │
│                                             │
│         "Ringing..."                        │
│         [Ring tone 🔊 playing]              │
│                                             │
│              [❌ End Call]                  │
│                                             │
└─────────────────────────────────────────────┘
```

**Design Details:**
- Phone button pulsing animation (scale 1.0 → 1.1 → 1.0)
- Ring tone playing (classic phone ring sound)
- Status text: "Ringing..."
- Small "End Call" button (red, bottom)
- Optional: AI avatar/icon appearing

**Animation:**
- Button pulses every 1 second
- Smooth scale transition
- Ring tone loops 2-3 times

---

## State 3: Connecting (AI Answering)

```
┌─────────────────────────────────────────────┐
│  [Text Chat] [Voice Call] [📞 Call with AI]│
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│              ┌───────────┐                  │
│              │    👤     │                  │
│              │  AI Icon  │                  │
│              └───────────┘                  │
│                                             │
│         "Connecting..."                     │
│         [Loading spinner]                   │
│                                             │
│              [❌ End Call]                  │
│                                             │
└─────────────────────────────────────────────┘
```

**Design Details:**
- AI avatar/icon appears
- Loading spinner
- Status: "Connecting..."
- Brief state (1-2 seconds)

---

## State 4: In-Call (Active Conversation)

```
┌─────────────────────────────────────────────┐
│  [Text Chat] [Voice Call] [📞 Call with AI]│
├─────────────────────────────────────────────┤
│                                             │
│              ┌───────────┐                  │
│              │    👤     │                  │
│              │  AI Icon  │                  │
│              └───────────┘                  │
│                                             │
│         "AI Partner"                        │
│         "02:15" (call duration)             │
│                                             │
│    ┌─────────────────────────┐             │
│    │  ▁▃▅▇█▇▅▃▁  (Waveform)  │             │
│    │  "AI is speaking..."     │             │
│    └─────────────────────────┘             │
│                                             │
│         [🎤 You are speaking]              │
│                                             │
│    [🔇 Mute]  [🔊 Speaker]  [📞 End Call] │
│                                             │
└─────────────────────────────────────────────┘
```

**Design Details:**
- AI avatar/icon at top
- AI name: "AI Partner"
- Call duration timer (MM:SS format)
- Animated waveform when AI speaks
- Microphone indicator when user speaks
- Control buttons at bottom:
  - Mute button (🔇)
  - Speaker button (🔊)
  - End Call button (📞 - red, prominent)

**Waveform Animation:**
- Animated bars showing audio levels
- Smooth transitions
- Color changes based on volume
- Shows when AI is speaking

---

## State 5: User Speaking

```
┌─────────────────────────────────────────────┐
│  [Text Chat] [Voice Call] [📞 Call with AI]│
├─────────────────────────────────────────────┤
│                                             │
│              ┌───────────┐                  │
│              │    👤     │                  │
│              │  AI Icon  │                  │
│              └───────────┘                  │
│                                             │
│         "AI Partner"                        │
│         "03:42"                             │
│                                             │
│    ┌─────────────────────────┐             │
│    │  ▁▃▅▇█▇▅▃▁  (Your audio)│             │
│    │  "You are speaking..."  │             │
│    └─────────────────────────┘             │
│                                             │
│         [🎤 Recording...]                   │
│                                             │
│    [🔇 Mute]  [🔊 Speaker]  [📞 End Call] │
│                                             │
└─────────────────────────────────────────────┘
```

**Design Details:**
- Waveform shows user's audio input
- Microphone icon active
- Status: "You are speaking..." or "Recording..."
- Real-time transcription (optional, below waveform)

---

## State 6: Call Ended

```
┌─────────────────────────────────────────────┐
│  [Text Chat] [Voice Call] [📞 Call with AI]│
├─────────────────────────────────────────────┤
│                                             │
│              ┌───────────┐                  │
│              │    ✅     │                  │
│              │  Check    │                  │
│              └───────────┘                  │
│                                             │
│         "Call ended"                        │
│         "Duration: 05:23"                   │
│                                             │
│    ┌─────────────────────────┐             │
│    │  Call Summary            │             │
│    │  • Topics discussed    │             │
│    │  • Mistakes found      │             │
│    │  • View full report    │             │
│    └─────────────────────────┘             │
│                                             │
│         [📞 Call Again]                    │
│                                             │
└─────────────────────────────────────────────┘
```

**Design Details:**
- Check mark icon
- Call duration displayed
- Brief call summary
- "Call Again" button
- Link to full session report

---

## Component Specifications

### 1. Call Button (Main)

**Size:**
- Mobile: 120px × 120px
- Desktop: 150px × 150px

**Colors:**
- Idle: Primary green (#10B981)
- Ringing: Pulsing (scale animation)
- In-Call: Gray/disabled

**States:**
- Idle: Static, hover effect
- Ringing: Pulsing animation
- In-Call: Hidden or disabled

**Icon:**
- Lucide React: `Phone` icon
- Size: 64px (mobile), 80px (desktop)

---

### 2. Waveform Component

**Visual:**
- Animated bars (5-10 bars)
- Height varies with audio level
- Smooth transitions
- Color: Primary gradient

**Animation:**
- 60fps smooth animation
- Reacts to audio levels in real-time
- Shows direction (AI vs User)

**States:**
- AI Speaking: Blue/purple gradient
- User Speaking: Green gradient
- Silent: Gray, minimal height

---

### 3. Call Status Display

**Shows:**
- Current state (Ringing, Connected, etc.)
- Call duration (MM:SS)
- Connection quality (optional)

**Typography:**
- State: Large, bold (24px)
- Duration: Medium (18px)
- Quality: Small (12px)

---

### 4. Control Buttons

**Layout:**
- Bottom of screen
- Horizontal row
- Equal spacing

**Buttons:**
1. **Mute** (🔇)
   - Toggle microphone
   - Visual feedback when muted
   - Red indicator when muted

2. **Speaker** (🔊)
   - Toggle speakerphone
   - Visual feedback
   - Active state indicator

3. **End Call** (📞)
   - Red color
   - Larger size
   - Prominent placement

**Size:**
- 56px × 56px (mobile)
- 64px × 64px (desktop)

---

## Audio Experience

### Ring Tone

**Sound:**
- Classic phone ring
- 2-3 second loop
- Play 2-3 times before AI answers

**Implementation:**
- MP3/WAV file
- Play on call start
- Stop on AI answer
- Optional: User can mute

**File:**
- `public/audio/ring-tone.mp3`
- 2-3 seconds duration
- 44.1kHz, 16-bit

---

### Connection Sounds

**Call Connect:**
- Subtle "beep" or "click"
- Play when AI answers
- 0.5 seconds

**Call End:**
- Subtle "beep" or "hang-up" sound
- Play when call ends
- 0.5 seconds

**Files:**
- `public/audio/call-connect.mp3`
- `public/audio/call-end.mp3`

---

## Animations

### 1. Call Button Pulse (Ringing)

```css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.ringing {
  animation: pulse 1s ease-in-out infinite;
}
```

### 2. Waveform Animation

```css
@keyframes waveform {
  0%, 100% { height: 20%; }
  50% { height: 100%; }
}

.waveform-bar {
  animation: waveform 0.5s ease-in-out infinite;
  animation-delay: var(--delay);
}
```

### 3. State Transitions

- Fade in/out (300ms)
- Smooth scale transitions
- Color transitions

---

## Responsive Design

### Mobile (Primary)

**Layout:**
- Full-screen call interface
- Large touch targets (min 44px)
- Bottom-aligned controls
- Centered main content

**Optimizations:**
- One-hand operation
- Thumb-friendly buttons
- Large text
- High contrast

### Desktop

**Layout:**
- Centered call interface
- Max width: 600px
- Larger waveform display
- Keyboard shortcuts

**Keyboard Shortcuts:**
- `Space`: Mute/unmute
- `Escape`: End call
- `S`: Toggle speaker
- `R`: Call again (after end)

---

## Accessibility

### Screen Reader Support

- Announce call state changes
- Announce call duration updates
- Announce button states
- Announce connection quality

**ARIA Labels:**
```html
<button aria-label="Start call with AI">
<button aria-label="End call">
<button aria-label="Mute microphone">
<div role="status" aria-live="polite">Call duration: 02:15</div>
```

### Keyboard Navigation

- Tab through all controls
- Enter/Space to activate
- Escape to end call
- Arrow keys for volume (optional)

### Visual Accessibility

- High contrast mode support
- Large text option
- Color-blind friendly colors
- Clear visual feedback

---

## Implementation Checklist

### Frontend Components

- [ ] `CallWithAI` - Main container
- [ ] `CallButton` - Large phone button
- [ ] `CallStatus` - Status display
- [ ] `Waveform` - Audio visualization
- [ ] `CallControls` - Mute, speaker, end
- [ ] `CallTimer` - Duration display
- [ ] `CallEnded` - Post-call summary

### Audio Files

- [ ] Ring tone (ring-tone.mp3)
- [ ] Call connect sound (call-connect.mp3)
- [ ] Call end sound (call-end.mp3)

### Backend Integration

- [ ] WebSocket connection to OpenAI Realtime API
- [ ] Audio streaming handler
- [ ] Call state management
- [ ] Session integration

### Animations

- [ ] Button pulse animation
- [ ] Waveform animation
- [ ] State transition animations
- [ ] Loading states

### Testing

- [ ] Test on mobile devices
- [ ] Test on desktop browsers
- [ ] Test audio playback
- [ ] Test call states
- [ ] Test error handling
- [ ] Test accessibility

---

## User Flow Diagram

```
[Idle State]
    ↓
[Click Call Button]
    ↓
[Ringing State] → [Ring Tone Plays]
    ↓
[AI Answers] → [Connection Sound]
    ↓
[In-Call State] → [Real-time Conversation]
    ↓
[User Ends Call] → [End Sound]
    ↓
[Call Ended] → [Show Summary]
    ↓
[Call Again?] → [Back to Idle]
```

---

## Next Steps

1. ✅ Review UI/UX design
2. ✅ Create component mockups
3. ✅ Implement components
4. ✅ Add audio files
5. ✅ Integrate with OpenAI Realtime API
6. ✅ Test on devices
7. ✅ Deploy

---

**Goal:** Create a **phone call-like experience** that feels natural, familiar, and comfortable for users practicing English with AI.

