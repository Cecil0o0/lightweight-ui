import { Column, IUseCellsMeasure } from '../../types';
import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { calculateMinWidth } from './calculate-min-width';
import { measureHeights } from './measure-heights';
import { createMeasurer } from './measure-size';
import { isEqual, pick } from 'lodash';

export function useCellsMeasure<T>({
  columns,
  dataSource,
  containerWidth,
  fixedRowHeight,
  rowSelection,
  listRef,
  tableInnerRef
}: IUseCellsMeasure<T>) {
  // TODO: memorize
  const [columnWidths, setColumns] = useState<number[]>([]);
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  const prevDynamicHeightColumns = useRef<Column<T>[]>();
  const measurer = useMemo(() => {
    if (measurer) {
      measurer.destroy();
    }
    return tableInnerRef.current ? createMeasurer(tableInnerRef.current) : undefined;
  }, [tableInnerRef.current]);

  const recalcRowHeightEffect = ({
    newColumnWidths = columnWidths,
    newDataSource = dataSource,
    forceReCalc = false
  }: { newColumnWidths?: number[]; newDataSource?: T[]; forceReCalc?: boolean } = {}) => {
    if (columns.length === 0 || newColumnWidths.length === 0 || newDataSource.length === 0) return;

    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }

    if (!forceReCalc) {
      const { current: prev } = prevDynamicHeightColumns;
      const nextDynamicHeightColumns = columns
        .filter(c => c.dynamicHeight)
        // 构建动态高度列简易模型 { dynamicHeight, dataIndex }
        .map(c => pick(c, ['dynamicHeight', 'dataIndex']));
      if (prev === undefined) {
        prevDynamicHeightColumns.current = nextDynamicHeightColumns;
      } else {
        if (isEqual(prev, nextDynamicHeightColumns)) {
          return;
        }
        prevDynamicHeightColumns.current = nextDynamicHeightColumns;
      }
    }

    setRowHeights(
      measureHeights<T>({
        columns,
        columnWidths: newColumnWidths,
        dataSource: newDataSource,
        fixedRowHeight,
        measurer
      })
    );
  };
  useLayoutEffect(() => {
    recalcRowHeightEffect({ forceReCalc: true });
  }, [dataSource]);

  useEffect(recalcRowHeightEffect, [columnWidths]);

  useEffect(() => {
    setColumns(
      calculateMinWidth<T>({ columns, containerWidth, rowSelection })
    );
  }, [columns, containerWidth]);

  return {
    rowHeights,
    columnWidths,
    setRowHeights
  };
}
