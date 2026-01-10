import PageMeta from "../../components/common/PageMeta.tsx";
import Tree from "../../components/ui/tree";
import {useState} from "react";
import {TreeNode} from "../../components/ui/tree/types.ts";
import AddMenuModal from "../../components/System/AddMenuModal.tsx";
import {MenuFormData, MenuParent} from "../../types/menu";
import SystemApi from "../../api/SystemApi.ts";
import useMountEffect from "../../hooks/useMountEffect.ts";


// 将 API 返回的菜单数据转换为 TreeNode 格式
interface MenuApiData extends MenuFormData {
    id?: string;
    children?: MenuApiData[];
}

const convertMenuToTreeNode = (menus: MenuApiData[]): TreeNode[] => {
    return menus.map(menu => ({
        key: menu.id || '',
        title: `${menu.name} (${menu.type})`,
        children: menu.children ? convertMenuToTreeNode(menu.children) : undefined,
    }));
};

export default function MenusList() {
    const [treeData, setTreeData] = useState<TreeNode[]>([]);
    const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // 页面加载时获取菜单数据
    useMountEffect(() => {
        const fetchMenus = async () => {
            try {
                setLoading(true);
                const response = await SystemApi.listMenus({} as MenuFormData);
                const treeNodes = convertMenuToTreeNode(response as unknown as MenuApiData[]);
                setTreeData(treeNodes);
            } catch (error) {
                console.error('获取菜单列表失败:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMenus().then(() => console.log('菜单加载完成'));
    });
    // 处理删除节点
    const handleDelete = (node: TreeNode) => {
        console.log('Delete node:', node);
        // 获取要删除的节点及其所有子节点的keys
        const getNodeAndChildrenKeys = (n: TreeNode): string[] => {
            let keys = [n.key || ''];
            if (n.children) {
                n.children.forEach((child: TreeNode) => {
                    keys = keys.concat(getNodeAndChildrenKeys(child));
                });
            }
            return keys;
        };

        const keysToRemove = getNodeAndChildrenKeys(node);

        // 递归删除节点的函数
        const removeNode = (nodes: TreeNode[], key: string): TreeNode[] => {
            return nodes.filter(n => {
                if (n.key === key) {
                    return false;
                }
                if (n.children) {
                    n.children = removeNode(n.children, key);
                }
                return true;
            });
        };

        // 更新树数据
        const newTreeData = (prevData: TreeNode[]) => removeNode(prevData, node.key || '');
        setTreeData(newTreeData);
        // 清除被删除节点相关的选中状态
        setSelectedKeys(prev => prev.filter(key => !keysToRemove.includes(key)));
        // 清除被删除节点相关的勾选状态
        setCheckedKeys(prev => prev.filter(key => !keysToRemove.includes(key)));
        // 清除被删除节点相关的展开状态
        setExpandedKeys(prev => prev.filter(key => !keysToRemove.includes(key)));
    };

    // 处理添加菜单
    const handleAddMenu = (menuData: MenuFormData) => {
        console.log('Add menu:', menuData);

        // 生成唯一key
        const newKey = Date.now().toString();

        // 创建新的菜单节点
        const newNode: TreeNode = {
            key: newKey,
            title: `${menuData.name} (${menuData.type})`,
        };

        // 如果有父级菜单，添加到对应父级下
        if (menuData.parent) {
            const addToParent = (nodes: TreeNode[]): TreeNode[] => {
                return nodes.map(node => {
                    if (node.key === menuData.parent?.id) {
                        return {
                            ...node,
                            children: [...(node.children || []), newNode]
                        };
                    }
                    if (node.children) {
                        return {
                            ...node,
                            children: addToParent(node.children)
                        };
                    }
                    return node;
                });
            };
            setTreeData(prevData => addToParent(prevData));
        } else {
            // 作为顶级菜单添加
            setTreeData(prevData => [...prevData, newNode]);
        }
    };

    // 获取所有菜单作为父级菜单选项
    const getParentMenuOptions = (nodes: TreeNode[], level = 1): MenuParent[] => {
        let options: MenuParent[] = [];
        nodes.forEach(node => {
            if (node.key && level < 3) { // 限制最多3级
                options.push({
                    id: node.key,
                    name: node.title,
                    level: level
                });
                if (node.children) {
                    options = options.concat(getParentMenuOptions(node.children, level + 1));
                }
            }
        });
        return options;
    };

    const parentMenuOptions = getParentMenuOptions(treeData);

    console.log(selectedKeys);
    console.log(checkedKeys);
    console.log(expandedKeys);

    return (
        <>
            <PageMeta
                title="菜单列表"
                description="菜单列表管理页面"
            />
            <div className="mb-6 flex justify-end">
                <AddMenuModal
                    onAdd={handleAddMenu}
                    parentMenuOptions={parentMenuOptions}
                />
            </div>
            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div
                        className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <span className="ml-3 text-gray-500 dark:text-gray-400">加载中...</span>
                </div>
            ) : treeData.length > 0 ? (
                <Tree
                    treeData={treeData}
                    selectable={true}
                    deletable={true}
                    onDelete={handleDelete}
                    defaultExpandAll={true}
                />
            ) : (
                <div
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 dark:border-gray-700 dark:bg-gray-900">
                    <svg
                        className="mb-4 h-16 w-16 text-gray-400 dark:text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        暂无菜单数据
                    </h3>
                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                        点击上方按钮添加你的第一个菜单
                    </p>
                </div>
            )}
        </>
    );
}