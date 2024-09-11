import { FormattedMessage, useIntl } from 'react-intl';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';

import styles from './addresses-panel.module.css';
import messages from './messages';
import Tooltip from '@commercetools-uikit/tooltip';
import IconButton from '@commercetools-uikit/icon-button';
import {
  DomainIcon,
  EyeIcon,
  HomeIcon,
  InfoIcon,
  MailIcon,
  PaperBillInvertedIcon,
  UserLinearIcon,
} from '@commercetools-uikit/icons';
import { Link, useHistory } from 'react-router-dom';
import Spacings from '@commercetools-uikit/spacings';
import AddressContainer from '../address-container';
import Address from '../address';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import Grid from '@commercetools-uikit/grid';
import { designTokens } from '@commercetools-uikit/design-system';
import Constraints from '@commercetools-uikit/constraints';
import Text from '@commercetools-uikit/text';
import FlatButton from '@commercetools-uikit/flat-button';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { TCart, TShipping } from '../../../types/generated/ctp';
import { FC } from 'react';

export const ADDRESS_TYPE = {
  BILLING: 'billing-address',
  SHIPPING: 'shipping-address',
};

export const SHIPPING_MODES = {
  MULTIPLE: 'Multiple',
  SINGLE: 'Single',
};

type Props = { cart: TCart };

const AddressesPanel: FC<Props> = ({ cart }) => {
  const { push } = useHistory();
  const { projectKey } = useApplicationContext((context) => ({
    projectKey: context.project?.key ?? '',
  }));
  const { formatMessage } = useIntl();

  const renderCustomerLink = () => (
    <Tooltip
      placement="left"
      title={formatMessage(
        cart.customerId ? messages.goToCustomer : messages.noCustomer
      )}
    >
      <IconButton
        icon={<UserLinearIcon />}
        id="addresses-panel-customer-link"
        isDisabled={!cart.customerId}
        label={formatMessage(messages.goToCustomer)}
        onClick={() => push(`/${projectKey}/customers/${cart.customerId}`)}
      />
    </Tooltip>
  );

  const getShippingAndDeliveryTabLink = (msg: string) => (
    <Link to={'/orders'}>{msg}</Link>
  );

  const getNewLine = () => <br />;

  const getMultipleShippingView = (shipping: Array<TShipping>) =>
    shipping.length > 1 ? (
      <Spacings.Inline alignItems="flex-start" scale="xs">
        <div className={styles['icon-container']}>
          <InfoIcon color="info" size="medium" />
        </div>
        <Text.Body
          intlMessage={{
            ...messages.multipleShippingMethodsHint,
            values: {
              shippingAndDeliveryTabLink: getShippingAndDeliveryTabLink,
              newLine: getNewLine,
            },
          }}
        />
      </Spacings.Inline>
    ) : (
      <AddressContainer>
        <Address
          address={shipping?.[0]?.shippingAddress}
          data-testid="shipping-address"
          labelMissing={
            <FormattedMessage {...messages.labelMissingShippingAddress} />
          }
        />
      </AddressContainer>
    );

  return (
    <CollapsiblePanel
      data-testid="addresses-panel"
      header={
        <CollapsiblePanel.Header>
          <FormattedMessage {...messages.panelTitle} />
        </CollapsiblePanel.Header>
      }
      headerControls={renderCustomerLink()}
    >
      <Constraints.Horizontal>
        <Grid
          gridColumnGap={designTokens.spacingXl}
          gridRowGap={designTokens.spacingL}
          gridTemplateColumns="1fr 1fr"
        >
          <Grid.Item gridColumn="span 1">
            <Constraints.Horizontal max={11}>
              <Spacings.Inline
                alignItems="center"
                data-testid="addresses-panel-customerEmail"
                scale="xs"
              >
                <MailIcon />
                <Spacings.Inline>
                  <Text.Body intlMessage={messages.customerEmailLabel} isBold />
                  <Text.Body>
                    {cart?.customerEmail ?? NO_VALUE_FALLBACK}
                  </Text.Body>
                </Spacings.Inline>
              </Spacings.Inline>
            </Constraints.Horizontal>
          </Grid.Item>
          {cart.businessUnit?.name && (
            <Grid.Item gridColumn="2">
              <Constraints.Horizontal max={11}>
                <Spacings.Inline
                  alignItems="center"
                  data-testid="addresses-panel-businessUnit"
                  scale="xs"
                >
                  <DomainIcon />
                  <Spacings.Inline>
                    <Text.Body
                      intlMessage={messages.businessUnitLabel}
                      isBold
                    />
                    <Text.Body>{cart.businessUnit.name}</Text.Body>
                  </Spacings.Inline>
                </Spacings.Inline>
              </Constraints.Horizontal>
            </Grid.Item>
          )}
          <Grid.Item gridRow="2">
            <Constraints.Horizontal max={11}>
              <Spacings.Stack scale="m">
                <Spacings.Inline alignItems="center" scale="xs">
                  <HomeIcon />
                  <Text.Subheadline
                    as="h4"
                    intlMessage={messages.shippingAddress}
                  />
                </Spacings.Inline>
                {cart.shippingMode === SHIPPING_MODES.MULTIPLE ? (
                  getMultipleShippingView(cart.shipping)
                ) : (
                  <AddressContainer>
                    <Address
                      address={cart.shippingAddress}
                      data-testid="shipping-address"
                      labelMissing={
                        <FormattedMessage
                          {...messages.labelMissingShippingAddress}
                        />
                      }
                    />
                    {cart.shippingAddress?.custom && (
                      <div className={styles['custom-fields-link-container']}>
                        <FlatButton
                          icon={<EyeIcon />}
                          label={formatMessage(messages.viewCustomFieldsLabel, {
                            addressType: ADDRESS_TYPE.SHIPPING.replace(
                              '-',
                              ' '
                            ),
                          })}
                          onClick={() =>
                            push(
                              'routes.orderGeneralAddressesCustomFields.go({addressType: ADDRESS_TYPE.SHIPPING,}'
                            )
                          }
                          tone="primary"
                        />
                      </div>
                    )}
                  </AddressContainer>
                )}
              </Spacings.Stack>
            </Constraints.Horizontal>
          </Grid.Item>
          <Grid.Item gridRow="2">
            <Constraints.Horizontal max={11}>
              <Spacings.Stack scale="m">
                <Spacings.Inline alignItems="center" scale="xs">
                  <PaperBillInvertedIcon />
                  <Text.Subheadline
                    as="h4"
                    intlMessage={messages.billingAddress}
                  />
                </Spacings.Inline>
                <AddressContainer>
                  <Address
                    address={cart.billingAddress}
                    data-testid="billing-address"
                    labelMissing={
                      <FormattedMessage
                        {...messages.labelMissingBillingAddress}
                      />
                    }
                  />
                  {cart.billingAddress?.custom && (
                    <div className={styles['custom-fields-link-container']}>
                      <FlatButton
                        icon={<EyeIcon />}
                        label={formatMessage(messages.viewCustomFieldsLabel, {
                          addressType: ADDRESS_TYPE.BILLING.replace('-', ' '),
                        })}
                        onClick={() =>
                          'routes.orderGeneralAddressesCustomFields.go({addressType: ADDRESS_TYPE.BILLING,})'
                        }
                        tone="primary"
                      />
                    </div>
                  )}
                </AddressContainer>
              </Spacings.Stack>
            </Constraints.Horizontal>
          </Grid.Item>
        </Grid>
      </Constraints.Horizontal>
    </CollapsiblePanel>
  );
};

export default AddressesPanel;
