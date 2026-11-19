// The cover renderer: one function draws a whole cover — panels, photos, grade, lettering —
// onto any 2D context at any size, so the editor's preview and the exported PNG are the same
// drawing. A render state is the editor state with each panel slot's photo index resolved to
// the loaded image itself (resolveState below).

import { LAYOUTS, panelBounds } from './layouts.js';
import { GRADES } from './grades.js';
import { drawLettering } from './lettering.js';

const BACKDROP = '#06060a';

/** Maps panel slots' photo indexes to images: { ...state, panels: [{ img, zoom, ox, oy }] }. */
export function resolveState(state) {
  return {
    ...state,
    panels: state.panels.map((slot) => ({
      zoom: slot.zoom ?? 1,
      ox: slot.ox ?? 0,
      oy: slot.oy ?? 0,
      img: slot.photo == null ? null : (state.photos[slot.photo]?.img ?? null),
    })),
  };
}

/**
 * Where a photo lands inside a panel box (all in cover pixels): the cover-fit placement,
 * scaled by the slot's zoom and shifted by its offsets. ox/oy run -1..1 across the overflow,
 * so the photo always covers the box. The editor reuses this for its drag maths.
 */
export function photoPlacement(img, boxW, boxH, slot) {
  const scale = Math.max(boxW / img.naturalWidth, boxH / img.naturalHeight) * (slot.zoom ?? 1);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const x = (boxW - dw) / 2 + (slot.ox ?? 0) * Math.max(0, dw - boxW) / 2;
  const y = (boxH - dh) / 2 + (slot.oy ?? 0) * Math.max(0, dh - boxH) / 2;
  return { x, y, dw, dh };
}

function tracePanel(ctx, panel, w, h) {
  ctx.beginPath();
  panel.forEach(([u, v], i) => {
    if (i === 0) ctx.moveTo(u * w, v * h);
    else ctx.lineTo(u * w, v * h);
  });
  ctx.closePath();
}

function drawPanel(ctx, w, h, panel, slot, grade) {
  const bounds = panelBounds(panel);
  const bx = bounds.x * w;
  const by = bounds.y * h;
  const bw = bounds.w * w;
  const bh = bounds.h * h;
  ctx.save();
  tracePanel(ctx, panel, w, h);
  ctx.clip();
  if (slot?.img) {
    const placed = photoPlacement(slot.img, bw, bh, slot);
    ctx.filter = grade.filter;
    ctx.drawImage(slot.img, bx + placed.x, by + placed.y, placed.dw, placed.dh);
    ctx.filter = 'none';
  } else {
    const fill = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
    fill.addColorStop(0, '#1d1d2a');
    fill.addColorStop(1, '#0c0c15');
    ctx.fillStyle = fill;
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.34)';
    ctx.font = `700 ${Math.max(12, h * 0.02)}px "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ADD A PHOTO', bx + bw / 2, by + bh / 2);
  }
  ctx.restore();
  // The gutter: a thick backdrop stroke centred on the panel's edge, then a hairline of light.
  tracePanel(ctx, panel, w, h);
  ctx.strokeStyle = BACKDROP;
  ctx.lineWidth = Math.max(6, w * 0.009);
  ctx.stroke();
  tracePanel(ctx, panel, w, h);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.13)';
  ctx.lineWidth = Math.max(1, w * 0.0016);
  ctx.stroke();
}

function paintGradeWash(ctx, w, h, grade) {
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  for (const [offset, colour] of grade.wash) wash.addColorStop(offset, colour);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
}

function paintTitleShade(ctx, w, h, state) {
  const atTop = state.titlePos === 'top';
  const shade = atTop
    ? ctx.createLinearGradient(0, 0, 0, h * 0.42)
    : ctx.createLinearGradient(0, h, 0, h * 0.58);
  shade.addColorStop(0, 'rgba(0, 0, 0, 0.42)');
  shade.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, w, h);
}

function paintVignette(ctx, w, h, strength) {
  const radius = Math.max(w, h) * 0.78;
  const glow = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, radius);
  glow.addColorStop(0, 'rgba(0, 0, 0, 0)');
  glow.addColorStop(1, `rgba(0, 0, 0, ${strength})`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

/** Draws the whole cover described by a resolved state onto ctx at w x h. */
export function drawCoverArt(ctx, w, h, state) {
  const layout = LAYOUTS[state.layoutId] ?? LAYOUTS.classic;
  const grade = GRADES[state.gradeId] ?? GRADES['vice-sunset'];
  ctx.save();
  ctx.fillStyle = BACKDROP;
  ctx.fillRect(0, 0, w, h);
  layout.panels.forEach((panel, i) => drawPanel(ctx, w, h, panel, state.panels[i], grade));
  paintGradeWash(ctx, w, h, grade);
  paintTitleShade(ctx, w, h, state);
  paintVignette(ctx, w, h, grade.vignette);
  drawLettering(ctx, w, h, state);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = Math.max(2, w * 0.002);
  const inset = ctx.lineWidth;
  ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
  ctx.restore();
}

/** Renders a cover onto a fresh offscreen canvas at an export size and returns the canvas. */
export function renderExportCanvas(state, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  drawCoverArt(canvas.getContext('2d'), w, h, resolveState(state));
  return canvas;
}
