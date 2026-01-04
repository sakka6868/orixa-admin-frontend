import React, { useState } from 'react';
import Tree from '../ui/tree';

const TreeExample: React.FC = () => {
  const [treeData] = useState([
    {
      key: '1',
      title: 'Parent 1',
      children: [
        {
          key: '1-1',
          title: 'Child 1-1',
          children: [
            {
              key: '1-1-1',
              title: 'Grandchild 1-1-1',
            },
            {
              key: '1-1-2',
              title: 'Grandchild 1-1-2',
            },
          ],
        },
        {
          key: '1-2',
          title: 'Child 1-2',
        },
      ],
    },
    {
      key: '2',
      title: 'Parent 2',
      children: [
        {
          key: '2-1',
          title: 'Child 2-1',
        },
        {
          key: '2-2',
          title: 'Child 2-2',
          children: [
            {
              key: '2-2-1',
              title: 'Grandchild 2-2-1',
            },
          ],
        },
      ],
    },
    {
      key: '3',
      title: 'Parent 3 (Disabled)',
      disabled: true,
      children: [
        {
          key: '3-1',
          title: 'Child 3-1',
        },
      ],
    },
  ]);

  // 更复杂的树数据，包含叶子节点
  const [complexTreeData] = useState([
    {
      key: 'root',
      title: 'Root',
      children: [
        {
          key: 'folder1',
          title: 'Folder 1',
          children: [
            { key: 'file1-1', title: 'File 1-1' }, // 叶子节点
            { key: 'file1-2', title: 'File 1-2' }, // 叶子节点
            {
              key: 'subfolder1',
              title: 'Subfolder 1',
              children: [
                { key: 'file1-1-1', title: 'File 1-1-1' }, // 叶子节点
              ],
            },
          ],
        },
        {
          key: 'folder2',
          title: 'Folder 2',
          children: [
            { key: 'file2-1', title: 'File 2-1' }, // 叶子节点
          ],
        },
        { key: 'standalone', title: 'Standalone File' }, // 叶子节点
      ],
    },
  ]);

  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['1']);

  const handleCheck = (checked: string[]) => {
    console.log('Checked keys:', checked);
    setCheckedKeys(checked);
  };

  const handleSelect = (selected: string[]) => {
    console.log('Selected keys:', selected);
    setSelectedKeys(selected);
  };

  const handleExpand = (expandedKeys: string[]) => {
    console.log('Expanded keys:', expandedKeys);
    setExpandedKeys(expandedKeys);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Tree Component Example</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A tree component with expand/collapse, selection, and check functionality
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 基础树形组件 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Basic Tree</h2>
          <Tree 
            treeData={treeData} 
            selectable={true}
            defaultExpandAll={true}
            onExpand={handleExpand}
          />
        </div>

        {/* 可勾选的树形组件（级联） */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Checkable Tree (Cascading)</h2>
          <Tree 
            treeData={treeData} 
            checkable={true}
            checkStrictly={false} // 级联选择
            selectable={true}
            onCheck={handleCheck}
            onSelect={handleSelect}
            defaultExpandAll={true}
          />
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>Checked: {checkedKeys.join(', ') || 'None'}</p>
            <p>Selected: {selectedKeys.join(', ') || 'None'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* 严格模式勾选（非级联） */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Checkable Tree (Strict Mode)</h2>
          <Tree 
            treeData={treeData} 
            checkable={true}
            checkStrictly={true} // 严格模式，不级联
            onCheck={handleCheck}
            defaultExpandAll={true}
          />
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>Checked: {checkedKeys.join(', ') || 'None'}</p>
          </div>
        </div>

        {/* 受控模式 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Controlled Tree</h2>
          <Tree 
            treeData={treeData} 
            checkable={true}
            checkedKeys={checkedKeys}
            onCheck={handleCheck}
            expandedKeys={expandedKeys}
            onExpand={handleExpand}
            defaultExpandAll={false}
          />
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>Checked: {checkedKeys.join(', ') || 'None'}</p>
            <p>Expanded: {expandedKeys.join(', ') || 'None'}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Complex Tree with Leaf Nodes</h2>
        <Tree 
          treeData={complexTreeData} 
          checkable={true}
          className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600"
          onCheck={handleCheck}
          defaultExpandAll={true}
        />
      </div>
    </div>
  );
};

export default TreeExample;