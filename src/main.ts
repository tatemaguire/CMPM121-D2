import "./style.css";

document.body.innerHTML = `
  <h1>DRAW!</h1>
  <canvas id="canvas" width="256" height="256"></canvas>
  <br/><br/>
  <button id="clear">Clear</button>
  <button id="undo">Undo</button>
  <button id="redo">Redo</button>
  <button id="makeThin" class="selected_button">Thin Stroke</button>
  <button id="makeThick">Thick Stroke</button>
`;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

interface Point {
  x: number;
  y: number;
}

interface Displayable {
  display(context: CanvasRenderingContext2D): void;
}

class MarkerLine implements Displayable {
  points: Point[];
  thickLine: boolean;
  constructor(startPoint: Point, thickLine: boolean) {
    this.points = [startPoint];
    this.thickLine = thickLine;
  }
  appendPoint(newPoint: Point) {
    this.points.push(newPoint);
  }
  display(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.moveTo(this.points[0].x, this.points[0].y);
    for (const pt of this.points) {
      context.lineTo(pt.x, pt.y);
    }
    context.lineWidth = this.thickLine ? 10 : 2;
    context.stroke();
  }
}

const redoObjects: Displayable[] = [];
const displayObjects: Displayable[] = [];
let currentLine: MarkerLine | null = null;
let currentlyThick = false;

canvas.addEventListener("mousedown", (e) => {
  redoObjects.splice(0, redoObjects.length);
  currentLine = new MarkerLine({ x: e.offsetX, y: e.offsetY }, currentlyThick);
  displayObjects.push(currentLine);
});

canvas.addEventListener("mousemove", (e) => {
  if (e.buttons & 1) {
    currentLine?.appendPoint({
      x: e.offsetX,
      y: e.offsetY,
    });
    notify("display-changed");
  }
});

canvas.addEventListener("display-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const obj of displayObjects) {
    obj.display(ctx);
  }
});

function notify(message: string) {
  canvas.dispatchEvent(new Event(message));
}

const clearButton = document.getElementById("clear") as HTMLButtonElement;

clearButton.addEventListener("click", () => {
  displayObjects.splice(0, displayObjects.length);
  notify("display-changed");
});

const undoButton = document.getElementById("undo") as HTMLButtonElement;

undoButton.addEventListener("click", () => {
  const undoneObj = displayObjects.pop();
  if (undoneObj) {
    redoObjects.push(undoneObj);
    notify("display-changed");
  }
});

const redoButton = document.getElementById("redo") as HTMLButtonElement;

redoButton.addEventListener("click", () => {
  const redoneObj = redoObjects.pop();
  if (redoneObj) {
    displayObjects.push(redoneObj);
    notify("display-changed");
  }
});

const thinButton = document.getElementById("makeThin") as HTMLButtonElement;
const thickButton = document.getElementById("makeThick") as HTMLButtonElement;

thinButton.addEventListener("click", () => {
  currentlyThick = false;
  thinButton.classList.add("selected_button");
  thickButton.classList.remove("selected_button");
});

thickButton.addEventListener("click", () => {
  currentlyThick = true;
  thinButton.classList.remove("selected_button");
  thickButton.classList.add("selected_button");
});
