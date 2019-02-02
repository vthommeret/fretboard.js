fretboard.js allows you to quickly generate interactive fretboard diagrams by specifying a specific pattern of notes and string skips. For example the following pattern is a minor pentatonic scale with a root note, flat 3rd on the next string, a perfect 4th, a perfect 5th on the next string, a flat 7th, and an octave on the next string:

```html
<div class="pattern" data-notes="1, b3^, 4,  5^, b7,  8^"></div>
```

Which generates the following diagram:

<img width="222" alt="image" src="https://user-images.githubusercontent.com/42359/52160172-da25b480-2664-11e9-8abc-476685a22ecc.png">

...which can be played by clicking any note.

## Credits

This library uses [Tone.js](https://github.com/Tonejs/Tone.js) and samples from Nicholaus Brosowsky's [tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments) project.
