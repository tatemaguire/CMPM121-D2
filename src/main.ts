import "./style.css";

document.body.innerHTML = `
  <h1>DRAW!</h1>
  <canvas id="canvas" width="256" height="256"></canvas>
`;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.addEventListener("mousedown", (e) => {
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
  console.log(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", (e) => {
  if (e.buttons & 1) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  }
});
