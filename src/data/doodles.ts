// Line-drawn marks shared outside the home page. One 2px line, rounded ends, no fill (styles set by each user).
// Same paths as the home page's `doodle` object in src/pages/index.astro (the home page moves to this file later).

// Compass (120 x 130 box, centre 60,70): ring, cardinal ticks, a small N; the dotted inner ring and the needle are
// separate so the dots can be styled and the needle can turn. The needle is a diamond, like the logo mark.
export const compass = {
  ring: 'M10 70a50 50 0 1 0 100 0a50 50 0 1 0-100 0M60 20V32M60 108V120M10 70H22M98 70H110M32.5 42.5L36 46M87.5 42.5L84 46M32.5 97.5L36 94M87.5 97.5L84 94M55 15V4L65 15V4',
  dots: 'M16 70a44 44 0 1 0 88 0a44 44 0 1 0-88 0',
  needle: 'M60 34L69 70L60 106L51 70ZM60 34V106M56.5 70a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0',
};
