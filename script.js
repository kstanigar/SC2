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
 * @version 3.0
 */

// ============================================================================
// DATA STRUCTURES
// ============================================================================

const musicLibrary = {
    lightJazz: [
        'https://soundcloud.com/cafemusicbgmofficial/regrowth-38',
        'https://soundcloud.com/cafemusicbgmofficial/bright-garden-12',
        'https://soundcloud.com/cafemusicbgmofficial/sugar-maroon-5-cafe-jazz-cover',
        'https://soundcloud.com/cafemusicbgmofficial/riverside-ease-40',
        'https://soundcloud.com/cafemusicbgmofficial/pink-petals-37',
        'https://soundcloud.com/cafemusicbgmofficial/pastel-afternoon-34',
        'https://soundcloud.com/cafemusicbgmofficial/window-canvas-53',
        'https://soundcloud.com/cafemusicbgmofficial/spring-laughters-46',
        'https://soundcloud.com/cafemusicbgmofficial/entire-day-46',
        'https://soundcloud.com/cafemusicbgmofficial/happy-xmas-war-is-over-13',
        'https://soundcloud.com/cafemusicbgmofficial/diamond-cut-36',
        'https://soundcloud.com/cafemusicbgmofficial/kissaten-33',
        'https://soundcloud.com/cafemusicbgmofficial/lets-start',
        'https://soundcloud.com/cafemusicbgmofficial/stylish-year',
        'https://soundcloud.com/cafemusicbgmofficial/o-come-all-ye-faithful-27',
        'https://soundcloud.com/relaxcafemusic/early-summer',
        'https://soundcloud.com/relaxcafemusic/cherry-on-top',
        'https://soundcloud.com/cafemusicbgmofficial/jingle-bells-21'
    ],
    rnb: [
        'https://soundcloud.com/levertofficial/levert-casanova',
        'https://soundcloud.com/wrz7smvkpd0p/zombie-millimax',
        'https://soundcloud.com/commodores-official/zoom-album-version',
        'https://soundcloud.com/otisredding/ive-been-loving-you-too-long',
        'https://soundcloud.com/janetjackson/come-back-to-me-album-version',
        'https://soundcloud.com/dpwctqasgte6/b918fade-db3d-4f18-8fc5-be3c2181ad00'
    ],
    electronic: [
        'https://soundcloud.com/matador_official/matador-femme-just-getting-started',
        'https://soundcloud.com/tinlicker/never-let-me-go-1',
        'https://soundcloud.com/kompakt/raxon-never-stops-2',
        'https://soundcloud.com/eynka/the-way',
        'https://soundcloud.com/flozbeats/overmono-everything-u-need-floz-edit',
        'https://soundcloud.com/ellum/matteea-frames-1',
        'https://soundcloud.com/maceoplex/mutant-romance-fakemaster1',
        'https://soundcloud.com/thisneverhappenedlabel/lane-8-little-voices',
        'https://soundcloud.com/disciplesldn/they-dont-know',
        'https://soundcloud.com/telefon-tel-aviv/sound-in-a-dark-room',
    ]
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/** Current active genre */
let currentGenre = 'lightJazz';

/** Current track index within the active genre */
let currentIndex = 0;

/** SoundCloud widget instance */
let widget;

/** Flag to prevent autoplay on first load (browser restrictions) */
let isFirstLoad = true;

/** Current volume level (0-100) */
let currentVolume = 50;

/** Flag to prevent rapid track changes from double-firing events */
let isChangingTrack = false;

// Expose globally for cross-file access (simon.js)
window.currentGenre = currentGenre;
window.currentVolume = currentVolume;

// ============================================================================
// LOCALSTORAGE CONFIGURATION
// ============================================================================
// REUSABLE: These keys can be used in other projects for persistent storage

/** Storage key for genre track positions */
const STORAGE_KEY = 'musicPlayerGenrePositions';

/** Storage key for volume preference */
const VOLUME_STORAGE_KEY = 'musicPlayerVolume';

/** Storage key for current genre selection */
const GENRE_STORAGE_KEY = 'musicPlayerCurrentGenre';

// ============================================================================
// LOCALSTORAGE UTILITIES
// ============================================================================
// REUSABLE: These functions provide a safe localStorage interface with error
// handling and default values. Can be adapted for any key-value persistence.

/**
 * Loads all saved genre positions from localStorage
 *
 * REUSABLE: Pattern for loading JSON objects from localStorage with fallback
 *
 * @returns {Object} Object mapping genre names to track indices
 * @example
 * { lightJazz: 5, rnb: 2, electronic: 7 }
 */
function loadGenrePositions() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Failed to load genre positions:', e);
    }
    // Default positions
    return { lightJazz: 0, rnb: 0, electronic: 0 };
}

