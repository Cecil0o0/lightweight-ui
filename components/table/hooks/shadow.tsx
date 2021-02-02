import { Column, UseFixedShadowState, ITable } from '../types';
import { useState, useRef, useEffect, MutableRefObject } from 'react';
import { Neutral900 } from '@/components/colors';
import styled, { createGlobalStyle } from 'styled-components';
import { fade } from '../utils';
import {
  rowSelection as rowSelectionDefaultConfig,
  shadowZIndex,
  edgeClasses
} from '../shared/default-config';
import { isNil } from 'lodash';
import { isXScroll } from '../shared/utils';

const zeroShadowWidth = 10;

const addClassName = (dom: HTMLElement, className: string) =>
  dom.className.includes(className) || dom.classList.add(className);

const removeClassName = (dom: HTMLElement, className: string) =>
  dom.className.includes(className) && dom.classList.remove(className);

const LeftShadow = styled.div<{ width: number }>`
  position: absolute;
  width: ${props => props.width}px;
  left: 0;
  top: 0;
  bottom: 0;
  box-shadow: 4px 0 9px 0 ${fade(Neutral900, 0.06)};
  pointer-events: none;
  z-index: ${shadowZIndex};
`;
const RightShadow = styled(LeftShadow)`
  left: auto;
  right: 0;
  box-shadow: -4px 0 9px 0 ${fade(Neutral900, 0.06)};
`;
const ZeroRightShadow = styled(RightShadow)`
  right: -${zeroShadowWidth}px;
`;

const ReactiveShadow = createGlobalStyle`
  .${edgeClasses.rightOverlay} ${RightShadow},
  .${edgeClasses.rightOverlay} ${ZeroRightShadow},
  .${edgeClasses.leftOverlay} ${LeftShadow} {
    display: none;
  }
  .${edgeClasses.leftOverlay} ${RightShadow} {
    display: unset;
  }
`;

const genShadowState: (params: {
  columns: Column<any>[];
  lastScrollLeftRef: MutableRefObject<number>;
  xScrollable: boolean;
}) => UseFixedShadowState = ({ columns, lastScrollLeftRef, xScrollable }) => {
  let lastLeftFixedColumnIndex;
  for (let i = columns.length - 1; i >= 0; i--) {
    const col = columns[i];
    if (col && col.fixed && ['left', true].includes(col.fixed)) {
      lastLeftFixedColumnIndex = i;
      break;
    }
  }
  const fisrtRightFixedColumnIndex = columns.findIndex(col => col.fixed === 'right');
  return {
    lastLeftFixedColumnIndex,
    fisrtRightFixedColumnIndex:
      fisrtRightFixedColumnIndex !== -1 ? fisrtRightFixedColumnIndex : undefined,
    createHandleScroll: ({
      scrollContainerRef,
      totalActualWidth,
      elementForClassRef,
      immediately = true
    }) => {
      const handler = () => {
        const { current } = scrollContainerRef;
        if (!current) return;
        const elementForClass = elementForClassRef ? elementForClassRef.current : current;
        if (!elementForClass) return;

        // 方法为性能优化，我的原则是逻辑聚合固然重要，仍然为性能优化让步。
        const calculateFitTopEdge = () => {
          const isFitTopEdge = current.scrollTop === 0;
          isFitTopEdge
            ? addClassName(elementForClass, edgeClasses.topOverlay)
            : removeClassName(elementForClass, edgeClasses.topOverlay);
        };

        if (!xScrollable) {
          calculateFitTopEdge();
          return;
        }

        const isXScrolling = current.scrollLeft !== lastScrollLeftRef.current;
        if (isXScrolling) {
          lastScrollLeftRef.current = current.scrollLeft;
          const isFitLeftEdge = current.scrollLeft === 0;
          isFitLeftEdge
            ? addClassName(elementForClass, edgeClasses.leftOverlay)
            : removeClassName(elementForClass, edgeClasses.leftOverlay);

          const isFitRightEdge = current.scrollLeft + current.clientWidth === totalActualWidth;
          isFitRightEdge
            ? addClassName(elementForClass, edgeClasses.rightOverlay)
            : removeClassName(elementForClass, edgeClasses.rightOverlay);
        } else {
          calculateFitTopEdge();
        }
      };
      immediately && handler();
      return handler;
    }
  };
};

export function useFixedShadow<T>({
  columns,
  containerWidth,
  columnWidths,
  rowSelection,
  scrollbarSize
}: Pick<ITable<T>, 'columns' | 'containerWidth' | 'rowSelection'> & {
  columnWidths: number[];
  scrollbarSize: number;
}) {
  const lastScrollLeftRef = useRef(-1);
  const xScrollable = isXScroll({ columnWidths, containerWidth, rowSelection });
  const [state, setState] = useState<UseFixedShadowState>(() =>
    genShadowState({ columns, lastScrollLeftRef, xScrollable })
  );

  useEffect(() => {
    setState(genShadowState({ columns, lastScrollLeftRef, xScrollable }));
  }, [columns, columnWidths, rowSelection, containerWidth]);

  return {
    ...state,
    genShadows: () => {
      if (!xScrollable) {
        return;
      }
      const { lastLeftFixedColumnIndex: lIndex, fisrtRightFixedColumnIndex: rIndex } = state;
      let leftShadowDivWidth = rowSelection ? rowSelectionDefaultConfig.columnWidth : 0;
      let rightShadowDivWidth = 0;
      if (!isNil(lIndex)) {
        leftShadowDivWidth += columnWidths
          .slice(0, lIndex + 1)
          .reduce((acc, item) => acc + item, 0);
      }
      if (!isNil(rIndex)) {
        rightShadowDivWidth =
          columnWidths.slice(rIndex).reduce((acc, item) => acc + item, 0) + scrollbarSize;
      }
      return (
        <>
          {<ReactiveShadow />}
          {!!leftShadowDivWidth && <LeftShadow width={leftShadowDivWidth} />}
          {rightShadowDivWidth > 0 ? (
            <RightShadow width={rightShadowDivWidth} />
          ) : (
            <ZeroRightShadow width={zeroShadowWidth} />
          )}
        </>
      );
    }
  };
}
