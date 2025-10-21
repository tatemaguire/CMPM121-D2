import "./style.css";

document.body.innerHTML = `
  <h1>DRAW!</h1>
  <canvas id="canvas" width="256" height="256"></canvas>
  <br/><br/>
  <button id="clear">Clear</button>
  <button id="undo">Undo</button>
  <button id="redo">Redo</button>
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
  constructor(startPoint: Point) {
    this.points = [startPoint];
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
    context.stroke();
  }
}

const redoObjects: Displayable[] = [];
const displayObjects: Displayable[] = [];
let currentLine: MarkerLine | null = null;

canvas.addEventListener("mousedown", (e) => {
  redoObjects.splice(0, redoObjects.length);
  currentLine = new MarkerLine({ x: e.offsetX, y: e.offsetY });
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
