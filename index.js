var FRET_WIDTH = 40;
var STRING_HEIGHT = 30;
var NOTE_RADIUS = 10;

var PADDING = 20;
var BORDER_RADIUS = 3;

var SCALE = 2;
var ARROW_WIDTH = 4;
var ARROW_LEN = 7;
var LINE_CAP = 'round';

var COLOR_ROOT = '#000'
var COLOR_MAJOR_SECOND = '#FAC23D'
var COLOR_MINOR_THIRD = '#4A90E2'
var COLOR_MINOR_THIRD_ACTIVE = '#1D5EAA'

var NOTE_COLOR = '#fff';
var NOTE_FONT = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

var COLOR_MAP = {
  'R': COLOR_ROOT,
  'M2': COLOR_MAJOR_SECOND,
  'm3': COLOR_MINOR_THIRD,
};

var MIN_FRET = 1;
var MIN_STRING = 2;
var STRING_INTERVAL = 4; // Guitar string interval

var INTERVALS = {
   '1': 0,
  '#1': 1,
  'b2': 1,
   '2': 2,
  '#2': 3,
  'b3': 3,
   '3': 4,
   '4': 5,
  '#4': 6,
  'b5': 6,
   '5': 7,
  '#5': 8,
  'b6': 8,
   '6': 9,
  '#6': 10,
  'b7': 10,
   '7': 11,
   '8': 12,
};

function draw() {
  var patterns = document.querySelectorAll('.pattern');
  for (var i = 0; i < patterns.length; i++) {
    drawPattern(patterns[i]);
  }
}

function drawPattern(pattern) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');

  // Initialize notes
  var notes = [];
  if (pattern.dataset.notes) {
    notes = normalizeNotes(parseNotes(pattern.dataset.notes));
  }

  // Get extents
  var extents = noteExtents(notes);
  frets = extents.frets.max;
  strings = extents.strings.max;

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

  // Draw initial frame
  drawPatternFrame(ctx,
    patternWidth, patternHeight,
    frets, strings, notes,
  );

  // Mousemove handler
  (function (width, height, frets, strings, notes) {
    canvas.addEventListener('mousemove', function (e) {
      var pos = getPos(this, e);
      var highlight;
      for (var i = 0; i < notes.length; i++) {
        var note = notes[i];
        note.highlight = (noteDistance(pos, note) <= NOTE_RADIUS);
        if (note.highlight) {
          highlight = true;
          break;
        }
      }
      this.style.cursor = highlight ? 'pointer' : 'default';
      drawPatternFrame(ctx, width, height, frets, strings, notes);
    });
  })(patternWidth, patternHeight, frets, strings, notes);

  // Mousedown handler
  (function (width, height, frets, strings, notes) {
    canvas.addEventListener('mousedown', function (e) {
      var pos = getPos(this, e);
      for (var i = 0; i < notes.length; i++) {
        var note = notes[i];
        note.active = (noteDistance(pos, note) <= NOTE_RADIUS);
      }
      drawPatternFrame(ctx, width, height, frets, strings, notes);
    });
  })(patternWidth, patternHeight, frets, strings, notes);

  // Mouseup handler
  (function (width, height, frets, strings, notes) {
    canvas.addEventListener('mouseup', function (e) {
      for (var i = 0; i < notes.length; i++) {
        var note = notes[i];
        note.active = false;
      }
      drawPatternFrame(ctx, width, height, frets, strings, notes);
    });
  })(patternWidth, patternHeight, frets, strings, notes);

  // Add canvas to pattern
  pattern.appendChild(canvas);
}

function getPos(canvas, e) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left - PADDING,
    y: e.clientY - rect.top - PADDING,
  };
}

function noteDistance(pos, note) {
  return Math.sqrt(
    Math.pow(pos.x - note.x, 2) +
    Math.pow(pos.y - note.y, 2)
  );
}

function drawPatternFrame(ctx, width, height, frets, strings, notes, second) {
  // Clear canvas
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Identity matrix
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();

  // Draw fretboard
  ctx.strokeStyle = '#dadada';
  roundRect(ctx, 0, 0, width, height, BORDER_RADIUS);
  ctx.stroke();

  // Draw frets
  ctx.beginPath();
  for (var j = 0; j < frets - 1; j++) {
    var x = FRET_WIDTH * (j + 1);
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  ctx.closePath();
  ctx.stroke();

  // Draw strings
  ctx.beginPath();
  for (var j = 0; j < strings - 2; j++) {
    var y = STRING_HEIGHT * (j + 1);
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.closePath();
  ctx.stroke();

  // Draw notes
  for (var j = 0; j < notes.length; j++) {
    var note = notes[j];
    var x = note.fret * FRET_WIDTH - FRET_WIDTH / 2;
    var y = (strings - note.string) * STRING_HEIGHT;
    var color;
    if (note.active) {
      color = COLOR_MINOR_THIRD_ACTIVE;
    } else if (note.highlight) {
      color = COLOR_MINOR_THIRD;
    } else {
      color = note.color;
    }
    note.x = x;
    note.y = y;
    drawNote(ctx, x, y, color, note.label);
  }

  // Draw arrows
  /*
  ctx.lineWidth = 2;
  ctx.lineCap = LINE_CAP;
  arrow(ctx, 0, 0, 200, 80, COLOR_MINOR_THIRD);
  arrow(ctx, 0, 120, 100, 90, COLOR_MAJOR_SECOND);
  arrow(ctx, 300, 0, 300, 100, COLOR_MINOR_THIRD);
  */
}

// Return note objects given declarative notes definition
function parseNotes(notesData) {
  notesData = notesData.split(',');
  var notes = [];
  var string = 1;
  for (var i = 0; i < notesData.length; i++) {
    var note = notesData[i];
    var fret;
    if (note[note.length-1] === '^') {
      note = note.substring(0, note.length-1);
      string++;
    }
    note = note.trim();
    fret = INTERVALS[note] - (string - 1) * INTERVALS[STRING_INTERVAL] + 1;
    notes.push({
      color: COLOR_ROOT,
      fret: fret,
      string: string,
      label: styleNote(note),
    });
  }
  return notes;
}

// Start frets at 1.
function normalizeNotes(notes) {
  var dims = noteExtents(notes);
  var offset = MIN_FRET - dims.frets.min;
  for (var i = 0; i < notes.length; i++) {
    notes[i].fret += offset;
  }
  return notes;
}

// Return min and max of frets and strings.
function noteExtents(notes) {
  var dims = {
    frets: {min: MIN_FRET, max: MIN_FRET},
    strings: {min: MIN_STRING, max: MIN_STRING},
  };
  for (var i = 0; i < notes.length; i++) {
    var note = notes[i];
    if (note.fret < dims.frets.min) {
      dims.frets.min = note.fret;
    } else if (note.fret > dims.frets.max) {
      dims.frets.max = note.fret;
    }
    if (note.string < dims.strings.min) {
      dims.strings.min = note.string;
    } else if (note.string > dims.strings.max) {
      dims.strings.max = note.string;
    }
  }
  return dims;
}

function styleNote(note) {
  note = note
    .replace('b', '♭')
    .replace('#', '♯')
    .replace('1', 'R');
  return note;
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
