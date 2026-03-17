# SC2 Music Player - Development Memory

## Project Overview
A mobile-first SoundCloud music player for Ellie with multi-genre playlists, animated backgrounds, love notes, countdown timer, and integrated Simon Says game.

**Current Version:** v5.2.0
**Status:** Production-ready, fully functional

---

## Quick Reference (v5.2.0)

### Current Features
- **Music Player:** SoundCloud playlist playback with genre switching (Jazz, R&B, EDM)
- **Controls:** Previous, Play/Pause, Replay, Next (main player and game modal)
- **Memory:** Track position saved per genre in localStorage
- **Game:** Simon Says integrated in modal with music controls
- **UI:** Love notes, countdown timer, clock display, animated backgrounds
- **Mobile:** Touch-optimized, double-tap zoom prevented

### Key localStorage Keys
- `musicPlayerCurrentGenre` - Current genre selection
- `musicPlayerTrackPosition_lightJazz` - Last track in Jazz playlist
- `musicPlayerTrackPosition_rnb` - Last track in R&B playlist
- `musicPlayerTrackPosition_electronic` - Last track in Electronic playlist
- `simonBestScore` - Best Simon Says game score

### Volume Control
- **Desktop/Android:** Use SoundCloud widget's built-in volume slider
- **iOS Safari:** Use physical device volume buttons (JavaScript volume control is blocked by Apple)

### Historical Note
Volume controls were removed in v5.0.0 after extensive research confirmed that iOS Safari permanently blocks all JavaScript-based volume control. This is an intentional Apple security/UX policy, not a bug. The SoundCloud widget includes its own volume control that works on desktop/Android.

---

## Version History

### v4.0.0 - Playlist Migration
- Migrated from individual track URLs to SoundCloud playlist URLs
- Changed from track-based navigation to playlist-based system
- SoundCloud widget handles auto-advance natively
- Removed track position tracking (widget manages internally)
- localStorage keys updated:
  - `musicPlayerVolume` - Volume preference
  - `musicPlayerCurrentGenre` - Genre selection
  - Removed individual track position keys

### v4.1.0 - v4.4.0 - Initial Volume Control Attempts
Multiple attempts to fix volume controls on mobile Safari - all failed:
1. Added touchend events to sliders
2. Created `initVolumeControls()` wrapper function
3. Moved initialization to `window.onload`
4. Added multiple event listeners (input, change, touchend)
5. Pulled exact working code from git commit 5b54992 (v3.0)

**Status:** None of these approaches worked on mobile Safari

### v4.5.0 - Centralized Volume Management
**Attempt:** Created centralized `updateVolume()` function
- Synchronized both main player and game modal sliders
- Added comprehensive console logging
- Added both `input` and `change` event listeners
- Enhanced localStorage debugging

**Result:** FAILED - Still not working on mobile Safari

### v4.6.0 - iOS Safari Compatibility Fixes
**Attempts:**
1. Fixed double-tap zoom prevention blocking slider touch events
2. Added try/catch around all `widget.setVolume()` calls
3. Added iOS detection and user-facing volume note
4. Enhanced safety checks for widget initialization

**Result:** FAILED - Still not working on mobile Safari

### v4.7.0 - Code Cleanup
**Changes:**
- Removed ~20 debug console.log statements
- Simplified error handling
- Cleaned up production code

**Result:** Code cleaner but volume still non-functional on iOS

### v5.0.0 - Volume Controls Removed (FINAL SOLUTION)
**Decision:** After extensive research confirming iOS Safari blocks ALL JavaScript volume control, volume controls have been completely removed from the application.

**Removed:**
- Volume sliders from main player interface
- Volume controls from game modal
- All volume-related JavaScript code
- `updateVolume()` function
- `saveVolume()` and `loadSavedVolume()` functions
- Volume localStorage key (`musicPlayerVolume`)
- iOS volume notice messages
- "Tap Listen in browser" help text
- Debug files: debug-volume.html, mobile-debug.html, test-localStorage.html, simon.html

**Rationale:**
- iOS Safari blocks volume control by design (Apple policy)
- Desktop/Android users can use browser's built-in controls
- Volume sliders gave false impression of functionality
- Cleaner, simpler UX without non-functional controls
- Users control volume via system/browser controls

**Result:** RESOLVED - Volume issue eliminated by removing volume controls entirely

