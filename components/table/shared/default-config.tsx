import { inWindows, isChrome, isFirefox } from './device-detect';
import { Neutral300 } from '@/components/colors';

export const header = {
  fixedHeight: 48,
  widthWhenUnset: 80
};

export const body = {
  fixedHeight: 44,
  borderSize: 1,
  // 空串和 flex-start 效果相同
  cellAlign: ''
};

export const overscanCount = (inWindows() && isChrome()) || isFirefox() ? 10 : 1;

export const rowSelection = {
  columnWidth: 28,
  defaultKey: 'id'
};

export const placeholderCharacter = '-';
export const stickyZIndex = {
  bodyCell: 5,
  header: 30,
  opts: 8
};
export const shadowZIndex = 10;

export const edgeClasses = {
  leftOverlay: 'fit-left-edge',
  topOverlay: 'fit-top-edge',
  rightOverlay: 'fit-right-edge'
};

export const pagination = {
  paddingTop: 10,
  sizeHeight: {
    small: 28,
    default: 28
  }
};

export const everyHorizontalPadding = 12;

export const scrollableClassNames = {
  xScrollable: 'xScrollable',
  yScrollable: 'yScrollable',
  visiblePermanently: 'permanently-show-scrollbar'
};

export const borderStyleText = `${body.borderSize}px solid ${Neutral300}`;
