import type { ThemePack } from '../../types';

// Local-only packs, e.g. with character artwork that must never be committed.
// Committed empty. To use it locally, edit it and run:
//   git update-index --skip-worktree src/theme/packs/private/index.ts
export const privatePacks: ThemePack[] = [];
