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

const lines: Point[][] = []; // tail element is most recently drawn
const redoLines: Point[][] = []; // tail element is most recently undone

canvas.addEventListener("mousedown", (e) => {
  const line: Point[] = [];
  line.push({ x: e.offsetX, y: e.offsetY });
  lines.push(line);
  redoLines.splice(0, redoLines.length);
});

canvas.addEventListener("mousemove", (e) => {
  if (e.buttons & 1) {
    const line = lines[lines.length - 1];
    line.push({ x: e.offsetX, y: e.offsetY });
    notify("display-changed");
  }
});

canvas.addEventListener("display-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of lines) {
    ctx.beginPath();
    ctx.moveTo(line[0].x, line[0].y);
    for (const pt of line) {
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
  }
});

function notify(message: string) {
  canvas.dispatchEvent(new Event(message));
}

const clearButton = document.getElementById("clear") as HTMLButtonElement;

clearButton.addEventListener("click", () => {
  lines.splice(0, lines.length);
  redoLines.splice(0, redoLines.length);
  notify("display-changed");
});

const undoButton = document.getElementById("undo") as HTMLButtonElement;

undoButton.addEventListener("click", () => {
  const undoneLine = lines.pop();
  if (undoneLine) {
    redoLines.push(undoneLine);
    notify("display-changed");
  }
});

const redoButton = document.getElementById("redo") as HTMLButtonElement;

redoButton.addEventListener("click", () => {
  const redoneLine = redoLines.pop();
  if (redoneLine) {
    lines.push(redoneLine);
    notify("display-changed");
  }
});
