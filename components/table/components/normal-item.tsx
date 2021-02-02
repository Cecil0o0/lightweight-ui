import { genStickyStyle } from '../shared';
import {
  rowSelection as defaultRowSelectionConfig,
  placeholderCharacter,
  body as bodyDefaultConfig,
  stickyZIndex
} from '../shared/default-config';
// eslint-disable-next-line no-restricted-imports
import { Checkbox } from '@material-ui/core';
import cn from 'classnames';
import { isNil } from 'lodash';
import { CSSProperties, memo } from 'react';
import { IRow } from '../types';
import { DraggableProvided } from 'react-beautiful-dnd';

// 后续若迭代，此处禁用 hooks，以防 React.memo 失效。
const NormalItem = memo(function<T extends { id: string }>({
  provided,
  style,
  index,
  sortable,
  data: {
    dataSource,
    columns,
    columnWidths,
    rowClassName,
    rowSelection,
    setHoverRow,
    removeExtraOpts,
    scrollContainerRef,
    headWrapperRef
  }
}: IRow<T> & { provided?: DraggableProvided; sortable?: boolean }) {
  const rowIndex = index + 1;

  function getStyle(rowStyle: CSSProperties, draggableProvided: DraggableProvided) {
    let providedStyle = draggableProvided.draggableProps.style;
    if (!draggableProvided.draggableProps.style) {
      providedStyle = {};
    }
    return { ...rowStyle, width: 'auto', display: 'flex', ...providedStyle };
  }

  const cols = columns.map((column, columnIndex) => {
    let cell;
    if (column.render) {
      cell = column.dataIndex
        ? column.render(dataSource[index][column.dataIndex as keyof T], dataSource[index], index)
        : '';
    } else {
      cell = column.dataIndex ? dataSource[index][column.dataIndex as keyof T] : '';
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
        {cell}
      </div>
    );
  });

  let checkbox;
  if (rowSelection) {
    const { selectedRowKeys, onChange } = rowSelection;
    const rowKey = dataSource[index][defaultRowSelectionConfig.defaultKey as 'id'];
    const checked = selectedRowKeys.includes(rowKey);
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
        <Checkbox
          checked={checked}
          onChange={() => {
            if (typeof onChange !== 'function') return;
            let rowKeys;
            if (checked) {
              const copied = selectedRowKeys.slice();
              copied.splice(
                selectedRowKeys.findIndex(item => item === rowKey),
                1
              );
              rowKeys = copied;
            } else {
              rowKeys = selectedRowKeys.concat(rowKey);
            }
            const rows = [];
            const map = new Map(
              dataSource.map(value => [value[defaultRowSelectionConfig.defaultKey as 'id'], value])
            );
            for (let i = 0; i < rowKeys.length; i++) {
              rows.push(map.get(rowKeys[i]));
            }
            onChange(rowKeys, rows);
          }}
        />
      </div>
    );
  }

  if (sortable && provided) {
    return (
      <div
        className={cn(rowClassName, 'sortable-row')}
        aria-rowindex={rowIndex}
        role="row"
        onMouseEnter={() => {
          setHoverRow({
            row: dataSource[index],
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
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={getStyle(style, provided)}
      >
        {checkbox}
        {cols}
      </div>
    );
  }
  return (
    <div
      className={cn(rowClassName)}
      aria-rowindex={rowIndex}
      role="row"
      onMouseEnter={() => {
        setHoverRow({
          row: dataSource[index],
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
      style={{ ...style, width: 'auto', display: 'flex' }}
    >
      {checkbox}
      {cols}
    </div>
  );
});

export { NormalItem };
