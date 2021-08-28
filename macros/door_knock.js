const sounds = [ "Knocking-on-door-two-knocks", "Knocking-on-wall-five-knocks", "Knocking-on-door-five-knocks", "Knocking-on-wall-four-knocks-moderate", "Knocking-softly-on-door" ]

const url = "https://www.fesliyanstudios.com/soundeffects/3-27-2019batch/" + sounds[Math.floor(Math.random() * sounds.length)] + "-www.fesliyanstudios.com.mp3"

AudioHelper.play({src: url, volume: 0.8, autoplay: true, loop: false}, true);