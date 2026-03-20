/**
 * ============================================================================
 * FOR ELLIE - SOUNDCLOUD MUSIC PLAYER
 * ============================================================================
 *
 * A mobile-first music player with genre-specific playlists, animated
 * backgrounds, love notes, countdown timer, and integrated Simon Says game.
 *
 * Key Features:
 * - Multi-genre support with localStorage persistence
 * - SoundCloud Widget API integration
 * - Real-time UI synchronization across player and game modal
 * - Touch-optimized controls for mobile devices
 * - Glassmorphic design with animated backgrounds
 *
 * @author Keith Stanigar
 * @version 5.2.1
 */

// ============================================================================
// DATA STRUCTURES
// ============================================================================

const musicLibrary = {
    lightJazz: 'https://soundcloud.com/run-catch-kiss/sets/light-jazz',
    rnb: 'https://soundcloud.com/run-catch-kiss/sets/r-b-playlist',
    electronic: 'https://soundcloud.com/run-catch-kiss/sets/electronic'
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/** Current active genre */
let currentGenre = 'lightJazz';

/** SoundCloud widget instance */
let widget;

/** Current track index in the playlist (0-based) */
let currentTrackIndex = 0;

/** Timestamp of last track change to prevent event double-firing */
let lastTrackChangeTime = 0;

/** Flag to track if user has interacted (enables autoplay on genre switch) */
let hasUserInteracted = false;

// Expose globally for cross-file access (simon.js)
window.currentGenre = currentGenre;

// ============================================================================
// LOCALSTORAGE CONFIGURATION
// ============================================================================
// REUSABLE: These keys can be used in other projects for persistent storage

/** Storage key for current genre selection */
const GENRE_STORAGE_KEY = 'musicPlayerCurrentGenre';

/** Storage key prefix for track positions (genre-specific) */
const TRACK_POSITION_PREFIX = 'musicPlayerTrackPosition_';

// ============================================================================
// LOCALSTORAGE UTILITIES
// ============================================================================
// REUSABLE: These functions provide a safe localStorage interface with error
// handling and default values. Can be adapted for any key-value persistence.

/**
 * Saves the current active genre to localStorage
 *
 * @param {string} genre - Genre identifier to save
 */
function saveCurrentGenre(genre) {
    try {
        localStorage.setItem(GENRE_STORAGE_KEY, genre);
    } catch (e) {
        console.warn('Failed to save genre:', e);
    }
}

/**
 * Loads the last active genre from localStorage
 *
 * @returns {string} Saved genre identifier, defaults to 'lightJazz'
 */
function loadSavedGenre() {
    try {
        const saved = localStorage.getItem(GENRE_STORAGE_KEY);
        if (saved && musicLibrary[saved]) {
            return saved;
        }
    } catch (e) {
        console.warn('Failed to load genre:', e);
    }
    return 'lightJazz'; // Default genre
}

/**
 * Saves the current track position for a specific genre
 *
 * @param {string} genre - Genre identifier
 * @param {number} trackIndex - Track index in the playlist (0-based)
 */
function saveTrackPosition(genre, trackIndex) {
    try {
        localStorage.setItem(TRACK_POSITION_PREFIX + genre, trackIndex.toString());
    } catch (e) {
        console.warn('Failed to save track position:', e);
    }
}

/**
 * Loads the saved track position for a specific genre
 *
 * @param {string} genre - Genre identifier
 * @returns {number} Saved track index, defaults to 0
 */
function loadTrackPosition(genre) {
    try {
        const saved = localStorage.getItem(TRACK_POSITION_PREFIX + genre);
        if (saved !== null) {
            return parseInt(saved, 10);
        }
    } catch (e) {
        console.warn('Failed to load track position:', e);
    }
    return 0; // Default to first track
}

// Love Notes
const loveNotes = [
    "Missing your smile right now... 💕",
    "Every wine glass reminds me of you",
    "Where's my kiss?",
    "You're always on my mind",
    "Counting down the days until I see you",
    "Distance means so little when you mean so much",
    "This song is for you, my love",
    "Thinking of all our beautiful moments together, while going poo 💩",
    "You make every day brighter, even from afar",
    "My heart is wherever you are",
    "Soon we'll be dancing together again",
    "Love you more than words can say",
    "You're my favorite thing!",
    "You're my everything!",
    "I'm thinking of you right now",
    "I love my baby, I love my babyyyyyyyyy. I love, I love, I love, I love, I love my baby! Hey!",
    "Until we're together again, you're in my thoughts",
    "Babydoll? Babyyyyy-doll?",
];

// Countdown Configuration
const returnDate = new Date('2026-04-30'); // Set your return date here

// ============================================================================
// SOUNDCLOUD PLAYER MANAGEMENT
// ============================================================================

/**
 * Initializes or reloads the SoundCloud widget with current genre playlist
 *
 * Creates a new iframe embed for SoundCloud with the genre's playlist URL,
 * configures the widget API, and sets up event handlers for playback control.
 * SoundCloud handles auto-advance natively within playlists.
 *
 * @param {boolean} autoplay - Whether to use widget's native auto_play parameter
 * @fires widget.bind - SC.Widget.Events.READY
 * @fires widget.bind - SC.Widget.Events.FINISH
 */
function loadPlayer(autoplay = false) {
    const playerDiv = document.getElementById('player');
    playerDiv.innerHTML = '';

    // Load the playlist for the current genre
    const playlistUrl = musicLibrary[currentGenre];

    // Use widget's native auto_play when user has interacted
    const shouldAutoplay = autoplay && hasUserInteracted;

    const params = [
        `url=${encodeURIComponent(playlistUrl)}`,
        `auto_play=${shouldAutoplay}`,  // Let SoundCloud widget handle autoplay
        'show_artwork=false',
        'show_playcount=false',
        'show_comments=false',
        'color=%232850ac',
        'hide_related=true'
    ].join('&');

    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '120';
    iframe.scrolling = 'no';
    iframe.frameBorder = 'no';
    iframe.allow = 'autoplay';
    iframe.src = `https://w.soundcloud.com/player/?${params}`;
    playerDiv.appendChild(iframe);

    iframe.onload = () => {
        widget = SC.Widget(iframe);
        widget.bind(SC.Widget.Events.READY, () => {
            // Load saved track position for this genre
            const savedTrackIndex = loadTrackPosition(currentGenre);
            currentTrackIndex = savedTrackIndex;

            // Skip to the saved track if not the first one
            if (savedTrackIndex > 0) {
                widget.skip(savedTrackIndex);
            }

            // Update icon based on autoplay state
            updatePlayPauseIcon(!shouldAutoplay);

            // Sync play/pause icon when widget plays
            widget.bind(SC.Widget.Events.PLAY, () => {
                updatePlayPauseIcon(false); // Show pause icon (playing)

                // Update current track index when playing
                widget.getCurrentSoundIndex((index) => {
                    currentTrackIndex = index;
                });
            });

            // Sync play/pause icon when widget pauses
            widget.bind(SC.Widget.Events.PAUSE, () => {
                updatePlayPauseIcon(true); // Show play icon (paused)
            });

            // SoundCloud widget handles auto-advance automatically for playlists
            // Show love note occasionally when tracks finish
            widget.bind(SC.Widget.Events.FINISH, () => {
                // Show love note occasionally (30% chance)
                if (Math.random() < 0.3) {
                    showLoveNote();
                }

                // Save track position when track finishes (next track will start)
                widget.getCurrentSoundIndex((index) => {
                    currentTrackIndex = index;
                    saveTrackPosition(currentGenre, index);
                });
            });
        });
    };
}

// ============================================================================
// UI UPDATE FUNCTIONS
// ============================================================================

/**
 * Displays a random love note message
 *
 * REUSABLE: Pattern for showing timed messages with fade in/out
 *
 * Selects a random message from the loveNotes array, displays it with
 * a CSS transition, and automatically hides it after 2 minutes.
 *
 * @example
 * // Trigger on user action or timer
 * showLoveNote();
 */
function showLoveNote() {
    const loveNoteDiv = document.getElementById('love-note');
    const randomNote = loveNotes[Math.floor(Math.random() * loveNotes.length)];

    loveNoteDiv.textContent = randomNote;
    loveNoteDiv.classList.add('show');

    // Hide after 2 minutes
    setTimeout(() => {
        loveNoteDiv.classList.remove('show');
    }, 120000);
}

/**
 * Updates the countdown timer display
 *
 * REUSABLE: Pattern for calculating and displaying time differences
 *
 * Calculates the time difference between now and a target date,
 * then displays it in a human-readable format (days/hours).
 *
 * @example
 * // Set target date and call periodically
 * const returnDate = new Date('2026-04-30');
 * setInterval(updateCountdown, 3600000); // Every hour
 */
function updateCountdown() {
    const countdownDiv = document.getElementById('countdown');
    const now = new Date();
    const timeDiff = returnDate - now;

    if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) {
            countdownDiv.textContent = `${days} day${days === 1 ? '' : 's'} until I see you again ❤️`;
        } else if (hours > 0) {
            countdownDiv.textContent = `${hours} hour${hours === 1 ? '' : 's'} until I see you again ❤️`;
        } else {
            countdownDiv.textContent = `Soon, my love! ❤️`;
        }
    } else {
        countdownDiv.textContent = `Together at last! ❤️`;
    }
}

