import { ReactNode, ReactElement, MutableRefObject, CSSProperties, MouseEventHandler } from 'react';
import { ListChildComponentProps, GridChildComponentProps, VariableSizeList } from 'react-window';
import { TablePaginationProps } from '@material-ui/core';
import {
  DragStart as DndDragStart,
  DragUpdate as DndDragUpdate,
  DropResult as DndDropResult
} from 'react-beautiful-dnd';
import { HierarchyNode } from 'd3-hierarchy';

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

type OPT<T> = ((params: InfoForOptClick<T>) => ReactNode) | ReactElement;
type IOpts<T> = OPT<T>[] | ((param: InfoForOptClick<T>) => ReactNode);

type DivElementRef = MutableRefObject<HTMLDivElement | undefined | null>;

export type ILoadMore<T> = (node: HierarchyTableNode<T>) => Promise<(T & TreeNodeData)[]>;

export interface RowHandlers {
  onClick?: MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: MouseEventHandler<HTMLDivElement>;
  onContextMenu?: MouseEventHandler<HTMLDivElement>;
}

export interface IAdminVirtualTable<T> {
  dataSource: T[];
  columns: Column<T>[];
  loading?: boolean;
  headerProps?: {
    fixedHeight?: number;
  };
  opts?: IOpts<T>;
  rowClassName?: string;
  rowSelection?: {
    selectedRowKeys: string[];
    onChange: RowSelectionOnchange;
  };
  pagination?: any | null | false;
  activeIndex?: number;
  className?: string;
  emptyPlaceholder?: ReactNode;
  rowHeight?: number;
  layoutVertical?: LayoutVerticalType;
  sortable?: boolean;
  cloneRowClassName?: string; // 可拖拽时，给 renderCloneElem 加上类，使行中各项样式保持有效
  refreshRowHeightsAfterDrag?: boolean;
  isSortableRow?: (data: any) => boolean;
  onDragStart?: (initial: DndDragStart) => void;
  onBeforeDragStart?: (initial: DndDragStart) => void;
  onDragUpdate?: (initial: DndDragUpdate) => void;
  onDragEnd?: (result: DndDropResult) => void;
  renderPagination?: (props: {
    innerPagination: ReactElement;
    containerWidth: number;
  }) => ReactElement;
  treeMode?: {
    // 使用 table 结构数据且异步加载时
    loadMore?: ILoadMore<T>;
  };
  onRow?: (record: T | HierarchyNode<T>, index: number) => RowHandlers;
}

export type DragStart = DndDragStart;
export type DragUpdate = DndDragUpdate;
export type DropResult = DndDropResult;

export enum LayoutVertical {
  FLUID = 'fluid',
  FILL = 'fill'
}

export type LayoutVerticalType = 'fluid' | 'fill';

export type RowSelectionOnchange = (selectedRowKeys: string[], selecteRows: any[]) => void;

export interface ITable<T> extends IAdminVirtualTable<T> {
  containerWidth: number;
  containerHeight: number;
}

export interface IBodyCell<T>
  extends Pick<ITable<T>, 'dataSource' | 'columns'>,
    GridChildComponentProps {}

export interface IRow<T> extends ListChildComponentProps {
  data: {
    columnWidths: number[];
    setHoverRow: (params: ISetHoverRow) => void;
    removeExtraOpts: Function;
    scrollContainerRef: DivElementRef;
    headWrapperRef: DivElementRef;
    cacheRows: T[];
    BodyCheckbox: ({ index }: { index: number }) => ReactElement;
    treeTableModel: TreeTableModel<T>;
  } & Pick<
    ITable<T>,
    | 'dataSource'
    | 'columns'
    | 'rowClassName'
    | 'rowSelection'
    | 'activeIndex'
    | 'isSortableRow'
    | 'containerWidth'
    | 'onRow'
  >;
}

export interface IHeadCell<T> extends Pick<ITable<T>, 'columns'>, ListChildComponentProps {}

export interface IInner extends Pick<ITable<any>, 'layoutVertical'> {
  children: ReactNode;
  style: CSSProperties;
}

export interface IHead {
  children: ReactNode;
}

export type listRefType = MutableRefObject<VariableSizeList | undefined | null>;

export interface IUseCellsMeasure<T>
  extends Pick<ITable<T>, 'columns' | 'dataSource' | 'containerWidth' | 'rowSelection'> {
  fixedRowHeight?: number;
  listRef: listRefType;
  tableInnerRef: DivElementRef;
}

export interface ICalculateMinWidth<T>
  extends Pick<ITable<T>, 'columns' | 'containerWidth' | 'rowSelection'> {}

export enum WIDTH_TYPE {
  INTERVAL = 'interval',
  FIXED = 'fixed',
  TO_BE_ALLOCATED = 'toBeAllocated'
}

export interface ISetRowHeightsByIndex {
  rowIndex: number;
  rowHeight: number;
}

export interface UseFixedShadowState {
  lastLeftFixedColumnIndex?: number;
  fisrtRightFixedColumnIndex?: number;
  createHandleScroll: (params: {
    scrollContainerRef: DivElementRef;
    totalActualWidth: number;
    elementForClassRef: DivElementRef;
    immediately?: boolean;
  }) => () => void;
}

export interface IUseExtraOpts<T> extends Pick<ITable<T>, 'opts'> {
  scrollContainerRef: DivElementRef;
  rowHeights: number[];
  tableInnerRef: DivElementRef;
  tableInnerHeight: number;
  headerHeight: number;
  yScrollable: boolean;
  xScrollable: boolean;
  scrollbarSize: number;
}

export interface InfoForOptClick<T> {
  row: T;
  index: number;
}
export interface ISetHoverRow extends InfoForOptClick<any> {
  top: number;
}

export interface IMeasurer {
  measure: (element: ReactElement, width: number) => { height: number };
  destroy: () => void;
}

export interface IUseSizeAndScroll
  extends Pick<ITable<any>, 'rowSelection' | 'containerWidth' | 'containerHeight'> {
  propHeaderHeight?: number;
  rowHeights: number[];
  columnWidths: number[];
  containerHeight: number;
  paginationHeight: number;
  paginationPaddingTop: number;
  tableWrapperRef: DivElementRef;
  layoutVertical: LayoutVerticalType;
}

export interface IUseRowSelection
  extends Pick<ITable<any>, 'rowSelection' | 'pagination' | 'dataSource'> {}

export interface IUseTreeShape extends Pick<ITable<any>, 'dataSource' | 'treeMode' | 'columns'> {}

export interface TreeNodeData extends AsyncNodeData, AdjacencyNodeData {}
export interface HierarchyTableNode<T> extends HierarchyNode<T & TreeNodeData> {
  expanded?: boolean;
  visible?: boolean;
  loaded?: boolean;
}
export interface AsyncNodeData {
  hasChild?: boolean;
}
export interface AdjacencyNodeData {
  id: string;
  parentID?: string;
}
export interface TreeTableModel<T> {
  renderTreePart: (props: { node: HierarchyTableNode<T> }) => ReactElement;
  tabularData?: HierarchyNode<T>[];
  inTreeMode: boolean;
}
