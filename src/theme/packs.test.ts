import { describe, expect, it } from '@jest/globals';
import { contrastRatio } from './contrast';
import { getPack, packs } from './packs';
import { defaultPack } from './packs/default';
import type { ThemeColors } from './types';

const TEXT_PAIRS: [keyof ThemeColors, keyof ThemeColors][] = [
  ['text', 'background'],
  ['text', 'surface'],
  ['textMuted', 'background'],
  ['textMuted', 'surface'],
  ['onPrimary', 'primary'],
  ['danger', 'background'],
  ['danger', 'surface'],
];
const GRAPHIC_PAIRS: [keyof ThemeColors, keyof ThemeColors][] = [
  ['primary', 'background'],
  ['primary', 'surface'],
  ['success', 'background'],
  ['success', 'surface'],
  ['warning', 'background'],
  ['warning', 'surface'],
];

const variants = packs.flatMap((pack) =>
  (['light', 'dark'] as const).map((scheme): [string, (typeof pack)['light']] => [
    `${pack.id} / ${scheme}`,
    pack[scheme],
  ]),
);

describe('theme pack registry', () => {
  it('has unique pack ids', () => {
    const ids = packs.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('falls back to the default pack for an unknown id', () => {
    expect(getPack('does-not-exist')).toBe(defaultPack);
  });
});

describe.each(variants)('theme pack %s', (_name, variant) => {
  const { colors, background } = variant;

  it('uses #RRGGBB colors', () => {
    for (const value of Object.values(colors)) expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it.each(TEXT_PAIRS)('keeps %s readable on %s', (fg, bg) => {
    expect(contrastRatio(colors[fg], colors[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(GRAPHIC_PAIRS)('keeps %s visible on %s', (fg, bg) => {
    expect(contrastRatio(colors[fg], colors[bg])).toBeGreaterThanOrEqual(3);
  });

  it('keeps the background scrim within 0 and 1', () => {
    if (background?.scrim !== undefined) {
      expect(background.scrim).toBeGreaterThanOrEqual(0);
      expect(background.scrim).toBeLessThanOrEqual(1);
    }
  });
});
