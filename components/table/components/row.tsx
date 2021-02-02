import { IRow, RowHandlers } from '../types';
import { genStickyStyle } from '../shared';
import {
  rowSelection as defaultRowSelectionConfig,
  placeholderCharacter,
  body as bodyDefaultConfig,
  stickyZIndex
} from '../shared/default-config';
import cn from 'classnames';
import { isNil } from 'lodash';
import { memo } from 'react';
import { areEqual } from 'react-window';

// 后续若迭代，此处禁用 hooks，以防 React.memo 失效。
const memorizedRow = memo(function<T extends { id: string }>({
  style,
  index,
  data: {
    dataSource,
    columns,
    columnWidths,
    rowClassName,
    rowSelection,
    activeIndex,
    setHoverRow,
    removeExtraOpts,
    scrollContainerRef,
    headWrapperRef,
    BodyCheckbox,
    treeTableModel,
    onRow
  }
}: IRow<T>) {
  const { tabularData: tabularDataInTreeMode, inTreeMode, renderTreePart } = treeTableModel;
  const actualDataSource = inTreeMode ? tabularDataInTreeMode! : dataSource;
  const rowIndex = index + 1;

  // currying handler
  let handlers: RowHandlers = {};
  if (onRow) {
    handlers = onRow(actualDataSource[rowIndex], rowIndex);
  }

  const cols = columns.map((column, columnIndex) => {
    const data = inTreeMode ? (actualDataSource[index] as any).data : actualDataSource[index];
    let cell;
    if (column.render) {
      cell = column.dataIndex ? column.render(data[column.dataIndex as keyof T], data, index) : '';
    } else {
      cell = column.dataIndex ? data[column.dataIndex as keyof T] : '';
    }
    if (isNil(cell)) {
      cell = placeholderCharacter;
    }
    return (
      <div
        className={column.className}
        key={columnIndex + 1}
        style={{
          width: columnWidths[columnIndex],
          ...genStickyStyle({ columnIndex, column, columnWidths, rowSelection }),
          justifyContent: column.align || bodyDefaultConfig.cellAlign
        }}
        role="cell"
        aria-colindex={columnIndex + 1}
      >
        {columnIndex === 0 && renderTreePart({ node: actualDataSource[index] as any })}
        {cell}
      </div>
    );
  });

  let checkbox;
  if (rowSelection) {
    checkbox = (
      <div
        style={{
          width: defaultRowSelectionConfig.columnWidth,
          left: 0,
          position: 'sticky',
          zIndex: stickyZIndex.bodyCell
        }}
        role="cell"
        aria-colindex={0}
      >
        <BodyCheckbox index={index} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        {
          'table-row-active': activeIndex === rowIndex
        },
        rowClassName
      )}
      style={{ ...style, width: 'auto', display: 'flex' }}
      aria-rowindex={rowIndex}
      role="row"
      onMouseEnter={() => {
        setHoverRow({
          row: actualDataSource[index],
          index,
          top: style.top as number
        });
      }}
      onMouseLeave={e => {
        if (!e.nativeEvent.relatedTarget) return;
        if (
          scrollContainerRef.current === e.nativeEvent.relatedTarget ||
          (e.nativeEvent.relatedTarget as HTMLDivElement).offsetParent === headWrapperRef.current
        ) {
          removeExtraOpts();
        }
      }}
      onClick={handlers.onClick}
      onDoubleClick={handlers.onDoubleClick}
      onContextMenu={handlers.onContextMenu}
    >
      {checkbox}
      {cols}
    </div>
  );
},
areEqual);

export { memorizedRow as Row };
