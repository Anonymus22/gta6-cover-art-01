// Colour grades. Each grade is a canvas filter applied to every photo as it is drawn, plus a
// full-cover wash (a vertical gradient painted over the panels) and a vignette strength, in
// the sunset / neon tradition of poster covers. `swatch` is the CSS gradient the editor shows
// on the grade's button; it is only a hint of the look, the canvas does the real work.

export const GRADES = {
  'vice-sunset': {
    label: 'Vice Sunset',
    filter: 'saturate(1.4) contrast(1.1) brightness(1.03) sepia(0.12)',
    wash: [
      [0, 'rgba(30, 0, 64, 0.22)'],
      [0.35, 'rgba(255, 80, 60, 0.05)'],
      [0.75, 'rgba(255, 64, 120, 0.16)'],
      [1, 'rgba(255, 94, 58, 0.34)'],
    ],
    vignette: 0.32,
    swatch: 'linear-gradient(160deg, #2a0a4a, #ff5e3a 70%, #ffb347)',
  },
  'neon-nights': {
    label: 'Neon Nights',
    filter: 'saturate(1.55) contrast(1.18) brightness(0.97) hue-rotate(-10deg)',
    wash: [
      [0, 'rgba(8, 0, 40, 0.28)'],
      [0.5, 'rgba(190, 24, 255, 0.10)'],
      [1, 'rgba(0, 229, 255, 0.20)'],
    ],
    vignette: 0.4,
    swatch: 'linear-gradient(160deg, #12002e, #be18ff 60%, #00e5ff)',
  },
  'golden-hour': {
    label: 'Golden Hour',
    filter: 'sepia(0.32) saturate(1.35) contrast(1.06) brightness(1.06)',
    wash: [
      [0, 'rgba(64, 32, 0, 0.10)'],
      [1, 'rgba(255, 150, 40, 0.30)'],
    ],
    vignette: 0.26,
    swatch: 'linear-gradient(160deg, #7a4a12, #ffb347 70%, #ffe259)',
  },
  noir: {
    label: 'Noir',
    filter: 'grayscale(1) contrast(1.3) brightness(1.03)',
    wash: [
      [0, 'rgba(0, 0, 0, 0.12)'],
      [1, 'rgba(0, 0, 0, 0.38)'],
    ],
    vignette: 0.5,
    swatch: 'linear-gradient(160deg, #3a3a42, #0a0a0e)',
  },
  clean: {
    label: 'Clean',
    filter: 'saturate(1.06) contrast(1.03)',
    wash: [
      [0, 'rgba(0, 0, 0, 0)'],
      [1, 'rgba(0, 0, 0, 0.10)'],
    ],
    vignette: 0.18,
    swatch: 'linear-gradient(160deg, #5b7a99, #cfd8e3)',
  },
};
