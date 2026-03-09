//XENOLUX HARMONIC WEAVE
 // Inspiration: Bach Structure vs Sun Ra Chaos
 // 100 vertical "strings"  act like a digital harp.When it detect frequency , the string doesn't just grow,, it curves and ripples, crossing over other strings to create new "accidental" colors where they intersect.

let mic, fft;
let isStarted = false;
let gainSlider;
let time = 0;

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.id('chromaweave-canvas');
  colorMode(HSB, 360, 100, 100, 1);
  
  mic = new p5.AudioIn();
  fft = new p5.FFT(0.9, 512); // smoothing for silk-like movement

  gainSlider = createSlider(1, 100, 40); 
  gainSlider.parent('slider-container');
}

function draw() {
  // very low alpha for maximum "ghosting" and synthesis effect
  background(260, 50, 2, 0.05); 

  if (!isStarted) {
    drawDiagnostic();
    return;
  }

  let spectrum = fft.analyze();
  let vol = mic.getLevel();
  let gain = gainSlider.value();

  //  UI Meter
  let meter = document.getElementById('meter-fill');
  if (meter) meter.style.width = map(vol * gain, 0, 25, 0, 100, true) + "%";

  // THE WEAVE ENGINE
  //  draw 60 vertical "strings" across the screen
  let numStrings = 60;
  let spacing = width / numStrings;

  for (let i = 0; i < numStrings; i++) {
    // Each string maps to a specific part of the frequency spectrum
    let freqIndex = floor(map(i, 0, numStrings, 0, spectrum.length / 2));
    let amp = spectrum[freqIndex] * gain;
    
    // Calculate color based on frequency (Seeing Sound)
    let hue = map(freqIndex, 0, spectrum.length / 2, 0, 360);
    
    noFill();
    // High volume - the strings glow and thicken
    stroke(hue, 80, 100, map(amp, 0, 150, 0.1, 0.8));
    strokeWeight(map(amp, 0, 150, 0.5, 5));

    beginShape();
    // Start string at the top
    curveVertex(i * spacing, 0);
    curveVertex(i * spacing, 0);

    // 5 control points for the curve
    for (let y = 0; y <= height; y += height / 5) {
      // PERLIN NOISE DRIFT (The Sun Ra Chaos)
      // The music amplitude distorts the straight Bach-like line
      let noiseVal = noise(i * 0.1, y * 0.01, time);
      let xOffset = map(noiseVal, 0, 1, -amp, amp);
      
      // Horizontal ripple
      let ripple = sin(y * 0.01 + time * 50) * (amp / 4);
      
      curveVertex(i * spacing + xOffset + ripple, y);
    }

    curveVertex(i * spacing, height);
    curveVertex(i * spacing, height);
    endShape();
  }

  time += 0.005; // The slow "Sentient" drift
}

function touchStarted() { if (!isStarted) initAudio(); return false; }
function mousePressed() { if (!isStarted) initAudio(); }

function initAudio() {
  userStartAudio();
  mic.start();
  fft.setInput(mic);
  isStarted = true;
  document.getElementById('status').innerText = "WEAVE ACTIVE // SYNTHESIA MODE";
}

function saveArt() {
  saveCanvas('Chroma_Weave_' + Date.now(), 'png');
}

function drawDiagnostic() {
  noFill(); stroke(0, 0, 100, 0.1);
  ellipse(width/2, height/2, 100 + sin(frameCount * 2) * 20);
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
