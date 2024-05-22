import ReactDOM from 'react-dom';
import NoImageIcon from '@commercetools-frontend/assets/images/no-image.svg';

import { useProjectExtensionImageRegex } from '@commercetools-frontend/application-shell-connectors';
import Image from '../image';
import { FC, forwardRef, PropsWithChildren } from 'react';
import {
  tooltipBodyStyles,
  containerStyles,
  imageContainerStyles,
  containerRowStyles,
  iconButtonStyles,
  tooltipWrapperStyles,
  imageStyles,
} from './image-container.styles';
import IconButton from '@commercetools-uikit/icon-button';
import Tooltip from '@commercetools-uikit/tooltip';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';

interface WrapperComponentProps extends PropsWithChildren<{}> {}

const WrapperComponent: FC<WrapperComponentProps> = forwardRef<
  HTMLDivElement,
  WrapperComponentProps
>(({ children, ...props }, ref) => (
  <div {...props} ref={ref}>
    {children}
  </div>
));
WrapperComponent.displayName = 'WrapperComponent';

interface TooltipWrapperComponentProps extends PropsWithChildren<{}> {}
const TooltipWrapperComponent: FC<TooltipWrapperComponentProps> = (props) =>
  ReactDOM.createPortal(
    <div css={tooltipWrapperStyles}>{props.children}</div>,
    document.body
  );

interface BodyComponentProps {
  url: string;
}
const BodyComponent: FC<BodyComponentProps> = (props) => {
  return (
    <div css={tooltipBodyStyles}>
      <img src={props.url} />
    </div>
  );
};

interface AccessibleImageProps
  extends PropsWithChildren<{
    isSelectable?: boolean;
    label: string;
  }> {}
const AccessibleImage: FC<AccessibleImageProps> = ({
  isSelectable,
  label,
  children,
}) => {
  if (isSelectable) {
    return (
      <IconButton
        label={label}
        css={iconButtonStyles}
        icon={<>{children}</>}
        size="small"
      />
    );
  } else {
    return <>{children}</>;
  }
};

interface ImageContainerProps {
  url?: string;
  label?: string;
}

// NOTE: we had to split the component into separate pieces (layout, connector)
// so that those can be used in some special cases.
// See https://github.com/commercetools/merchant-center-frontend/pull/5305#issuecomment-415685705
// Once that problem would be fixed, we can re-merge the pieces into one component.

const ImageContainer: FC<ImageContainerProps> = ({
  url = NoImageIcon,
  label = 'image',
}) => {
  const { isLoading } = useProjectExtensionImageRegex();

  return (
    <Tooltip
      components={{
        WrapperComponent,
        BodyComponent: () => <BodyComponent url={url} />,
        TooltipWrapperComponent,
      }}
      off={!url || url === NoImageIcon}
      placement="top"
      title=""
      modifiers={{
        preventOverflow: {
          enabled: false,
        },
      }}
    >
      <div css={containerStyles}>
        <div css={containerRowStyles}>
          <div css={imageContainerStyles}>
            {isLoading && <LoadingSpinner />}
            {!isLoading && (
              <AccessibleImage label={label ?? ''}>
                <Image css={imageStyles} url={url} />
              </AccessibleImage>
            )}
          </div>
        </div>
      </div>
    </Tooltip>
  );
};

export default ImageContainer;
