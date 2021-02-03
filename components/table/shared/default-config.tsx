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
  columnWidth: 50,
  defaultKey: 'id'
};

export const placeholderCharacter = '-';
export const stickyZIndex = {
  bodyCell: 10,
  header: 30,
  opts: 18
};
export const shadowZIndex = 50;

export const edgeClasses = {
  leftOverlay: 'fit-left-edge',
  topOverlay: 'fit-top-edge',
  rightOverlay: 'fit-right-edge'
};

export const pagination = {
  paddingTop: 10,
  sizeHeight: {
    small: 28,
    default: 54,
    medium: 54,
    large: 68
  }
};

export const everyHorizontalPadding = 12;

export const scrollableClassNames = {
  xScrollable: 'xScrollable',
  yScrollable: 'yScrollable',
  visiblePermanently: 'permanently-show-scrollbar'
};

export const borderStyleText = `${body.borderSize}px solid ${Neutral300}`;
