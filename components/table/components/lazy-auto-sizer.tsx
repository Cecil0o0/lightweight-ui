import { memo, useRef, useState } from 'react';
import AutoSizer, { AutoSizerProps } from 'react-virtualized-auto-sizer';
import { nanoid } from 'nanoid';

const ChildrenWrapper = memo(
  ({ children }: any) => {
    return <>{children}</>;
  },
  function areEqual(prevProps, nextProps) {
    // espace from memo
    if (
      prevProps.containerSize.width === nextProps.containerSize.width &&
      prevProps.containerSize.height === nextProps.containerSize.height
    ) {
      return false;
    }
    if (nextProps.frameId === prevProps.frameId) {
      return true;
    }

    return false;
  }
);

const defaultDelay = 150;

export function LazyAutoSizer({
  debounceTrigger,
  children,
  ...restProps
}: AutoSizerProps & { debounceTrigger?: boolean }) {
  const lastSizeRef = useRef({ lastTriggerTime: 0, timer: 0 });
  // 在父 DOM 频繁 resize 的场景中，为每个有意义的帧定义 id，当且仅当 id 变更时才更新否则缓存。
  // 比如通讯录动画、浏览器窗口 resize 等
  const [frameId, setFrameId] = useState('');
  return (
    <AutoSizer {...restProps}>
      {childParam => {
        if (debounceTrigger) {
          const { lastTriggerTime } = lastSizeRef.current;
          const now = Date.now();
          if (now - lastTriggerTime <= defaultDelay || lastTriggerTime === 0) {
            Object.assign(lastSizeRef.current, { lastTriggerTime: now });
            clearTimeout(lastSizeRef.current.timer);
            lastSizeRef.current.timer = setTimeout(() => {
              setFrameId(nanoid(10));
              requestAnimationFrame(() => {
                clearTimeout(lastSizeRef.current.timer);
                Object.assign(lastSizeRef.current, { lastTriggerTime: 0, timer: 0 });
              });
            }, defaultDelay);
          }
        }
        return (
          <ChildrenWrapper frameId={frameId} containerSize={childParam}>
            {children(childParam)}
          </ChildrenWrapper>
        );
      }}
    </AutoSizer>
  );
}

export default LazyAutoSizer;
