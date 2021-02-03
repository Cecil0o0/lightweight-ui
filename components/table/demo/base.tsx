/* eslint-disable no-console */
import { AdminVirtualTable } from '..';
import { Input, Button, Tooltip, ButtonGroup } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { debounce, isNil, isUndefined } from 'lodash';
import { nanoid } from 'nanoid';
import React, { ChangeEvent, ReactNode, useState } from 'react';
import styled from 'styled-components';

const Controller = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  > * {
    margin-right: 10px;
  }
`;

const OverwriteStyle = styled.div`
  .sortable-column-btn-wrapper {
    margin-left: 10px;
  }
`;

interface Info {
  indexA: string;
  indexB: string;
  indexC: string;
}

interface AsyncNodeData {
  hasChild?: boolean;
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

interface ITableData extends AsyncNodeData {
  id: string;
  indexA?: string;
  indexB?: string;
  indexC?: string;
  indexD?: string;
  indexE?: string;
}
const initialTotal = 10600;
const initialPageSize = 200;

function genDataSource({
  total = initialTotal,
  pageSize = initialPageSize,
  extraContent = ''
}: any = {}) {
  const data: any[] = [];

  for (let i = 1; i <= total / pageSize; i++) {
    data.push(
      Array.from({ length: pageSize }).map((_, j) => ({
        id: nanoid(),
        indexA: `page-${i}-row-${j}-element`,
        indexB: `page-${i}-row-${j}-title`,
        indexC: `page-${i}-row-${j}-button${extraContent}`,
        indexD: `page-${i}-row-${j}-title`,
        indexE: `opts`,
        indexG: `page-${i}-row-${j}-titlepage-${i}-row-${j}`,
        parentID: 'root'
      }))
    );
  }
  return data;
}

const dataSourcePagesRef = {
  current: genDataSource({
    extraContent: '12'
  })
};

// const defaultSelectorColumns = [
//   {
//     name: 'indexA',
//     disabled: true,
//   },
//   {
//     name: 'indexB',
//   },
//   {
//     name: 'indexC',
//   },
//   {
//     name: 'indexD',
//   },
//   {
//     name: 'indexE',
//   },
//   {
//     name: 'indexF',
//   },
//   {
//     name: 'indexG',
//   },
// ].map(({ name, disabled }, i) => ({
//   key: name,
//   name: () => name,
//   checked: true,
//   disabled,
// }));

const defaultColumns: Column<Info>[] = [
  {
    title: () => 'Column A',
    dataIndex: 'indexA',
    minWidth: 200,
    fixed: true,
    render(text) {
      return <div>{text}</div>;
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
    width: 300,
    fixed: 'right',
    render() {
      return 'options';
    }
  }
];

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

export const Base = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [columns, setColumns] = useState<any[]>(defaultColumns);
  // const [selectorColumns, setSelectorColumns] = useState<any[]>(defaultSelectorColumns);
  const [page, setPage] = useState(0);
  const [dataSource, setDataSource] = useState(dataSourcePagesRef.current[0]);

  const handler1 = createCommonHandler((value?: number) => {
    if (isUndefined(value) || value === 0) value = 200;
    const newColumns = defaultColumns.slice();
    newColumns.find((item) => item.dataIndex === 'indexD')!.minWidth = value;
    setColumns(newColumns);
  });

  return (
    <OverwriteStyle>
      <Controller>
        <ButtonGroup variant="text" color="secondary" size="small">
          <Button
            onClick={() => {
              setSelectedRowKeys([]);
            }}
          >
            清空选中行
          </Button>
          <Button
            onClick={() => {
              const selected = dataSource.slice(0, 10).map((data: any) => data.id);
              setSelectedRowKeys(selected);
            }}
          >
            清空并选中选中当前页前10行
          </Button>
        </ButtonGroup>
        <Input
          placeholder="调整`Column D`列宽"
          onChange={handler1}
          style={{ width: 180 }}
          type="small"
        />
      </Controller>
      <Alert style={{ margin: '10px 0' }} color="info" severity="info">
        固定右侧操作栏以及浮层操作栏的目标几乎一致，建议两种设计取其一。
      </Alert>
      <div style={{ width: '100%', height: 500 }}>
        <AdminVirtualTable<ITableData>
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
          onRow={(record, index) => ({
            onClick(e) {
              console.log(e.type, 'onclick row', record, index);
            },
            onDoubleClick(e) {
              console.log(e.type, 'onDoubleClick row', record, index);
            },
            onContextMenu(e) {
              console.log(e.type, 'onContextMenu row', record, index);
            }
          })}
          pagination={{
            page,
            count: initialTotal,
            rowsPerPage: initialPageSize,
            rowsPerPageOptions: [200],
            onChangePage(e, page) {
              setPage(page);
              setDataSource(dataSourcePagesRef.current[page]);
            },
            nextIconButtonProps: {
              size: 'small',
              color: 'secondary'
            },
            backIconButtonProps: {
              size: 'small',
              color: 'secondary'
            }
          }}
          opts={[
            <Button key="a">操作A</Button>,
            <Button key="b">操作B</Button>,
            <Button key="c">操作C</Button>
          ]}
        />
      </div>
    </OverwriteStyle>
  );
};

export default Base;
