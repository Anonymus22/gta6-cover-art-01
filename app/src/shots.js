// Fixed scenes for the maker's screenshots, named by ?shot=<mode>&scene=<name>. A scene is a
// whole editor state described with sample photo names; the editor resolves the names to its
// loaded photos, applies the state, and sets window.__shotReady once the cover is painted.
// Modes: "cover" shows only the exported cover at its export size; "editor" shows the app.

export const SCENES = {
  cover1: {
    mode: 'cover',
    state: {
      size: '1080x1350',
      layoutId: 'hero',
      gradeId: 'vice-sunset',
      panels: [
        { photo: 'boulevard', zoom: 1.02, ox: 0, oy: -0.05 },
        { photo: 'pier', zoom: 1.2, ox: 0, oy: 0 },
        { photo: 'boulevard', zoom: 2.0, ox: 0, oy: 0.85 },
      ],
      title: 'PALM CITY\nHEAT',
      subtitle: 'every saint has a past',
      lettering: 'sunset',
      titlePos: 'bottom',
      titleScale: 1,
    },
  },
  cover2: {
    mode: 'cover',
    state: {
      size: '1080x1080',
      layoutId: 'triptych',
      gradeId: 'neon-nights',
      panels: [
        { photo: 'boulevard', zoom: 1.1, ox: -0.15, oy: -0.1 },
        { photo: 'pier', zoom: 1.25, ox: 0.1, oy: 0 },
        { photo: 'boulevard', zoom: 1.45, ox: 0.05, oy: 0.6 },
      ],
      title: 'NEON\nREVENGE',
      subtitle: 'the city never sleeps',
      lettering: 'neon',
      titlePos: 'bottom',
      titleScale: 1,
    },
  },
  editor1: {
    mode: 'editor',
    state: {
      size: '1080x1350',
      layoutId: 'hero',
      gradeId: 'vice-sunset',
      panels: [
        { photo: 'boulevard', zoom: 1.02, ox: 0, oy: -0.05 },
        { photo: 'pier', zoom: 1.2, ox: 0, oy: 0 },
        { photo: 'boulevard', zoom: 2.0, ox: 0, oy: 0.85 },
      ],
      title: 'PALM CITY\nHEAT',
      subtitle: 'every saint has a past',
      lettering: 'sunset',
      titlePos: 'bottom',
      titleScale: 1,
    },
  },
  editor2: {
    mode: 'editor',
    state: {
      size: '1920x1080',
      layoutId: 'diagonal',
      gradeId: 'golden-hour',
      panels: [
        { photo: 'pier', zoom: 1.05, ox: 0.2, oy: 0.5 },
        { photo: 'boulevard', zoom: 1.3, ox: 0.85, oy: 0.9 },
      ],
      title: 'LAST CAST',
      subtitle: 'one more tide',
      lettering: 'chrome',
      titlePos: 'bottom',
      titleScale: 1,
    },
  },
};

/** The scene named by the query, or null when the page is not in a screenshot mode. */
export function sceneFromQuery(query) {
  const name = query.get('scene');
  if (!name || !SCENES[name]) return null;
  return { mode: query.get('shot') ?? SCENES[name].mode, state: SCENES[name].state };
}
