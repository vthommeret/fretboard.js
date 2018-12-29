var FRET_WIDTH = 40;
var STRING_HEIGHT = 30;
var NOTE_RADIUS = 10;

var PADDING = 20;
var RADIUS = 3;

var SCALE = 2;
var ARROW_WIDTH = 4;
var ARROW_LEN = 7;
var LINE_CAP = 'round';

var COLOR_ROOT = '#000'
var COLOR_MAJOR_SECOND = '#FAC23D'
var COLOR_MINOR_THIRD = '#4A90E2'

var NOTE_COLOR = '#fff';
var NOTE_FONT = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

var COLOR_MAP = {
  'R': COLOR_ROOT,
  'M2': COLOR_MAJOR_SECOND,
  'm3': COLOR_MINOR_THIRD,
};

function draw() {
  // Initialize canvas
  var patterns = document.querySelectorAll('.pattern');

  for (var i = 0; i < patterns.length; i++) {
    var pattern = patterns[i];

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    // Get data
    var frets = parseInt(pattern.dataset.frets, 10);
    var strings = parseInt(pattern.dataset.strings, 10);
    var notesData = pattern.dataset.notes.split(';');

    // Initialize notes
    var notes = [];
    for (var j = 0; j < notesData.length; j++) {
      var note = notesData[j];
      var parts = note.split(',');
      notes.push({
        color: COLOR_MAP[parts[0]],
        fret: parts[1],
        string: parts[2],
        label: parts[3],
      });
    }

    // Initialize dimensions
    var patternWidth = FRET_WIDTH * frets;
    var patternHeight = STRING_HEIGHT * (strings - 1);
    var width = patternWidth + PADDING * 2;
    var height = patternHeight + PADDING * 2;

    // Retina-friendly dimensions
    canvas.width = width * SCALE;
    canvas.height = height * SCALE;
    canvas.style.width = pattern.style.width = width;
    canvas.style.height = canvas.style.height = height;
    ctx.scale(SCALE, SCALE);

    // Padding
    ctx.translate(PADDING, PADDING);

    // Draw fretboard
    ctx.strokeStyle = '#dadada';
    roundRect(ctx, 0, 0, patternWidth, patternHeight, RADIUS);
    ctx.stroke();

    // Draw frets
    ctx.beginPath();
    for (var j = 0; j < frets - 1; j++) {
      var x = FRET_WIDTH * (j + 1);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, patternHeight);
    }
    ctx.closePath();
    ctx.stroke();

    // Draw strings
    ctx.beginPath();
    for (var j = 0; j < strings - 2; j++) {
      var y = STRING_HEIGHT * (j + 1);
      ctx.moveTo(0, y);
      ctx.lineTo(patternWidth, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Draw notes
    for (var j = 0; j < notes.length; j++) {
      var note = notes[j];
      drawNote(ctx,
        note.fret * FRET_WIDTH - FRET_WIDTH / 2,
        (strings - note.string) * STRING_HEIGHT,
        note.color,
        note.label
      );
    }

    // Draw arrows
    /*
    ctx.lineWidth = 2;
    ctx.lineCap = LINE_CAP;
    arrow(ctx, 0, 0, 200, 80, COLOR_MINOR_THIRD);
    arrow(ctx, 0, 120, 100, 90, COLOR_MAJOR_SECOND);
    arrow(ctx, 300, 0, 300, 100, COLOR_MINOR_THIRD);
    */

    // Add canvas to pattern
    pattern.appendChild(canvas);
  }
}

// Draw a rounded rectangle
function roundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) {
    r = w / 2;
  }
  if (h < 2 * r) {
    r = h / 2;
  }
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y,   x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x,   y+h, r);
  ctx.arcTo(x,   y+h, x,   y,   r);
  ctx.arcTo(x,   y,   x+w, y,   r);
  ctx.closePath();
}

// Draw a note in a pattern
function drawNote(ctx, x, y, color, note) {
  ctx.save();

  // Draw circle
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, NOTE_RADIUS, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();

  // Draw label
  var offset = NOTE_RADIUS / 2;
  ctx.fillStyle = NOTE_COLOR;
  ctx.font = NOTE_FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(note, x, y + .5);

  ctx.restore();
}

// Draw an arrow
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
