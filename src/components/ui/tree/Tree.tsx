import React, {useCallback, useEffect, useState} from 'react';
import {TreeNode, TreeProps} from './types';

const Tree: React.FC<TreeProps> = ({
                                       treeData,
                                       checkable = false,
                                       selectable = true,
                                       defaultExpandAll = false,
                                       defaultExpandedKeys = [],
                                       defaultCheckedKeys = [],
                                       defaultSelectedKeys = [],
                                       onCheck,
                                       onSelect,
                                       onExpand,
                                       className = '',
                                       multiple = false,
                                       checkStrictly = false,
                                       expandedKeys: controlledExpandedKeys,
                                       checkedKeys: controlledCheckedKeys,
                                       selectedKeys: controlledSelectedKeys,
                                   }) => {
    // 使用受控或非受控状态
    const [internalExpandedKeys, setInternalExpandedKeys] = useState<string[]>(defaultExpandedKeys);
    const [internalCheckedKeys, setInternalCheckedKeys] = useState<string[]>(defaultCheckedKeys);
    const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>(defaultSelectedKeys);

    const isControlledExpanded = controlledExpandedKeys !== undefined;
    const isControlledChecked = controlledCheckedKeys !== undefined;
    const isControlledSelected = controlledSelectedKeys !== undefined;

    const expandedKeys = isControlledExpanded ? controlledExpandedKeys : internalExpandedKeys;
    const checkedKeys = isControlledChecked ? controlledCheckedKeys : internalCheckedKeys;
    const selectedKeys = isControlledSelected ? controlledSelectedKeys : internalSelectedKeys;

    // 初始化展开状态
    useEffect(() => {
        if (defaultExpandAll && !isControlledExpanded) {
            const allKeys = getAllKeys(treeData);
            setInternalExpandedKeys(allKeys);
        }
    }, [treeData, defaultExpandAll, isControlledExpanded]);

    // 获取所有节点的 keys
    const getAllKeys = (nodes: TreeNode[]): string[] => {
        let keys: string[] = [];
        nodes.forEach(node => {
            if (node.key) {
                keys.push(node.key);
            }
            if (node.children) {
                keys = keys.concat(getAllKeys(node.children));
            }
        });
        return keys;
    };

    // 切换节点展开状态
    const toggleExpand = useCallback((node: TreeNode) => {
        if (!node.children || node.children.length === 0) return;

        const newExpandedKeys = expandedKeys.includes(node.key || '')
            ? expandedKeys.filter(key => key !== node.key)
            : [...expandedKeys, node.key || ''];

        if (!isControlledExpanded) {
            setInternalExpandedKeys(newExpandedKeys);
        }

        // 调用 onExpand 回调
        if (onExpand) {
            onExpand(newExpandedKeys, node);
        }
    }, [expandedKeys, isControlledExpanded, onExpand]);

    // 获取节点的所有父级节点keys
    const getNodeParentKeys = (treeNodes: TreeNode[], targetNode: TreeNode): string[] => {
        const findPath = (nodes: TreeNode[], targetKey: string, path: string[] = []): string[] | null => {
            for (const node of nodes) {
                const currentPath = [...path, node.key || ''];
                if (node.key === targetKey) {
                    return currentPath.slice(0, -1); // 不包含目标节点本身
                }
                if (node.children) {
                    const result = findPath(node.children, targetKey, currentPath);
                    if (result) return result;
                }
            }
            return null;
        };

        const parentKeys = findPath(treeNodes, targetNode.key || '');
        return parentKeys || [];
    };

    // 处理节点选择
    const handleSelect = useCallback((node: TreeNode) => {
        if (!selectable || node.disabled) return;

        let newSelectedKeys: string[] = [];

        if (multiple) {
            if (selectedKeys.includes(node.key || '')) {
                // 取消选择时，移除该节点及其所有子节点的选中状态
                newSelectedKeys = selectedKeys.filter(key => key !== node.key);
            } else {
                // 选择时，添加该节点及其所有父级节点
                const parentKeys = getNodeParentKeys(treeData, node);
                newSelectedKeys = [...new Set([...selectedKeys, node.key || '', ...parentKeys])];
            }
        } else {
            // 单选模式下，选中该节点及其所有父级节点
            const parentKeys = getNodeParentKeys(treeData, node);
            newSelectedKeys = [...parentKeys, node.key || ''];
        }

        if (!isControlledSelected) {
            setInternalSelectedKeys(newSelectedKeys);
        }

        if (onSelect) {
            onSelect(newSelectedKeys, {
                selected: !selectedKeys.includes(node.key || ''),
                node
            });
        }
    }, [selectable, multiple, selectedKeys, isControlledSelected, onSelect, treeData]);

    // 处理节点勾选（带级联逻辑）
    const handleCheck = useCallback((node: TreeNode) => {
        if (!checkable || node.disabled) return;

        let newCheckedKeys: string[] = [];

        if (checkStrictly) {
            // 严格模式下，不进行级联选择
            if (checkedKeys.includes(node.key || '')) {
                newCheckedKeys = checkedKeys.filter(key => key !== node.key);
            } else {
                newCheckedKeys = [...checkedKeys, node.key || ''];
            }
        } else {
            // 级联模式下，需要处理父子节点关系
            if (checkedKeys.includes(node.key || '')) {
                // 取消勾选节点及其所有子节点
                newCheckedKeys = removeNodeAndChildren(checkedKeys, node);
            } else {
                // 勾选节点及其所有子节点
                newCheckedKeys = addNodeAndChildren(checkedKeys, node);
            }

            // 检查父节点是否应该被勾选
            newCheckedKeys = updateParentNodes(newCheckedKeys, treeData, node);
        }

        // 在非严格模式下，检查所有父节点是否应该被勾选
        if (!checkStrictly) {
            newCheckedKeys = updateAllParentNodes(newCheckedKeys, treeData);
        }

        if (!isControlledChecked) {
            setInternalCheckedKeys(newCheckedKeys);
        }

        if (onCheck) {
            onCheck(newCheckedKeys, {
                checked: !checkedKeys.includes(node.key || ''),
                node
            });
        }
    }, [checkable, checkedKeys, checkStrictly, isControlledChecked, onCheck, treeData]);

    // 递归获取所有子节点的 keys
    const getAllChildKeys = (node: TreeNode): string[] => {
        let keys: string[] = [];
        if (node.children) {
            node.children.forEach(child => {
                keys.push(child.key || '');
                keys = keys.concat(getAllChildKeys(child));
            });
        }
        return keys;
    };

    // 添加节点及其所有子节点到勾选列表
    const addNodeAndChildren = (currentKeys: string[], node: TreeNode): string[] => {
        const newKeys = [...currentKeys];
        if (!newKeys.includes(node.key || '')) {
            newKeys.push(node.key || '');
        }

        const childKeys = getAllChildKeys(node);
        childKeys.forEach(key => {
            if (!newKeys.includes(key)) {
                newKeys.push(key);
            }
        });

        return newKeys;
    };

    // 从勾选列表中移除节点及其所有子节点
    const removeNodeAndChildren = (currentKeys: string[], node: TreeNode): string[] => {
        const newKeys = [...currentKeys];
        const index = newKeys.indexOf(node.key || '');
        if (index > -1) {
            newKeys.splice(index, 1);
        }

        const childKeys = getAllChildKeys(node);
        childKeys.forEach(key => {
            const childIndex = newKeys.indexOf(key);
            if (childIndex > -1) {
                newKeys.splice(childIndex, 1);
            }
        });

        return newKeys;
    };

    // 更新父节点的勾选状态
    const updateParentNodes = (currentKeys: string[], treeNodes: TreeNode[], changedNode: TreeNode): string[] => {
        const newKeys = [...currentKeys];

        // 获取所有父节点的keys
        const parentKeys = getNodeParentKeys(treeNodes, changedNode);

        // 遍历每个父节点，更新其勾选状态
        parentKeys.forEach(parentKey => {
            const parentNode = findNodeByKey(treeNodes, parentKey);
            if (parentNode && parentNode.children) {
                // 检查该父节点的所有子节点是否都被勾选
                const allChildrenChecked = parentNode.children.every(
                    child => newKeys.includes(child.key || '')
                );

                if (allChildrenChecked && !newKeys.includes(parentKey)) {
                    newKeys.push(parentKey);
                } else if (!allChildrenChecked && newKeys.includes(parentKey)) {
                    // 如果父节点被勾选但不是所有子节点都被勾选，则移除父节点的勾选
                    const parentIndex = newKeys.indexOf(parentKey);
                    if (parentIndex > -1) {
                        newKeys.splice(parentIndex, 1);
                    }
                }
            }
        });

        return newKeys;
    };

    // 根据key查找节点
    const findNodeByKey = (nodes: TreeNode[], key: string): TreeNode | undefined => {
        for (const node of nodes) {
            if (node.key === key) {
                return node;
            }
            if (node.children) {
                const found = findNodeByKey(node.children, key);
                if (found) return found;
            }
        }
        return undefined;
    };

    // 更新所有父节点的勾选状态
    const updateAllParentNodes = (currentKeys: string[], treeNodes: TreeNode[]): string[] => {
        const newKeys = [...currentKeys];

        // 遍历树中的每个节点，检查是否需要更新父节点状态
        const checkNode = (nodes: TreeNode[]) => {
            for (const node of nodes) {
                if (node.children && node.children.length > 0) {
                    // 检查该节点的所有子节点是否都被勾选
                    const allChildrenChecked = node.children.every(
                        child => newKeys.includes(child.key || '')
                    );

                    if (allChildrenChecked && !newKeys.includes(node.key || '')) {
                        // 添加父节点到勾选列表
                        if (node.key && !newKeys.includes(node.key)) {
                            newKeys.push(node.key);
                        }
                    } else if (!allChildrenChecked && newKeys.includes(node.key || '')) {
                        // 如果父节点被勾选但不是所有子节点都被勾选，则移除父节点的勾选
                        const parentIndex = newKeys.indexOf(node.key || '');
                        if (parentIndex > -1) {
                            newKeys.splice(parentIndex, 1);
                        }
                    }

                    // 递归检查子节点
                    checkNode(node.children);
                }
            }
        };

        checkNode(treeNodes);

        return newKeys;
    };

    // 检查节点的勾选状态（是否部分勾选）
    const getNodeCheckState = (node: TreeNode) => {
        const isChecked = checkedKeys.includes(node.key || '');
        if (isChecked) return 'checked';

        if (node.children && node.children.length > 0) {
            const childKeys = getAllChildKeys(node);
            const checkedChildCount = childKeys.filter(key => checkedKeys.includes(key)).length;
            if (checkedChildCount > 0 && checkedChildCount < childKeys.length) {
                return 'indeterminate';
            }
        }

        return 'unchecked';
    };

    // 渲染单个树节点
    const renderTreeNode = (node: TreeNode, level: number = 0) => {
        const isExpanded = expandedKeys.includes(node.key || '');
        const isSelected = selectedKeys.includes(node.key || '');
        const checkState = getNodeCheckState(node);
        const hasChildren = node.children && node.children.length > 0;
        //const isLeaf = node.isLeaf || !hasChildren;

        return (
            <div key={node.key || node.title} className="w-full">
                <div
                    className={`
            flex items-center py-2 px-3 rounded-lg transition-all duration-200
            ${isSelected
                        ? 'bg-brand-500/10 text-brand-500 dark:bg-brand-500/20'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}
            ${node.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
                    onClick={() => handleSelect(node)}
                    style={{paddingLeft: `${level * 20 + 12}px`}}
                >
                    {/* 展开/折叠图标 */}
                    {hasChildren && (
                        <span
                            className="mr-2 flex items-center justify-center w-6 h-6 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(node);
                            }}
                        >
              {isExpanded ? (
                  <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
              ) : (
                  <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
              )}
            </span>
                    )}

                    {/* 如果不是叶子节点且没有子节点图标，则显示叶子节点图标 */}
                    {!hasChildren && (
                        <span className="mr-2 flex items-center justify-center w-6 h-6">
              <svg className="w-1.5 h-1.5 text-gray-400 rounded-full bg-gray-400" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4"/>
              </svg>
            </span>
                    )}

                    {/* 勾选框 */}
                    {checkable && (
                        <label className="relative flex items-center mr-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={checkState === 'checked'}
                                ref={el => {
                                    if (el) {
                                        el.indeterminate = checkState === 'indeterminate';
                                    }
                                }}
                                onChange={() => handleCheck(node)}
                                className="sr-only"
                            />
                            <span
                                className={`
                  w-4 h-4 rounded border flex items-center justify-center
                  ${checkState === 'checked'
                                    ? 'bg-brand-500 border-brand-500 text-white'
                                    : checkState === 'indeterminate'
                                        ? 'bg-brand-500/50 border-brand-500 text-white'
                                        : 'border-gray-300 dark:border-gray-600'}
                `}
                            >
                {checkState === 'checked' && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12l5 5L20 7"/>
                    </svg>
                )}
                                {checkState === 'indeterminate' && (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M5 12h14"/>
                                    </svg>
                                )}
              </span>
                        </label>
                    )}

                    {/* 节点标题 */}
                    <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            {node.title}
          </span>
                </div>

                {/* 子节点 */}
                {hasChildren && isExpanded && (
                    <div className="ml-0">
                        {node.children?.map(child => renderTreeNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
            <div className="space-y-1">
                {treeData.map(node => renderTreeNode(node))}
            </div>
        </div>
    );
};

export default Tree;