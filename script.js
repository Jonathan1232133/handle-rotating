const bar = document.getElementById('bar');
const button = document.getElementById('clicker');
const body = document.body;

let progress = 0;
const max = 100;

const decayInterval = 80;
const lightDuration = 15000;
const increment = 5;
const decayRate = max / (lightDuration / decayInterval);

let finished = false;
let lightTimeout = null;

// === аудио
const gearAudio = new Audio('gears.mp3');
gearAudio.loop = true;
let audioPlaying = false;

// Включаем звук — только если не играет
function playGearAudio() {
    if (!audioPlaying) {
        gearAudio.currentTime = 0;
        gearAudio.play();
        audioPlaying = true;
    }
}

// Отключаем звук
function stopGearAudio() {
    if (audioPlaying) {
        gearAudio.pause();
        gearAudio.currentTime = 0;
        audioPlaying = false;
    }
}

button.addEventListener('click', () => {
    if (finished) return;

    // Если прогресс был 0 и теперь стал больше 0 — запускаем звук
    if (progress === 0) {
        playGearAudio();
    }

    progress += increment;
    if (progress > max) progress = max;

    if (progress >= max) {
        finished = true;
        button.disabled = true;
        bar.style.background = 'gold';
        body.style.background = '#f4f4f4';

        PortalsSdk.closeIframe();
        PortalsSdk.sendMessageToUnity(
            JSON.stringify({
                TaskName: "room-light",
                TaskTargetState: "SetNotActiveToActive"
            })
        );

        // Выключить звук через 15 секунд (с окончанием света)
        setTimeout(() => {
            stopGearAudio();
            PortalsSdk.sendMessageToUnity(
                JSON.stringify({
                    TaskName: "room-light",
                    TaskTargetState: "SetActiveToNotActive"
                })
            );
        }, lightDuration);
    }

    updateBar();
});

function updateBar() {
    bar.style.width = progress + '%';
    if (!finished) {
        bar.style.background = 'linear-gradient(90deg, #6fcf97, #28a745)';
    }
}

// постоянный откат
function decay() {
    if (!finished) {
        progress -= 1;
        if (progress < 0) progress = 0;
        updateBar();

        // Если прогресс опустился до 0 — выключаем звук
        if (progress === 0) {
            stopGearAudio();
        }
    } else {
        progress -= decayRate;
        if (progress <= 0) {
            progress = 0;
            finished = false;
            button.disabled = false;
            bar.style.background = 'linear-gradient(90deg, #6fcf97, #28a745)';
            body.style.background = '#222';
            clearTimeout(lightTimeout);
            stopGearAudio(); // Выключить звук, если прогресс доходит до 0 после победы
        }
        updateBar();
    }
}

setInterval(decay, decayInterval);

window.onload = () => {
    progress = 0;
    finished = false;
    bar.style.width = '0%';
    button.disabled = false;
    bar.style.background = 'linear-gradient(90deg, #6fcf97, #28a745)';
    body.style.background = '#222';
    stopGearAudio();
};
