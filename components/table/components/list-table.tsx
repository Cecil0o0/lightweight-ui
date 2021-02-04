import styled from 'styled-components';
import { VariableSizeList, ReactElementType } from 'react-window';
import { ITable, LayoutVertical, LayoutVerticalType } from '../types';
import { Row } from './row';
import { Head } from './head';
import { Inner, Wrapper as InnerWrapper } from './inner';
import { useCellsMeasure } from '../hooks/cells-measure';
import {
  header as headerDefaultConfig,
  body as bodyDefaultConfig,
  rowSelection as defaultRowSelectionConfig,
  overscanCount,
  scrollableClassNames,
  borderStyleText,
  edgeClasses
} from '../shared/default-config';
import { genStickyStyle } from '../shared';
import { usePagination } from '../hooks/pagination';
import React, { useRef, useMemo } from 'react';
import { EmptyTablePlaceholder } from './default-empty-placeholder';
import { Neutral100, Neutral200, Neutral300 } from '@/components/colors';
import { useFixedShadow } from '../hooks/shadow';
import { useExtraOptsApp } from '../hooks/extra-opts-app';
import { useSizeAndScroll } from '../hooks/size-and-scroll';
import cn from 'classnames';
import {
  DragDropContext,
  DraggableProvided,
  DraggableRubric,
  DraggableStateSnapshot,
  DraggingStyle,
  DragStart,
  DragUpdate,
  Droppable,
  DroppableProvided,
  DropResult
} from 'react-beautiful-dnd';
import { SortableRow } from './sortableRow';
import { NormalItem } from './normal-item';
import { arrayMove } from '../utils';
import { useRowSelection } from '../hooks/row-selection';
import { useTreeTableModel } from '../hooks/tree-table-model';

const ghostStyle = { margin: 0 };

const Wrapper = styled.div<{
  layoutVertical: LayoutVerticalType;
}>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  div {
    box-sizing: border-box;
  }
  [role='head-row'] {
    border-bottom: ${bodyDefaultConfig.borderSize}px solid ${Neutral300};
  }
  [role='row'] {
    border-bottom: ${borderStyleText};
    &.hover {
      [role='cell'] {
        background-color: ${Neutral200};
      }
    }
  }
  ${props =>
    props.layoutVertical === LayoutVertical.FLUID
      ? `
  &.${scrollableClassNames.xScrollable}.${scrollableClassNames.visiblePermanently}
    [role='row']:last-child {
    border-bottom: none;
  }
  `
      : `
  &.${scrollableClassNames.yScrollable}.${scrollableClassNames.xScrollable}.${scrollableClassNames.visiblePermanently}
    [role='row']:last-child {
    border-bottom: none;
  }
  `}
`;

// 拖拽行样式
const QuoteItemWrapper = styled(InnerWrapper)<{ width: number; left: number }>`
  [role='row'] {
    width: ${props => props.width}px !important;
    border-top: ${borderStyleText};
    overflow: hidden;
    left: ${props => props.left}px !important;
    [role='cell'] {
      flex: none;
      background-color: ${Neutral100} !important;
    }
  }
