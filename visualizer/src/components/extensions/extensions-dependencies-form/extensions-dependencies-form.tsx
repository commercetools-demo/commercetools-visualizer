import { FC } from 'react';
import { useFormikContext } from 'formik';
import { IntlShape, useIntl } from 'react-intl';
import { Checkbox, LoadingSpinner, Stack, Text } from '@commercetools/nimbus';
import { TFormValues } from '../extensions-form/extensions-form';
import {
  DependencyCandidate,
  DependencyErrors,
  DependencyProblem,
  MAX_DEPENDENCIES,
  dependencyProblem,
  validateDependencies,
} from '../extensions-form/restrictions';
import messages from './messages';

type Props = {
  extensionId?: string;
  // undefined while loading or when loading failed
  candidates: Array<DependencyCandidate> | undefined;
  loading: boolean;
  hasLoadError: boolean;
  isReadOnly?: boolean;
};

const reason = (intl: IntlShape, problem: DependencyProblem) => {
  switch (problem) {
    case 'circular':
      return intl.formatMessage(messages.reasonCircular);
    case 'notApplicable':
      return intl.formatMessage(messages.reasonNotApplicable);
    case 'limit':
      return intl.formatMessage(messages.reasonLimit, {
        max: MAX_DEPENDENCIES,
      });
    default:
      return undefined;
  }
};

const ExtensionsDependenciesForm: FC<Props> = ({
  extensionId,
  candidates,
  loading,
  hasLoadError,
  isReadOnly,
}) => {
  const intl = useIntl();
  const { values, setFieldValue } = useFormikContext<TFormValues>();
  const selected = values.dependencies ?? [];
  // Computed here rather than read from Formik's errors, which only appear once the user
  // has touched the form — a stale stored dependency should be flagged on load.
  const dependencyErrors: DependencyErrors = validateDependencies(selected, {
    extensionId,
    triggers: values.triggers,
    candidates,
  });

  const others = (candidates ?? [])
    .filter((candidate) => candidate.id !== extensionId)
    .sort((a, b) => (a.key ?? a.id).localeCompare(b.key ?? b.id));
  const nameOf = (id: string) =>
    candidates?.find((candidate) => candidate.id === id)?.key || id;

  return (
    <Stack direction="column" gap="300">
      <Text color="neutral.11">
        {intl.formatMessage(messages.dependenciesDescription, {
          max: MAX_DEPENDENCIES,
        })}
      </Text>
      {loading && <LoadingSpinner />}
      {hasLoadError && (
        <Text color="critical.11">
          {intl.formatMessage(messages.loadError)}
        </Text>
      )}
      {candidates && others.length === 0 && (
        <Text color="neutral.11">
          {intl.formatMessage(messages.noOtherExtensions)}
        </Text>
      )}
      {others.map((candidate) => {
        const isSelected = selected.includes(candidate.id);
        const problem = dependencyProblem(candidate.id, {
          extensionId,
          triggers: values.triggers,
          selected,
          candidates: candidates ?? [],
        });
        const selectedProblem = dependencyErrors.problems?.[candidate.id];
        const hint = reason(
          intl,
          selectedProblem ?? (problem as DependencyProblem)
        );
        return (
          <Stack key={candidate.id} direction="column" gap="100">
            <Checkbox
              isSelected={isSelected}
              isReadOnly={isReadOnly}
              // A selected dependency stays uncheckable so a stale choice can be removed.
              isDisabled={!isSelected && Boolean(problem)}
              onChange={(next) =>
                setFieldValue(
                  'dependencies',
                  next
                    ? [...selected, candidate.id]
                    : selected.filter((id) => id !== candidate.id)
                )
              }
            >
              {candidate.key || candidate.id}
            </Checkbox>
            {hint && (!isSelected || selectedProblem) && (
              <Text
                color={selectedProblem ? 'critical.11' : 'neutral.11'}
                fontSize="sm"
              >
                {hint}
              </Text>
            )}
          </Stack>
        );
      })}
      {selected
        .filter((id) => dependencyErrors.problems?.[id] === 'notFound')
        .map((id) => (
          <Stack key={id} direction="row" gap="200" alignItems="center">
            <Checkbox
              isSelected
              isReadOnly={isReadOnly}
              onChange={() =>
                setFieldValue(
                  'dependencies',
                  selected.filter((existing) => existing !== id)
                )
              }
            >
              {id}
            </Checkbox>
            <Text color="critical.11" fontSize="sm">
              {intl.formatMessage(messages.errorNotFound, { name: nameOf(id) })}
            </Text>
          </Stack>
        ))}
      {dependencyErrors.tooMany && (
        <Text color="critical.11">
          {intl.formatMessage(messages.errorTooMany, { max: MAX_DEPENDENCIES })}
        </Text>
      )}
    </Stack>
  );
};

export default ExtensionsDependenciesForm;
