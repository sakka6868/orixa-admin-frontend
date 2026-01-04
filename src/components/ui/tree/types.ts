export interface TreeNode {
  key?: string;
  title: string;
  children?: TreeNode[];
  isLeaf?: boolean;
  disabled?: boolean;
  checked?: boolean;
  selected?: boolean;
  expanded?: boolean;
}

export interface TreeProps {
  treeData: TreeNode[];
  checkable?: boolean;
  selectable?: boolean;
  defaultExpandAll?: boolean;
  defaultExpandedKeys?: string[];
  defaultCheckedKeys?: string[];
  defaultSelectedKeys?: string[];
  onCheck?: (checkedKeys: string[], e: { checked: boolean; node: TreeNode }) => void;
  onSelect?: (selectedKeys: string[], e: { selected: boolean; node: TreeNode }) => void;
  onExpand?: (expandedKeys: string[], node: TreeNode) => void;
  onDelete?: (node: TreeNode) => void;
  className?: string;
  multiple?: boolean;
  /** 级联选择 */
  checkStrictly?: boolean;
  /** 展开受控 */
  expandedKeys?: string[];
  /** 选中受控 */
  checkedKeys?: string[];
  /** 选择受控 */
  selectedKeys?: string[];
  /** 是否显示删除按钮 */
  deletable?: boolean;
}