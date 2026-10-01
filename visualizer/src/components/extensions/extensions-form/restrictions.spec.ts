import {
  DependencyCandidate,
  MAX_DEPENDENCIES,
  MAX_EXPANSION_PATHS,
  coversTriggers,
  dependencyProblem,
  normalizeExpansionPaths,
  validateDependencies,
  validateExpansionPaths,
  wouldCreateCycle,
} from './restrictions';

const candidate = (
  id: string,
  triggers: DependencyCandidate['triggers'] = [
    { resourceTypeId: 'cart', actions: ['Create', 'Update'] },
  ],
  dependencyIds: string[] = []
): DependencyCandidate => ({ id, key: `key-${id}`, triggers, dependencyIds });

describe('limits', () => {
  it('match the documented limits', () => {
    // https://docs.commercetools.com/api/projects/api-extensions#extension-chaining
    expect(MAX_DEPENDENCIES).toBe(5);
    // https://docs.commercetools.com/api/limits#api-extensions
    expect(MAX_EXPANSION_PATHS).toBe(3);
  });
});

describe('expansion paths', () => {
  it('normalizes: trims and drops blank entries', () => {
    expect(normalizeExpansionPaths([' a ', '', '  ', 'b'])).toEqual(['a', 'b']);
    expect(normalizeExpansionPaths(undefined)).toEqual([]);
    expect(normalizeExpansionPaths(null)).toEqual([]);
  });

  it.each([[[]], [['a']], [['a', 'b', 'c']]])('accepts %j', (paths) => {
    expect(validateExpansionPaths(paths)).toEqual({});
  });

  it('rejects more than 3 paths', () => {
    expect(validateExpansionPaths(['a', 'b', 'c', 'd'])).toEqual({
      tooMany: true,
    });
  });

  it('ignores blank rows when counting, since they are dropped on save', () => {
    expect(validateExpansionPaths(['a', '', 'b', ' ', 'c', ''])).toEqual({});
  });

  it('rejects duplicates, also when they only differ in whitespace', () => {
    expect(validateExpansionPaths(['a', ' a '])).toEqual({ duplicate: true });
  });

  it('reports both problems together', () => {
    expect(validateExpansionPaths(['a', 'a', 'b', 'c'])).toEqual({
      tooMany: true,
      duplicate: true,
    });
  });
});

describe('coversTriggers', () => {
  const cart = candidate('c', [
    { resourceTypeId: 'cart', actions: ['Create', 'Update'] },
  ]);

  it('is true when every resource type and action is covered', () => {
    expect(
      coversTriggers(cart, [{ resourceTypeId: 'cart', actions: ['Update'] }])
    ).toBe(true);
  });

  it('is true for an extension without triggers', () => {
    expect(coversTriggers(cart, [])).toBe(true);
    expect(coversTriggers(cart, undefined)).toBe(true);
  });

  it('is false when a resource type is not covered', () => {
    expect(
      coversTriggers(cart, [
        { resourceTypeId: 'cart', actions: ['Create'] },
        { resourceTypeId: 'order', actions: ['Create'] },
      ])
    ).toBe(false);
  });

  it('is false when only some actions of a resource type are covered', () => {
    const createOnly = candidate('c', [
      { resourceTypeId: 'cart', actions: ['Create'] },
    ]);
    expect(
      coversTriggers(createOnly, [
        { resourceTypeId: 'cart', actions: ['Create', 'Update'] },
      ])
    ).toBe(false);
  });

  it('combines several triggers of the candidate for one resource type', () => {
    const split = candidate('c', [
      { resourceTypeId: 'cart', actions: ['Create'] },
      { resourceTypeId: 'cart', actions: ['Update'] },
    ]);
    expect(
      coversTriggers(split, [
        { resourceTypeId: 'cart', actions: ['Create', 'Update'] },
      ])
    ).toBe(true);
  });
});