/**
 * Updates the clock display in both player and game
 *
 * REUSABLE: Pattern for formatting and displaying current time
 *
 * Formats the current time in 12-hour format with date (e.g., "Mar 16, 2:45 PM")
 * and updates all clock elements in the DOM.
 *
 * @example
 * // Initialize and update every minute
 * updateClock();
 * setInterval(updateClock, 60000);
 */
function updateClock() {
    const now = new Date();

    // Format date: "Mar 16"
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[now.getMonth()];
    const day = now.getDate();

    // Format time: "2:45 PM"
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;

    const timeStr = `${month} ${day}, ${hours}:${minutesStr} ${ampm}`;

    // Update both clocks
    const playerClock = document.getElementById('player-clock');
    const gameClock = document.getElementById('game-clock');

    if (playerClock) playerClock.textContent = timeStr;
    if (gameClock) gameClock.textContent = timeStr;
}

// ============================================================================
// PLAYBACK CONTROL FUNCTIONS
// ============================================================================

/**
 * Switches the active music genre and updates all UI elements
 *
 * This function orchestrates genre switching by:
 * - Updating theme/background animations
 * - Syncing tab buttons in main player
 * - Loading new playlist with native autoplay
 * - Displaying a love note
 *
 * @param {string} genre - Genre identifier ('lightJazz', 'rnb', 'electronic')
 */
