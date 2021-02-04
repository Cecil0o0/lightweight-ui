/* eslint-disable no-console */
import { Table } from '..';
import { Input, Button, Tooltip } from '@material-ui/core';
import { AccessTime as AccessTimeIcon } from '@material-ui/icons';
import { Blue50, Blue500 } from '../../colors';
import { debounce, isNil, isUndefined } from 'lodash';
import { nanoid } from 'nanoid';
import React, { ChangeEvent, ReactNode, useRef, useState } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { arrayMove } from '../utils';

const Controller = styled.div`
  display: flex;
  align-items: center;
  > * {
    margin-right: 10px;
  }
`;

const OverwriteStyle = styled.div``;

interface Info {
  indexA: string;
  indexB: string;
  indexC: string;
}

interface Column<T> {
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

const defaultColumns: Column<Info>[] = [
  {
    title: () => 'Column A',
    dataIndex: 'indexA',
    minWidth: 200,
    fixed: true,
    render(text) {
      return <div title={text}>{text}</div>;
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
    dynamicHeight: {
      enableTextOptimize: true,
      factors: {
        lineHeight: 20,
        fontSize: 14,
        fontWeight: 400
      },
      getTextContent(text) {
        return text;
      }
    },
    render(text, _, index) {
      return (
        <Tooltip title={text}>
          <div
            style={{
              wordBreak: 'break-all',
              display: 'flex',
              alignItems: 'center',
              lineHeight: '20px',
              fontSize: 14,
              fontWeight: 400
            }}
          >
            {text}
          </div>
        </Tooltip>
      );
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

const initialTotal = 600;
const initialPageSize = 200;

function genSortableDataSource({
  total = initialTotal,
  pageSize = initialPageSize,
  extraContent = ''
}: any = {}) {
  const data: any[] = [];

  for (let i = 1; i <= total / pageSize; i++) {
    data.push(
      Array.from({ length: pageSize }).map((_, j) => {
        if (j === 0 || j === 1 || j === 2 || j === 3) {
          return {
            id: nanoid(),
            indexA: `page-${i}-row-${j}-element`,
            indexB: `page-${i}-row-${j}-title`,
            indexC: `page-${i}-row-${j}-button${extraContent}`,
            indexD: `page-${i}-row-${j}-titlepage-${i}-row-${j}`,
            indexE: `opts`,
            draggable: true
          };
        }
        return {
          id: nanoid(),
          indexA: `page-${i}-row-${j}-element`,
          indexB: `page-${i}-row-${j}-title`,
          indexC: `page-${i}-row-${j}-button${extraContent}`,
          indexD: `page-${i}-row-${j}-titlepage-${i}-row-${j}-titlepage-${i}-row-${j}-titlepage-${i}-row-${j}-titlepage-${i}-row-${j}-titlepage-${i}-row-${j}-titlepage-${i}-row-${j}-titlepage-${i}-row-${j}-titlepage-${i}`,
          indexE: `opts`,
          draggable: false
        };
      })
    );
  }
  return data;
}

const sortablaDataSourcePagesRef = {
  current: genSortableDataSource()
};

const createCommonHandler = (func: any) => {
  const debounced = debounce((value) => {
    if (/[^\d]+/.test(value)) return;
    if (Number(value) > 2000) {
      alert(
        'Is width of one column more than 2,000 pixels? You must be kidding me! Try a smaller number again.🙅‍♂️'
      );
      return;
    }
    func(isNil(value) ? undefined : Number(value));
  }, 500);

  return (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    return debounced(value);
  };
};

export const Sortable = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [columns, setColumns] = useState<any[]>(defaultColumns);
  const [page, setPage] = useState(1);
  const [dataSource, setDataSource] = useState(sortablaDataSourcePagesRef.current[0]);
  const clearSelectedHandleRef = useRef<() => void | undefined>();

  const handler1 = createCommonHandler((value?: number) => {
    if (isUndefined(value)) value = 200;
    const newColumns = defaultColumns.slice();
    newColumns.find((item) => item.dataIndex === 'indexD')!.minWidth = value;
    setColumns(newColumns);
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    if (result.source.index === result.destination.index) {
      return;
    }
    const newRes = arrayMove(dataSource, result.source.index, result.destination.index);
    console.log(newRes);
    setDataSource(newRes);
  };

  return (
    <OverwriteStyle>
      <Controller>
        <Button
          onClick={() => {
            clearSelectedHandleRef.current && clearSelectedHandleRef.current();
            setSelectedRowKeys([]);
          }}
        >
          清空选中行
        </Button>
        <Input placeholder="调整`Column D`列宽" onChange={handler1} style={{ width: 180 }} />
      </Controller>
      <div style={{ width: '100%', height: 500 }}>
        <Table<{
          id: string;
          indexA: string;
          indexB: string;
          indexC: string;
          indexD: string;
          indexE: string;
        }>
          className="company-table"
          dataSource={dataSource}
          columns={columns}
          loading={false}
          rowClassName="table-row"
          rowHeight={44}
          layoutVertical="fill"
          rowSelection={{
            selectedRowKeys,
            onChange(changedSelectedRowKeys, changedSelectRows) {
              console.log(changedSelectedRowKeys, changedSelectRows);
              setSelectedRowKeys(changedSelectedRowKeys);
            }
          }}
          pagination={{
            page,
            count: initialTotal,
            rowsPerPage: initialPageSize,
            rowsPerPageOptions: [200],
            onChangePage(e, page) {
              setPage(page);
              setDataSource(sortablaDataSourcePagesRef.current[page]);
            }
          }}
          opts={[
            <Button key="reassign">操作离职</Button>,
            <AccessTimeIcon
              key="calendar"
              style={{ color: Blue500 }}
              onClick={(e: any) => console.log(e.detail.row, e.detail.index)}
            />,
            ({ row, index }) => {
              if (index === 5) return;
              return <AccessTimeIcon key="country" style={{ color: Blue500 }} />;
            },
            <AccessTimeIcon style={{ color: Blue500 }} key="safe" />
          ]}
          sortable
          refreshRowHeightsAfterDrag
          onDragEnd={handleDragEnd}
          isSortableRow={(data) => data.draggable}
        />
      </div>
    </OverwriteStyle>
  );
};

// export default {
//   title: 'Table'
// };
