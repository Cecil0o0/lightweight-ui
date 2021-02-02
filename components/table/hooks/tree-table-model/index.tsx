import { HierarchyNode, stratify } from 'd3-hierarchy';
import React, { useEffect, useState } from 'react';
import { HierarchyTableNode, IUseTreeShape, TreeNodeData, TreeTableModel } from '../../types';
import {
  toTabularData,
  expandOrCollapse as _expandOrCollapse,
  defaultParentIDAccessor
} from './utils';
import { ArrowIcon, ArrowWapper } from './components';

export function useTreeTableModel<T>({
  dataSource,
  treeMode,
  columns
}: IUseTreeShape): TreeTableModel<T> {
  const inTreeMode = !!treeMode;
  if (inTreeMode) {
    // 不支持动态行高，因为没一次展开与收起都必然碰到 Table 的性能瓶颈，从而带来较差的用户体验。
    columns.forEach(column => delete column.dynamicHeight);
    // 不支持异步数据场景下的分页，因为没场景。
  }
  let defaultTree: HierarchyTableNode<TreeNodeData> = {} as any;
  let defaultTabularData: any[] = [];
  if (inTreeMode) {
    defaultTree = stratify<TreeNodeData>().parentId(defaultParentIDAccessor)(dataSource);
    defaultTree.expanded = true;
    defaultTabularData = defaultTree.descendants();
  }
  const [state, setState] = useState<{
    tree: HierarchyNode<any>;
    tabularData: any[];
  }>({
    tree: defaultTree,
    tabularData: defaultTabularData
  });

  const _reArrange = () => {
    if (!inTreeMode) return;
    setState(prevState => {
      return {
        ...prevState,
        tabularData: toTabularData(prevState.tree)
      };
    });
  };

  useEffect(() => {
    if (!inTreeMode) return;
    const newTree: HierarchyTableNode<TreeNodeData> = stratify<TreeNodeData>().parentId(
      defaultParentIDAccessor
    )(dataSource);
    newTree.expanded = true;
    setState({
      tree: newTree,
      tabularData: toTabularData(newTree)
    });
  }, [dataSource]);

  return {
    renderTreePart({ node }) {
      if (!inTreeMode) return <></>;
      const isRoot = !node.parent;
      const hasChild = node.data.hasChild || isRoot;
      const expanded = node.expanded;
      return (
        <>
          <span style={{ width: node.depth * 15 }}></span>
          <ArrowWapper
            expanded={expanded}
            hasChildren={hasChild}
            onClick={async () => {
              if (!hasChild) return;
              await _expandOrCollapse<T>(node, { tree: state.tree, loadMore: treeMode?.loadMore });
              _reArrange();
            }}
          >
            <ArrowIcon />
          </ArrowWapper>
        </>
      );
    },
    tabularData: state.tabularData,
    inTreeMode
  };
}
