// Restrictions the commercetools API puts on an Extension, validated client-side so the user
// gets feedback before a round trip (the API stays authoritative and its errors are shown).
//
// - Expansion paths: at most 3 per Extension
//   https://docs.commercetools.com/api/limits#api-extensions
// - Dependencies ("Extension Chaining"): at most 5 direct dependencies, no circular
//   dependencies, chain depth at most 3 layers, and every dependency must exist and be
//   applicable to every trigger and action of the Extension being saved
//   https://docs.commercetools.com/api/projects/api-extensions#extension-chaining
//   The depth is not checked here (the platform reports `ExtensionChainTooDeep`).

export const MAX_DEPENDENCIES = 5;
export const MAX_EXPANSION_PATHS = 3;

type TriggerLike = {
  resourceTypeId: string;
  actions?: ReadonlyArray<string> | null;
};

export type DependencyCandidate = {
  id: string;
  key?: string | null;
  triggers: ReadonlyArray<TriggerLike>;
  // ids of the extensions this one depends on
  dependencyIds: ReadonlyArray<string>;
};

export type DependencyProblem =
  | 'self'
  | 'circular'
  | 'notApplicable'
  | 'notFound'
  | 'limit';

export const normalizeExpansionPaths = (
  paths: ReadonlyArray<string> | null | undefined
): Array<string> =>
  (paths ?? []).map((path) => path.trim()).filter((path) => path.length > 0);

export type ExpansionPathErrors = { tooMany?: boolean; duplicate?: boolean };

// Blank rows are ignored (they are dropped on save), so only real paths count.
export const validateExpansionPaths = (
  paths: ReadonlyArray<string> | null | undefined
): ExpansionPathErrors => {
  const normalized = normalizeExpansionPaths(paths);
  const errors: ExpansionPathErrors = {};
  if (normalized.length > MAX_EXPANSION_PATHS) errors.tooMany = true;
  if (new Set(normalized).size !== normalized.length) errors.duplicate = true;
  return errors;
};

// Does the candidate run for every (resource type, action) the extension is triggered for?
export const coversTriggers = (
  candidate: Pick<DependencyCandidate, 'triggers'>,
  triggers: ReadonlyArray<TriggerLike> | null | undefined
): boolean =>
  (triggers ?? []).every((trigger) =>
    (trigger.actions ?? []).every((action) =>
      candidate.triggers.some(
        (candidateTrigger) =>
          candidateTrigger.resourceTypeId === trigger.resourceTypeId &&
          (candidateTrigger.actions ?? []).includes(action)
      )
    )
  );

// Would `extensionId` depending on `dependencyId` close a cycle, i.e. does `dependencyId`
// (transitively) already depend on `extensionId`? An unsaved extension has no id and
// cannot be part of a cycle.
export const wouldCreateCycle = (
  extensionId: string | undefined,
  dependencyId: string,
  candidates: ReadonlyArray<DependencyCandidate>
): boolean => {
  if (!extensionId) return false;
  const byId = new Map(
    candidates.map((candidate) => [candidate.id, candidate])
  );
  const visited = new Set<string>();
  const stack = [dependencyId];
  while (stack.length > 0) {
    const current = stack.pop() as string;
    if (current === extensionId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    stack.push(...(byId.get(current)?.dependencyIds ?? []));
  }
  return false;
};

type ProblemContext = {
  extensionId?: string;
  triggers: ReadonlyArray<TriggerLike> | null | undefined;
  selected: ReadonlyArray<string>;
  candidates: ReadonlyArray<DependencyCandidate>;
};

// Why `dependencyId` can't be (or can no longer be) a dependency, if it can't.
export const dependencyProblem = (
  dependencyId: string,
  { extensionId, triggers, selected, candidates }: ProblemContext
): DependencyProblem | undefined => {
  if (dependencyId === extensionId) return 'self';
  const candidate = candidates.find((item) => item.id === dependencyId);
  if (!candidate) return 'notFound';
  if (wouldCreateCycle(extensionId, dependencyId, candidates))
    return 'circular';
  if (!coversTriggers(candidate, triggers)) return 'notApplicable';
  if (!selected.includes(dependencyId) && selected.length >= MAX_DEPENDENCIES) {
    return 'limit';
  }
  return undefined;
};

export type DependencyErrors = {
  tooMany?: boolean;
  // problem per selected dependency id
  problems?: Record<string, DependencyProblem>;
};

// `candidates` is undefined while the other extensions are still loading (or failed to
// load); then only the count can be checked.
export const validateDependencies = (
  selected: ReadonlyArray<string> | null | undefined,
  context: Omit<ProblemContext, 'selected' | 'candidates'> & {
    candidates: ReadonlyArray<DependencyCandidate> | undefined;
  }
): DependencyErrors => {
  const ids = selected ?? [];
  const errors: DependencyErrors = {};
  if (ids.length > MAX_DEPENDENCIES) errors.tooMany = true;
  if (!context.candidates) return errors;
  const problems: Record<string, DependencyProblem> = {};
  ids.forEach((id) => {
    const problem = dependencyProblem(id, {
      ...context,
      candidates: context.candidates as ReadonlyArray<DependencyCandidate>,
      selected: ids,
    });
    if (problem && problem !== 'limit') problems[id] = problem;
  });
  if (Object.keys(problems).length > 0) errors.problems = problems;
  return errors;
};
