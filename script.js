const soundcloudUrls = [
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





