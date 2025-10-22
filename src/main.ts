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

// ----------------------------------------------------------
// ----------------- Interfaces and classes -----------------
// ----------------------------------------------------------

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

class ToolPreview implements Displayable {
  cursor: Point;
  constructor(cursor: Point) {
    this.cursor = cursor;
  }
  display(context: CanvasRenderingContext2D) {
    context.beginPath();
    const radius = (currentlyThick ? 10 : 2) / 2;
    context.arc(this.cursor.x, this.cursor.y, radius, 0, 2 * Math.PI);
    context.fill();
  }
}

// ----------------------------------------------------------
// ----------------- Global Variables -----------------------
// ----------------------------------------------------------

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const redoObjects: Displayable[] = [];
const displayObjects: Displayable[] = [];
let currentLine: MarkerLine | null = null;
let currentlyThick = false;
let toolPreview: ToolPreview | null = null;

// ----------------------------------------------------------
// ----------------- Canvas Mouse Events --------------------
// ----------------------------------------------------------

canvas.addEventListener("mousedown", (e) => {
  redoObjects.splice(0, redoObjects.length);
  currentLine = new MarkerLine({ x: e.offsetX, y: e.offsetY }, currentlyThick);
  displayObjects.push(currentLine);

  toolPreview = null;
  notify("tool-moved");
});

canvas.addEventListener("mouseup", (e) => {
  toolPreview = new ToolPreview({ x: e.offsetX, y: e.offsetY });
  notify("tool-moved");
});

canvas.addEventListener("mousemove", (e) => {
  if (e.buttons & 1) {
    currentLine?.appendPoint({
      x: e.offsetX,
      y: e.offsetY,
    });
    notify("display-changed");
  }
  if (toolPreview) {
    toolPreview.cursor = { x: e.offsetX, y: e.offsetY };
    notify("tool-moved");
  }
});

canvas.addEventListener("mouseenter", (e) => {
  toolPreview = new ToolPreview({ x: e.offsetX, y: e.offsetY });
  notify("tool-moved");
});

canvas.addEventListener("mouseleave", () => {
  toolPreview = null;
  notify("tool-moved");
});

// ----------------------------------------------------------
// ------------- Custom events and notifications ------------
// ----------------------------------------------------------

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const obj of displayObjects) {
    obj.display(ctx);
  }
  toolPreview?.display(ctx);
}

canvas.addEventListener("display-changed", redraw);
canvas.addEventListener("tool-moved", redraw);

function notify(message: string) {
  canvas.dispatchEvent(new Event(message));
}

// ----------------------------------------------------------
// ----------------- Button Callbacks -----------------------
// ----------------------------------------------------------

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
