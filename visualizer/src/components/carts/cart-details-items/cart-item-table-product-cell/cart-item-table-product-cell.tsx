import NoImageIconUri from '@commercetools-frontend/assets/images/no-image.svg';
import { formatLocalizedString } from '@commercetools-frontend/l10n';

import messages from './messages';
import { TCustomLineItem, TLineItem } from '../../../../types/generated/ctp';
import { FC } from 'react';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import ImageContainer from '../../../image-container';

const getImageUrl = ({
  lineItem,
}: {
  lineItem: TLineItem | TCustomLineItem;
}) => {
  if ('money' in lineItem) return NoImageIconUri;
  // We optionally select `Variant` from lineItem with the risk that
  // `lineItem.variant` could have been deleted from the project
  // through missync (multi project setup)
  return lineItem?.variant?.images?.length
    ? lineItem.variant.images[0].url
    : undefined;
};
type Props = {
  lineItem: TLineItem | TCustomLineItem;
};
export const CartItemTableProductCell: FC<Props> = (props) => {
  const imageUrl = getImageUrl(props);
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const lineItemName = formatLocalizedString(props.lineItem, {
    key: 'name',
    locale: dataLocale,
    fallback: props.lineItem.id,
    fallbackOrder: projectLanguages,
  });

  return (
    <Spacings.Inline alignItems="center">
      <ImageContainer
        label={
          lineItemName ||
          ('variant' in props.lineItem && props.lineItem.variant?.sku) ||
          ('variant' in props.lineItem && props.lineItem.variant?.key) ||
          ''
        }
        url={imageUrl}
      />
      <div>
        <span>{lineItemName}</span>
        {'price' in props.lineItem && (
          <>
            {props.lineItem.variant?.sku && (
              <Text.Detail
                intlMessage={{
                  ...messages.sku,
                  values: {
                    sku: props.lineItem.variant?.sku,
                  },
                }}
                tone="secondary"
              />
            )}
            {props.lineItem.variant?.key && (
              <Text.Detail
                intlMessage={{
                  ...messages.key,
                  values: {
                    key: props.lineItem.variant?.key,
                  },
                }}
                tone="secondary"
              />
            )}
          </>
        )}
      </div>
    </Spacings.Inline>
  );
};
