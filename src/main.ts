import "./style.css";

document.body.innerHTML = `
  <h1>DRAW!</h1>
  <canvas id="canvas" width="256" height="256"></canvas>
  <button id="clear">Clear</button>
`;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

interface Point {
  x: number;
  y: number;
}

const lines: Point[][] = [];

canvas.addEventListener("mousedown", (e) => {
  const line: Point[] = [];
  line.push({ x: e.offsetX, y: e.offsetY });
  lines.push(line);
});

canvas.addEventListener("mousemove", (e) => {
  if (e.buttons & 1) {
    const line = lines[lines.length - 1];
    line.push({ x: e.offsetX, y: e.offsetY });
    canvas.dispatchEvent(new Event("display-changed"));
  }
});

canvas.addEventListener("display-changed", () => {
  for (const line of lines) {
    ctx.beginPath();
    ctx.moveTo(line[0].x, line[0].y);
    for (const pt of line) {
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
  }
});

const clearButton = document.getElementById("clear") as HTMLButtonElement;

clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lines.splice(0, lines.length);
});
