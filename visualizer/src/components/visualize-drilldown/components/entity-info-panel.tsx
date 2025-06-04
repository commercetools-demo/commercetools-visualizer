import { Drawer } from '@commercetools-frontend/application-components';
import Card from '@commercetools-uikit/card';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import React from 'react';
import { useIntl } from 'react-intl';
import { useEntityFetcher } from '../hooks/use-entity-fetcher';
import { EntityInfo } from '../types';
import messages from '../messages';

interface EntityInfoPanelProps {
  entityInfo: EntityInfo | null;
  onClose: () => void;
  isOpen: boolean;
}

export const EntityInfoPanel: React.FC<EntityInfoPanelProps> = ({
  entityInfo,
  onClose,
  isOpen,
}) => {
  const intl = useIntl();
  const { extractName } = useEntityFetcher();
  const name = extractName(entityInfo as EntityInfo);

  if (!entityInfo) {
    return null;
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={intl.formatMessage(messages.entityInfoTitle)}
      hideControls={true}
    >
      <Spacings.Stack scale="m">
        <Spacings.Inline
          scale="s"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text.Headline as="h3">{name}</Text.Headline>
        </Spacings.Inline>

        <Spacings.Stack scale="s">
          <div>
            <Text.Detail tone="secondary">
              {intl.formatMessage(messages.entityType)}
            </Text.Detail>
            <Text.Body>{entityInfo.entityType}</Text.Body>
          </div>

          <div>
            <Text.Detail tone="secondary">
              {intl.formatMessage(messages.entityId)}
            </Text.Detail>
            <Text.Body>{entityInfo.id}</Text.Body>
          </div>

          {entityInfo.data.key && (
            <div>
              <Text.Detail tone="secondary">
                {intl.formatMessage(messages.entityKey)}
              </Text.Detail>
              <Text.Body>{entityInfo.data.key}</Text.Body>
            </div>
          )}

          <div>
            <Text.Detail tone="secondary">
              {intl.formatMessage(messages.entityVersion)}
            </Text.Detail>
            <Text.Body>{entityInfo.data.version}</Text.Body>
          </div>

          <div>
            <Text.Detail tone="secondary">
              {intl.formatMessage(messages.entityCreatedAt)}
            </Text.Detail>
            <Text.Body>
              {new Date(entityInfo.data.createdAt).toLocaleString()}
            </Text.Body>
          </div>

          <div>
            <Text.Detail tone="secondary">
              {intl.formatMessage(messages.entityLastModified)}
            </Text.Detail>
            <Text.Body>
              {new Date(entityInfo.data.lastModifiedAt).toLocaleString()}
            </Text.Body>
          </div>
        </Spacings.Stack>

        <div>
          <Text.Detail tone="secondary">
            {intl.formatMessage(messages.rawData)}
          </Text.Detail>
          <Card
            type="flat"
            insetScale="s"
            theme="light"
            css={{
              backgroundColor: '#f5f5f5',
              maxHeight: '200px',
              overflow: 'auto',
            }}
          >
            <pre style={{ fontSize: '12px', margin: 0 }}>
              {JSON.stringify(entityInfo.data, null, 2)}
            </pre>
          </Card>
        </div>
      </Spacings.Stack>
    </Drawer>
  );
};