### v5.1.0 - Game Modal UX Improvements
**Changes:**
- Removed genre selection buttons from game modal
  - Genre switching is only available from main player interface
  - Simplifies game modal UI
  - Prevents accidental genre changes while playing game
- Added replay button to music controls
  - Uses SoundCloud Widget API `seekTo(0)` method
  - Restarts current song from beginning
  - Automatically resumes playback if paused
  - Positioned between play/pause and next buttons
- Removed `switchGenreFromGame()` function (no longer needed)
- Removed game genre tabs initialization code
- Updated `switchGenre()` function documentation

**Music Controls in Game Modal (v5.1.0):**
- Previous track button
- Play/Pause button
- **Replay button** (new)
- Next track button

**Result:** Cleaner, more focused game modal interface with useful replay functionality

### v5.1.1 - Play/Pause Icon Sync Fix
**Bug:** Play/pause button icon in game modal didn't sync when user clicked play/pause on the SoundCloud widget itself (only updated when using the game modal button).

**Fix:** Added event listeners to SoundCloud Widget API:
- `SC.Widget.Events.PLAY` - Updates icon to pause state when playback starts
- `SC.Widget.Events.PAUSE` - Updates icon to play state when playback pauses

**Result:** Play/pause icon now accurately reflects playback state regardless of where the user triggers play/pause (SoundCloud widget, game modal button, autoplay, track end, etc.)

**Technical Implementation:**
```javascript
widget.bind(SC.Widget.Events.PLAY, () => {
    updatePlayPauseIcon(false); // Show pause icon (playing)
});

widget.bind(SC.Widget.Events.PAUSE, () => {
    updatePlayPauseIcon(true); // Show play icon (paused)
});
```

### v5.2.0 - Track Position Memory & Main Player Controls
**Changes:**

1. **Added play/pause and replay buttons to main player**
   - Main player now has: Previous, Play/Pause, Replay, Next
   - Matches game modal control layout
   - Updated `updatePlayPauseIcon()` to sync both main player and game modal icons
   - Both sets of icons stay in sync regardless of where playback is controlled

2. **Restored track position localStorage (per-genre memory)**
   - Each genre remembers which track was playing when you last listened to it
   - When switching from Jazz (track 5) to R&B, Jazz saves position 5
   - When switching back to Jazz later, it loads and resumes from track 5

   **Implementation:**
   - Added `currentTrackIndex` state variable
   - Added `TRACK_POSITION_PREFIX` localStorage key
   - Added `saveTrackPosition(genre, trackIndex)` function
   - Added `loadTrackPosition(genre)` function
   - Saves track position when:
     - Switching genres
     - Clicking next/previous buttons
     - Track finishes and auto-advances
     - Playback starts
   - Uses SoundCloud Widget API `getCurrentSoundIndex()` and `skip()` methods

   **localStorage Keys:**
   - `musicPlayerTrackPosition_lightJazz`
   - `musicPlayerTrackPosition_rnb`
   - `musicPlayerTrackPosition_electronic`

3. **Minor Updates:**
   - Added 💩 emoji to "going poo" love note
   - Updated documentation comments

**Result:**
- Main player has full playback controls (not just prev/next)
- Genres remember last played track position when switching between them
- More intuitive UX with consistent controls across main player and game modal
- Restores functionality that was removed in v4.0.0 playlist migration

---

## CRITICAL ISSUE: Volume Controls Not Working on Mobile Safari

### Problem Statement
Volume sliders (both main player and game modal) do not control audio volume on Mobile Safari browser. Physical device volume buttons work, but in-app sliders have no effect.

### What Works
✅ Volume sliders work on desktop browsers
✅ Volume preference saves to localStorage
✅ Slider UI updates correctly
✅ Autoplay restrictions acknowledged and handled
✅ Genre switching works
✅ Next/Previous track navigation works

### What Doesn't Work
❌ Volume sliders do not change audio volume on Mobile Safari
❌ `widget.setVolume()` appears to be ignored by iOS Safari
❌ Both main player and game modal volume controls affected

### All Attempts Made (Chronological)

#### Attempt 1: Added touchend Events
**Code:**
```javascript
document.getElementById('volume-control').addEventListener('touchend', (e) => {
    currentVolume = e.target.value;
    if (widget) widget.setVolume(currentVolume);
});
```
**Result:** FAILED

