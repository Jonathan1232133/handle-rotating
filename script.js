const bar = document.getElementById('bar');
const button = document.getElementById('clicker');
const body = document.body;

let progress = 0;
const max = 100;

const decayInterval = 80;        // как часто срабатывает откат
const lightDuration = 15000;     // сколько горит свет (в мс)
const increment = 5;             // сила клика

// === рассчитываем скорость отката под нужную длительность
// decayRate = сколько процентов снимается за один шаг
const decayRate = max / (lightDuration / decayInterval);

let finished = false;
let lightTimeout = null;

button.addEventListener('click', () => {
    if (finished) return;

    progress += increment;
    if (progress > max) progress = max;

    if (progress >= max) {
        finished = true;
        button.disabled = true;
        bar.style.background = 'gold';
        body.style.background = '#f4f4f4';

        // === SDK: закрыть iframe и активировать задачу
        PortalsSdk.closeIframe();
        PortalsSdk.sendMessageToUnity(
            JSON.stringify({
                TaskName: "room-light",
                TaskTargetState: "SetNotActiveToActive"
            })
        );

        // === через 15 секунд — деактивировать задачу (вместе с концом шкалы)
        lightTimeout = setTimeout(() => {
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
        progress -= 1; // обычное “сопротивление” до 100%
        if (progress < 0) progress = 0;
        updateBar();
    } else {
        // когда “победа” — синхронный откат ровно за lightDuration
        progress -= decayRate;
        if (progress <= 0) {
            progress = 0;
            finished = false;
            button.disabled = false;
            bar.style.background = 'linear-gradient(90deg, #6fcf97, #28a745)';
            body.style.background = '#222';
            clearTimeout(lightTimeout);
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
};
