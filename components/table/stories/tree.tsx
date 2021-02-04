/* eslint-disable no-console */
import { EllipsisTooltip, Table } from '@/components';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { nanoid } from 'nanoid';
import React, { ReactNode, useState } from 'react';

export interface Column<T> {
  key?: string;
  title?: (() => string | ReactNode) | string;
  width?: number;
  minWidth?: number;
  fixed?: 'left' | 'right' | boolean;
  dataIndex?: string;
  dynamicHeight?:
    | boolean
    | {
        enableTextOptimize: boolean;
        maxHeight?: number;
        factors: {
          lineHeight: number;
          fontSize?: number;
          fontWeight?: number | 'normal' | 'bold' | 'lighter' | 'bolder';
          fontFamily?: string;
        };
        getTextContent(text: any, entity: T, index: number): string;
      };
  render?: (value: any, entity: T, index: number) => ReactNode;
  align?: 'flex-start' | 'center' | 'flex-end';
  className?: string;
}

interface TreeNodeData extends AsyncNodeData, AdjacencyNodeData {}
interface AsyncNodeData {
  hasChild?: boolean;
}
interface AdjacencyNodeData {
  id: string;
  parentID?: string;
}

interface ITableData extends TreeNodeData {
  id: string;
  indexA?: string;
  indexB?: string;
  indexC?: string;
  indexD?: string;
  indexE?: string;
}

const asyncData: ITableData[] = [
  {
    id: nanoid(),
    indexA: `children row`
  },
  {
    id: nanoid(),
    indexA: `children row`
  },
  {
    id: nanoid(),
    indexA: `children row`
  }
];

const initialPageSize = 400;

function genDataSource({ pageSize = initialPageSize, extraContent = '' }: any = {}) {
  const data: any[] = Array.from({ length: pageSize }).map((_, j) => {
    const obj = {
      id: nanoid(),
      indexA: `row-${j}-element`,
      indexB: `row-${j}-title`,
      indexC: `row-${j}-button${extraContent}`,
      indexD: `row-${j}-title`,
      indexE: `opts`,
      indexG: `row-${j}-titlerow-${j}`,
      parentID: 'root'
    };
    if (j === 0) {
      return {
        id: 'root',
        indexA: "It's root."
      };
    }
    if (j === 1) {
      Object.assign(obj, {
        hasChild: true
      });
    }
    return obj;
  });

  return data;
}

const observedValue = observable<{
  selectedRowKeys: string[];
}>({
  selectedRowKeys: []
});

const defaultColumns: Column<ITableData>[] = [
  {
    title: () => {
      return observedValue.selectedRowKeys.length
        ? `已选中${observedValue.selectedRowKeys.length}项`
        : 'Column A';
    },
    dataIndex: 'indexA',
    minWidth: 200,
    fixed: true,
    render(text: string) {
      return <EllipsisTooltip title={text}>{text}</EllipsisTooltip>;
    }
  },
  {
    title: () => 'Column B',
    dataIndex: 'indexB',
    width: 200,
    fixed: 'left'
  },
  {
    title: () => 'Column D',
    dataIndex: 'indexD',
    minWidth: 600
  },
  {
    title: () => 'Column C',
    dataIndex: 'indexC',
    width: 200,
    render(text) {
      return <EllipsisTooltip title={text}>{text}</EllipsisTooltip>;
    }
  },
  {
    title: () => 'Column E',
    dataIndex: 'indexE',
    minWidth: 200
  },
  {
    title: () => 'Column F',
    dataIndex: 'indexF',
    minWidth: 100
  },
  {
    title: () => 'Column G',
    dataIndex: 'indexG',
    width: 400
  }
];

const dataSourcePagesRef = {
  current: genDataSource()
};

export const Tree = observer(() => {
  const [dataSource] = useState(dataSourcePagesRef.current);
  const [columns] = useState(defaultColumns);
  const { selectedRowKeys } = observedValue;
  return (
    <div style={{ width: '100%', height: 500 }}>
      <Table<ITableData>
        className="company-table"
        dataSource={dataSource}
        columns={columns}
        loading={false}
        rowClassName="table-row"
        rowHeight={44}
        layoutVertical="fill"
        rowSelection={{
          selectedRowKeys,
          onChange(selectedKeys) {
            observedValue.selectedRowKeys = selectedKeys;
          }
        }}
        treeMode={{
          loadMore: async node => {
            return asyncData.slice().map((d: ITableData) => ({
              ...d,
              parentID: node.data.id
            }));
          }
        }}
      />
    </div>
  );
});

export default Tree;
