import { flatten } from 'lodash';
import React, { ReactElement, useEffect, useRef } from 'react';
import { IUseRowSelection } from '../types';
import { Checkbox } from '@material-ui/core';
import { rowSelection as defaultRowSelectionConfig } from '../shared/default-config';

export function useRowSelection({
  pagination,
  dataSource,
  rowSelection,
}: IUseRowSelection): {
  headerCheckbox: ReactElement;
  BodyCheckbox: ({ index }: { index: number }) => ReactElement;
} {
  const innerRowSelectionCacheRows = useRef<any>({});
  const cachedRows = useRef<any[]>([]);
  useEffect(() => {
    const cacheKey = pagination && pagination.current ? pagination.current : -1;
    innerRowSelectionCacheRows.current[cacheKey] = Array.from(dataSource);

    cachedRows.current = flatten(Object.values(innerRowSelectionCacheRows.current));
    return () => {
      innerRowSelectionCacheRows.current = {};
      cachedRows.current = [];
    };
  }, [dataSource, pagination && pagination?.current]);

  if (!rowSelection) {
    return {
      headerCheckbox: <></>,
      BodyCheckbox: () => <></>,
    };
  }

  const { selectedRowKeys, onChange } = rowSelection;
  // 是否全选
  const isSelectedAll =
    selectedRowKeys?.length > 0 &&
    dataSource.every((data) => selectedRowKeys.find((key) => key === data.id));
  // 是否有半选样式
  const indeterminate =
    !isSelectedAll && dataSource.some((data) => selectedRowKeys.find((key) => key === data.id));

  return {
    headerCheckbox: (
      <Checkbox
        size="small"
        indeterminate={indeterminate}
        checked={isSelectedAll}
        onChange={() => {
          if (typeof onChange !== 'function') return;
          if (!isSelectedAll) {
            onChange(
              dataSource.map((item) => item[defaultRowSelectionConfig.defaultKey as 'id']),
              dataSource
            );
          } else {
            onChange([], []);
          }
        }}
      ></Checkbox>
    ),
    BodyCheckbox: ({ index }) => {
      const rowKey = dataSource[index][defaultRowSelectionConfig.defaultKey as 'id'];
      const checked = selectedRowKeys.includes(rowKey);
      return (
        <Checkbox
          checked={checked}
          size="small"
          onChange={() => {
            if (typeof onChange !== 'function') return;
            let rowKeys;
            if (checked) {
              const copied = selectedRowKeys.slice();
              copied.splice(
                selectedRowKeys.findIndex((item) => item === rowKey),
                1
              );
              rowKeys = copied;
            } else {
              rowKeys = selectedRowKeys.concat(rowKey);
            }
            const rows = [];
            const map = new Map(
              cachedRows.current.map((value) => [
                value[defaultRowSelectionConfig.defaultKey as 'id'],
                value,
              ])
            );
            for (let i = 0; i < rowKeys.length; i++) {
              rows.push(map.get(rowKeys[i]));
            }
            onChange(rowKeys, rows);
          }}
        />
      );
    },
  };
}
