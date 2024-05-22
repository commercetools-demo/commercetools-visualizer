import { css } from '@emotion/react';
import { FC, useEffect, useState } from 'react';
import NoImageIcon from '@commercetools-frontend/assets/images/no-image.svg';
import BrokenIcon from '@commercetools-frontend/assets/images/image-broken.svg';
import ExternalIcon from '@commercetools-frontend/assets/images/image-linked.svg';
import BrokenExternalIcon from '@commercetools-frontend/assets/images/image-link-broken.svg';

const imgExtRegex = /.[^.]+$/;

const imageStyles = css`
  vertical-align: middle;
  max-width: 100%;
  max-height: 100%;
`;

interface ImageProps {
  url: string;
  className?: string;
}

const Image: FC<ImageProps> = ({ className, url }) => {
  const [src, setSrc] = useState(formatUrl(url));

  useEffect(() => {
    setSrc(formatUrl(url));
  }, [url]);
  const handleError = () => {
    const isExternal = !isInternal(url);
    setSrc(isExternal ? BrokenExternalIcon : BrokenIcon);
  };

  return (
    <img
      css={imageStyles}
      className={className}
      src={src}
      onError={handleError}
    />
  );
};
Image.displayName = 'Image';

export default Image;

function formatUrl(url: string) {
  if (isInternalPlaceholder(url)) return url;

  if (isInternal(url)) {
    // We expect the url to end with an img extension
    const match = url.match(imgExtRegex);
    // Unexpected URL format
    if (!match) return url;
    const ext = match[0];
    return url.replace(imgExtRegex, `-thumb${ext}`);
  }

  return url.replace(url, ExternalIcon);
}

const allowedHostnames = [
  'rackcdn.com',
  'commercetools.de',
  'commercetools.com',
];

function isInternal(url: string) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    // Check if the hostname ends with any of the allowed hostnames
    return allowedHostnames.some((allowedHostname) =>
      hostname.endsWith(allowedHostname)
    );
  } catch (error) {
    return false;
  }
}

function isInternalPlaceholder(url: string) {
  return url.includes(NoImageIcon) || url.substring(0, 4) === 'data';
}
