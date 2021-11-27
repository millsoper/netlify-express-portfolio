/*
  There are two main objects that are handled in this file: 
  1. An array referencing all the line elements in the svg
  2. An array of coordinate sets which are used to define paths for those lines
  They should always be of the same length.
  
  To generate the array of coordinates, we first generate a random path config.
  Then we generate a random "goal" for each part of the config.
  We push the first path into the array.
  Then we generate more paths, each one progressing "forwards"
  We push each new path into the array until there are enough paths in the array
  
  When the array is filled, we are ready to begin.
  
  We set an interval which will fire every 50 milliseconds.
  In the interval, we apply each path in the array to the element with a corresponding index.
  We then shift the first path out of the array.
  We generate a new path by stepping closer to the goalPath. 
  we push this path onto the back of the path array.
  
  To implement this, we'll need a few new steps: 
  1. Instead of having one mutating path object, make an array of path objects
  2. at each interval, remove one item, add another.
  3. render the lines with the paths.
*/

// This generates the string path defining the shape of the <path> element
const generatePath = (pathData, index) => {
  const { spaceBetweenLines, waveInterval, waveHeights } = pathData;
  const spacer = spaceBetweenLines * index;
  return `M${waveInterval[0]},${spacer} Q${waveInterval[1]},${waveHeights[0] +
    spacer} ${waveInterval[2]},${spacer} T${waveInterval[3]},${waveHeights[1] +
    spacer}`;
};

const numberOfLines = 40;
const svgWidth = 100;

/*
wave object should look like this:
wave = { 
  spaceBetweenLines: int,
  waveInterval: Array<int>, (4 long)
  waveHeights: Array<int>, (2 long)
}
*/

// here we get random values which we'll use to generate the first path
const getRandomWave = svgWidth => {
  const wave = {};
  wave.spaceBetweenLines = 6; // this might change based on page height?
  wave.waveInterval = getWaveIntervals(svgWidth); // we pass in the svg width for proportions!
  wave.waveHeights = []; // two random values.
  wave.waveHeights[0] = getWaveHeight(svgWidth);
  wave.waveHeights[1] = getWaveHeight(svgWidth);
  return wave;
};

//Wave interval makers!
const getOneWaveInterval = (svgWidth, waveIntervalIndex) => {
  switch (waveIntervalIndex) {
    case 0:
      return Math.round(Math.random() * (svgWidth / 5) * -1);
      break;
    case 1:
      return Math.round(Math.random() * (svgWidth / 2));
      break;
    case 2:
      return Math.round(Math.random() * (svgWidth / 2) + svgWidth / 2);
      break;
    case 3:
      return Math.round((Math.random() + 2) * svgWidth);
      break;
    default:
      console.log("That's not a valid wave interval...");
  }
};

const getWaveHeight = svgWidth => {
  return Math.round((Math.random() * svgWidth) / 2 - svgWidth / 10);
};

// This is a helper function for `getRandomWave`
// as I recall, basically each is like, a variable location for each peak
const getWaveIntervals = svgWidth => {
  const waves = [];
  for (let i = 0; i < 4; i++) {
    waves[i] = getOneWaveInterval(svgWidth, i);
  }
  return waves;
};

const getRandomColor = baseColor => {
  const colorValue = Math.floor(
    Math.random() * (baseColor + 30 - baseColor + 1) + baseColor
  );
  return `hsla(${colorValue}, 100%, 50%, 75%)`;
};

/**** SETUP ****/
const container = document.getElementById("lines");
// this generates a bunch of lines
// this will hold our references to the DOM elements we create here
const allWaves = [];
let allPaths = [];

const baseColor = Math.floor(Math.random() * 325);
// This only fires once, at startup
for (let i = 0; i < numberOfLines; i++) {
  // Remember you need `createElementNS` because it's SVG!
  const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
  line.setAttribute("fill", "transparent");
  line.classList.add("line");
  container.appendChild(line);
  // We generate a random bright value for every line
  const randomColor = getRandomColor(baseColor);
  line.setAttribute("stroke", "#f2f2f2");
  allWaves.push(line);
}

const getNextStep = (wave, targetWave, index) => {
  // It was a reference error, y'all.

  // Now we have the new error that these are all around the same central point...
  let waveInterval = [0, 0, 0, 0];
  let waveHeights = [0, 0];
  let spaceBetweenLines = 6;

  for (let i = 0; i < waveInterval.length; i++) {
    if (wave.waveInterval[i] > targetWave.waveInterval[i]) {
      waveInterval[i] = wave.waveInterval[i] - 1;
    } else if (wave.waveInterval[i] < targetWave.waveInterval[i]) {
      waveInterval[i] = wave.waveInterval[i] + 1;
    } else {
      targetWave.waveInterval[i] = getOneWaveInterval(svgWidth, i);
      waveInterval[i] = wave.waveInterval[i];
    }
  }

  for (let j = 0; j < waveHeights.length; j++) {
    if (wave.waveHeights[j] > targetWave.waveHeights[j]) {
      waveHeights[j] = wave.waveHeights[j] - 1;
    } else if (wave.waveHeights[j] < targetWave.waveHeights[j]) {
      waveHeights[j] = wave.waveHeights[j] + 1;
    } else {
      targetWave.waveHeights[j] = getWaveHeight(svgWidth);
      waveHeights[j] = wave.waveHeights[j];
    }
  }
  const newWave = { spaceBetweenLines, waveHeights, waveInterval };
  return newWave;
};

const linesConfig = {
  numberOfLines: 40,
  svgWidth: 100,
  targetLine: getRandomWave(100),
  currentLine: getRandomWave(100)
};

const updatePaths = paths => {
  const newPaths = paths.slice(1);
  const lastPath = paths[paths.length - 1];
  // Appallingly unclear code. The paths array is one shorter than usual because THIS one hasn't been pushed on yet
  const nextPath = getNextStep(lastPath, targetWave, paths.length);
  newPaths.push(nextPath);
  return newPaths;
};
// initial wave setup.  This only fires once, at startup
let wave = getRandomWave(svgWidth); // the current, frontmost wave
let targetWave = getRandomWave(svgWidth); // the target wave

for (let i = 0; i < numberOfLines; i++) {
  let nextStep = Object.assign({}, getNextStep(wave, targetWave, i));
  wave = nextStep;
  allPaths.push(nextStep);
}

// we kept a reference to each of those DOM elements in that array, so we can iterate over it to update them all with a new wave pattern.
const printAllWaves = () => {
  for (let i = 0; i < allWaves.length; i++) {
    allWaves[i].setAttribute("d", generatePath(allPaths[i], i));
  }
  allPaths = updatePaths(allPaths);
};

printAllWaves();

let request;
let timeout;
let running = true;
let framesPerSecond = 35;

const animate = () => {
  timeout = setTimeout(function() {
    request = requestAnimationFrame(animate);
    draw();
  }, 1000 / framesPerSecond);
};

function draw(){
  printAllWaves();
};

const stop = () => {
  cancelAnimationFrame(request);
  clearInterval(timeout);
  running = false;
};

const start = () => {
  // VERY interesting -- clicking start repeating (without this check) accelerates the animation!
  if (!running){
    animate();
  }
};

animate();

const projectBox = document.getElementsByClassName("lines")[0];

if (projectBox) {
  stop();
  projectBox.addEventListener("mouseenter", start);
  projectBox.addEventListener("mouseleave", stop);
}