function switchGenre(genre) {
    if (currentGenre === genre) return;

    // Mark that user has interacted
    hasUserInteracted = true;

    // Save current track position before switching
    saveTrackPosition(currentGenre, currentTrackIndex);

    currentGenre = genre;
    window.currentGenre = genre; // Update global reference
    saveCurrentGenre(genre); // Save to localStorage

    // Update Theme Class for CSS animations
    document.body.className = `theme-${genre === 'lightJazz' ? 'jazz' : genre}`;

    // Update Button Active States (main player)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        // Matching logic for Jazz/Light Jazz, R&B, and EDM labels
        const isActive = (genre === 'lightJazz' && text.includes('jazz')) ||
            (genre === 'rnb' && text.includes('r&b')) ||
            (genre === 'electronic' && text.includes('edm'));
        btn.classList.toggle('active', isActive);
    });

    loadPlayer(true); // Use widget's native auto_play
    updateSongIndexUI();
    showLoveNote(); // Show love note when switching genres
}

/**
 * Updates the song index display with current genre
 *
 * Shows genre name since SoundCloud widget manages track positions internally.
 */
function updateSongIndexUI() {
    const songIndexDiv = document.getElementById('song-index');
    if (!songIndexDiv) return;

    let displayLabel = 'Jazz Playlist';
    if (currentGenre === 'rnb') displayLabel = 'R&B Playlist';
    if (currentGenre === 'electronic') displayLabel = 'Electronic Playlist';

    songIndexDiv.textContent = displayLabel;
}

/**
 * Advances to the next track in the current genre playlist
 *
 * Uses SoundCloud widget's native next() method to navigate within the playlist.
 * Loops back to the first track when reaching the end of the playlist.
 * Includes debounce protection to prevent double-firing on mobile.
 */
function playNextSong() {
    // Prevent double-firing from touchend + click events on mobile
    const now = Date.now();
    if (now - lastTrackChangeTime < 500) {
        return;
    }
    lastTrackChangeTime = now;

    if (!widget) return;

    hasUserInteracted = true; // Mark user interaction

    // Check if we're on the last track to enable looping
    widget.getSounds((sounds) => {
        const totalTracks = sounds.length;
        widget.getCurrentSoundIndex((currentIndex) => {
            if (currentIndex >= totalTracks - 1) {
                // We're on the last track, loop back to first
                widget.skip(0);
                currentTrackIndex = 0;
                saveTrackPosition(currentGenre, 0);
            } else {
                // Normal next behavior
                widget.next();
                // Update and save track position after short delay
                setTimeout(() => {
                    widget.getCurrentSoundIndex((index) => {
                        currentTrackIndex = index;
                        saveTrackPosition(currentGenre, index);
                    });
                }, 500);
            }
        });
    });

    // Show love note occasionally (30% chance)
    if (Math.random() < 0.3) {
        showLoveNote();
    }
}

/**
 * Returns to the previous track in the current genre playlist
 *
 * Uses SoundCloud widget's native prev() method to navigate within the playlist.
 * Loops back to the last track when going backwards from the first track.
 * Includes debounce protection to prevent double-firing on mobile.
 */
