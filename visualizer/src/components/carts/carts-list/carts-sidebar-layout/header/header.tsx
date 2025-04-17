import Spacings from '@commercetools-uikit/spacings';
import { useIntl } from 'react-intl';
import Tooltip from '@commercetools-uikit/tooltip';
import messages from '../../messages';
import { ArrowRightIcon } from '@commercetools-uikit/icons';
import IconButton from '@commercetools-uikit/icon-button';

type HeaderProps = {
  onClose: () => void;
};
const Header = ({ onClose }: HeaderProps) => {
  const { formatMessage } = useIntl();

  return (
    <Spacings.Inset scale="l">
      <Spacings.Inline alignItems="flex-end" justifyContent="flex-end">
        <Tooltip placement="left" title={formatMessage(messages.hideFilters)}>
          <IconButton
            data-testid="hide-sidebar-layout-button"
            icon={
              <>
                <ArrowRightIcon color="primary" size="big" />
              </>
            }
            label={formatMessage(messages.hideFilters)}
            onClick={onClose}
          />
        </Tooltip>
      </Spacings.Inline>
    </Spacings.Inset>
  );
};

export default Header;
