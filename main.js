const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 300;

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 400;

const carCTX = carCanvas.getContext("2d");
const networkCTX = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
const cars = generateCars(1000);
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
    if (i!=0) {
      NeuralNetwork.mutate(cars[i].brain,0.2);
    }
  }
}

const traffic = [
  new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 1.6),
  new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 1.6),
  new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 1.6),
  new Car(road.getLaneCenter(1), -400, 30, 50, "DUMMY", 1.6),
  new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 1.6),
  new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 1.6),
  new Car(road.getLaneCenter(2), -600, 30, 50, "DUMMY", 1.6),
  new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 1.6),
  new Car(road.getLaneCenter(0), -200, 30, 50, "DUMMY", 1.6),
  new Car(road.getLaneCenter(1), -800, 30, 50, "DUMMY", 1.6),
  new Car(road.getLaneCenter(2), -800, 30, 50, "DUMMY", 1.6),
  new Car(road.getLaneCenter(0), -900, 30, 50, "DUMMY", 1.6),
  new Car(road.getLaneCenter(1), -1000, 30, 50, "DUMMY", 1.6),
  new Car(road.getLaneCenter(2), -1000, 30, 50, "DUMMY", 1.6),
];

animate();

function save() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
  localStorage.removeItem("bestBrain");
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
  requestAnimationFrame(animate);
}
