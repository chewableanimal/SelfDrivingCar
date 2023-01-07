// Declare global variables
const carCanvas = document.getElementById("carCanvas");
const networkCanvas = document.getElementById("networkCanvas");
const carCTX = carCanvas.getContext("2d");
const networkCTX = networkCanvas.getContext("2d");
let play = localStorage.getItem("play") === "true";

// Set canvas widths
carCanvas.width = 300;
networkCanvas.width = 0.3 * window.innerWidth;

// Create road and range
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
const range = document.getElementById("myRange");

// Set range value, position and update
const rangeV = document.getElementById("rangeV");
const setValue = () => {
  const newValue = Number(
      ((range.value - range.min) * 100) / (range.max - range.min)
    ),
    newPosition = 10 - newValue * 0.2;
  rangeV.innerHTML = `<span>${range.value}</span>`;
  rangeV.style.left = `calc(${newValue}% + (${newPosition}px))`;
};
range.value = JSON.parse(localStorage.getItem("carsValue")) || 100;
range.addEventListener("input", setValue);

const trafficRange = document.getElementById("trafficRange");

// Set range value, position and update
const rangeVV = document.getElementById("rangeVV");
const setTrafficValue = () => {
  const newValue = Number(
      ((trafficRange.value - trafficRange.min) * 100) /
        (trafficRange.max - trafficRange.min)
    ),
    newPosition = 10 - newValue * 0.2;
  rangeVV.innerHTML = `<span>${trafficRange.value}</span>`;
  rangeVV.style.left = `calc(${newValue}% + (${newPosition}px))`;
};
range.value = JSON.parse(localStorage.getItem("carsValue")) || 100;
trafficRange.value = JSON.parse(localStorage.getItem("trafficValue")) || 2;

range.addEventListener("input", setValue);
trafficRange.addEventListener("input", setTrafficValue);

// Generate cars
const carWidth = 45;
const carHeight = 75;
const cars = generateCars(document.getElementById("myRange").value);
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
    if (i != 0) {
      NeuralNetwork.mutate(cars[i].brain, 0.1);
    }
  }
}

// Create traffic
let oldTraffic = JSON.parse(localStorage.getItem("trafficData"));

if (oldTraffic) {
  for (let i = 0; i < oldTraffic.length; i++) {
    oldTraffic[i] = new Car(
      oldTraffic[i].x,
      oldTraffic[i].y,
      carWidth,
      carHeight,
      "DUMMY",
      1.2
    );
  }
}

let traffic = oldTraffic || generateTraffic(trafficRange.value, -carHeight);

displayPlayButton();

// Animate function
animate();

// Functions
function displayPlayButton() {
  const pausePlayButton = document.querySelector(".pause-play-button");
  if (play) {
    pausePlayButton.innerHTML = "Pause";
    pausePlayButton.style.backgroundColor = "#be2087";
  } else {
    pausePlayButton.innerHTML = "Play";
    pausePlayButton.style.backgroundColor = "#ff6f61";
  }
}
function togglePlay() {
  play = !play;
  displayPlayButton();

  localStorage.setItem("play", JSON.stringify(play));
  if (play) {
    animate();
  }
}

function retry() {
  window.location.reload();
}

function save() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
  localStorage.removeItem("bestBrain");
}

function getNewCarsValue() {
  localStorage.setItem(
    "carsValue",
    JSON.stringify(document.getElementById("myRange").value)
  );
  window.location.reload();
}

function getNewTrafficValue() {
  localStorage.setItem(
    "trafficValue",
    JSON.stringify(document.getElementById("trafficRange").value)
  );
  localStorage.removeItem("trafficData");
  window.location.reload();
}

function generateCars(N) {
  const cars = [];
  for (let i = 1; i < N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 100, carWidth, carHeight, "AI"));
  }
  return cars;
}

function generateTraffic(complex, position) {
  let newTraffic = [];
  let lastPosition = position;
  const carAmounts = [4, 7, 10, 15, 30];
  const lanePositions = [0, 1, 2];
  const carAmount = carAmounts[complex - 1];

  for (let i = 0; i < carAmount; i++) {
    const randomNum = getRandomIntInclusive(0, 2);
    lastPosition -= randomNum * carHeight * 2.25;
    let lanePosition = road.getLaneCenter(
      i === 3 ? 1 : lanePositions[randomNum]
    );
    if (
      i >= 2 &&
      newTraffic[i - 2].y == lastPosition &&
      newTraffic[i - 1].y == lastPosition
    ) {
      const randomNum = getRandomIntInclusive(1, 2);
      lastPosition -= randomNum * carHeight * 2.25;
    }
    if (i >= 2 && newTraffic[i - 2].x == newTraffic[i - 1].x) {
      // Choose a different lane position to avoid having 3 cars in a row with the same x value
      while (lanePosition == newTraffic[i - 1].x) {
        const randomNum = getRandomIntInclusive(0, 2);
        lanePosition = road.getLaneCenter(randomNum);
      }
    }
    newTraffic.push(
      new Car(lanePosition, lastPosition, carWidth, carHeight, "DUMMY", 1.2)
    );
  }

  for (let i = 0; i < newTraffic.length; i++) {
    if (
      i >= 3 &&
      newTraffic[i - 3].y == newTraffic[i - 2].y &&
      newTraffic[i - 1].y == newTraffic[i].y
    ) {
      newTraffic.splice(i - 2, 1);
    }
  }

  localStorage.setItem("trafficData", JSON.stringify(newTraffic));
  console.table(newTraffic);
  return newTraffic;
}

function randomizeTraffic() {
  localStorage.removeItem("trafficData");
  window.location.reload();
}

function animate() {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }

  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic);
  }

  bestCar = cars.find((c) => c.y === Math.min(...cars.map((c) => c.y)));

  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  carCTX.save();
  carCTX.translate(0, -bestCar.y + carCanvas.height * 0.7);

  road.draw(carCTX);
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCTX, "#6600FF");
  }

  carCTX.globalAlpha = 0.2;
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carCTX, "#ff6f61");
  }
  carCTX.globalAlpha = 1;
  bestCar.draw(carCTX, "#ff6f61", true);

  carCTX.restore();

  Visualizer.drawNetwork(networkCTX, bestCar.brain);

  if (play) {
    requestAnimationFrame(animate);
  }
}
