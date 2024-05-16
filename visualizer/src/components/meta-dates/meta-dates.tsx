import { FormattedMessage, useIntl } from 'react-intl';
import { customProperties } from '@commercetools-uikit/design-system';
import styles from './meta-dates.module.css';
import messages from './messages';
import Grid from '@commercetools-uikit/grid';
import Text from '@commercetools-uikit/text';
import { FC } from 'react';

export const InlineMetadatesLayout: FC<InlineMetadatesProps> = (props) => {
  const intl = useIntl();
  return (
    <div data-testid="inline-metadates-layout" className={styles.container}>
      <Text.Detail tone="secondary">
        <FormattedMessage
          {...messages.dateCreated}
          values={{
            datetime:
              intl.formatDate(props.created) +
              ' ' +
              intl.formatTime(props.created),
          }}
        />
      </Text.Detail>
      <Text.Detail tone="secondary">
        <FormattedMessage
          {...messages.dateModified}
          values={{
            datetime:
              intl.formatDate(props.modified) +
              ' ' +
              intl.formatTime(props.modified),
          }}
        />
      </Text.Detail>
    </div>
  );
};

export const StackMetadatesLayout: FC<StackMetadatesProps> = (props) => {
  const intl = useIntl();
  return (
    <div data-testid="stack-metadates-layout">
      <Grid
        display="inline-grid"
        gridTemplateColumns="auto auto"
        gridColumnGap={customProperties.spacingS}
      >
        <Grid.Item>
          <Text.Detail tone="secondary">
            <FormattedMessage
              {...messages.dateCreated}
              values={{
                datetime: '',
              }}
            />
          </Text.Detail>
          <Text.Detail tone="secondary">
            <FormattedMessage
              {...messages.dateModified}
              values={{
                datetime: '',
              }}
            />
          </Text.Detail>
        </Grid.Item>
        <Grid.Item>
          <Text.Detail tone="secondary">
            {intl.formatDate(props.created) +
              ' ' +
              intl.formatTime(props.created)}
          </Text.Detail>
          <Text.Detail tone="secondary">
            {intl.formatDate(props.modified) +
              ' ' +
              intl.formatTime(props.modified)}
          </Text.Detail>
        </Grid.Item>
      </Grid>
    </div>
  );
};

type Props = {
  created: string;
  modified: string;
};
type MetaDatesProps = {
  orientation?: 'inline' | 'stack';
} & Props;
type InlineMetadatesProps = {} & Props;
type StackMetadatesProps = {} & Props;

export const MetaDates: FC<MetaDatesProps> = ({
  created,
  modified,
  orientation = 'inline',
}) => {
  if (!created || !modified) {
    return null;
  }

  return orientation === 'inline' ? (
    <InlineMetadatesLayout created={created} modified={modified} />
  ) : (
    <StackMetadatesLayout created={created} modified={modified} />
  );
};

export default MetaDates;