/**
 * Saves the current track position for a specific genre
 *
 * REUSABLE: Pattern for updating nested localStorage objects
 *
 * @param {string} genre - Genre identifier (e.g., 'lightJazz', 'rnb')
 * @param {number} index - Track index to save
 */
function saveGenrePosition(genre, index) {
    try {
        const positions = loadGenrePositions();
        positions[genre] = index;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
    } catch (e) {
        console.warn('Failed to save genre position:', e);
    }
}

/**
 * Retrieves the saved track position for a specific genre
 *
 * @param {string} genre - Genre identifier
 * @returns {number} Saved track index, or 0 if none found
 */
function getSavedPosition(genre) {
    const positions = loadGenrePositions();
    return positions[genre] || 0;
}

/**
 * Persists volume level to localStorage
 *
 * REUSABLE: Simple value persistence pattern
 *
 * @param {number} volume - Volume level (0-100)
 */
function saveVolume(volume) {
    try {
        localStorage.setItem(VOLUME_STORAGE_KEY, volume);
    } catch (e) {
        console.warn('Failed to save volume:', e);
    }
}

/**
 * Retrieves saved volume level from localStorage
 *
 * REUSABLE: Pattern for loading numeric values with defaults
 *
 * @returns {number} Saved volume (0-100), defaults to 50
 */
function loadSavedVolume() {
    try {
        const saved = localStorage.getItem(VOLUME_STORAGE_KEY);
        if (saved !== null) {
            return parseInt(saved, 10);
        }
    } catch (e) {
        console.warn('Failed to load volume:', e);
    }
    return 50; // Default volume
}

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

