import { Neutral600 } from '@/components/colors';
import styled, { css } from 'styled-components';
import { HierarchyTableNode } from '../../../types';

const expandedMixin = css<Pick<HierarchyTableNode<any>, 'expanded'>>`
  ${props =>
    props.expanded
      ? ``
      : `
    i > svg {
      transform: rotate(-90deg);
    }
  `}
`;
const hasChildrenMixin = css<{ hasChildren?: boolean }>`
  ${props =>
    props.hasChildren
      ? ``
      : `
    pointer-events: none;
    visibility: hidden;
  `}
`;
export const ArrowWapper = styled.div<
  Pick<HierarchyTableNode<any>, 'expanded'> & { hasChildren?: boolean }
>`
  width: 16px;
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  i {
    color: ${Neutral600};
    line-height: 1;
    height: 100%;
  }
  ${expandedMixin}
  ${hasChildrenMixin}
`;

export const ArrowIcon = ({ size = 12 }: { size?: number }) => (
  <i style={{ fontSize: size, height: size, width: size }}>
    <svg
      viewBox="0 0 1024 1024"
      data-icon="caret-down"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"></path>
    </svg>
  </i>
);
