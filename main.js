// Declare global variables
const carCanvas = document.getElementById("carCanvas");
const networkCanvas = document.getElementById("networkCanvas");
const carCTX = carCanvas.getContext("2d");
const networkCTX = networkCanvas.getContext("2d");
let play = localStorage.getItem("play") === "true";

// Set canvas widths
carCanvas.width = 300;
networkCanvas.width = 400;

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
// document.addEventListener("DOMContentLoaded", setValue);
range.addEventListener("input", setValue);

// Generate cars
const cars = generateCars(document.getElementById("myRange").value);
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
    if (i != 0) {
      NeuralNetwork.mutate(cars[i].brain, 0.2);
    }
  }
}

// Create traffic
const traffic = [
  new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 1.2),
  new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 1.2),
  new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 1.2),
  new Car(road.getLaneCenter(1), -400, 30, 50, "DUMMY", 1.2),
  new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 1.2),
  new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 1.2),
  new Car(road.getLaneCenter(2), -600, 30, 50, "DUMMY", 1.2),
  new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 1.2),
  new Car(road.getLaneCenter(0), -200, 30, 50, "DUMMY", 1.2),
  new Car(road.getLaneCenter(1), -800, 30, 50, "DUMMY", 1.6),
  new Car(road.getLaneCenter(2), -800, 30, 50, "DUMMY", 1.6),
  new Car(road.getLaneCenter(0), -900, 30, 50, "DUMMY", 1.6),
  new Car(road.getLaneCenter(1), -1000, 30, 50, "DUMMY", 1.6),
];

// Animate function
animate();

// Functions
function togglePlay() {
  play = !play;
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

function generateCars(N) {
  const cars = [];
  for (let i = 1; i < N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
  }
  return cars;
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
