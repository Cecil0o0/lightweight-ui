import { getScrollbarSize } from '../utils';
import { useMemo } from 'react';
import { IUseSizeAndScroll, LayoutVertical } from '../types';
import {
  header as headerDefaultConfig,
  rowSelection as defaultRowSelectionConfig,
  scrollableClassNames
} from '../shared/default-config';

export function useSizeAndScroll({
  propHeaderHeight,
  columnWidths,
  rowHeights,
  containerHeight,
  paginationHeight,
  paginationPaddingTop,
  rowSelection,
  containerWidth,
  tableWrapperRef,
  layoutVertical
}: IUseSizeAndScroll) {
  const someGlobalSyncStates = useMemo(() => {
    const scrollbarSize = getScrollbarSize();
    const headerHeight = propHeaderHeight || headerDefaultConfig.fixedHeight;
    let totalActualWidth = Math.floor(columnWidths.reduce((acc, item) => acc + Number(item), 0));
    if (rowSelection) {
      totalActualWidth += defaultRowSelectionConfig.columnWidth;
    }
    const xScrollable = totalActualWidth > containerWidth;
    const totalContentHeight =
      rowHeights.reduce((acc, item) => acc + item, 0) +
      headerHeight +
      (xScrollable ? scrollbarSize : 0);
    let tableInnerHeight = totalContentHeight;
    const maxTableInnerHeight = containerHeight - paginationHeight - paginationPaddingTop;
    let yScrollable = false;
    if (layoutVertical === LayoutVertical.FILL) {
      tableInnerHeight = maxTableInnerHeight;
    } else if (layoutVertical === LayoutVertical.FLUID) {
      tableInnerHeight = totalContentHeight;
    }
    if (totalContentHeight > maxTableInnerHeight) {
      tableInnerHeight = maxTableInnerHeight;
      yScrollable = true;
    }
    if (tableWrapperRef.current) {
      tableWrapperRef.current.classList[scrollbarSize ? 'add' : 'remove'](
        scrollableClassNames.visiblePermanently
      );
      tableWrapperRef.current.classList[yScrollable ? 'add' : 'remove'](
        scrollableClassNames.yScrollable
      );
      tableWrapperRef.current.classList[xScrollable ? 'add' : 'remove'](
        scrollableClassNames.xScrollable
      );
    }
    return {
      scrollbarSize,
      xScrollable,
      yScrollable,
      totalActualWidth,
      tableInnerHeight,
      totalContentHeight,
      headerHeight
    };
  }, [
    propHeaderHeight,
    columnWidths,
    rowHeights,
    containerHeight,
    paginationHeight,
    paginationPaddingTop,
    rowSelection,
    containerWidth
  ]);

  return someGlobalSyncStates;
}
