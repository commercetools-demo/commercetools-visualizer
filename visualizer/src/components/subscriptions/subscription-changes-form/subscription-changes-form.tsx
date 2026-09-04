import { FC } from 'react';
import { useField } from 'formik';
import { Checkbox, Grid, Heading, Stack } from '@commercetools/nimbus';
import { useIntl } from 'react-intl';
import { TChangeSubscriptionInput } from '../../../types/generated/ctp';
import messages from './messages';
import { changes } from './subscription-changes-types';

type Props = {
  isReadOnly?: boolean;
};

const SubscriptionChangesForm: FC<Props> = ({ isReadOnly }) => {
  const intl = useIntl();
  const [field, , helpers] =
    useField<Array<TChangeSubscriptionInput>>('changes');

  const isChecked = (resourceTypeId: string) =>
    Boolean(
      field.value?.find((item) => item.resourceTypeId === resourceTypeId)
    );

  const toggle = (resourceTypeId: string, isSelected: boolean) => {
    const nextValue = isSelected
      ? [...(field.value ?? []), { resourceTypeId }]
      : (field.value ?? []).filter(
          (item) => item.resourceTypeId !== resourceTypeId
        );
    helpers.setValue(nextValue);
  };

  return (
    <Stack direction="column" gap="400">
      <Heading as="h2" size="md">
        {intl.formatMessage(messages.ChangesLabel)}
      </Heading>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="200">
        {changes.map((entry) => (
          <Checkbox
            key={entry}
            isSelected={isChecked(entry)}
            isReadOnly={isReadOnly}
            onChange={(isSelected) => toggle(entry, isSelected)}
          >
            {intl.formatMessage(messages.label, { type: entry })}
          </Checkbox>
        ))}
      </Grid>
    </Stack>
  );
};
export default SubscriptionChangesForm;
