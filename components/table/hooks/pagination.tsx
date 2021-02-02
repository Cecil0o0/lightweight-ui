import { IAdminVirtualTable, listRefType, TreeTableModel } from '../types';
import { useEffect, useRef } from 'react';
// eslint-disable-next-line no-restricted-imports
import { TablePagination } from '@material-ui/core';
import styled from 'styled-components';
import {
  Neutral900,
  Neutral300,
  Blue500,
  Blue100,
  Neutral600
} from '@/components/colors';
import { pagination as paginationDefaultConfig } from '../shared/default-config';

const defaultSizerHeihgt = paginationDefaultConfig.sizeHeight.default;

function getPaginationHeight(pagination: IAdminVirtualTable<any>['pagination']) {
  if (pagination && pagination.size) {
    const height = paginationDefaultConfig.sizeHeight[pagination.size as 'small' | 'default'];
    return height || defaultSizerHeihgt;
  }
  return defaultSizerHeihgt;
}

const OverwriteAntdStyles = styled.div``;
const PaginationWrapper = styled(OverwriteAntdStyles)<{
  height: number;
}>`
  display: flex;
  justify-content: center;
  padding-top: ${paginationDefaultConfig.paddingTop}px;
  height: ${props => props.height + paginationDefaultConfig.paddingTop}px;
`;

export function usePagination<T>({
  pagination,
  renderPagination,
  containerWidth,
  treeTableModel,
  listRef
}: Pick<IAdminVirtualTable<T>, 'pagination' | 'renderPagination'> & {
  containerWidth: number;
  treeTableModel: TreeTableModel<T>;
  listRef: listRefType;
}) {
  // 解决 pagination 传 null 导致 Object.assign TypeError，从而中断 Table 渲染的问题。
  !!pagination && Object.assign(pagination, { size: 'default' });
  const { current: height } = useRef(getPaginationHeight(pagination));
  useEffect(() => {
    if (pagination && pagination.current) {
      listRef?.current?.scrollTo(0);
    }
  }, [pagination && pagination.current]);
  // 目前 admin 只有单根树场景，在树模式中不必展示，若有需要再开启便是。
  if (treeTableModel.inTreeMode || !pagination) {
    return {
      height: 0,
      paddingTop: 0,
      paginationJSX: <></>
    };
  }
  const innerPagination = (
    <PaginationWrapper height={height} className="inner-pagination-wrapper">
      <TablePagination {...pagination} />
    </PaginationWrapper>
  );
  return {
    height,
    paddingTop: paginationDefaultConfig.paddingTop,
    paginationJSX: renderPagination
      ? renderPagination({ innerPagination, containerWidth })
      : innerPagination
  };
}
