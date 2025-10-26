import "./style.css";

document.body.innerHTML = `
  <h1>DRAW!</h1>
  <canvas id="canvas" width="256" height="256"></canvas>
  <br/><br/>
  <button id="clear">Clear</button>
  <button id="undo">Undo</button>
  <button id="redo">Redo</button>
  <button id="createCustomSticker">Create Custom Sticker</button>
  <br/><br/>
  <button id="makeThin" class="selected_button">Thin Marker</button>
  <button id="makeThick">Thick Marker</button>
  <br/><br/>
  <div id="stickerButtons"></div>
`;

const defaultStickers: string[] = [
  "🫟",
  "🩸",
  "🦠",
];

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
  drag(newPoint: Point) {
    this.points.push(newPoint);
    notify("display-changed");
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

class Sticker implements Displayable {
  emoji: string;
  centerPos: Point;
  constructor(centerPos: Point, emoji: string) {
    this.emoji = emoji;
    this.centerPos = centerPos;
  }
  display(context: CanvasRenderingContext2D): void {
    context.textAlign = "center";
    context.fillText(this.emoji, this.centerPos.x, this.centerPos.y);
  }
}

interface Tool extends Displayable {
  visible: boolean;
  cursor: Point;
  onMouseDown(e: MouseEvent): void;
  onMouseUp(e: MouseEvent): void;
  onMouseMove(e: MouseEvent): void;
  onMouseEnter(e: MouseEvent): void;
  onMouseLeave(e: MouseEvent): void;
}

class MarkerTool implements Tool {
  visible: boolean;
  cursor: Point;
  isThick: boolean;
  currentLine: MarkerLine | null;

  constructor(isThick: boolean) {
    this.visible = true;
    this.cursor = { x: 0, y: 0 };
    this.isThick = isThick;
    this.currentLine = null;
  }
  display(context: CanvasRenderingContext2D): void {
    if (this.visible) {
      context.beginPath();
      const radius = (this.isThick ? 10 : 2) / 2;
      context.arc(this.cursor.x, this.cursor.y, radius, 0, 2 * Math.PI);
      context.fill();
    }
  }

  onMouseDown(e: MouseEvent): void {
    this.cursor = { x: e.offsetX, y: e.offsetY };
    this.visible = false;

    if (!this.currentLine) {
      this.currentLine = new MarkerLine(this.cursor, this.isThick);
      displayObjects.push(this.currentLine);
    }
  }
  onMouseUp(e: MouseEvent): void {
    this.cursor = { x: e.offsetX, y: e.offsetY };
    this.visible = true;
    this.currentLine = null;
  }
  onMouseMove(e: MouseEvent): void {
    this.cursor = { x: e.offsetX, y: e.offsetY };
    if (e.buttons & 1) {
      this.currentLine?.drag(this.cursor);
    }
  }
  onMouseEnter(e: MouseEvent): void {
    if (e.buttons & 1) {
      this.onMouseDown(e);
    } else {
      this.cursor = { x: e.offsetX, y: e.offsetY };
      this.visible = true;
    }
  }
  onMouseLeave(e: MouseEvent): void {
    if (e.buttons & 1) {
      this.onMouseUp(e);
    } else {
      this.visible = false;
    }
  }
}

class StickerTool implements Tool {
  visible: boolean;
  cursor: Point;
  emoji: string;
  constructor(emoji: string) {
    this.visible = true;
    this.cursor = { x: 0, y: 0 };
    this.emoji = emoji;
  }
  display(context: CanvasRenderingContext2D): void {
    if (this.visible) {
      context.textAlign = "center";
      context.fillText(this.emoji, this.cursor.x, this.cursor.y);
    }
  }

  onMouseDown(e: MouseEvent): void {
    this.cursor = { x: e.offsetX, y: e.offsetY };
    const sticker = new Sticker(this.cursor, this.emoji);
    displayObjects.push(sticker);
  }
  onMouseUp(e: MouseEvent): void {
    this.cursor = { x: e.offsetX, y: e.offsetY };
  }
  onMouseMove(e: MouseEvent): void {
    this.cursor = { x: e.offsetX, y: e.offsetY };
  }
  onMouseEnter(e: MouseEvent): void {
    this.cursor = { x: e.offsetX, y: e.offsetY };
    this.visible = true;
  }
  onMouseLeave(): void {
    this.visible = false;
  }
}

// ----------------------------------------------------------
// ----------------- Global Variables -----------------------
// ----------------------------------------------------------

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const redoObjects: Displayable[] = [];
const displayObjects: Displayable[] = [];
let currentTool: Tool = new MarkerTool(false);

// ----------------------------------------------------------
// ----------------- Canvas Mouse Events --------------------
// ----------------------------------------------------------

canvas.addEventListener("mousedown", (e) => {
  redoObjects.splice(0, redoObjects.length);

  currentTool.onMouseDown(e);
  notify("tool-moved");
});

canvas.addEventListener("mouseup", (e) => {
  currentTool.onMouseUp(e);
  notify("tool-moved");
});

canvas.addEventListener("mousemove", (e) => {
  currentTool.onMouseMove(e);
  notify("tool-moved");
});

canvas.addEventListener("mouseenter", (e) => {
  currentTool.onMouseEnter(e);
  notify("tool-moved");
});

canvas.addEventListener("mouseleave", (e) => {
  currentTool.onMouseLeave(e);
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
  currentTool?.display(ctx);
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
  redoObjects.splice(0, redoObjects.length);
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

const createCustomStickerButton = document.getElementById(
  "createCustomSticker",
) as HTMLButtonElement;

createCustomStickerButton.addEventListener("click", () => {
  const emoji = prompt(
    "Enter the emoji for your custom sticker:",
    "❌",
  ) as string;
  addStickerTool(emoji);
});

// ----------------------------------------------------------
// -------------------- Tool Buttons ------------------------
// ----------------------------------------------------------

const thinButton = document.getElementById("makeThin") as HTMLButtonElement;
const thickButton = document.getElementById("makeThick") as HTMLButtonElement;
const stickerDiv = document.getElementById("stickerButtons") as HTMLDivElement;

const markerButtons: HTMLButtonElement[] = [thinButton, thickButton];
const stickerButtons: HTMLButtonElement[] = [];

function selectButton(button: HTMLButtonElement) {
  for (const b of markerButtons) {
    b.classList.remove("selected_button");
  }
  for (const b of stickerButtons) {
    b.classList.remove("selected_button");
  }
  button.classList.add("selected_button");
}

thinButton.addEventListener("click", () => {
  currentTool = new MarkerTool(false);
  selectButton(thinButton);
});

thickButton.addEventListener("click", () => {
  currentTool = new MarkerTool(true);
  selectButton(thickButton);
});

function addStickerTool(emoji: string) {
  const newButton = document.createElement("button");
  newButton.innerText = emoji;
  newButton.addEventListener("click", () => {
    currentTool = new StickerTool(emoji);
    selectButton(newButton);
  });
  stickerDiv.appendChild(newButton);
  stickerButtons.push(newButton);
}

defaultStickers.forEach(addStickerTool);
