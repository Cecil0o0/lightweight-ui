import { isNumber } from 'lodash';
import { ICalculateMinWidth, WIDTH_TYPE } from '../../types';
import {
  header as defaultHeaderConfig,
  rowSelection as rowSelectionDefaultConfig
} from '../../shared/default-config';

const delimiter = ':';
const { widthWhenUnset } = defaultHeaderConfig;

const getTrueWidth = (width: string) => {
  if (width.startsWith(WIDTH_TYPE.INTERVAL) || width.startsWith(WIDTH_TYPE.FIXED)) {
    return Number(width.split(delimiter)[1]);
  }
  return widthWhenUnset;
};

export function calculateMinWidth<T>({
  columns,
  containerWidth,
  rowSelection
}: ICalculateMinWidth<T>): number[] {
  if (rowSelection) {
    containerWidth -= rowSelectionDefaultConfig.columnWidth;
  }

  // 计算动态宽度
  // column.minWidth || column.width || undefined
  const originalWidths = columns.map(column => {
    if (isNumber(column.minWidth) && column.minWidth > 0) {
      return `${WIDTH_TYPE.INTERVAL}${delimiter}${column.minWidth}`;
    }
    if (isNumber(column.width) && column.width > 0) {
      return `${WIDTH_TYPE.FIXED}${delimiter}${column.width}`;
    }
    return WIDTH_TYPE.TO_BE_ALLOCATED;
  });

  // 算法细节
  // 若 ['interval:50', 'fixed:100', 'toBeAllocated', 'toBeAllocated', 'toBeAllocated']
  // 等价于 ['interval:50', 'fixed:100', 'interval:widthWhenUnset', 'interval:widthWhenUnset', 'interval:widthWhenUnset']
  const totalOriginalWidth = originalWidths.reduce((acc, item) => {
    return acc + getTrueWidth(item);
  }, 0);

  const targetWidths = originalWidths.map(getTrueWidth);

  // 虚拟列表自适应宽度的实现
  if (totalOriginalWidth < containerWidth) {
    const noneFixedWidthsWithIndex: { [key: number]: number } = {};
    originalWidths.forEach((item, index) => {
      if (!item.startsWith(WIDTH_TYPE.FIXED)) {
        noneFixedWidthsWithIndex[index] = getTrueWidth(item);
      }
    });
    const noneFixedLength = Object.keys(noneFixedWidthsWithIndex).length;

    if (!noneFixedLength) {
      return targetWidths;
    }
    // 总分配量
    const restSpace = containerWidth - totalOriginalWidth;
    // 总分配份数
    const totalPieces = Object.values(noneFixedWidthsWithIndex).reduce(
      (acc, item) => acc + Number(item),
      0
    );
    // 各分配比例
    const allocatedRatios = Object.values(noneFixedWidthsWithIndex).map(
      item => Number(item) / totalPieces
    );
    // 获取实际被分配的像素
    const getExtraSpaceByValue = (value: number) => (Number(value) / totalPieces) * restSpace;
    // （来源于移动端浏览器渲染小于1px的兼容性问题），猜测 PC 端也有同样问题，而且组件可能应用于移动端，试行约定最小分配单位是 1px
    const is1pxEnoughForEveryDynamicWidth = restSpace / Math.min(...allocatedRatios) >= 1;
    if (is1pxEnoughForEveryDynamicWidth) {
      Object.entries(noneFixedWidthsWithIndex).forEach(([key, value]) => {
        noneFixedWidthsWithIndex[Number(key)] += getExtraSpaceByValue(Number(value));
      });
    } else {
      const [[key, value]] = Object.entries(noneFixedWidthsWithIndex);
      noneFixedWidthsWithIndex[Number(key)] += getExtraSpaceByValue(Number(value));
    }

    // 更新 targetWidths
    Object.entries(noneFixedWidthsWithIndex).forEach(([key, value]) => {
      targetWidths[Number(key)] = value;
    });
  }

  return targetWidths;
}