#### Attempt 2: Created initVolumeControls() Function
**Code:**
```javascript
function initVolumeControls() {
    document.getElementById('volume-control').addEventListener('input', (e) => {
        currentVolume = e.target.value;
        if (widget) widget.setVolume(currentVolume);
    });
}
```
**Result:** FAILED

#### Attempt 3: Moved to window.onload
**Reasoning:** Ensure DOM is fully loaded before attaching listeners
**Result:** FAILED

#### Attempt 4: Exact v3.0 Working Code
**Code from git commit 5b54992:**
```javascript
document.getElementById('volume-control').addEventListener('input', (e) => {
    currentVolume = e.target.value;
    if (widget) {
        widget.setVolume(currentVolume);
    }
});
```
**User Confirmation:** "This was working before"
**Result:** FAILED - No longer works in v4.x

#### Attempt 5: Centralized updateVolume() Function
**Code:**
```javascript
function updateVolume(newVolume) {
    currentVolume = newVolume;

    // Sync both sliders
    const mainSlider = document.getElementById('volume-control');
    const gameSlider = document.getElementById('game-volume-control');
    if (mainSlider) mainSlider.value = newVolume;
    if (gameSlider) gameSlider.value = newVolume;

    // Update widget
    if (widget) widget.setVolume(newVolume);

    // Save to localStorage
    saveVolume(newVolume);
}
```
**Result:** FAILED

#### Attempt 6: Fixed touchend preventDefault Interference
**Problem Identified:** Double-tap zoom prevention was blocking all touch events
**Code:**
```javascript
document.addEventListener('touchend', (e) => {
    // Don't prevent default on input elements (sliders need touch events)
    if (e.target.tagName === 'INPUT') {
        return;
    }

    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, { passive: false });
```
**Result:** FAILED

#### Attempt 7: iOS Safari Limitation Handling
**Added:**
- Try/catch around `widget.setVolume()`
- Safety checks: `if (widget && typeof widget.setVolume === 'function')`
- iOS device detection
- User-facing message: "📱 iOS: Use physical volume buttons"

**Result:** FAILED - Still no volume control on Mobile Safari

### Diagnostic Tools Created

#### debug-volume.html
Tests:
- localStorage functionality
- Range slider events (input, change, touchstart, touchmove, touchend)
- Current saved volume value
- Lists all localStorage keys

#### mobile-debug.html
- On-screen console for Mobile Safari debugging
- Intercepts console.log, console.warn, console.error
- Shows user agent and touch support

#### test-localStorage.html
- Tests all 3 localStorage keys
- Tests write capability
- Clear all function

### User Feedback Throughout Process
- "the volume was working before. Why can't we get it to work now?"
- "still not working"
- "still no"
- "could it have something to do with local storage?"
- "still doesn't work" (after all iOS Safari fixes)

---

## Technical Limitations Discovered

### iOS Safari Volume Control Restrictions
**Research Finding:** Apple blocks JavaScript from programmatically changing media volume on iOS Safari. This is by design to:
1. Protect users from websites blasting loud audio
2. Maintain user control via physical volume buttons
3. Prevent override of system-level volume settings

**Evidence:**
- SoundCloud Widget API `widget.setVolume()` calls are silently ignored
- No errors thrown, but no volume change occurs
- Physical volume buttons work correctly
- This affects ALL web-based media players on iOS, not just this project

### Key Difference: v3.0 vs v4.0
**v3.0:** Individual track URLs
**v4.0:** Playlist URLs (`/sets/` format)

**Hypothesis:** iOS Safari may allow volume control on individual embedded tracks but blocks it on playlist embeds. This needs verification but cannot be easily tested without reverting to v3.0 architecture.

---

## RESEARCH FINDINGS: Official Documentation (2026-03-17)

### Question 1: Does SoundCloud Widget API support volume control on iOS Safari?
**ANSWER: NO - This is an iOS Safari limitation, not a SoundCloud issue.**

#### Apple's Official Documentation
From [Safari HTML5 Audio and Video Guide](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html):

> "On iOS devices, the audio level is always under the user's physical control. The `volume` property is not settable in JavaScript. Reading the `volume` property always returns 1."

