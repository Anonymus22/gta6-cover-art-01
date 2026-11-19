// The caption lettering: stacked, heavy, outlined capitals drawn on the canvas itself, so the
// exported PNG carries the same words the preview shows. Four styles, all drawn with system
// font stacks and canvas paint only — no font file is shipped or copied from anywhere.

const FONT_STACK = '"Arial Black", "Liberation Sans", "Segoe UI", system-ui, sans-serif';

export const LETTERING_STYLES = {
  block: { label: 'Block' },
  sunset: { label: 'Sunset' },
  neon: { label: 'Neon Glow' },
  chrome: { label: 'Chrome' },
};

function fontFor(size) {
  return `900 ${size}px ${FONT_STACK}`;
}

/** The fill paint for a style: a colour, or a vertical gradient built for one line's box. */
function fillPaint(ctx, style, x, y, size) {
  if (style === 'sunset' || style === 'chrome') {
    const stops = style === 'sunset'
      ? ['#ffe259', '#ffa751', '#ff5e8a']
      : ['#f8fafc', '#cbd5e1', '#f1f5f9', '#64748b'];
    const gradient = ctx.createLinearGradient(0, y - size, 0, y + size * 0.15);
    stops.forEach((colour, i) => gradient.addColorStop(i / (stops.length - 1), colour));
    return gradient;
  }
  return style === 'neon' ? '#eafcff' : '#ffffff';
}

function strokeColour(style) {
  if (style === 'sunset') return '#2b0630';
  if (style === 'neon') return '#083344';
  if (style === 'chrome') return '#0f172a';
  return '#0c0c12';
}

/** Draws one title line: a thick outline pass, then the fill (with the style's shadow/glow). */
function drawTitleLine(ctx, text, cx, baseline, size, style) {
  ctx.font = fontFor(size);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = strokeColour(style);
  ctx.lineWidth = size * 0.16;
  ctx.strokeText(text, cx, baseline);
  if (style === 'neon') {
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = size * 0.42;
    ctx.fillStyle = fillPaint(ctx, style, cx, baseline, size);
    ctx.fillText(text, cx, baseline);
    ctx.shadowColor = '#f471b5';
    ctx.shadowBlur = size * 0.3;
    ctx.fillText(text, cx, baseline);
  } else if (style === 'block') {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowOffsetX = size * 0.035;
    ctx.shadowOffsetY = size * 0.06;
    ctx.fillStyle = fillPaint(ctx, style, cx, baseline, size);
    ctx.fillText(text, cx, baseline);
  } else {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = size * 0.12;
    ctx.shadowOffsetY = size * 0.03;
    ctx.fillStyle = fillPaint(ctx, style, cx, baseline, size);
    ctx.fillText(text, cx, baseline);
  }
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

/** Draws the subtitle: letter-spaced capitals on a soft dark pill of shade. */
function drawSubtitle(ctx, text, cx, baseline, size) {
  ctx.font = `700 ${size}px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  try {
    ctx.letterSpacing = `${Math.round(size * 0.34)}px`;
  } catch {
    // Older engines have no letterSpacing; the subtitle still reads fine without it.
  }
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = size * 0.35;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text.toUpperCase(), cx, baseline);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  try {
    ctx.letterSpacing = '0px';
  } catch {
    // Nothing to reset where the property does not exist.
  }
}

/**
 * Draws the whole caption block (title lines, then the subtitle) at the top or bottom of a
 * w x h cover. The title shrinks until its widest line fits 92% of the cover's width.
 */
export function drawLettering(ctx, w, h, state) {
  const lines = String(state.title ?? '')
    .split('\n')
    .map((line) => line.trim().toUpperCase())
    .filter(Boolean);
  const subtitle = String(state.subtitle ?? '').trim();
  if (!lines.length && !subtitle) return;
  let size = h * 0.118 * (state.titleScale ?? 1);
  if (lines.length) {
    ctx.font = fontFor(size);
    let widest = 0;
    for (const line of lines) widest = Math.max(widest, ctx.measureText(line).width);
    while (widest > w * 0.92 && size > 10) {
      size *= 0.96;
      ctx.font = fontFor(size);
      widest = 0;
      for (const line of lines) widest = Math.max(widest, ctx.measureText(line).width);
    }
  }
  const lineHeight = size * 1.04;
  const subtitleSize = Math.max(11, size * 0.3);
  const atTop = state.titlePos === 'top';
  // Baselines are worked out from the block's own end, so the last line (or the subtitle
  // under it) always keeps its margin from the cover's edge.
  const baselines = [];
  let subtitleBaseline = null;
  if (atTop) {
    let baseline = h * 0.05 + size * 0.86;
    for (let i = 0; i < lines.length; i++) {
      baselines.push(baseline);
      baseline += lineHeight;
    }
    if (subtitle) subtitleBaseline = baseline - lineHeight + size * 0.55 + subtitleSize * 0.9;
  } else {
    const lastBaseline = subtitle ? h - h * 0.045 - subtitleSize * 1.9 : h - h * 0.05;
    for (let i = 0; i < lines.length; i++) {
      baselines.push(lastBaseline - (lines.length - 1 - i) * lineHeight);
    }
    if (subtitle) subtitleBaseline = h - h * 0.045 - subtitleSize * 0.3;
  }
  lines.forEach((line, i) => {
    drawTitleLine(ctx, line, w / 2, baselines[i], size, state.lettering ?? 'block');
  });
  if (subtitle) drawSubtitle(ctx, subtitle, w / 2, subtitleBaseline, subtitleSize);
}
