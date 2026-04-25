import {useState, useEffect} from "react";
import {CreateMessageCommand} from "../../api/MessageApi.ts";
import {Modal} from "../ui/modal";
import Button from "../ui/button/Button";
import {useModal} from "../../hooks/useModal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import {useMessage} from "../ui/message";
import FoundationApi from "../../api/FoundationApi.ts";
import {User} from "../../types/user";

interface MessageModalProps {
    onSubmit: (data: CreateMessageCommand) => Promise<void>;
    onSent?: () => void;
}

export default function MessageModal({onSubmit, onSent}: MessageModalProps) {
    const modal = useModal();
    const message = useMessage();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [receiverIds, setReceiverIds] = useState<string[]>([]);
    const [priority, setPriority] = useState<'HIGH' | 'NORMAL' | 'LOW'>('NORMAL');
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoadingUsers(true);
                const result = await FoundationApi.listUsers({});
                setUsers(result);
            } catch (error) {
                console.error('获取用户列表失败:', error);
            } finally {
                setLoadingUsers(false);
            }
        };
        fetchUsers();
    }, []);

    const handleSubmit = async () => {
        if (!title.trim()) {
            message.warning("验证失败", "请输入消息标题");
            return;
        }
        if (receiverIds.length === 0) {
            message.warning("验证失败", "请选择收件人");
            return;
        }
        if (!content.trim()) {
            message.warning("验证失败", "请输入消息内容");
            return;
        }
        setLoading(true);
        try {
            // 为每个收件人发送消息
            for (const receiverId of receiverIds) {
                await onSubmit({title, content, receiverId, priority});
            }
            handleClose();
            if (onSent) {
                onSent();
            }
        } catch (error) {
            console.error('发送失败:', error);
            message.error("发送失败", "消息发送失败");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setTitle('');
        setContent('');
        setReceiverIds([]);
        setPriority('NORMAL');
        modal.closeModal();
    };

    return (
        <>
            <Button onClick={modal.openModal}>
                发送站内信
            </Button>
            <Modal
                isOpen={modal.isOpen}
                onClose={handleClose}
                className="w-full max-w-[600px] p-6 lg:p-10"
            >
                <div>
                    <h4 className="text-title-sm mb-1 font-semibold text-gray-800 dark:text-white/90">
                        发送站内信
                    </h4>
                    <p className="mb-7 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        填写站内信信息，发送给指定用户
                    </p>
                    <div className="space-y-4">
                        <div>
                            <Label>收件人（可多选） <span className="text-red-500">*</span></Label>
                            <select
                                className="h-24 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                value={receiverIds.length > 0 ? receiverIds[receiverIds.length - 1] : ''}
                                onChange={(e) => {
                                    const selectedOptions = Array.from(e.target.selectedOptions);
                                    const selectedIds = selectedOptions.map(opt => opt.value).filter(id => id !== '');
                                    setReceiverIds(selectedIds);
                                }}
                                disabled={loadingUsers}
                                multiple
                            >
                                <option value="" disabled>按住 Ctrl 多选</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                已选择 {receiverIds.length} 个收件人
                            </p>
                        </div>

                        <div>
                            <Label>标题 <span className="text-red-500">*</span></Label>
                            <Input
                                type="text"
                                placeholder="请输入消息标题"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>优先级</Label>
                            <select
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as 'HIGH' | 'NORMAL' | 'LOW')}
                            >
                                <option value="HIGH">紧急</option>
                                <option value="NORMAL">普通</option>
                                <option value="LOW">低</option>
                            </select>
                        </div>

                        <div>
                            <Label>内容 <span className="text-red-500">*</span></Label>
                            <textarea
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                placeholder="请输入消息内容"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={6}
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col-reverse sm:flex-row w-full items-center justify-end gap-3">
                        <Button variant="outline" onClick={handleClose} disabled={loading}>
                            取消
                        </Button>
                        <Button onClick={handleSubmit} isLoading={loading}>
                            {receiverIds.length > 1 ? '群发' : '发送'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
