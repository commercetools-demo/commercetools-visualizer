import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { BreadcrumbItem, EntityType } from '../types';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import FlatButton from '@commercetools-uikit/flat-button';
import { AngleRightIcon, HomeIcon } from '@commercetools-uikit/icons';
import messages from '../messages';

interface BreadcrumbNavigationProps {
  breadcrumbs: BreadcrumbItem[];
  onNavigateToLevel: (level: number) => void;
  onNavigateToRoot: () => void;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  breadcrumbs,
  onNavigateToLevel,
  onNavigateToRoot,
}) => {
  const intl = useIntl();
  const filteredBreadcrumbs = useMemo(() => {
    if (breadcrumbs.length > 3) {
      return [
        {
          entityType: undefined as unknown as EntityType,
          entityId: '',
          entityName: '...',
          level: 0,
        } as BreadcrumbItem,
      ].concat(breadcrumbs.slice(-3));
    }
    return breadcrumbs;
  }, [breadcrumbs]);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Spacings.Stack scale="s">
      <Text.Detail tone="secondary">
        {intl.formatMessage(messages.navigationPath)}
      </Text.Detail>
      <Spacings.Inline scale="xs" alignItems="center">
        <FlatButton
          icon={<HomeIcon />}
          label={intl.formatMessage(messages.rootBreadcrumb)}
          onClick={onNavigateToRoot}
        />

        {filteredBreadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={`${breadcrumb.level}-${breadcrumb.entityId}`}>
            <AngleRightIcon size="medium" />
            {breadcrumb.entityType ? (
              <FlatButton
                label={`${breadcrumb.entityName} (${breadcrumb.entityType})`}
                onClick={() => onNavigateToLevel(breadcrumb.level)}
                tone={
                  index === breadcrumbs.length - 1 ? 'primary' : 'secondary'
                }
              />
            ) : (
              <Text.Body>{breadcrumb.entityName}</Text.Body>
            )}
          </React.Fragment>
        ))}
      </Spacings.Inline>
    </Spacings.Stack>
  );
};
