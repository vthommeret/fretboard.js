var WIDTH = 400;
var HEIGHT = 200;

var SCALE = 2;
var ARROW_LEN = 10;

function draw() {
  var canvas = document.getElementById('scale');
  var ctx = canvas.getContext('2d');
	var width = canvas.width;
	var height = canvas.height;

  // Retina-friendly dimensions
  canvas.width = width * SCALE;
  canvas.height = height * SCALE;
  canvas.style.width = width;
  canvas.style.height = height;
  ctx.scale(SCALE, SCALE);

	// Canvas config
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#4A78E2';

  arrow(ctx, 20, 20, 200, 80);
}

function arrow(ctx, x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  var rot = -Math.atan2(dx, dy);
  var len = Math.sqrt(dx * dx + dy * dy);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
