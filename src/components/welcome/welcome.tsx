import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Constraints from '@commercetools-uikit/constraints';
import Grid from '@commercetools-uikit/grid';
import { AngleRightIcon } from '@commercetools-uikit/icons';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import messages from './messages';
import styles from './welcome.module.css';
import WebDeveloperSvg from './web-developer.svg';

type TWrapWithProps = {
  children: ReactNode;
  condition: boolean;
  wrapper: (children: ReactNode) => ReactNode;
};
const WrapWith = (props: TWrapWithProps) => (
  <>{props.condition ? props.wrapper(props.children) : props.children}</>
);
WrapWith.displayName = 'WrapWith';

type TInfoCardProps = {
  title: string;
  content: string;
  linkTo: string;
  isExternal?: boolean;
};

const InfoCard = (props: TInfoCardProps) => (
  <Grid.Item>
    <div className={styles.infoCard}>
      <Spacings.Stack scale="m">
        <Text.Headline as="h3">
          <WrapWith
            condition={true}
            wrapper={(children) =>
              props.isExternal ? (
                <a
                  className={styles.infoCardLink}
                  href={props.linkTo}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ) : (
                <RouterLink className={styles.infoCardLink} to={props.linkTo}>
                  {children}
                </RouterLink>
              )
            }
          >
            <Spacings.Inline scale="s" alignItems="center">
              <span>{props.title}</span>
              <AngleRightIcon size="big" color="primary" />
            </Spacings.Inline>
          </WrapWith>
        </Text.Headline>
        <Text.Body>{props.content}</Text.Body>
      </Spacings.Stack>
    </div>
  </Grid.Item>
);
InfoCard.displayName = 'InfoCard';

const Welcome = () => {
  return (
    <Spacings.Inset scale="l">
      <Constraints.Horizontal max={16}>
        <Spacings.Stack scale="xl">
          <Text.Headline as="h1" intlMessage={messages.title} />
          <div>
            <div className={styles.imageContainer}>
              <img
                alt="web developer"
                src={WebDeveloperSvg}
                width="100%"
                height="100%"
              />
            </div>
          </div>
          <Text.Subheadline as="h4" intlMessage={messages.subtitle} />
        </Spacings.Stack>
      </Constraints.Horizontal>
    </Spacings.Inset>
  );
};
Welcome.displayName = 'Welcome';

export default Welcome;
