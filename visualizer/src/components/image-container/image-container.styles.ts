import { css, keyframes } from '@emotion/react';
import { customProperties as vars } from '@commercetools-uikit/design-system';

const IMAGE_DIMENSION = {
  DEFAULT: '50px',
  CONDENSED: '32px',
};

const show = keyframes`
  0% {
    opacity: 0.01;
    visibility: hidden;
  }

  100% {
    opacity: 1;
    visibility: visible;
  }
`;

export const tooltipWrapperStyles = css`
  & > div {
    z-index: 25000;
  }
`;

export const tooltipBodyStyles = css`
  line-height: 0;
  animation: ${show} 0.1s forwards linear;
  animation-delay: 0.3s;
  visibility: hidden;
  background: rgb(0 0 0 / 15%);
  & img {
    box-shadow: ${vars.shadow1};
    max-width: calc((100vw / 4));
  }
`;

export const iconButtonStyles = css`
  border: none;
  height: 100%;
  align-items: center;
  max-width: ${IMAGE_DIMENSION.DEFAULT};
  max-height: ${IMAGE_DIMENSION.DEFAULT};

  .condensed & {
    max-width: ${IMAGE_DIMENSION.CONDENSED};
    max-height: ${IMAGE_DIMENSION.CONDENSED};
  }

  &:focus-visible {
    outline: none;
  }
`;

export const containerStyles = css`
  width: fit-content;
  border: 1px solid ${vars.colorNeutral};
  &.condensed {
    width: min-content;

    &.clickable:hover::after,
    &.clickable:focus-within::after {
      margin-top: calc(-1 * ${IMAGE_DIMENSION.CONDENSED});
      height: ${IMAGE_DIMENSION.CONDENSED};
    }
  }

  &.clickable:hover,
  &.clickable:focus-within {
    border-color: ${vars.colorPrimary};

    &::after {
      box-shadow: inset 0 0 0 1px ${vars.colorPrimary};
      content: '';
      display: block;
      position: relative;
      margin-top: calc(-1 * ${IMAGE_DIMENSION.DEFAULT});
      height: ${IMAGE_DIMENSION.DEFAULT};
    }
  }
`;

export const containerRowStyles = css`
  display: flex;
`;

export const imageContainerStyles = css`
  background: ${vars.colorSurface};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${IMAGE_DIMENSION.DEFAULT};
  height: ${IMAGE_DIMENSION.DEFAULT};

  .condensed & {
    width: ${IMAGE_DIMENSION.CONDENSED};
    height: ${IMAGE_DIMENSION.CONDENSED};
  }
`;

export const imageStyles = css`
  object-fit: contain;
`;
