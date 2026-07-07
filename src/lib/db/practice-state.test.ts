import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

let dir: string;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'its-practice-'));
  process.env.ITS_RUNTIME_DIR = dir;
});

afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
  delete process.env.ITS_RUNTIME_DIR;
});

describe('practice-state repository (file mode)', () => {
  it('returns empty snapshot for unknown user', async () => {
    const { getPracticeState } = await import('./practice-state');
    const snap = await getPracticeState('unknown-user');
    expect(snap.records).toEqual([]);
    expect(snap.wrongBook).toEqual([]);
  });

  it('saves and reads back user-scoped state', async () => {
    const { getPracticeState, savePracticeState } = await import('./practice-state');
    await savePracticeState('user-a', {
      records: [
        { questionId: 'q1', selected: 'A', correct: true, answeredAt: '2026-01-01T00:00:00Z' },
      ],
      wrongBook: [],
    });
    await savePracticeState('user-b', {
      records: [],
      wrongBook: [
        { questionId: 'q2', wrongCount: 2, lastWrongAt: '2026-01-02T00:00:00Z', mastered: false },
      ],
    });
    const a = await getPracticeState('user-a');
    const b = await getPracticeState('user-b');
    expect(a.records).toHaveLength(1);
    expect(a.wrongBook).toHaveLength(0);
    expect(b.wrongBook).toHaveLength(1);
    expect(b.records).toHaveLength(0);
    expect(a.updatedAt).toBeTruthy();
  });
});