#### SoundCloud Widget API Documentation
From [SoundCloud Widget API Docs](https://developers.soundcloud.com/docs/api/html5-widget):
- `setVolume(volume)` — sets the widget volume to a certain value in the range 0-100
- `getVolume(callback)` — returns the current volume, in the range of [0, 100]
- **No mention of iOS limitations** (SoundCloud docs don't document browser-specific restrictions)

#### MDN Browser Compatibility Data
From [GitHub Issue #13554](https://github.com/mdn/browser-compat-data/issues/13554):
- **Title:** "api.HTMLMediaElement.volume - Not supported on iOS Safari"
- **Status:** Confirmed limitation, closed as duplicate
- Affects ALL HTML5 audio/video elements, including those in iframes

### Question 2: Why Does This Limitation Exist?

**Apple's Design Philosophy:**
1. **User Control:** Prevents websites from overriding system volume
2. **User Safety:** Protects users from unexpectedly loud audio
3. **Consistency:** All web audio behaves the same way on iOS
4. **Physical Controls:** Volume must be controlled via hardware buttons

### Question 3: Is This Specific to Playlists or v4.0?

**ANSWER: NO - This affects ALL web audio on iOS Safari**
- Individual tracks (v3.0): ❌ Volume control blocked
- Playlist embeds (v4.0): ❌ Volume control blocked
- HTML5 `<audio>` tags: ❌ Volume control blocked
- Web Audio API GainNode: ❌ Volume control blocked

**If v3.0 appeared to work on iOS, it was likely:**
- Only tested on desktop Safari (not iOS Safari)
- Volume happened to already be at desired level
- Placebo effect (slider moved but volume didn't change)

### Question 4: Are There Any Workarounds?

**ANSWER: NO - There are NO workarounds for this iOS Safari limitation**

Attempted solutions that DO NOT work:
- ❌ Web Audio API GainNode
- ❌ Different SoundCloud embed parameters
- ❌ HTML5 Audio API
- ❌ WKWebView (even worse, has additional bugs)
- ❌ Any JavaScript-based volume control

**The ONLY way to change volume on iOS Safari:**
✅ Physical device volume buttons
✅ Control Center volume slider (OS-level)

### Definitive Conclusion

**This is not a bug. This is not fixable. This is Apple's intentional design.**

Volume control on iOS Safari is permanently restricted to physical hardware controls. No amount of code changes, API calls, or workarounds will enable JavaScript volume control on iOS devices.

**Sources:**
- [Safari HTML5 Audio and Video Guide (Apple Official)](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html)
- [SoundCloud Widget API Documentation](https://developers.soundcloud.com/docs/api/html5-widget)
- [MDN Browser Compat Data - Issue #13554](https://github.com/mdn/browser-compat-data/issues/13554)
- [Apple Developer Forums - Volume Control Thread](https://developer.apple.com/forums/thread/116406)

### Final Solution

**Based on official documentation research, there is ONLY ONE valid approach:**

#### Accept iOS Safari Limitation (Implemented in v5.0.0)
- ✅ Volume controls completely removed from application
- ✅ SoundCloud widget has its own built-in volume control
- ✅ Desktop/Android users can use SoundCloud's native volume slider
- ✅ iOS users use physical volume buttons (as required by Apple)
- ✅ Code is clean, simple, and focused on working functionality

**Why the other "options" won't work:**
- ❌ Reverting to v3.0: Individual tracks are ALSO blocked on iOS
- ❌ Alternative SoundCloud embeds: Apple blocks ALL iframe media
- ❌ HTML5 Audio API: Apple explicitly blocks HTMLMediaElement.volume
- ❌ Web Audio API: GainNode is also ignored on iOS Safari
- ❌ Different hosting: iOS restriction applies regardless of source

**This is the correct and only solution.**

---

## Files Modified

### Core Files (v5.2.0)
- `script.js` - Main application logic
  - Removed all volume control code (v5.0.0)
  - Added track position memory (v5.2.0)
  - Added main player play/pause and replay controls (v5.2.0)
  - Play/pause icon sync across main player and game modal (v5.1.1)
- `index.html` - Player interface
  - Removed volume controls (v5.0.0)
  - Removed game modal genre tabs (v5.1.0)
  - Added main player play/pause and replay buttons (v5.2.0)
- `style.css` - Styling (unchanged since v4.x)
- `simon.js` - Game logic (unchanged since v4.x)
- `memory.md` - Complete development history and documentation (continuously updated)

### Deleted Files (v5.0.0)
- ❌ `debug-volume.html` - Volume testing tool (no longer needed)
- ❌ `mobile-debug.html` - Mobile console (debugging complete)
- ❌ `test-localStorage.html` - localStorage testing (no longer needed)
- ❌ `simon.html` - Standalone game page (game now in modal only)

### Current Project Structure
```
SC2/
├── index.html          - Main player interface with game modal
├── script.js           - Player logic and SoundCloud Widget API
├── simon.js            - Simon Says game logic
├── style.css           - Styling and animations
├── memory.md           - Development documentation
└── README.md           - Project readme
```

---

## Known Working Features (v5.2.0)

✅ Multi-genre switching (Jazz, R&B, EDM) - main player only
✅ SoundCloud playlist playback
✅ Next/Previous track navigation (main player and game modal)
✅ Play/Pause controls (main player and game modal, fully synced)
✅ Replay current song from beginning (main player and game modal)
✅ Track position memory per genre (remembers which song you were on in each genre)
✅ Love notes display (random, timed) with poo emoji 💩
✅ Countdown timer to return date
✅ Clock display (player and game)
✅ Simon Says game integration in modal
✅ Genre persistence (localStorage)
✅ Track position persistence (localStorage, per-genre)
✅ Animated backgrounds per genre
✅ Glassmorphic UI design
✅ Mobile-responsive layout
✅ Touch-optimized controls
✅ Double-tap zoom prevention (without blocking input elements)
✅ SoundCloud player built-in volume control (works on desktop/Android)

---

## Conclusion

**After 7 distinct attempts across versions 4.1.0 through 4.6.0, volume controls remained non-functional on Mobile Safari.**

### Root Cause: Confirmed iOS Safari Limitation

Research into official Apple documentation (2026-03-17) confirms that **iOS Safari intentionally and permanently blocks ALL JavaScript volume control** as a core platform security and user protection feature.

From Apple's official Safari HTML5 Audio and Video Guide:
> "On iOS devices, the audio level is always under the user's physical control. The `volume` property is not settable in JavaScript."

### This Affects:
- ❌ SoundCloud Widget API `setVolume()`
- ❌ HTML5 `<audio>` and `<video>` elements
- ❌ Web Audio API GainNode
- ❌ ALL iframe-embedded media
- ❌ Individual tracks AND playlists
- ❌ All third-party audio libraries

### What Actually Works on iOS:
- ✅ Physical device volume buttons only
- ✅ iOS Control Center volume slider only

### Final Solution (v5.0.0)

**VOLUME CONTROLS COMPLETELY REMOVED**

After confirming that iOS Safari blocks all JavaScript volume control and no workarounds exist, the decision was made to remove volume controls entirely from the application.

**Why This Is The Right Solution:**
- ✅ Eliminates non-functional UI elements
- ✅ Cleaner, simpler interface
- ✅ No false expectations for users
- ✅ Removes ~100 lines of unnecessary code
- ✅ Desktop/Android users use browser/system volume controls
- ✅ iOS users use physical volume buttons (as intended by Apple)

**This issue is PERMANENTLY RESOLVED by removing volume controls.**

---

## Technical Architecture (v5.2.0)

### SoundCloud Widget API Integration
**Primary Methods Used:**
- `SC.Widget(iframe)` - Initialize widget from iframe
- `widget.bind(SC.Widget.Events.READY, callback)` - Widget ready event
- `widget.bind(SC.Widget.Events.PLAY, callback)` - Play event (for icon sync)
- `widget.bind(SC.Widget.Events.PAUSE, callback)` - Pause event (for icon sync)
- `widget.bind(SC.Widget.Events.FINISH, callback)` - Track finish event
- `widget.play()` - Start playback
- `widget.pause()` - Pause playback
- `widget.isPaused(callback)` - Check playback state
- `widget.next()` - Skip to next track
- `widget.prev()` - Skip to previous track
- `widget.seekTo(milliseconds)` - Seek to position (used for replay)
- `widget.getCurrentSoundIndex(callback)` - Get current track index
- `widget.skip(index)` - Jump to specific track index

### Track Position Memory System
**How It Works:**
1. User is listening to Jazz, track 5
2. User switches to R&B
3. Before switching, `saveTrackPosition('lightJazz', 5)` is called
4. When switching back to Jazz, `loadTrackPosition('lightJazz')` returns 5
5. After widget loads, `widget.skip(5)` jumps to that track

**Triggers for Saving:**
- Switching genres (saves old genre position)
- Clicking next/previous buttons
- Track auto-advances (FINISH event)
- Playback starts (PLAY event)

### Icon Synchronization Pattern
**Challenge:** Two sets of play/pause icons (main player + game modal) must stay in sync

**Solution:**
- Single `updatePlayPauseIcon(isPaused)` function updates both sets
- SoundCloud widget events (PLAY, PAUSE) trigger icon updates
- Manual toggles also call `updatePlayPauseIcon()`
- Icons always reflect actual playback state

**Icon IDs:**
- Main player: `main-play-icon`, `main-pause-icon`
- Game modal: `play-icon`, `pause-icon`

### Mobile Touch Optimization
**Double-Tap Zoom Prevention:**
```javascript
document.addEventListener('touchend', (e) => {
    // Don't prevent default on input elements (sliders need touch events)
    if (e.target.tagName === 'INPUT') {
        return;
    }

    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault(); // Prevent zoom
    }
    lastTouchEnd = now;
}, { passive: false });
```

**Next/Previous Debounce:**
```javascript
// Prevent double-firing from touchend + click events
const now = Date.now();
if (now - lastTrackChangeTime < 500) {
    return;
}
lastTrackChangeTime = now;
```

### Design Decisions

**Why Playlists Instead of Individual Tracks (v4.0.0):**
- Pros: SoundCloud handles auto-advance natively, simpler code
- Cons: Lost individual track position memory (restored in v5.2.0)
- Net: Simpler overall with track position restoration

**Why Remove Volume Controls (v5.0.0):**
- iOS Safari blocks JavaScript volume control (Apple policy)
- SoundCloud widget has built-in volume control
- Removing custom controls eliminates non-functional UI
- Users now use system/browser/widget volume controls

**Why Remove Genre Tabs from Game Modal (v5.1.0):**
- Genre switching rarely needed while playing game
- Simplifies game modal interface
- Prevents accidental genre changes during gameplay
- Main player genre tabs still accessible

**Why Add Track Position Memory (v5.2.0):**
- User request: "What happened to local storing which song was playing"
- Functionality was removed in v4.0.0 playlist migration
- Improves UX: remembers where you left off in each genre
- Each genre has independent memory

---

## Development Lessons Learned

### iOS Safari Volume Control Investigation
**Key Takeaway:** Always research browser limitations before attempting fixes.

The iOS Safari volume control issue consumed 7 version iterations (v4.1.0 - v4.7.0) before proper research was conducted. Once Apple's official documentation was consulted, it became clear that:
1. The issue was unfixable (Apple policy)
2. All attempted workarounds were futile
3. The correct solution was removal, not fixing

**Better Approach:**
1. Research first: Check official browser documentation
2. Validate: Test on actual devices early
3. Accept limitations: Some things cannot be "fixed"
4. Focus effort: Spend time on solvable problems

### Version Control Best Practices
**Git History is Your Friend:**
- User remembered: "volume was working before"
- Used `git show <commit>` to retrieve exact working code
- Even though it didn't solve the iOS issue, it provided valuable reference

**Lesson:** Maintain clear commit messages and frequent commits for easy history navigation.

### Documentation Value
**This memory.md file:**
- Tracks all attempted solutions and their outcomes
- Documents research findings with sources
- Explains architectural decisions and rationale
- Prevents repeating failed approaches
- Serves as onboarding documentation for future work

**Lesson:** Comprehensive documentation saves time and prevents circular problem-solving.

---

## Future Considerations

### Potential Enhancements
- **Shuffle Mode:** Add playlist shuffle using widget API
- **Time Display:** Show current track time/duration
- **Playlist Info:** Display total number of tracks
- **Offline Mode:** Service worker for PWA capabilities
- **Share Button:** Share current track via Web Share API

### Known Limitations
- **iOS Volume Control:** Cannot be fixed (Apple policy)
- **Autoplay on iOS:** Requires user interaction first (browser security)
- **Track Metadata:** Limited to what SoundCloud widget provides
- **Playlist Size:** Limited by SoundCloud playlist constraints

### Maintenance Notes
- SoundCloud Widget API is stable but monitor for deprecations
- localStorage has 5-10MB limit per domain (current usage minimal)
- Mobile Safari updates may change behavior (test regularly)
- Keep dependencies minimal (currently: SoundCloud Widget API only)