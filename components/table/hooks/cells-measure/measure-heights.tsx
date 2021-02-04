import { ITable, IMeasurer } from '../../types';
import { measureTextWidth } from '../../utils';
import { getColumnRender } from '../../shared';
import {
  body as bodyDefaultConfig,
  header as headerDefaultConfig,
  everyHorizontalPadding
} from '../../shared/default-config';
import { ReactElement } from 'react';

export function measureHeights<T>({
  columns,
  dataSource,
  columnWidths,
  fixedRowHeight,
  measurer
}: Pick<ITable<T>, 'columns' | 'dataSource'> & {
  columnWidths: number[];
  fixedRowHeight?: number;
  measurer?: IMeasurer;
}) {
  let heights = [];
  const dynamicHeightIndexList = [];
  for (let i = 0; i < columns.length; i++) {
    if (columns[i].dynamicHeight) {
      dynamicHeightIndexList.push(i);
    }
  }
  // 测量动态高度
  if (dynamicHeightIndexList.length && measurer) {
    // eslint-disable-next-line no-console
    console.time('measure overhead');
    for (let i = 0; i < dataSource.length; i++) {
      const rowHeights: number[] = [];
      dynamicHeightIndexList.forEach(dynamicHeightIndex => {
        const columnRender = getColumnRender(columns[dynamicHeightIndex]);
        const { dataIndex, dynamicHeight } = columns[dynamicHeightIndex];
        const text = dataIndex ? dataSource[i][dataIndex as keyof T] : '';

        let cellHeight: number;
        // 垂直轴线、水平轴线的 padding 和
        const axisTotalPadding = 2 * everyHorizontalPadding;
        const mirrorContainerWidth =
          (columnWidths[dynamicHeightIndex] || headerDefaultConfig.widthWhenUnset) -
          axisTotalPadding;

        const preciseMeasure = () =>
          measurer.measure(
            columnRender ? (columnRender(text, dataSource[i], i) as ReactElement) : <>{text}</>,
            mirrorContainerWidth
          ).height;

        if (typeof dynamicHeight === 'object') {
          const {
            enableTextOptimize,
            maxHeight,
            factors: { lineHeight, fontSize = 12, fontWeight = 400 },
            getTextContent
          } = dynamicHeight;
          const plainTextMeasure = () => {
            const textWidth = measureTextWidth(getTextContent(text, dataSource[i], i), {
              fontSize,
              fontWeight
            });
            const lineNumber = Math.ceil(textWidth / mirrorContainerWidth);
            return (
              Math.min(lineNumber * lineHeight, maxHeight || Number.MAX_SAFE_INTEGER) +
              axisTotalPadding
            );
          };

          if (enableTextOptimize) {
            cellHeight = plainTextMeasure();
          } else {
            cellHeight = preciseMeasure();
          }
        } else {
          cellHeight = preciseMeasure();
        }

        rowHeights.push(cellHeight);
      });
      heights.push(Math.max(...rowHeights, bodyDefaultConfig.fixedHeight));
    }
    // eslint-disable-next-line no-console
    console.timeEnd('measure overhead');
  } else {
    heights = Array.from({ length: dataSource.length }).fill(
      fixedRowHeight || bodyDefaultConfig.fixedHeight
    ) as number[];
  }
  return heights.map((height, idx, arr) => {
    if (idx === arr.length - 1) {
      return height;
    }
    return height + bodyDefaultConfig.borderSize;
  });
}
