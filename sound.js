import {
    hslToRgb
} from './util';

const WIDTH = 1500;
const HEIGHT = 1500;
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = WIDTH;
canvas.height = HEIGHT;
let analyzer;
let bufferLength;

function handldeError(err) {
    console.log('you must give access to your mic to proceed')
}
async function getAudio() {
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
    }).catch(handldeError);
    const audioCtx = new AudioContext();
    analyzer = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyzer);
    // How much data should be collect.
    analyzer.fftSize = 2 ** 10;
    // pull the data off the audio.
    // How many pieces of data are there?!?
    bufferLength = analyzer.frequencyBinCount;
    const timeData = new Uint8Array(bufferLength);
    const frequencyData = new Uint8Array(bufferLength);
    drawTimeData(timeData);
    drawFrequency(frequencyData);
}

function drawTimeData(timeData) {

    analyzer.getByteTimeDomainData(timeData);
    // now that we have the data, lets turn into something visuals

    // 1. clear the canvas TODO.

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    // 2. setup some canvas drawing.
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#ffc600';
    ctx.beginPath();
    const sliceWidth = WIDTH / bufferLength;
    let x = 0;
    timeData.forEach((data, i) => {
        const v = data / 128;
        const y = (v * HEIGHT) / 2;
        // Draw our lines
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        x += sliceWidth;
    });
    ctx.stroke();
    // call itself as soon as possible.
    requestAnimationFrame(() => drawTimeData(timeData));
}

function drawFrequency(frequencyData) {
    // get the frequency data into our frequencyData array
    analyzer.getByteFrequencyData(frequencyData);
    // figure out the bar width.
    const barWidth = (WIDTH / bufferLength) * 2.5;

    let x = 0;
    frequencyData.forEach(amount => {
        // 0 to 255
        const percent = amount / 255;
        const [h, s, l] = [360 / (percent * 360) - 0.3, 0.8, 0.5];
        const barHeight = (HEIGHT * percent) / 1.2;
        // TODO: convert the colour to hsl TODO
        const [r, g, b] = hslToRgb(h, s, l);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
        x += barWidth + 2;
    });


    requestAnimationFrame(() => drawFrequency(frequencyData));
}
getAudio();