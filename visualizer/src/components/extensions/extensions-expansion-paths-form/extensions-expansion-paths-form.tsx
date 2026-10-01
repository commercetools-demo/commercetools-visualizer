import { FC } from 'react';
import { useFormikContext } from 'formik';
import { useIntl } from 'react-intl';
import {
  Button,
  Flex,
  IconButton,
  Stack,
  Text,
  TextInput,
} from '@commercetools/nimbus';
import { Add, Delete } from '@commercetools/nimbus-icons';
import { TFormValues } from '../extensions-form/extensions-form';
import {
  ExpansionPathErrors,
  MAX_EXPANSION_PATHS,
} from '../extensions-form/restrictions';
import messages from './messages';

type Props = {
  isReadOnly?: boolean;
};

const ExtensionsExpansionPathsForm: FC<Props> = ({ isReadOnly }) => {
  const intl = useIntl();
  const { values, errors, setFieldValue } = useFormikContext<TFormValues>();
  const paths = values.expansionPaths ?? [];
  const pathErrors = errors.expansionPaths as ExpansionPathErrors | undefined;

  return (
    <Stack direction="column" gap="300">
      <Text color="neutral.11">
        {intl.formatMessage(messages.description, { max: MAX_EXPANSION_PATHS })}
      </Text>
      {paths.map((path, index) => (
        // Rows are positional and have no identity of their own.
        <Flex key={index} gap="200" alignItems="center">
          <TextInput
            aria-label={intl.formatMessage(messages.pathLabel, {
              index: index + 1,
            })}
            value={path}
            isReadOnly={isReadOnly}
            onChange={(value) =>
              setFieldValue(
                'expansionPaths',
                paths.map((existing, i) => (i === index ? value : existing))
              )
            }
            width="full"
          />
          <IconButton
            aria-label={intl.formatMessage(messages.removePath, {
              index: index + 1,
            })}
            size="xs"
            variant="ghost"
            isDisabled={isReadOnly}
            onPress={() =>
              setFieldValue(
                'expansionPaths',
                paths.filter((_, i) => i !== index)
              )
            }
          >
            <Delete />
          </IconButton>
        </Flex>
      ))}
      {pathErrors?.tooMany && (
        <Text color="critical.11">
          {intl.formatMessage(messages.errorTooMany, {
            max: MAX_EXPANSION_PATHS,
          })}
        </Text>
      )}
      {pathErrors?.duplicate && (
        <Text color="critical.11">
          {intl.formatMessage(messages.errorDuplicate)}
        </Text>
      )}
      <Flex>
        <Button
          variant="outline"
          isDisabled={isReadOnly || paths.length >= MAX_EXPANSION_PATHS}
          onPress={() => setFieldValue('expansionPaths', [...paths, ''])}
        >
          <Add />
          {intl.formatMessage(messages.addPath)}
        </Button>
      </Flex>
    </Stack>
  );
};

export default ExtensionsExpansionPathsForm;
