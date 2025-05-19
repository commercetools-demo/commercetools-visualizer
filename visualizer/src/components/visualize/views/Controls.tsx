import { FC } from 'react';
import { useFullScreen, useCamera } from '@react-sigma/core';
import {
  ArrowsMinimizeIcon,
  ExpandIcon,
  MinimizeIcon,
  PlusThinIcon,
  WorldIcon,
} from '@commercetools-uikit/icons';
import styled from '@emotion/styled';
import { designTokens } from '@commercetools-uikit/design-system';
import Spacings from '@commercetools-uikit/spacings';
import Card from '@commercetools-uikit/card';
import IconButton from '@commercetools-uikit/icon-button';

const ControlPanel = styled.div`
  position: absolute;
  bottom: ${designTokens.spacingS};
  left: ${designTokens.spacingS};
`;

export type Props = {};

const Controls: FC<Props> = ({}) => {
  const { isFullScreen, toggle } = useFullScreen();
  const { zoomIn, zoomOut, reset } = useCamera({
    duration: 200,
    factor: 1.5,
  });
  return (
    <ControlPanel>
      <Spacings.Stack scale={'s'}>
        <Card theme={'light'} type={'raised'} insetScale={'s'}>
          <IconButton
            label={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            onClick={toggle}
            title={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            icon={isFullScreen ? <ArrowsMinimizeIcon /> : <ExpandIcon />}
          />
        </Card>
        <Card theme={'light'} type={'raised'} insetScale={'s'}>
          <IconButton
            onClick={() => zoomIn()}
            label={'Zoom In'}
            icon={<PlusThinIcon />}
          />
        </Card>
        <Card theme={'light'} type={'raised'} insetScale={'s'}>
          <IconButton
            onClick={() => zoomOut()}
            label={'Zoom Out'}
            icon={<MinimizeIcon />}
          />
        </Card>
        <Card theme={'light'} type={'raised'} insetScale={'s'}>
          <IconButton
            onClick={() => reset()}
            label={'See whole graph'}
            icon={<WorldIcon />}
          />
        </Card>
      </Spacings.Stack>
    </ControlPanel>
  );
};

export default Controls;
