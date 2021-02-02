import styled, { createGlobalStyle } from 'styled-components';
import { IHead } from '../types';
import { stickyZIndex, edgeClasses, everyHorizontalPadding } from '../shared/default-config';
import { forwardRef, RefObject } from 'react';

const ReactiveBorderBottom = createGlobalStyle`
  .${edgeClasses.topOverlay} [role='head-row'] {
    border-bottom-color: transparent;
  }
`;

// 用于写 cell 样式
const Wrapper = styled.div`
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: ${stickyZIndex.header};
  [role='head-row'] {
    display: flex;
    [role='cell'][aria-colindex='0'] {
      padding-left: 12px;
    }
    [role='cell']:not([aria-colindex='0']) {
      padding: 0 ${everyHorizontalPadding}px;
    }
    [role='cell'] {
      display: flex;
      align-items: center;
      background-color: #fff;
      height: 100%;
    }
  }
`;

export const Head = forwardRef(function({ children }: IHead, ref) {
  return (
    <Wrapper role="head-wrapper" ref={ref as RefObject<HTMLDivElement>}>
      <ReactiveBorderBottom />
      {children}
    </Wrapper>
  );
});
