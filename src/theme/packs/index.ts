import type { ThemePack } from '../types';
import { defaultPack } from './default';

export const packs: ThemePack[] = [defaultPack];

export function getPack(id: string): ThemePack {
  return packs.find((p) => p.id === id) ?? defaultPack;
}
