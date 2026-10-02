import { describe, expect, it } from '@jest/globals';
import { contrastRatio } from './contrast';

describe('contrastRatio', () => {
  it('is 21 for black on white and 1 for identical colors', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#336699', '#336699')).toBeCloseTo(1, 5);
  });

  it('does not depend on argument order', () => {
    expect(contrastRatio('#336699', '#FFFFFF')).toBeCloseTo(
      contrastRatio('#FFFFFF', '#336699'),
      10,
    );
  });

  it('matches the well-known AA boundary for grey text on white', () => {
    expect(contrastRatio('#767676', '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#777777', '#FFFFFF')).toBeLessThan(4.5);
  });
});
