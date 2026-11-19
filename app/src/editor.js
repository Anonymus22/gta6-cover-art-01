// Vice Panels editor: wires the page to the cover renderer. A photo library (the two kit
// samples, plus any photo the visitor adds — read on their own machine, never uploaded),
// panel layouts, colour grades, caption lettering, and a one-click PNG export at post sizes.
// A ?shot= query applies a fixed scene from ./shots.js for the maker's screenshots instead.

import { LAYOUTS, panelBounds, panelIndexAt } from './layouts.js';
import { GRADES } from './grades.js';
import { drawCoverArt, photoPlacement, renderExportCanvas, resolveState } from './render.js';
import { sceneFromQuery } from './shots.js';

export const SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

const SAMPLES = [
  { name: 'boulevard', url: 'samples/boulevard.jpg' },
  { name: 'pier', url: 'samples/pier.jpg' },
];

export const state = {
  photos: [],
  selectedPhoto: 0,
  layoutId: 'hero',
  gradeId: 'vice-sunset',
  panels: [
    { photo: 0, zoom: 1.02, ox: 0, oy: -0.05 },
    { photo: 1, zoom: 1.2, ox: 0, oy: 0 },
    { photo: 0, zoom: 2.0, ox: 0, oy: 0.85 },
  ],
  selectedPanel: 0,
  title: 'PALM CITY\nHEAT',
  subtitle: 'every saint has a past',
  lettering: 'sunset',
  titlePos: 'bottom',
  titleScale: 1,
  size: '1080x1350',
};

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const ctx = canvas.getContext('2d');
const status = $('status');
let shotMode = null;

/** Loads an image from a URL or object URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function currentLayout() {
  return LAYOUTS[state.layoutId];
}

function selectedSlot() {
  return state.panels[state.selectedPanel];
}

/** Paints the preview: the cover itself, plus (in the editor) the selected panel's outline. */
export function redraw() {
  const [w, h] = SIZES[state.size];
  canvas.width = w;
  canvas.height = h;
  if (shotMode === 'cover') {
    ctx.drawImage(renderExportCanvas(state, w, h), 0, 0);
    return;
  }
  drawCoverArt(ctx, w, h, resolveState(state));
  const panel = currentLayout().panels[state.selectedPanel];
  if (panel) {
    ctx.save();
    ctx.beginPath();
    panel.forEach(([u, v], i) => {
      if (i === 0) ctx.moveTo(u * w, v * h);
      else ctx.lineTo(u * w, v * h);
    });
    ctx.closePath();
    ctx.strokeStyle = '#ff2e88';
    ctx.lineWidth = Math.max(3, w * 0.004);
    ctx.setLineDash([w * 0.02, w * 0.014]);
    ctx.stroke();
    ctx.restore();
  }
}

/* ---------- control builders ---------- */

function buildChips(container, entries, current, onPick) {
  container.innerHTML = '';
  for (const [id, def] of entries) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip' + (def.swatch ? ' swatch' : '') + (id === current ? ' selected' : '');
    button.textContent = def.label;
    if (def.swatch) button.style.background = def.swatch;
    button.addEventListener('click', () => onPick(id));
    container.appendChild(button);
  }
}

function buildLayoutChips() {
  buildChips($('layouts'), Object.entries(LAYOUTS), state.layoutId, (id) => setLayout(id));
}

function buildGradeChips() {
  buildChips($('grades'), Object.entries(GRADES), state.gradeId, (id) => {
    state.gradeId = id;
    buildGradeChips();
    redraw();
  });
}

function renderThumbs() {
  const thumbs = $('thumbs');
  thumbs.innerHTML = '';
  state.photos.forEach((photo, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thumb' + (i === state.selectedPhoto ? ' selected' : '');
    button.title = photo.name;
    const img = document.createElement('img');
    img.src = photo.url;
    img.alt = photo.name;
    button.appendChild(img);
    button.addEventListener('click', () => assignPhoto(i));
    thumbs.appendChild(button);
  });
}

/* ---------- state changes ---------- */

function assignPhoto(i) {
  state.selectedPhoto = i;
  const slot = selectedSlot();
  if (slot) slot.photo = i;
  renderThumbs();
  syncPanelInfo();
  redraw();
}

function setLayout(id) {
  state.layoutId = id;
  const count = currentLayout().panels.length;
  while (state.panels.length < count) {
    state.panels.push({ photo: state.selectedPhoto ?? 0, zoom: 1, ox: 0, oy: 0 });
  }
  state.panels.length = count;
  if (state.selectedPanel >= count) state.selectedPanel = 0;
  buildLayoutChips();
  syncPanelInfo();
  redraw();
}

function syncPanelInfo() {
  const slot = selectedSlot();
  const zoom = $('zoom');
  if (!slot) {
    $('panel-info').textContent = 'No panel selected';
    return;
  }
  const photo = slot.photo == null ? null : state.photos[slot.photo];
  $('panel-info').textContent =
    `Panel ${state.selectedPanel + 1} of ${state.panels.length} — ${photo ? photo.name : 'empty'}`;
  zoom.value = String(slot.zoom ?? 1);
}

function syncControls() {
  $('title').value = state.title;
  $('subtitle').value = state.subtitle;
  $('lettering').value = state.lettering;
  $('title-pos').value = state.titlePos;
  $('title-scale').value = String(state.titleScale);
  $('size').value = state.size;
  buildLayoutChips();
  buildGradeChips();
  renderThumbs();
  syncPanelInfo();
}

/* ---------- photo intake ---------- */