// Love Notes
const loveNotes = [
    "Missing your smile right now... 💕",
    "Every wine glass reminds me of you",
    "Where's my kiss?",
    "You're always on my mind",
    "Counting down the days until I see you",
    "Distance means so little when you mean so much",
    "This song is for you, my love",
    "Thinking of all our beautiful moments together, while going poo",
    "You make every day brighter, even from afar",
    "My heart is wherever you are",
    "Soon we'll be dancing together again",
    "Love you more than words can say",
    "You're my favorite thing!",
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
 * Initializes or reloads the SoundCloud widget with current track
 *
 * Creates a new iframe embed for SoundCloud, configures the widget API,
 * and sets up event handlers for playback control.
 *
 * @fires widget.bind - SC.Widget.Events.READY
 * @fires widget.bind - SC.Widget.Events.FINISH
 */
function loadPlayer() {
    const url = musicLibrary[currentGenre][currentIndex];
    const playerDiv = document.getElementById('player');

    playerDiv.innerHTML = '';

    // Update these parameters
    const params = [
        `url=${encodeURIComponent(url)}`,
        'auto_play=false',
        'show_artwork=false',      // Set to false to hide artwork
        'show_playcount=false',
        'show_comments=false',
        'color=%232850ac',
        'hide_related=true'
    ].join('&');

    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '120';        // Reduced height back to 120 (since no artwork is shown)
    iframe.scrolling = 'no';
    iframe.frameBorder = 'no';
    iframe.allow = 'autoplay';
    iframe.src = `https://w.soundcloud.com/player/?${params}`;
    playerDiv.appendChild(iframe);

    iframe.onload = () => {
        widget = SC.Widget(iframe);
        widget.bind(SC.Widget.Events.READY, () => {
            widget.setVolume(currentVolume);
            widget.bind(SC.Widget.Events.FINISH, () => playNextSong());
            if (!isFirstLoad) {
                // Small delay to ensure widget is fully ready
                setTimeout(() => {
                    widget.play();
                    updatePlayPauseIcon(false); // Update icon to pause
                }, 100);
            } else {
                updatePlayPauseIcon(true); // Update icon to play
            }
        });
    };
    updateSongIndexUI();
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
 * - Saving current track position
 * - Loading saved position for new genre
 * - Updating theme/background animations
 * - Syncing tab buttons in both player and game
 * - Triggering autoplay
 * - Displaying a love note
 *
 * @param {string} genre - Genre identifier ('lightJazz', 'rnb', 'electronic')
 */
function switchGenre(genre) {
    if (currentGenre === genre) return;

    // Save current position before switching
    saveGenrePosition(currentGenre, currentIndex);

    currentGenre = genre;
    window.currentGenre = genre; // Update global reference
    saveCurrentGenre(genre); // Save to localStorage

    // Load saved position for the new genre
    currentIndex = getSavedPosition(genre);

    // Genre switch is user interaction - enable autoplay
    isFirstLoad = false;

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

    // Update game genre tabs if they exist
    document.querySelectorAll('.game-genre-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.genre === genre);
    });

    loadPlayer();
    showLoveNote(); // Show love note when switching genres
}

/**
 * Updates the song index display (e.g., "Jazz | Track 1 of 18")
 *
 * @example
 * // Called after loadPlayer() to show current position
 * updateSongIndexUI(); // "R&B | Track 3 of 6"
 */
function updateSongIndexUI() {
    const songIndexDiv = document.getElementById('song-index');
    if (!songIndexDiv) return;

    let displayLabel = 'Jazz';
    if (currentGenre === 'rnb') displayLabel = 'R&B';
    if (currentGenre === 'electronic') displayLabel = 'Electronic';

    const currentTrackNumber = currentIndex + 1;
    const totalTracks = musicLibrary[currentGenre].length;

    songIndexDiv.textContent = `${displayLabel} | Track ${currentTrackNumber} of ${totalTracks}`;
}

/**
 * Advances to the next track in the current genre playlist
 *
 * Wraps around to the beginning when reaching the end of the playlist.
 * Persists the new position and has a 30% chance to show a love note.
 * Includes debounce protection to prevent double-firing on mobile.
 */
function playNextSong() {
    // Prevent double-firing from touchend + click events on mobile
    if (isChangingTrack) return;
    isChangingTrack = true;

    currentIndex = (currentIndex + 1) % musicLibrary[currentGenre].length;
    saveGenrePosition(currentGenre, currentIndex); // Save new position
    isFirstLoad = false;
    loadPlayer();
    // Show love note occasionally (30% chance)
    if (Math.random() < 0.3) {
        showLoveNote();
    }

    // Reset flag after a brief delay
    setTimeout(() => {
        isChangingTrack = false;
    }, 300);
}

/**
 * Returns to the previous track in the current genre playlist
 *
 * Wraps around to the end when at the beginning of the playlist.
 * Persists the new position and has a 30% chance to show a love note.
 * Includes debounce protection to prevent double-firing on mobile.
 */
function playPrevSong() {
    // Prevent double-firing from touchend + click events on mobile
    if (isChangingTrack) return;
    isChangingTrack = true;

    currentIndex = (currentIndex - 1 + musicLibrary[currentGenre].length) % musicLibrary[currentGenre].length;
    saveGenrePosition(currentGenre, currentIndex); // Save new position
    isFirstLoad = false;
    loadPlayer();
    // Show love note occasionally (30% chance)
    if (Math.random() < 0.3) {
        showLoveNote();
    }

    // Reset flag after a brief delay
    setTimeout(() => {
        isChangingTrack = false;
    }, 300);
}

// Event Listeners
// Next button - support both click and touch
const nextBtn = document.getElementById('next-button');
nextBtn.addEventListener('click', playNextSong);
nextBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    playNextSong();
}, { passive: false });

