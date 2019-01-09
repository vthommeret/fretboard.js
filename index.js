var FRET_WIDTH = 40;
var STRING_HEIGHT = 30;
var NOTE_RADIUS = 10;

var PADDING = 20;
var BORDER_RADIUS = 3;

var SCALE = 2;
var ARROW_WIDTH = 4;
var ARROW_LEN = 7;
var LINE_CAP = 'round';

var COLOR_BASE = '#DADADA';

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
var OCTAVE = INTERVALS['8'];

var DATA_KEY = 'im.pattern';

function initPatterns() {
  var lastPattern;

  // Create Pattern objects
  var patterns = document.querySelectorAll('.pattern');
  for (var i = 0; i < patterns.length; i++) {
    var el = patterns[i];
    if (!el.dataset[DATA_KEY]) {
      var pattern = new Pattern(el);
      el[DATA_KEY] = pattern;
    }
  }

  // Mousemove handler
  window.addEventListener('mousemove', function (e) {
    var pattern = delegateEvent(e);

    // Clear any persistent state if window loses focuses.
    if (e.target !== lastPattern) {
      if (typeof lastPattern !== 'undefined') {
        lastPattern.dispatchEvent(e);
        delete lastPattern;
      }
      if (pattern) {
        lastPattern = pattern;
      }
    }
  });

  // Mousedown handler
  window.addEventListener('mousedown', delegateEvent);

  // Mouseup handler
  window.addEventListener('mouseup', delegateEvent);

  // Delegates window event to individual pattern event
  function delegateEvent(e) {
    var target = e.target.parentElement;
    if (target.hasOwnProperty(DATA_KEY)) {
      var pattern = target[DATA_KEY];
      pattern.dispatchEvent(e);
      return pattern;
    }
    return false;
  }
}

class Pattern {
  constructor(el) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    this._canvas = canvas;
    this._ctx = ctx;

    // Initialize notes
    var notes = [];
    if (el.dataset.notes) {
      notes = normalizeNotes(parseNotes(el.dataset.notes));
    }
    this._notes = notes;

    // Get extents
    var extents = noteExtents(notes);
    var frets = extents.frets.max;
    var strings = extents.strings.max;
    this._frets = frets;
    this._strings = strings;

    // Initialize dimensions
    var width = FRET_WIDTH * frets;
    var height = STRING_HEIGHT * (strings - 1);
    var canvasWidth = width + PADDING * 2;
    var canvasHeight = height + PADDING * 2;
    this._width = width;
    this._height = height;

    // Retina-friendly dimensions
    canvas.width = canvasWidth * SCALE;
    canvas.height = canvasHeight * SCALE;
    canvas.style.width = el.style.width = canvasWidth;
    canvas.style.height = canvas.style.height = canvasHeight;
    ctx.scale(SCALE, SCALE);

    // Padding
    ctx.translate(PADDING, PADDING);

    // Draw initial frame
    this.draw();

    // Add canvas to pattern
    el.appendChild(canvas);
  }

  // Draw pattern
  draw() {
    var ctx = this._ctx;
    var width = this._width;
    var height = this._height;
    var notes = this._notes;
    var frets = this._frets;
    var strings = this._strings;

    // Clear canvas
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Identity matrix
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();

    // Draw fretboard
    ctx.strokeStyle = COLOR_BASE;
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
  }

  // Dispatch event to specific handlers.
  dispatchEvent(e) {
    switch (e.type) {
      case 'mousemove':
        this.mousemove(e);
        break;
      case 'mousedown':
        this.mousedown(e);
        break;
      case 'mouseup':
        this.mouseup(e);
        break;
    }
  }

  // Highlight notes
  mousemove(e) {
    var pos = getPos(this._canvas, e);
    var highlight;
    for (var i = 0; i < this._notes.length; i++) {
      var note = this._notes[i];
      note.highlight = (noteDistance(pos, note) <= NOTE_RADIUS);
      if (note.highlight) {
        highlight = true;
        break;
      }
    }
    this._canvas.style.cursor = highlight ? 'pointer' : 'default';
    this.draw();
  }

  // Change notes to active state
  mousedown(e) {
    var canvas = this._canvas;
    var notes = this._notes;
    var pos = getPos(canvas, e);
    for (var i = 0; i < notes.length; i++) {
      var note = notes[i];
      note.active = (noteDistance(pos, note) <= NOTE_RADIUS);
    }
    this.draw();
  }

  // Change notes to default state
  mouseup(e) {
    var notes = this._notes;
    for (var i = 0; i < notes.length; i++) {
      var note = notes[i];
      note.active = false;
    }
    this.draw();
  }
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

    var root = ((string - 1) * INTERVALS[STRING_INTERVAL]) % OCTAVE;
    var target = INTERVALS[note];
    var interval = target - root;

    // Invert interval if necessary, for minimal distance.
    if (interval > OCTAVE / 2) {
      var sign = interval > 0 ? -1 : 1;
      interval += sign * OCTAVE;
    }

    fret = interval;

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