async function addPhotoFile(file) {
  const url = URL.createObjectURL(file);
  const img = await loadImage(url);
  state.photos.push({ name: file.name.replace(/\.[^.]+$/, ''), img, url });
  assignPhoto(state.photos.length - 1);
  status.textContent = `Added ${file.name} — it never left your machine.`;
}

function wirePhotoIntake() {
  $('file').addEventListener('change', async (event) => {
    for (const file of event.target.files) await addPhotoFile(file);
    event.target.value = '';
  });
  document.addEventListener('dragover', (event) => event.preventDefault());
  document.addEventListener('drop', async (event) => {
    event.preventDefault();
    for (const file of event.dataTransfer.files) {
      if (file.type.startsWith('image/')) await addPhotoFile(file);
    }
  });
}

/* ---------- canvas gestures: select, pan, zoom ---------- */

function wireCanvasGestures() {
  let drag = null;
  const toUnit = (event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      u: (event.clientX - rect.left) / rect.width,
      v: (event.clientY - rect.top) / rect.height,
      scale: canvas.width / rect.width,
    };
  };
  canvas.addEventListener('pointerdown', (event) => {
    const { u, v } = toUnit(event);
    const index = panelIndexAt(currentLayout(), u, v);
    if (index === -1) return;
    state.selectedPanel = index;
    const slot = selectedSlot();
    drag = { x: event.clientX, y: event.clientY, ox: slot.ox ?? 0, oy: slot.oy ?? 0 };
    canvas.setPointerCapture(event.pointerId);
    syncPanelInfo();
    redraw();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const slot = selectedSlot();
    const photo = slot.photo == null ? null : state.photos[slot.photo];
    if (!photo) return;
    const { scale } = toUnit(event);
    const bounds = panelBounds(currentLayout().panels[state.selectedPanel]);
    const bw = bounds.w * canvas.width;
    const bh = bounds.h * canvas.height;
    const placed = photoPlacement(photo.img, bw, bh, slot);
    const overflowX = Math.max(0, placed.dw - bw) / 2;
    const overflowY = Math.max(0, placed.dh - bh) / 2;
    if (overflowX > 0.5) {
      slot.ox = Math.min(1, Math.max(-1, drag.ox + ((event.clientX - drag.x) * scale) / overflowX));
    }
    if (overflowY > 0.5) {
      slot.oy = Math.min(1, Math.max(-1, drag.oy + ((event.clientY - drag.y) * scale) / overflowY));
    }
    redraw();
  });
  const endDrag = () => {
    drag = null;
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      const { u, v } = toUnit(event);
      const index = panelIndexAt(currentLayout(), u, v);
      if (index !== -1) state.selectedPanel = index;
      const slot = selectedSlot();
      if (!slot) return;
      slot.zoom = Math.min(3.5, Math.max(1, (slot.zoom ?? 1) * (event.deltaY < 0 ? 1.09 : 0.92)));
      syncPanelInfo();
      redraw();
    },
    { passive: false },
  );
}

/* ---------- remaining controls ---------- */

function wireControls() {
  $('zoom').addEventListener('input', (event) => {
    const slot = selectedSlot();
    if (!slot) return;
    slot.zoom = Number(event.target.value);
    redraw();
  });
  $('fill-all').addEventListener('click', () => {
    for (const slot of state.panels) slot.photo = state.selectedPhoto;
    syncPanelInfo();
    redraw();
  });
  $('clear-panel').addEventListener('click', () => {
    const slot = selectedSlot();
    if (!slot) return;
    slot.photo = null;
    syncPanelInfo();
    redraw();
  });
  $('title').addEventListener('input', (event) => {
    state.title = event.target.value;
    redraw();
  });
  $('subtitle').addEventListener('input', (event) => {
    state.subtitle = event.target.value;
    redraw();
  });
  $('lettering').addEventListener('change', (event) => {
    state.lettering = event.target.value;
    redraw();
  });
  $('title-pos').addEventListener('change', (event) => {
    state.titlePos = event.target.value;
    redraw();
  });
  $('title-scale').addEventListener('input', (event) => {
    state.titleScale = Number(event.target.value);
    redraw();
  });
  $('size').addEventListener('change', (event) => {
    state.size = event.target.value;
    redraw();
  });
  $('export').addEventListener('click', () => {
    const [w, h] = SIZES[state.size];
    renderExportCanvas(state, w, h).toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `vice-panels-${state.size}.png`;
      a.click();
      status.textContent = `Saved vice-panels-${state.size}.png (${w} × ${h})`;
    }, 'image/png');
  });
}

/* ---------- scenes and start ---------- */

/** Applies a shots.js scene: photo names resolve to the loaded samples. */
function applyScene(sceneState) {
  const byName = new Map(state.photos.map((photo, i) => [photo.name, i]));
  Object.assign(state, {
    ...sceneState,
    panels: sceneState.panels.map((slot) => ({
      zoom: 1,
      ox: 0,
      oy: 0,
      ...slot,
      photo: slot.photo == null ? null : (byName.get(slot.photo) ?? 0),
    })),
  });
  state.selectedPanel = 0;
  state.selectedPhoto = state.panels[0]?.photo ?? 0;
}

async function start() {
  for (const sample of SAMPLES) {
    const img = await loadImage(sample.url);
    state.photos.push({ name: sample.name, img, url: sample.url });
  }
  const query = new URLSearchParams(location.search);
  const scene = sceneFromQuery(query);
  wirePhotoIntake();
  wireCanvasGestures();
  wireControls();
  if (scene) {
    shotMode = scene.mode;
    if (scene.mode === 'cover') document.body.classList.add('shot-cover');
    applyScene(scene.state);
  }
  syncControls();
  redraw();
  if (scene) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.__shotReady = true;
    }));
  }
}

start();
