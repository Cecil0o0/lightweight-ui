import { stratify } from 'd3-hierarchy';
import { HierarchyTableNode, ILoadMore } from '../../types';

// copy from vddt store
export const expandOrCollapse = async function<T>(
  node: HierarchyTableNode<T>,
  { tree, loadMore }: { tree: HierarchyTableNode<T>; loadMore?: ILoadMore<T> }
) {
  if (loadMore && !node.loaded && node.data.hasChild) {
    await retriveNodes(node, { tree, loadMore });
  }
  if (!node.children) return;
  const contraryStatus = !node.expanded;
  node.children?.forEach((child: any) => {
    child.visible = contraryStatus;
  });
  node.expanded = contraryStatus;
};

export const defaultParentIDAccessor = (data: any) => data.parentID;

export async function retriveNodes<T>(
  node: HierarchyTableNode<T>,
  {
    tree,
    loadMore,
    parentIdAccessor = defaultParentIDAccessor
  }: {
    tree: HierarchyTableNode<T>;
    loadMore?: ILoadMore<T>;
    parentIdAccessor?: (data: any) => string;
  }
) {
  if (!loadMore) {
    // eslint-disable-next-line
    console.warn('请传递 loadMore prop');
    return;
  }
  const childrenData = await loadMore(node);

  if (childrenData.length) {
    let paths = tree!.path(node);
    // 兼容 null 为公共节点的 edge case.
    const index = paths.findIndex((path: any) => path === null);
    if (index !== -1) {
      paths = paths.slice(index + 1);
    }
    // 构建子树，然后 patch this.tree。
    // 需要注意计算节点 height、depth
    const partTree = stratify().parentId(parentIdAccessor)(
      paths.map((path: any) => path.data).concat(childrenData)
    ) as HierarchyTableNode<T>;
    // 更新该节点及其父节点的 height。
    // 与 wholeTree 相同位置的节点进行比较，取 height 较大值
    let _PartTreeNode = partTree;
    let _WholeTreeNode;
    // walk by depth
    for (let depth = 0; depth < paths.length; depth++) {
      // 因为有可能没有子部门
      if (!_PartTreeNode.children) {
        continue;
      }
      _WholeTreeNode = paths[depth];
      // height 可以不是只读的，只要改动的时候小心一点，计算仔细就没事儿了，@types/d3-hierarchy 的定义有点问题
      // @ts-ignore
      _WholeTreeNode.height = Math.max(_WholeTreeNode.height, _PartTreeNode.height);
      _PartTreeNode = _PartTreeNode.children[0];
    }

    // 矫正父节点引用之后赋值父节点的 children 属性
    node.children = partTree.leaves().map(child => {
      child.parent = node;
      return child;
    });
  }

  // 更新部门数据（区别于节点元数据）
  (node.data as any).children = childrenData;
  (node.data as any).hasChild = !!childrenData.length;
  // 更新部分节点元数据
  node.loaded = true;
}

export const definedToBeTrue = (value: boolean | undefined) =>
  value === true || value === undefined;

export function toTabularData<T>(tree: HierarchyTableNode<T>) {
  // DFS
  const root = tree;
  const stack: any[] = [];
  const results: any[] = [];
  stack.push(root);
  while (stack.length) {
    const node = stack.pop();
    results.push(node);
    if (node.children) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        if (definedToBeTrue(node.children[i].visible)) {
          stack.push(node.children[i]);
        }
      }
    }
  }
  return results;
}
