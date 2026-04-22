import PageMeta from "../../components/common/PageMeta.tsx";
import {useState, useRef} from "react";
import FileStorageApi, {FileStorage, FileStorageQuery} from "../../api/FileStorageApi.ts";
import useMountEffect from "../../hooks/useMountEffect.ts";
import {useMessage} from "../../components/ui/message";
import {useModal} from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";

export default function FileStorageList() {
    const [files, setFiles] = useState<FileStorage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [uploading, setUploading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(20);
    const [total, setTotal] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 筛选条件
    const [filterFileName, setFilterFileName] = useState<string>('');
    const [filterMimeType, setFilterMimeType] = useState<string>('');

    const message = useMessage();
    const modal = useModal();

    useMountEffect(() => {
        fetchFiles();
    });

    const fetchFiles = async (pageNum: number = 1) => {
        try {
            setLoading(true);
            const query: FileStorageQuery = {
                page: pageNum,
                size: pageSize,
                fileName: filterFileName || undefined,
                mimeType: filterMimeType || undefined
            };
            const result = await FileStorageApi.listFiles(query);
            setFiles(result.records);
            setTotal(result.total);
            setTotalPages(result.totalPages);
            setPage(result.current);
        } catch (error) {
            console.error('获取文件列表失败:', error);
            message.error("加载失败", "获取文件列表失败");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchFiles(1);
    };

    const handleReset = () => {
        setFilterFileName('');
        setFilterMimeType('');
        fetchFiles(1);
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            await FileStorageApi.uploadFile(file);
            message.success("上传成功", "文件已上传");
            await fetchFiles();
        } catch (error) {
            console.error('上传文件失败:', error);
            message.error("上传失败", "文件上传失败");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await modal.confirm({
            title: "确认删除",
            message: "确认删除该文件吗？此操作不可恢复。",
            confirmText: "确认删除",
            cancelText: "取消",
            type: "danger"
        });

        if (confirmed) {
            try {
                await FileStorageApi.deleteFile(id);
                message.success("删除成功", "文件已删除");
                await fetchFiles();
            } catch (error) {
                console.error('删除文件失败:', error);
                message.error("删除失败", "删除文件失败");
            }
        }
    };

    const getTypeIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) {
            return (
                <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            );
        } else if (mimeType.startsWith('video/')) {
            return (
                <svg className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            );
        } else if (mimeType.startsWith('audio/')) {
            return (
                <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
            );
        } else if (mimeType === 'application/pdf') {
            return (
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            );
        } else {
            return (
                <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            );
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    };

    const formatDateTime = (dateStr: string | null) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <PageMeta
                title="文件存储 | Orixa Admin"
                description="文件存储管理页面"
            />

            {/* 上传按钮和筛选器 */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        className="hidden"
                    />
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => fileInputRef.current?.click()}
                        isLoading={uploading}
                    >
                        上传文件
                    </Button>
                </div>
            </div>

            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">文件名</label>
                        <Input
                            type="text"
                            placeholder="搜索文件名"
                            value={filterFileName}
                            onChange={(e) => setFilterFileName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">MIME类型</label>
                        <Input
                            type="text"
                            placeholder="例如: image/png"
                            value={filterMimeType}
                            onChange={(e) => setFilterMimeType(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="flex items-end gap-2">
                        <Button variant="primary" size="md" onClick={handleSearch}>搜索</Button>
                        <Button variant="outline" size="md" onClick={handleReset}>重置</Button>
                    </div>
                </div>
            </div>

            {/* 统计信息 */}
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                共 {total} 个文件，第 {page}/{totalPages || 1} 页
            </div>

            {/* 文件列表 */}
            {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({length: 8}).map((_, i) => (
                        <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <div className="skeleton h-12 w-12 rounded"></div>
                            <div className="mt-2 skeleton h-4 w-full rounded"></div>
                            <div className="mt-1 skeleton h-3 w-2/3 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : files.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {files.map((file) => (
                        <div key={file.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    {getTypeIcon(file.mimeType)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white" title={file.fileName}>
                                        {file.fileName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatFileSize(file.fileSize)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {file.mimeType}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDateTime(file.createdAt)}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(file.id)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    删除
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 dark:border-gray-700 dark:bg-gray-900">
                    <svg className="mb-4 h-16 w-16 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                        暂无文件
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        点击上方按钮上传你的第一个文件
                    </p>
                </div>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => fetchFiles(page - 1)}
                    >
                        上一页
                    </Button>
                    <span className="flex items-center px-4 text-sm text-gray-700 dark:text-gray-300">
                        第 {page} / {totalPages} 页
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => fetchFiles(page + 1)}
                    >
                        下一页
                    </Button>
                </div>
            )}
        </>
    );
}
