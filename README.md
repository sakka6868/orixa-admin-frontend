# OrixaAdmin Frontend - React.js

[OrixaAdmin](https://orixaadmin.com) 是一个现代化、响应式、可定制的后台管理面板模板，基于 Tailwind CSS 和 React.js 构建。旨在帮助开发者快速构建美观且功能强大的仪表盘。

## 快速链接

- [✨ 访问官网](https://orixaadmin.com)
- [📄 文档中心](https://orixaadmin.com/docs)
- [⬇️ 下载地址](https://orixaadmin.com/download)
- [🌐 在线演示](https://react-demo.orixaadmin.com)

## 环境要求

在开始之前，请确保已安装以下环境：

- Node.js 18.x 或更高版本（推荐使用 Node.js 20.x 或更高版本）
- yarn 或 npm 包管理器

## 快速开始

### 1. 安装依赖

```bash
npm install
# 或
yarn install
```

> 如果安装过程中遇到 peer-dependency 错误，请使用 `--legacy-peer-deps` 标志。

### 2. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

应用将在开发模式下运行，打开 [http://localhost:3000](http://localhost:3000) 即可在浏览器中查看。

### 3. 构建生产版本

```bash
npm run build
# 或
yarn build
```

### 4. 代码检查

```bash
npm run lint
# 或
yarn lint
```

### 5. 预览生产构建

```bash
npm run preview
# 或
yarn preview
```

## 项目技术栈

- **框架**: React 19.0
- **构建工具**: Vite 6.x
- **样式**: Tailwind CSS 4.0
- **路由**: React Router 7.x
- **语言**: TypeScript 5.7
- **图表**: ApexCharts
- **日历**: FullCalendar
- **HTTP 客户端**: Axios

## 核心功能

### 🎨 现代化界面设计
- 完全响应式布局
- 可折叠侧边栏
- 暗色/亮色主题支持
- 精心设计的 UI 组件

### 📊 多样化仪表盘
- 电商仪表盘
- 数据分析仪表盘
- 营销仪表盘
- CRM 仪表盘
- 物流仪表盘

### 🛍️ 电商功能
- 产品管理（列表、添加、编辑）
- 订单管理
- 发票管理（列表、详情、创��）
- 交易记录管理

### 🧠 AI 助手套件
- 文本生成器
- 图像生成器
- 代码生成器
- 视频生成器

### 🔑 API 密钥管理
- API 密钥仪表盘
- 密钥列表视图
- 添加新密钥功能

### 🔌 集成管理
- 集成卡片展示
- 集成详情查看
- 添加新集成
- 集成设置管理

### 💬 客服支持
- 工单列表
- 工单回复界面

### 📅 其他功能
- 日历功能（支持拖拽）
- 聊天系统
- 高级数据表格（支持排序和筛选）
- 文件上传（拖拽支持）

## 更新日志

### Version 2.2.0 - 2025年7月30日

#### 🧭 物流仪表盘 - 新增
- 重新设计物流仪表盘界面
- 配送活动表格
- 配送跟踪时间线
- 总收入图表

#### 🛍️ 电商页面 - 新增
- **产品管理**：产品列表表格、添加产品表单
- **发票管理**：发票列表、发票详情、查看发票模态框、创建发票表单
- **交易管理**：交易列表、交易详情视图

#### 🧠 AI 助手套件 - 新增
- 文本生成器
- 图像生成器
- 代码生成器
- 视频生成器

#### 🔑 API 密钥管理 - 新增
- API 密钥仪表盘
- API 密钥表格视图
- 添加 API 密钥模态框

#### 🔌 集成管理 - 新增
- 集成卡片界面
- 集成详情模态框
- 添加集成模态框
- 集成设置模态框
- 删除集成确认模态框

#### 💬 客服支持 - 新增
- 支持工单列表页面
- 支持工单回复界面

#### 📊 图表与可视化 - 改进
- 新增柱状图设计

#### 🐛 其他更新
- 修复已知 bug 和 UI 问题
- 更新依赖包

### Version 2.1.2 - 2025年6月2日
- 修复基础表格 3 下拉菜单（裁剪）问题
- 修复弹出框和工具提示组件溢出（裁剪）问题

### Version 2.1.1 - 2025年3月25日
- 升级到 React 19
- 为防止 peer dependency 错误添加包覆盖配置
- 从 react-flatpickr 迁移到 flatpickr 包以支持 React 19

### Version 2.1.0 - 2025年3月10日
- 为 SaaS 产品添加新的仪表盘设计
- 新的指标卡片
- 带有图表的产品性能标签页

### Version 2.0.1 - 2025年2月27日
- 升级到 Tailwind CSS v4 以获得更好的性能和效率
- 更新类名使用以匹配最新语法和功能
- 替换已弃用的类并优化样式

### Version 2.0.0 - 2025年2月

重大更新，全面重新设计并实施现代化 React 模式。

#### 主要改进
- 完整的 UI 重新设计，采用现代化 React 模式
- 新功能：可折叠侧边栏、聊天和日历
- 改进性能和可访问性
- 使用 ApexCharts 更新数据可视化

#### 关键功能
- 重新设计的仪表盘（电商、分析、营销、CRM）
- 通过 React Router 集成增强导航
- 支持排序和筛选的高级表格
- 支持拖放的日历功能
- 新的 UI 组件和改进的现有组件

#### 破坏性变更
- 更新侧边栏组件 API
- 迁移图表到 ApexCharts
- 修订身份验证系统

[查看更多](https://orixaadmin.com/docs/update-logs/react)更新日志详情。

## 许可证

更多信息请访问我们的[许可证](https://orixaadmin.com/license)页面。

## 技术支持

如有任何问题或建议，请访问：
- 官方网站：https://orixaadmin.com
- 文档中心：https://orixaadmin.com/docs