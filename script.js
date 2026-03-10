const soundcloudUrls = [
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
    'https://soundcloud.com/cafemusicbgmofficial/uncharted',
    'https://soundcloud.com/cafemusicbgmofficial/right-way',
    'https://soundcloud.com/relaxcafemusic/everyone-togehter',
    'https://soundcloud.com/relaxcafemusic/011fun-love',
    'https://soundcloud.com/relaxcafemusic/005never-let-me-go',
    'https://soundcloud.com/relaxcafemusic/jam-session',
    'https://soundcloud.com/cafemusicbgmofficial/midnight-ensemble',
    'https://soundcloud.com/cafemusicbgmofficial/she-will-be-loved-maroon-5',
    'https://soundcloud.com/cafemusicbgmofficial/butter-braid'
];

let currentIndex = 0;
let widget;
let isFirstLoad = true;
let currentVolume = 1 * 20;  // Default volume (100%)

function loadPlayer(url) {
    var playerDiv = document.getElementById('player');
    playerDiv.innerHTML = '';  // Clear any previous embed

    var embedUrl = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(url) + '&auto_play=false&buying=false&sharing=false&show_playcount=false&show_comments=false&show_artwork=false&color=%232850ac';
    var iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '166';
    iframe.scrolling = 'no';
    iframe.frameBorder = 'no';
    iframe.allow = 'autoplay';
    iframe.src = embedUrl;
    playerDiv.appendChild(iframe);

    iframe.onload = function () {
        widget = SC.Widget(iframe);
        widget.bind(SC.Widget.Events.READY, function () {
            // Set the volume to the stored value
            widget.setVolume(currentVolume);

            // Debug: Log the initial volume to console
            widget.getVolume(function (volume) {
                console.log('Volume after loading track:', volume);
            });

            // Bind event listener for song finish to play next song
            widget.bind(SC.Widget.Events.FINISH, function () {
                playNextSong();
            });

            // Automatically play the song when ready, except for the first load
            if (!isFirstLoad) {
                widget.play();
            }
        });
    };

    updateSongIndex();
}

function updateSongIndex() {
    var songIndexDiv = document.getElementById('song-index');
    songIndexDiv.textContent = 'Now playing: ' + (currentIndex + 1) + ' / ' + soundcloudUrls.length;
}

function playNextSong() {
    // Store the current volume before switching to the next song
    widget.getVolume(function (volume) {
        currentVolume = volume;
    });

    currentIndex = (currentIndex + 1) % soundcloudUrls.length;
    isFirstLoad = false;  // Ensure subsequent songs autoplay
    loadPlayer(soundcloudUrls[currentIndex]);
}

document.getElementById('next-button').addEventListener('click', function () {
    // Store the current volume before switching
    widget.getVolume(function (volume) {
        currentVolume = volume;
    });

    playNextSong();
});

document.getElementById('prev-button').addEventListener('click', function () {
    // Store the current volume before switching
    widget.getVolume(function (volume) {
        currentVolume = volume;
    });

    currentIndex = (currentIndex - 1 + soundcloudUrls.length) % soundcloudUrls.length;
    isFirstLoad = false;  // Ensure subsequent songs autoplay
    loadPlayer(soundcloudUrls[currentIndex]);
});

document.getElementById('volume-control').addEventListener('input', function (event) {
    if (widget) {
        var volume = event.target.value / 100 * 50;
        currentVolume = volume;  // Store the new volume level
        widget.setVolume(volume);

        // Debug: Log the current volume to console
        widget.getVolume(function (currentVolume) {
            console.log('Current volume after input change:', currentVolume);
        });
    }
});

// Load the first track on page load
window.onload = function () {
    loadPlayer(soundcloudUrls[currentIndex]);
};





