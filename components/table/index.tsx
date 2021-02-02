import ListTable from './components/list-table';
import LazyAutoSizer from './components/lazy-auto-sizer';
import { IAdminVirtualTable } from './types';

function AdminVirtualTable<T extends { id: string }>(props: IAdminVirtualTable<T>) {
  return (
    <LazyAutoSizer debounceTrigger>
      {({ width, height }) => {
        return <ListTable<T> {...props} containerWidth={width} containerHeight={height} />;
      }}
    </LazyAutoSizer>
  );
}

export { AdminVirtualTable };
export * from './types';
export { useExtraOptsApp } from './hooks/extra-opts-app';
