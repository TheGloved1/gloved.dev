import * as React from 'react';

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export function useResponsiveItemsPerPage() {
  const [itemsPerPage, setItemsPerPage] = React.useState<number>(40);

  React.useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width < MOBILE_BREAKPOINT) {
        setItemsPerPage(10); // Mobile
      } else if (width < TABLET_BREAKPOINT) {
        setItemsPerPage(20); // Medium
      } else {
        setItemsPerPage(40); // Large
      }
    };

    updateItemsPerPage();

    const mql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`);
    mql.addEventListener('change', updateItemsPerPage);
    
    return () => mql.removeEventListener('change', updateItemsPerPage);
  }, []);

  return itemsPerPage;
}
