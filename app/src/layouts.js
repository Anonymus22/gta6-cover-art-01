// Panel layouts in the multi-panel cover tradition. Each layout is a list of panels, and each
// panel is a polygon of [x, y] points in unit space (0..1 across the cover). Rectangles are
// four-point polygons; the diagonal layout slants its divider the way poster covers do.

function rect(x, y, w, h) {
  return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
}

export const LAYOUTS = {
  classic: {
    label: 'Cover Classic',
    panels: [
      rect(0, 0, 1, 0.62),
      rect(0, 0.62, 1 / 3, 0.38),
      rect(1 / 3, 0.62, 1 / 3, 0.38),
      rect(2 / 3, 0.62, 1 / 3, 0.38),
    ],
  },
  hero: {
    label: 'Hero & Strips',
    panels: [
      rect(0, 0, 0.64, 1),
      rect(0.64, 0, 0.36, 0.5),
      rect(0.64, 0.5, 0.36, 0.5),
    ],
  },
  quad: {
    label: 'Four-Up Grid',
    panels: [
      rect(0, 0, 0.5, 0.5),
      rect(0.5, 0, 0.5, 0.5),
      rect(0, 0.5, 0.5, 0.5),
      rect(0.5, 0.5, 0.5, 0.5),
    ],
  },
  triptych: {
    label: 'Triptych',
    panels: [
      rect(0, 0, 1 / 3, 1),
      rect(1 / 3, 0, 1 / 3, 1),
      rect(2 / 3, 0, 1 / 3, 1),
    ],
  },
  diagonal: {
    label: 'Diagonal Split',
    panels: [
      [[0, 0], [0.8, 0], [0.36, 1], [0, 1]],
      [[0.8, 0], [1, 0], [1, 1], [0.36, 1]],
    ],
  },
  single: {
    label: 'Full Bleed',
    panels: [rect(0, 0, 1, 1)],
  },
};

/** The bounding box of a panel polygon, in unit space. */
export function panelBounds(panel) {
  let minX = 1;
  let minY = 1;
  let maxX = 0;
  let maxY = 0;
  for (const [x, y] of panel) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/** Ray-casting point-in-polygon test, in unit space. */
export function pointInPanel(panel, u, v) {
  let inside = false;
  for (let i = 0, j = panel.length - 1; i < panel.length; j = i++) {
    const [xi, yi] = panel[i];
    const [xj, yj] = panel[j];
    if ((yi > v) !== (yj > v) && u < ((xj - xi) * (v - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** The index of the panel under a unit-space point, or -1 when the point is on a gutter. */
export function panelIndexAt(layout, u, v) {
  for (let i = 0; i < layout.panels.length; i++) {
    if (pointInPanel(layout.panels[i], u, v)) return i;
  }
  return -1;
}
