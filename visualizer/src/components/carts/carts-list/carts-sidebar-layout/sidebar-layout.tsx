import { CSSTransition } from 'react-transition-group';

import Header from './header';
import styles from './sidebar-layout.module.css';
import { FC } from 'react';
import SidebarFilters from '../carts-sidebar-filters';
import { FilterValue } from '../carts-list';

// const useScrollToTopOnFilterAdd = (recentFilters) => {
//   const filterSidebarRef = useRef(null);
//   const prevRecentFilters = usePrevious(recentFilters) || {};
//   useEffect(() => {
//     if (
//       Object.keys(recentFilters).length > Object.keys(prevRecentFilters).length
//     ) {
//       filterSidebarRef?.current?.scrollTo({
//         top: 0,
//         left: 0,
//         behavior: 'smooth',
//       });
//     }
//   }, [recentFilters, prevRecentFilters]);
//
//   return filterSidebarRef;
// };

type SidebarLayoutProps = {
  isOpen: boolean;
  onClose: () => void;
  isInEditMode: boolean;
  selectedFilters: Record<string, FilterValue>;
  onChange: (filter: string, value: string) => void;
  // isEmpty: boolean;
  // mode: string;
  // filters: {
  //   [key: string]: {
  //     type: string;
  //     ids: string[];
  //   };
  // };
  // recentFilters: object;
};
const SidebarLayout: FC<SidebarLayoutProps> = ({
  isOpen,
  onClose,
  selectedFilters,
  onChange,
}) => {
  // const filterSidebarRef = useScrollToTopOnFilterAdd(props.recentFilters);

  return (
    <CSSTransition
      in={isOpen}
      classNames={{
        enter: styles.enterAnimation,
        enterActive: styles.enterActiveAnimation,
        exit: styles.exitAnimation,
        exitActive: styles.exitActiveAnimation,
      }}
      timeout={{ enter: 300, exit: 300 }}
      mountOnEnter
      unmountOnExit
    >
      <div className={styles.container} data-testid="sidebar-layout">
        <div className={styles.headerContainer}>
          <Header onClose={onClose} />
        </div>
        <div className={styles.bodyContainer}>
          <SidebarFilters
            selectedFilters={selectedFilters}
            onChange={onChange}
            // mode={props.mode}
            // filterResults={props.filters}
          />
        </div>
      </div>
    </CSSTransition>
  );
};

export default SidebarLayout;
