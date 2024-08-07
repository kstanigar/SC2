const soundcloudUrls = [
    'https://soundcloud.com/apparat/hailin-from-the-edge?in=apparat/sets/apparat-walls',
    'https://soundcloud.com/aku-en/akufen-jeep-sex',
    'https://soundcloud.com/meoko/premiere-joey-daniel-uninterrupted-sio',
    'https://soundcloud.com/moderat-official/copy-copy-logic1000-big-ever',
    'https://soundcloud.com/the-kingdom-behind-me/maya-jane-coles-what-they-say',
    'https://soundcloud.com/modmotif/mft003-queen-i-want-to-break-free-ansidis-get-loose-remix?in=modmotif/sets/modmotif-free-tunes',
    'https://soundcloud.com/user-800761345/morkz-afflicted-vr002',
    'https://soundcloud.com/timehaschangedrec/metodi-hristov-misted?in=sven-okpara/sets/rominimal',
    'https://soundcloud.com/mouse-on-mars/artificial-authentic',
    'https://soundcloud.com/telefon-tel-aviv/sound-in-a-dark-room',
];

let currentIndex = 0;
let widget;
let isFirstLoad = true;

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
            // Set the initial volume
            var volumeControl = document.getElementById('volume-control');
            var initialVolume = 1; // Set initial volume to 100%
            widget.setVolume(initialVolume);

            // Debug: Log the initial volume to console
            widget.getVolume(function (volume) {
                console.log('Initial volume:', volume);
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
    currentIndex = (currentIndex + 1) % soundcloudUrls.length;
    isFirstLoad = false;  // Ensure subsequent songs autoplay
    loadPlayer(soundcloudUrls[currentIndex]);
}

document.getElementById('next-button').addEventListener('click', function () {
    playNextSong();
});

document.getElementById('prev-button').addEventListener('click', function () {
    currentIndex = (currentIndex - 1 + soundcloudUrls.length) % soundcloudUrls.length;
    isFirstLoad = false;  // Ensure subsequent songs autoplay
    loadPlayer(soundcloudUrls[currentIndex]);
});

document.getElementById('volume-control').addEventListener('input', function (event) {
    if (widget) {
        var volume = event.target.value / 100 * 3;
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