function playPrevSong() {
    // Prevent double-firing from touchend + click events on mobile
    const now = Date.now();
    if (now - lastTrackChangeTime < 500) {
        return;
    }
    lastTrackChangeTime = now;

    if (!widget) return;

    hasUserInteracted = true; // Mark user interaction

    // Check if we're on the first track to enable looping
    widget.getCurrentSoundIndex((currentIndex) => {
        if (currentIndex <= 0) {
            // We're on the first track, loop back to last
            widget.getSounds((sounds) => {
                const lastIndex = sounds.length - 1;
                widget.skip(lastIndex);
                currentTrackIndex = lastIndex;
                saveTrackPosition(currentGenre, lastIndex);
            });
        } else {
            // Normal previous behavior
            widget.prev();
            // Update and save track position after short delay
            setTimeout(() => {
                widget.getCurrentSoundIndex((index) => {
                    currentTrackIndex = index;
                    saveTrackPosition(currentGenre, index);
                });
            }, 500);
        }
    });

    // Show love note occasionally (30% chance)
    if (Math.random() < 0.3) {
        showLoveNote();
    }
}

// Event Listeners
// Next button - using click event (works on both desktop and mobile)
const nextBtn = document.getElementById('next-button');
nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    playNextSong();
});

// Previous button - using click event (works on both desktop and mobile)
const prevBtn = document.getElementById('prev-button');
prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    playPrevSong();
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Forces a hard page reload to clear all cached resources
 *
 * Useful for troubleshooting when cached CSS/JS files cause issues.
 */
function clearCache() {
    // Force hard reload to clear cached resources
    window.location.reload(true);
}

/**
 * Toggles playback state between play and pause
 *
 * Uses SoundCloud widget's native play/pause methods and updates UI icon.
 * Marks user interaction flag for future autoplay capability.
 */
function togglePlayPause() {
    if (!widget) return;

    hasUserInteracted = true; // Mark user interaction

    widget.isPaused((paused) => {
        if (paused) {
            widget.play();
            updatePlayPauseIcon(false);
        } else {
            widget.pause();
            updatePlayPauseIcon(true);
        }
    });
}

/**
 * Updates the play/pause button icon based on playback state
 *
 * Updates icons in both main player and game modal to stay in sync
 *
 * @param {boolean} isPaused - True if player is paused, false if playing
 */
function updatePlayPauseIcon(isPaused) {
    // Main player icons
    const mainPlayIcon = document.getElementById('main-play-icon');
    const mainPauseIcon = document.getElementById('main-pause-icon');

    if (mainPlayIcon && mainPauseIcon) {
        if (isPaused) {
            mainPlayIcon.style.display = 'block';
            mainPauseIcon.style.display = 'none';
        } else {
            mainPlayIcon.style.display = 'none';
            mainPauseIcon.style.display = 'block';
        }
    }

    // Game modal icons
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');

    if (playIcon && pauseIcon) {
        if (isPaused) {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        } else {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        }
    }
}

/**
 * Replays the current song from the beginning
 *
 * Uses SoundCloud widget's seekTo method to restart the track at 0ms.
 * Also ensures the track is playing after replay.
 */
function replaySong() {
    if (!widget) return;

    hasUserInteracted = true; // Mark user interaction

    // Seek to beginning (0 milliseconds)
    widget.seekTo(0);

    // Ensure it's playing
    widget.isPaused((paused) => {
        if (paused) {
            widget.play();
            updatePlayPauseIcon(false);
        }
    });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Application initialization on page load
 *
 * This function sets up the complete application state by:
 * 1. Loading saved preferences from localStorage
 * 2. Initializing UI elements with saved values
 * 3. Setting up recurring timers for countdown and clock
 * 4. Configuring mobile touch optimizations
 * 5. Scheduling periodic love notes
 *
 * @listens window#load
 */
window.onload = () => {
    // Load saved genre
    currentGenre = loadSavedGenre();
    window.currentGenre = currentGenre;

    // Update theme based on saved genre
    document.body.className = `theme-${currentGenre === 'lightJazz' ? 'jazz' : currentGenre}`;

    // Update active tab button (main player)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        const isActive = (currentGenre === 'lightJazz' && text.includes('jazz')) ||
            (currentGenre === 'rnb' && text.includes('r&b')) ||
            (currentGenre === 'electronic' && text.includes('edm'));
        btn.classList.toggle('active', isActive);
    });

    loadPlayer();
    updateSongIndexUI();
    updateCountdown();
    updateClock();
    // Update countdown every hour
    setInterval(updateCountdown, 3600000);
    // Update clock every minute
    setInterval(updateClock, 60000);
    // Show initial love note after 5 seconds
    setTimeout(showLoveNote, 5000);
    // Show love notes every 12 minutes (720000ms)
    setInterval(showLoveNote, 720000);

    // Prevent double-tap zoom on iOS (but allow slider interaction)
    let lastTouchEnd = 0;
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
};