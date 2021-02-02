import { Column, IAdminVirtualTable, ITable } from '../types';
import { rowSelection as defaultRowSelectionConfig, stickyZIndex } from './default-config';

export function genStickyStyle({
  column,
  columnIndex,
  columnWidths,
  rowSelection
}: {
  column: Column<any>;
  columnIndex: number;
  columnWidths: number[];
  rowSelection: IAdminVirtualTable<any>['rowSelection'];
}) {
  if (!column.fixed) {
    return {};
  }
  const base = {
    position: 'sticky',
    zIndex: stickyZIndex.bodyCell
  };
  if ([true, 'left'].includes(column.fixed)) {
    let left = columnWidths.slice(0, columnIndex).reduce((acc, width) => acc + width, 0);
    if (rowSelection) {
      left += defaultRowSelectionConfig.columnWidth;
    }
    Object.assign(base, {
      left
    });
  } else if (column.fixed === 'right') {
    Object.assign(base, {
      right: columnWidths
        .slice(columnIndex - columnWidths.length, -1)
        .reduce((acc, width) => acc + width, 0)
    });
  }
  return base;
}

export function getColumnRender(column: Column<any>) {
  if (column && column.render && typeof column.render === 'function') {
    return column.render;
  }
}

export function isXScroll({
  columnWidths,
  containerWidth,
  rowSelection
}: { columnWidths: number[] } & Pick<ITable<any>, 'containerWidth' | 'rowSelection'>) {
  return (
    containerWidth - (rowSelection ? defaultRowSelectionConfig.columnWidth : 0) <
    columnWidths.reduce((acc, item) => acc + item, 0)
  );
}
