import {useState} from "react";
import {CreateMessageCommand} from "../../api/MessageApi.ts";
import {Modal} from "../ui/modal";
import Button from "../ui/button/Button";
import {useModal} from "../../hooks/useModal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import {useMessage} from "../ui/message";

interface MessageModalProps {
    onSubmit: (data: CreateMessageCommand) => Promise<void>;
    onSent?: () => void;
}

export default function MessageModal({onSubmit, onSent}: MessageModalProps) {
    const modal = useModal();
    const message = useMessage();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [receiverId, setReceiverId] = useState('');
    const [priority, setPriority] = useState<'HIGH' | 'NORMAL' | 'LOW'>('NORMAL');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim()) {
            message.warning("验证失败", "请输入消息标题");
            return;
        }
        if (!receiverId.trim()) {
            message.warning("验证失败", "请输入收件人ID");
            return;
        }
        if (!content.trim()) {
            message.warning("验证失败", "请输入消息内容");
            return;
        }
        setLoading(true);
        try {
            await onSubmit({title, content, receiverId, priority});
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
        setReceiverId('');
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
                            <Label>收件人ID <span className="text-red-500">*</span></Label>
                            <Input
                                type="text"
                                placeholder="请输入收件人用户ID"
                                value={receiverId}
                                onChange={(e) => setReceiverId(e.target.value)}
                            />
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
                            发送
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
