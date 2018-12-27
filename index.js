var WIDTH = 400;
var HEIGHT = 200;

var PADDING = 20;

var SCALE = 2;
var ARROW_WIDTH = 4;
var ARROW_LEN = 7;
var LINE_CAP = 'round';

var COLOR_MAJOR_SECOND = '#FED031'
var COLOR_MINOR_THIRD = '#157EFB'

function draw() {
  var fretboard = document.getElementById('fretboard');
  var canvas = fretboard.querySelector('canvas');
  var ctx = canvas.getContext('2d');
  var width = parseInt(fretboard.style.width);
  var height = parseInt(fretboard.style.height);

  // Retina-friendly dimensions
  canvas.width = width * SCALE;
  canvas.height = height * SCALE;
  canvas.style.width = width;
  canvas.style.height = height;
  ctx.scale(SCALE, SCALE);

  // Padding
  ctx.translate(PADDING, PADDING);

  // Canvas config
  ctx.lineWidth = 2;
  ctx.lineCap = LINE_CAP;

  arrow(ctx, 0, 0, 200, 80, COLOR_MINOR_THIRD);
  arrow(ctx, 0, 120, 100, 90, COLOR_MAJOR_SECOND);
  arrow(ctx, 300, 0, 300, 100, COLOR_MINOR_THIRD);
}

function arrow(ctx, x1, y1, x2, y2, color) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  var rot = -Math.atan2(dx, dy);
  var len = Math.sqrt(dx * dx + dy * dy);

  // Save context
  ctx.save();

  // Colors
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  // Line
  ctx.translate(x1, y1);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, len - ARROW_LEN);
  ctx.stroke();

  // Head
  ctx.save();
  ctx.translate(0, len);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-ARROW_WIDTH, -ARROW_LEN);
  ctx.lineTo(ARROW_WIDTH, -ARROW_LEN);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Label
  ctx.save();
  ctx.translate(0, len);
  ctx.rotate(-rot);
  ctx.fillText('Hello!', 2, 3);
  ctx.restore();

  // Restore
  ctx.restore();
}
