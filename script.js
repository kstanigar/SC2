/**
 * FOR ELLIE - MUSIC PLAYER LOGIC
 * Features: Genre Tabs, Background Theme Management, Mobile Touch Support
 */

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
        'https://soundcloud.com/cafemusicbgmofficial/the-first-noel-22',
        'https://soundcloud.com/cafemusicbgmofficial/joy-to-the-world-22',
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
        'https://soundcloud.com/stimming/arc-de-triomphe',
        'https://soundcloud.com/aku-en/akufen-installation?in=aku-en/sets/my-way-2002',
        'https://soundcloud.com/four-tet/for-these-times',
        'https://soundcloud.com/richiehawtin/f-u?in=robbie-jacobs-907573640/sets/ritchie-hawtin',
        'https://soundcloud.com/flozbeats/overmono-everything-u-need-floz-edit',
        'https://soundcloud.com/ellum/matteea-frames-1',
        'https://soundcloud.com/maceoplex/mutant-romance-fakemaster1',
        'https://soundcloud.com/thisneverhappenedlabel/lane-8-little-voices',
        'https://soundcloud.com/disciplesldn/they-dont-know',
        'https://soundcloud.com/telefon-tel-aviv/sound-in-a-dark-room',
    ]
};

let currentGenre = 'lightJazz';
let currentIndex = 0;
let widget;
let isFirstLoad = true;
let currentVolume = 50;

// Love Notes
const loveNotes = [
    "Missing your smile right now... 💕",
    "Every song reminds me of you",
    "Can't wait to hold you again",
    "You're always on my mind",
    "Counting down the days until I see you",
    "Distance means so little when you mean so much",
    "This song is for you, my love",
    "Thinking of all our beautiful moments together",
    "You make every day brighter, even from afar",
    "My heart is wherever you are",
    "Soon we'll be dancing together again",
    "Love you more than words can say",
    "You're my favorite melody",
    "Every beat of my heart sings your name",
    "Until we're together again, you're in my thoughts"
];

// Countdown Configuration
const returnDate = new Date('2026-04-30'); // Set your return date here

/**
 * Initializes or updates the SoundCloud Widget
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
                widget.play();
            }
        });
    };
    updateSongIndexUI();
}

/**
 * Show random love note
 */
function showLoveNote() {
    const loveNoteDiv = document.getElementById('love-note');
    const randomNote = loveNotes[Math.floor(Math.random() * loveNotes.length)];

    loveNoteDiv.textContent = randomNote;
    loveNoteDiv.classList.add('show');

    // Hide after 8 seconds
    setTimeout(() => {
        loveNoteDiv.classList.remove('show');
    }, 8000);
}

/**
 * Update countdown timer
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
 * Handles Tab Switching Logic
 */
function switchGenre(genre) {
    if (currentGenre === genre) return;

    currentGenre = genre;
    currentIndex = 0;
    isFirstLoad = false; // User initiated a click, so we can now autoplay

    // Update Theme Class for CSS animations
    document.body.className = `theme-${genre === 'lightJazz' ? 'jazz' : genre}`;

    // Update Button Active States
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        // Matching logic for Jazz/Light Jazz, R&B, and EDM labels
        const isActive = (genre === 'lightJazz' && text.includes('jazz')) ||
            (genre === 'rnb' && text.includes('r&b')) ||
            (genre === 'electronic' && text.includes('edm'));
        btn.classList.toggle('active', isActive);
    });

    loadPlayer();
    showLoveNote(); // Show love note when switching genres
}

/**
 * Updates the text counter (e.g., "Jazz | Track 1 of 18")
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
 * Track Navigation
 */
function playNextSong() {
    currentIndex = (currentIndex + 1) % musicLibrary[currentGenre].length;
    isFirstLoad = false;
    loadPlayer();
    // Show love note occasionally (30% chance)
    if (Math.random() < 0.3) {
        showLoveNote();
    }
}

function playPrevSong() {
    currentIndex = (currentIndex - 1 + musicLibrary[currentGenre].length) % musicLibrary[currentGenre].length;
    isFirstLoad = false;
    loadPlayer();
    // Show love note occasionally (30% chance)
    if (Math.random() < 0.3) {
        showLoveNote();
    }
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

// Volume Slider with immediate feedback
document.getElementById('volume-control').addEventListener('input', (e) => {
    currentVolume = e.target.value;
    if (widget) {
        widget.setVolume(currentVolume);
    }
});

// Initialize first song on window load
window.onload = () => {
    loadPlayer();
    updateCountdown();
    // Update countdown every hour
    setInterval(updateCountdown, 3600000);
    // Show initial love note after 5 seconds
    setTimeout(showLoveNote, 5000);

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