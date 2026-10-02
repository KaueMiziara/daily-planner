import type { ThemePack } from '../types';
import { defaultPack } from './default';
import { forestPack } from './forest';
import { privatePacks } from './private';
import { sakuraPack } from './sakura';

export const packs: ThemePack[] = [defaultPack, sakuraPack, forestPack, ...privatePacks];

export function getPack(id: string): ThemePack {
  return packs.find((p) => p.id === id) ?? defaultPack;
}