`;

export default function Table<T extends { id: string }>({
  containerWidth,
  containerHeight,
  columns,
  dataSource,
  headerProps = {
    fixedHeight: headerDefaultConfig.fixedHeight
  },
  opts,
  rowClassName,
  rowSelection,
  pagination,
  className,
  emptyPlaceholder,
  rowHeight,
  layoutVertical = 'fill',
  sortable = false,
  cloneRowClassName = '',
  refreshRowHeightsAfterDrag = false,
  isSortableRow,
  onDragEnd,
  onDragStart,
  onDragUpdate,
  onBeforeDragStart,
  renderPagination,
  treeMode,
  onRow
}: ITable<T>) {
  const listRef = useRef<VariableSizeList>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const headWrapperRef = useRef<HTMLDivElement>(null);
  const tableInnerRef = useRef<HTMLDivElement>(null);
  // listOuterRef
  const scrollContainerRef = useRef<HTMLDivElement>();
  // listInnerRef
  const tableBodyRef = useRef<HTMLDivElement>(null);

  const treeTableModel = useTreeTableModel<T>({
    dataSource,
    treeMode,
    columns
  });

  const { rowHeights, columnWidths, setRowHeights } = useCellsMeasure<T>({
    columns,
    dataSource: treeTableModel.inTreeMode ? (treeTableModel.tabularData as any[]) : dataSource,
    containerWidth,
    fixedRowHeight: rowHeight,
    rowSelection,
    listRef,
    tableInnerRef
  });
  const {
    paginationJSX,
    height: paginationHeight,
    paddingTop: paginationPaddingTop
  } = usePagination({ pagination, renderPagination, containerWidth, treeTableModel, listRef });

  const {
    xScrollable,
    yScrollable,
    totalActualWidth,
    tableInnerHeight,
    headerHeight,
    scrollbarSize
  } = useSizeAndScroll({
    propHeaderHeight: headerProps.fixedHeight,
    columnWidths,
    rowHeights,
    containerHeight,
    paginationHeight,
    paginationPaddingTop,
    rowSelection,
    containerWidth,
    tableWrapperRef,
    layoutVertical
  });

  const { createHandleScroll, genShadows } = useFixedShadow({
    columns,
    columnWidths,
    containerWidth,
    rowSelection,
    scrollbarSize
  });

  const { setHoverRow, removeExtraOpts, RenderExtraOptsApp } = useExtraOptsApp<T>({
    opts,
    scrollContainerRef,
    rowHeights,
    tableInnerRef,
    tableInnerHeight,
    headerHeight,
    yScrollable,
    xScrollable,
    scrollbarSize
  });

  const { headerCheckbox, BodyCheckbox } = useRowSelection({
    pagination,
    rowSelection,
    dataSource: treeTableModel.inTreeMode
      ? treeTableModel.tabularData!.map(d => d.data)
      : dataSource
  });

  const rowData = useMemo(() => {
    return {
      dataSource,
      columns,
      columnWidths,
      containerWidth,
      rowClassName,
      rowSelection,
      setHoverRow,
      removeExtraOpts,
      scrollContainerRef,
      headWrapperRef,
      isSortableRow,
      BodyCheckbox,
      treeTableModel,
      onRow
    };
  }, [
    dataSource,
    columns,
    columnWidths,
    containerWidth,
    rowClassName,
    rowSelection,
    setHoverRow,
    removeExtraOpts,
    scrollContainerRef,
    headWrapperRef,
    isSortableRow,
    BodyCheckbox,
    treeTableModel,
    onRow
  ]);

  const innerElementType = useMemo<ReactElementType>(
    () => ({ style, children }) => {
      let checkbox;
      if (rowSelection) {
        checkbox = (
          <div
            role="cell"
            aria-colindex={0}
            style={{
              width: defaultRowSelectionConfig.columnWidth,
              float: 'left',
              position: 'sticky',
              left: 0,
              zIndex: 150
            }}
          >
            {headerCheckbox}
          </div>
        );
      }
      return (
        <>
          <Head ref={headWrapperRef}>
            <div
              role="head-row"
              style={{
                width: totalActualWidth,
                height: headerHeight
              }}
            >
              {checkbox}
              {columns.map((column, index) => {
                const colindex = index + 1;
                const child = typeof column.title === 'function' ? column.title() : column.title;
                return (
                  <div
                    className={column.className}
                    key={colindex}
                    role="cell"
                    aria-colindex={colindex}
                    style={{
                      width: columnWidths[index],
                      ...genStickyStyle({
                        column,
                        columnIndex: index,
                        columnWidths,
                        rowSelection
                      }),
                      justifyContent: column.align || bodyDefaultConfig.cellAlign
                    }}
                  >
                    {child}
                  </div>
                );
              })}
            </div>
          </Head>
          <div style={{ ...style, position: 'relative', lineHeight: 0 }} ref={tableBodyRef}>
            {children}
          </div>
        </>
      );
    },
    [rowSelection, columns, headerHeight, columnWidths]
  );

  function handleDragStart(initial: DragStart) {
    removeExtraOpts();
    if (onDragStart) {
      onDragStart(initial);
    }
  }

  function handleDragEnd(result: DropResult) {
    if (onDragEnd) {
      onDragEnd(result);
      if (refreshRowHeightsAfterDrag) {
        if (!result.destination) {
          return;
        }
        setRowHeights(arrayMove(rowHeights, result.source.index, result.destination.index));
        // 清除 react-window 对 style 的缓存
        listRef.current?.resetAfterIndex(0);
      }
    }
  }

  function handleDragUpdate(initial: DragUpdate) {
    if (onDragUpdate) {
      onDragUpdate(initial);
    }
  }

  function handleBeforeDrgaStart(initial: DragStart) {
    if (onBeforeDragStart) {
      onBeforeDragStart(initial);
    }
  }

  const itemCount = treeTableModel.inTreeMode
    ? treeTableModel.tabularData!.length
    : dataSource.length;

  const isEmptyDataSource = itemCount === 0;

  return (
    <Wrapper
      ref={tableWrapperRef}
      role="table"
      className={cn(className, edgeClasses.leftOverlay, edgeClasses.topOverlay)}
      aria-rowcount={itemCount}
      aria-colcount={columns.length}
      layoutVertical={layoutVertical}
      style={{
        width: containerWidth,
        height: containerHeight
      }}
      onScrollCapture={createHandleScroll({
        scrollContainerRef,
        totalActualWidth,
        elementForClassRef: tableWrapperRef
      })}
    >
      <Inner ref={tableInnerRef} style={isEmptyDataSource ? { height: '100%' } : {}}>
        {isEmptyDataSource ? (
          emptyPlaceholder || <EmptyTablePlaceholder />
        ) : sortable ? (
          <DragDropContext
            onBeforeDragStart={handleBeforeDrgaStart}
            onDragStart={handleDragStart}
            onDragUpdate={handleDragUpdate}
            onDragEnd={handleDragEnd}
          >
            <Droppable
              droppableId="droppable"
              mode="virtual"
              renderClone={(
                provided: DraggableProvided,
                snapshot: DraggableStateSnapshot,
                rubric: DraggableRubric
              ) => {
                return (
                  <QuoteItemWrapper
                    className={cloneRowClassName}
                    width={containerWidth}
                    left={
                      (provided.draggableProps.style as DraggingStyle).left +
                      (scrollContainerRef.current?.scrollLeft || 0)
                    }
                  >
                    <NormalItem
                      provided={provided}
                      data={rowData as any}
                      style={ghostStyle}
                      index={rubric.source.index}
                      sortable
                    />
                  </QuoteItemWrapper>
                );
              }}
            >
              {(droppableProvided: DroppableProvided) => {
                return (
                  <RenderExtraOptsApp>
                    {!!columnWidths.length && !!rowHeights.length && (
                      <VariableSizeList
                        style={{
                          overflowY: yScrollable ? 'auto' : 'hidden',
                          overflowX: xScrollable ? 'auto' : 'hidden'
                        }}
                        outerRef={ref => {
                          droppableProvided.innerRef(ref);
                          scrollContainerRef.current = ref;
                        }}
                        ref={listRef}
                        onScroll={removeExtraOpts}
                        width={containerWidth}
                        height={tableInnerHeight}
                        itemCount={itemCount}
                        itemSize={index => rowHeights[index]}
                        estimatedItemSize={
                          bodyDefaultConfig.fixedHeight + bodyDefaultConfig.borderSize
                        }
                        overscanCount={overscanCount}
                        innerElementType={innerElementType}
                        itemData={rowData}
                      >
                        {SortableRow}
                      </VariableSizeList>
                    )}
                    {genShadows()}
                  </RenderExtraOptsApp>
                );
              }}
            </Droppable>
          </DragDropContext>
        ) : (
          <RenderExtraOptsApp>
            {!!columnWidths.length && !!rowHeights.length && (
              <VariableSizeList
                style={{
                  overflowY: yScrollable ? 'auto' : 'hidden',
                  overflowX: xScrollable ? 'auto' : 'hidden'
                }}
                outerRef={scrollContainerRef}
                ref={listRef}
                onScroll={removeExtraOpts}
                width={containerWidth}
                height={tableInnerHeight}
                itemCount={itemCount}
                itemSize={index => rowHeights[index]}
                estimatedItemSize={bodyDefaultConfig.fixedHeight + bodyDefaultConfig.borderSize}
                overscanCount={overscanCount}
                innerElementType={innerElementType}
                itemData={rowData}
              >
                {Row}
              </VariableSizeList>
            )}
            {genShadows()}
          </RenderExtraOptsApp>
        )}
      </Inner>
      {!isEmptyDataSource && paginationJSX}
    </Wrapper>
  );
}
