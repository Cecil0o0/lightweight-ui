import styled from 'styled-components';
import { Neutral200 } from '@/components/colors';
import { fade, getScrollbarSize } from '../../utils';
import { stickyZIndex } from '../../shared/default-config';

export const ExtraOptsAppInner = styled.div``;
export const collapsedClassName = 'collapsed';

const itemsFadeOutTransition = 'opacity .1s ease-in-out';
const itemsFadeInTransition = 'opacity .5s ease-in-out';

export const ExtraOptsApp = styled.div<{ preserveScrollWidth: boolean }>`
  position: absolute;
  right: ${(props) => (props.preserveScrollWidth ? getScrollbarSize() : 0)}px;
  &:before {
    position: absolute;
    z-index: -1;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    content: '';
    display: block;
    opacity: 1;
    background: linear-gradient(to right, ${fade(Neutral200, 0)} 0%, ${Neutral200} 112px);
    transition: opacity 0.2s ease-in-out;
    pointer-events: none;
  }
  z-index: ${stickyZIndex.opts};
  display: none;
  padding-left: 112px;
  padding-right: 24px;
  pointer-events: none;
  ${ExtraOptsAppInner} {
    position: relative;
    display: flex;
    align-items: center;
    height: 100%;
    right: 0;
    transition: right 0.2s ease-in-out;
    > * {
      pointer-events: all;
    }
    .item {
      padding-left: 16px;
      opacity: 1;
      transition: ${itemsFadeInTransition};
      &.first {
        padding-left: 6px;
      }
    }
    .icon-wrapper {
      width: 44px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      &:before {
        content: '';
        opacity: 0;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
        z-index: -1;
        background: linear-gradient(to right, ${fade(Neutral200, 0)} 0%, ${Neutral200} 16.42%);
        position: absolute;
        transition: opacity 0.2s ease-in-out 0.2s;
        pointer-events: none;
      }
      svg {
        transform: rotate(180deg);
        transition: none;
      }
    }
  }
  &.${collapsedClassName} {
    pointer-events: none;
    &:before {
      opacity: 0;
    }
    ${ExtraOptsAppInner} {
      right: calc(20px - 100%);
      .item {
        opacity: 0;
        transition ${itemsFadeOutTransition};
      }
      .icon-wrapper {
        &:before {
          opacity: 1;
        }
        pointer-events: all;
      }
      svg {
        transform: rotate(0deg);
      }
    }
  }
`;

export const ExtraOptsAppSupport = styled.div``;
