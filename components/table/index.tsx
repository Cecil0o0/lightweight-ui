import ListTable from './components/list-table';
import LazyAutoSizer from './components/lazy-auto-sizer';
import { ITableInner } from './types';

function Table<T extends { id: string }>(props: ITableInner<T>) {
  return (
    <LazyAutoSizer debounceTrigger>
      {({ width, height }) => {
        return <ListTable<T> {...props} containerWidth={width} containerHeight={height} />;
      }}
    </LazyAutoSizer>
  );
}

export { Table };
export * from './types';
export { useExtraOptsApp } from './hooks/extra-opts-app';
