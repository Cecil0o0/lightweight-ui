import { memo } from 'react';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import { NormalItem } from './normal-item';
import { IRow } from '../types';
import { areEqual } from 'react-window';
import { Row } from './row';

const SortableRow = memo(function<T extends { id: string }>({ style, index, data }: IRow<T>) {
  const { isSortableRow } = data;
  const quote = data.dataSource[index] || {};
  if (isSortableRow && isSortableRow(quote)) {
    return (
      <Draggable draggableId={quote.id} index={index} key={quote.id}>
        {(provided: DraggableProvided) => (
          <NormalItem provided={provided} sortable data={data as any} style={style} index={index} />
        )}
      </Draggable>
    );
  }
  return <Row data={data as any} style={style} index={index} />;
}, areEqual);

export { SortableRow };
