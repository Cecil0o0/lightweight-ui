import styled from 'styled-components';
import { IInner } from '../types';
import { borderStyleText } from '../shared/default-config';
import { forwardRef, RefObject } from 'react';

// 用于写 cell 样式
export const Wrapper = styled.div`
  position: relative;
  overflow: hidden;
  box-sizing: content-box;
  [role='row'] {
    border-bottom: ${borderStyleText};
    line-height: 1.5;
    [role='cell'][aria-colindex='0'] {
      padding-left: 12px;
    }
    [role='cell']:not([aria-colindex='0']) {
      padding: 0 12px;
    }
    [role='cell'] {
      display: flex;
      align-items: center;
      background-color: #fff;
      height: 100%;
    }
  }
`;

export const Inner = forwardRef(({ children, style }: IInner, ref) => {
  return (
    <Wrapper role="inner" ref={ref as RefObject<HTMLDivElement>} style={style}>
      {children}
    </Wrapper>
  );
});