describe('wouldCreateCycle', () => {
  it('is false for an unsaved extension (no id)', () => {
    expect(wouldCreateCycle(undefined, 'a', [candidate('a', [], ['b'])])).toBe(
      false
    );
  });

  it('detects a direct cycle', () => {
    expect(wouldCreateCycle('me', 'a', [candidate('a', [], ['me'])])).toBe(
      true
    );
  });

  it('detects a transitive cycle', () => {
    expect(
      wouldCreateCycle('me', 'a', [
        candidate('a', [], ['b']),
        candidate('b', [], ['c']),
        candidate('c', [], ['me']),
      ])
    ).toBe(true);
  });

  it('is false for an unrelated chain and for a diamond', () => {
    expect(
      wouldCreateCycle('me', 'd', [
        candidate('b', [], ['a']),
        candidate('c', [], ['a']),
        candidate('d', [], ['b', 'c']),
        candidate('a'),
      ])
    ).toBe(false);
  });

  it('terminates on a cycle that does not involve this extension', () => {
    expect(
      wouldCreateCycle('me', 'a', [
        candidate('a', [], ['b']),
        candidate('b', [], ['a']),
      ])
    ).toBe(false);
  });
});

describe('dependencyProblem', () => {
  const base = { extensionId: 'me', triggers: [], selected: [] as string[] };

  it('rejects depending on itself', () => {
    expect(
      dependencyProblem('me', { ...base, candidates: [candidate('me')] })
    ).toBe('self');
  });

  it('rejects an extension that does not exist', () => {
    expect(dependencyProblem('gone', { ...base, candidates: [] })).toBe(
      'notFound'
    );
  });

  it('rejects a circular dependency', () => {
    expect(
      dependencyProblem('a', {
        ...base,
        candidates: [candidate('a', [], ['me'])],
      })
    ).toBe('circular');
  });

  it('rejects an extension that is not triggered for every trigger/action', () => {
    expect(
      dependencyProblem('a', {
        ...base,
        triggers: [{ resourceTypeId: 'order', actions: ['Create'] }],
        candidates: [candidate('a')],
      })
    ).toBe('notApplicable');
  });

  it('accepts a valid dependency', () => {
    expect(
      dependencyProblem('a', {
        ...base,
        triggers: [{ resourceTypeId: 'cart', actions: ['Update'] }],
        candidates: [candidate('a')],
      })
    ).toBeUndefined();
  });

  it('reports the limit for further dependencies once 5 are selected, but not for the selected ones', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
    const candidates = ids.map((id) => candidate(id));
    const selected = ids.slice(0, 5);
    expect(dependencyProblem('f', { ...base, selected, candidates })).toBe(
      'limit'
    );
    expect(
      dependencyProblem('a', { ...base, selected, candidates })
    ).toBeUndefined();
  });
});

describe('validateDependencies', () => {
  const context = (candidates: DependencyCandidate[] | undefined) => ({
    extensionId: 'me',
    triggers: [{ resourceTypeId: 'cart', actions: ['Create'] }],
    candidates,
  });

  it('accepts none, or valid ones', () => {
    expect(validateDependencies([], context([]))).toEqual({});
    expect(validateDependencies(undefined, context([]))).toEqual({});
    expect(validateDependencies(['a'], context([candidate('a')]))).toEqual({});
  });

  it('rejects more than 5', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
    expect(
      validateDependencies(ids, context(ids.map((id) => candidate(id))))
    ).toEqual({ tooMany: true });
  });

  it('reports the problem per selected dependency', () => {
    expect(
      validateDependencies(
        ['gone', 'loop', 'ok', 'wrong'],
        context([
          candidate('loop', undefined, ['me']),
          candidate('ok'),
          candidate('wrong', [
            { resourceTypeId: 'order', actions: ['Create'] },
          ]),
        ])
      )
    ).toEqual({
      problems: { gone: 'notFound', loop: 'circular', wrong: 'notApplicable' },
    });
  });

  it('only checks the count while the other extensions are not available', () => {
    expect(validateDependencies(['a', 'b'], context(undefined))).toEqual({});
    expect(
      validateDependencies(['a', 'b', 'c', 'd', 'e', 'f'], context(undefined))
    ).toEqual({ tooMany: true });
  });
});
