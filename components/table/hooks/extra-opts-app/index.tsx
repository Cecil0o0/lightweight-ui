import { ExtraOptsAppSupport, ExtraOptsApp, ExtraOptsAppInner, collapsedClassName } from './styled';
import { cloneElement, useRef, useEffect, MutableRefObject, ReactNode, useMemo } from 'react';
import { IUseExtraOpts, InfoForOptClick, ISetHoverRow } from '../../types';
import { body as bodyDefaultConfig } from '../../shared/default-config';
import ReactDOM from 'react-dom';
import { IconButton } from '@material-ui/core';
import cn from 'classnames';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

const display = 'block';
const hoverClass = 'hover';

interface IVanishOverlay {
  appRef: MutableRefObject<HTMLDivElement | undefined | null>;
}
interface IRemoveHoverRowClass {
  hoverRowRef: MutableRefObject<HTMLDivElement | undefined>;
}

// Actions
const removeHoverRowClass = ({ hoverRowRef }: IRemoveHoverRowClass) => {
  if (hoverRowRef.current && hoverRowRef.current.className.includes(hoverClass)) {
    hoverRowRef.current.classList.remove(hoverClass);
  }
};
const addHoverRowClass = (
  scrollContainerRef: MutableRefObject<HTMLDivElement | null | undefined>,
  hoverRowRef: MutableRefObject<HTMLDivElement | undefined>,
  rowIndex: number
) => {
  if (!scrollContainerRef.current) return;
  const el = scrollContainerRef.current.querySelector(
    `[aria-rowindex='${rowIndex}']`
  ) as HTMLDivElement;
  if (!el) return;
  el.classList.add(hoverClass);
  hoverRowRef.current = el;
};
const vanishOverlay = ({ appRef }: IVanishOverlay) => {
  // 隐藏 overlay 元素
  const el = appRef.current;
  el && el.style.display === display && (el.style.display = 'none');
};
const showOverlay = ({ appRef }: IVanishOverlay) => {
  // 显示 overlay 元素
  const el = appRef.current;
  el && el.style.display !== display && (el.style.display = display);
};
const removeAll = ({ appRef, hoverRowRef }: IVanishOverlay & IRemoveHoverRowClass) => {
  removeHoverRowClass({ hoverRowRef });
  vanishOverlay({ appRef });
};
const toggleOpts = ({ appRef }: IVanishOverlay) => {
  // toggle overlay
  const el = appRef.current;
  if (el && el) {
    el.classList.toggle(collapsedClassName);
  }
};

const PlainHOC = ({ children }: any) => <>{children}</>;

export function useExtraOptsApp<T>({
  opts,
  scrollContainerRef,
  rowHeights,
  tableInnerRef,
  tableInnerHeight,
  headerHeight,
  yScrollable,
  xScrollable,
  scrollbarSize,
}: IUseExtraOpts<T>) {
  const rowInfo = useRef<InfoForOptClick<T>>();
  const appRef = useRef<HTMLDivElement>(null);
  const hoverRowRef = useRef<HTMLDivElement>();
  const removeExtraOpts = useMemo(() => () => removeAll({ appRef, hoverRowRef }), []);
  const preShowExtraOpts = (_top: number, itemHeight: number) =>
    _top >= headerHeight &&
    _top + itemHeight + (xScrollable ? scrollbarSize : 0) <= tableInnerHeight;

  const RenderExtraOptsApp = useMemo<any>(() => {
    return ({ children }: { children: ReactNode }) => {
      return (
        <ExtraOptsAppSupport role="extra-opts-app-wrapper">
          {children}
          <ExtraOptsApp role="extra-opts-app" ref={appRef} preserveScrollWidth={yScrollable}>
            <ExtraOptsAppInner />
          </ExtraOptsApp>
        </ExtraOptsAppSupport>
      );
    };
  }, [yScrollable]);

  const transformWheelEvent = (e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += e.deltaX;
      Math.abs(e.deltaY) > 3 && (scrollContainerRef.current.scrollTop += e.deltaY);
    }
  };

  useEffect(() => {
    if (appRef.current) {
      appRef.current.addEventListener('wheel', transformWheelEvent, {
        passive: false,
      });
      return () => {
        appRef.current && appRef.current.removeEventListener('wheel', transformWheelEvent);
      };
    }
  }, [appRef.current, tableInnerHeight, rowHeights]);

  useEffect(() => {
    if (tableInnerRef.current) {
      tableInnerRef.current.addEventListener('mouseleave', removeExtraOpts);
      return () => {
        if (tableInnerRef.current) {
          tableInnerRef.current.removeEventListener('mouseleave', removeExtraOpts);
        }
      };
    }
  }, [tableInnerRef.current]);

  return {
    RenderExtraOptsApp: !!opts?.length ? RenderExtraOptsApp : PlainHOC,
    setHoverRow: ({ top, row, index }: ISetHoverRow) => {
      let scrollTop = 0;
      removeHoverRowClass({ hoverRowRef });
      addHoverRowClass(scrollContainerRef, hoverRowRef, index + 1);

      rowInfo.current = { row, index };
      if (scrollContainerRef.current) {
        scrollTop = scrollContainerRef.current.scrollTop;
      }
      const _top = top + headerHeight - scrollTop;
      const itemHeight = rowHeights[index];
      const ele = appRef.current;
      if (!ele) return;
      if (preShowExtraOpts(_top, itemHeight)) {
        showOverlay({ appRef });
        ele.style.top = `${_top}px`;
        ele.style.height = `${rowHeights[index] - bodyDefaultConfig.borderSize}px`;
        let content;
        if (!opts) return;
        if (typeof opts === 'function') {
          content = opts(rowInfo.current!);
        } else {
          content = opts.map((opt, key) => {
            let child;
            if (typeof opt === 'function') {
              child = opt(rowInfo.current!);
            } else {
              const { onClick } = opt.props;
              child = onClick
                ? cloneElement(opt, {
                    onClick(e: MouseEvent & { detail: InfoForOptClick<T> }) {
                      Object.assign(e, {
                        detail: rowInfo.current,
                      });
                      opt.props.onClick(e);
                    },
                  })
                : opt;
            }
            if (!child) return;
            return (
              <div className={cn('item', key === 0 && 'first')} key={key}>
                {child}
              </div>
            );
          });
        }
        ReactDOM.render(
          <>
            <span className="icon-wrapper">
              <IconButton size="small" onClick={() => toggleOpts({ appRef })} color="secondary">
                <ChevronLeftIcon />
              </IconButton>
            </span>
            {content}
          </>,
          ele.children[0]
        );
      } else {
        ele.style.display = 'none';
      }
    },
    removeExtraOpts,
  };
}