// Previous button - support both click and touch
const prevBtn = document.getElementById('prev-button');
prevBtn.addEventListener('click', playPrevSong);
prevBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    playPrevSong();
}, { passive: false });

// ============================================================================
// VOLUME CONTROL
// ============================================================================
// REUSABLE: Pattern for syncing multiple UI controls to single state

const volumeControl = document.getElementById('volume-control');

/**
 * Updates volume across all interfaces and persists to storage
 *
 * REUSABLE: Pattern for synchronized state management across multiple UI elements
 *
 * This function demonstrates how to keep multiple UI controls (main player
 * slider and game slider) in sync with a single source of truth.
 *
 * @param {string|number} value - Volume level (0-100)
 *
 * @example
 * // Called from any volume slider
 * updateVolume(75); // Updates widget, both sliders, and localStorage
 */
function updateVolume(value) {
    currentVolume = value;
    window.currentVolume = value; // Update global reference
    if (widget && widget.setVolume) {
        widget.setVolume(currentVolume);
    }
    saveVolume(currentVolume); // Save to localStorage

    // Sync both volume sliders
    const mainVolumeControl = document.getElementById('volume-control');
    const gameVolumeControl = document.getElementById('game-volume-control');

    if (mainVolumeControl) mainVolumeControl.value = currentVolume;
    if (gameVolumeControl) gameVolumeControl.value = currentVolume;
}

// Handle both input and change events for better mobile support
volumeControl.addEventListener('input', (e) => {
    updateVolume(e.target.value);
});

volumeControl.addEventListener('change', (e) => {
    updateVolume(e.target.value);
});

// Handle touch events specifically for mobile
volumeControl.addEventListener('touchend', (e) => {
    updateVolume(e.target.value);
}, { passive: true });

// Game volume control - initialize after DOM loads
window.addEventListener('DOMContentLoaded', () => {
    const gameVolumeControl = document.getElementById('game-volume-control');
    if (gameVolumeControl) {
        // Set initial value
        gameVolumeControl.value = currentVolume;

        // Handle events
        gameVolumeControl.addEventListener('input', (e) => {
            updateVolume(e.target.value);
        });

        gameVolumeControl.addEventListener('change', (e) => {
            updateVolume(e.target.value);
        });

        gameVolumeControl.addEventListener('touchend', (e) => {
            updateVolume(e.target.value);
        }, { passive: true });
    }
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
 * Queries the SoundCloud widget for current state and toggles it,
 * then updates the UI icon to match.
 */
function togglePlayPause() {
    if (!widget) return;

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
 * REUSABLE: Pattern for toggling between two UI states
 *
 * @param {boolean} isPaused - True if player is paused, false if playing
 */
function updatePlayPauseIcon(isPaused) {
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
 * Switches genre from the game modal interface
 *
 * Updates the game's genre tab UI, then delegates to the main
 * switchGenre function for actual genre switching logic.
 *
 * @param {string} genre - Genre identifier to switch to
 */
function switchGenreFromGame(genre) {
    // Update game genre tabs
    document.querySelectorAll('.game-genre-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.genre === genre);
    });

    // Call main genre switch function
    switchGenre(genre);
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

    // Load saved position for the current genre
    currentIndex = getSavedPosition(currentGenre);

    // Load saved volume
    currentVolume = loadSavedVolume();
    window.currentVolume = currentVolume; // Update global reference
    const volumeControl = document.getElementById('volume-control');
    if (volumeControl) {
        volumeControl.value = currentVolume;
    }

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

    // Update game genre tabs
    document.querySelectorAll('.game-genre-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.genre === currentGenre);
    });

    loadPlayer();
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

    // Prevent double-tap zoom on iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
};