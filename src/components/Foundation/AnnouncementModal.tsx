import {useState, useEffect} from "react";
import {Announcement, AnnouncementFormData} from "../../types/announcement.ts";
import {Modal} from "../ui/modal";
import Button from "../ui/button/Button";
import {useModal} from "../../hooks/useModal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import {useMessage} from "../ui/message";

interface AnnouncementModalProps {
    announcement?: Announcement | null;
    isOpen?: boolean;
    onClose?: () => void;
    onSubmit: (data: AnnouncementFormData) => Promise<void>;
    onCreated?: () => void;
}

export default function AnnouncementModal({announcement, isOpen: controlledIsOpen, onClose: controlledOnClose, onSubmit, onCreated}: AnnouncementModalProps) {
    const internalModal = useModal();
    const message = useMessage();

    const isControlled = controlledIsOpen !== undefined;
    const isOpen = isControlled ? controlledIsOpen : internalModal.isOpen;
    const onClose = isControlled ? controlledOnClose : internalModal.closeModal;

    const [title, setTitle] = useState(announcement?.title || '');
    const [content, setContent] = useState(announcement?.content || '');
    const [priority, setPriority] = useState<AnnouncementFormData['priority']>(announcement?.priority || 'NORMAL');
    const [loading, setLoading] = useState(false);

    const isEditMode = !!announcement;

    useEffect(() => {
        if (isOpen) {
            setTitle(announcement?.title || '');
            setContent(announcement?.content || '');
            setPriority(announcement?.priority || 'NORMAL');
        }
    }, [isOpen, announcement]);

    const handleSubmit = async () => {
        if (!title.trim()) {
            message.warning("验证失败", "请输入公告标题");
            return;
        }
        if (!content.trim()) {
            message.warning("验证失败", "请输入公告内容");
            return;
        }
        setLoading(true);
        try {
            await onSubmit({title, content, priority});
            handleClose();
            if (!isEditMode && onCreated) {
                onCreated();
            }
        } catch (error) {
            console.error('操作失败:', error);
            message.error("操作失败", isEditMode ? "更新公告失败" : "创建公告失败");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!isEditMode) {
            setTitle('');
            setContent('');
            setPriority('NORMAL');
        }
        onClose?.();
    };

    return (
        <>
            {!isControlled && (
                <Button onClick={internalModal.openModal}>
                    {isEditMode ? "编辑" : "创建公告"}
                </Button>
            )}
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                className="w-full max-w-[600px] p-6 lg:p-10"
            >
                <div>
                    <h4 className="text-title-sm mb-1 font-semibold text-gray-800 dark:text-white/90">
                        {isEditMode ? "编辑公告" : "创建公告"}
                    </h4>
                    <p className="mb-7 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        {isEditMode ? "修改公告信息" : "填写公告信息，创建新公告"}
                    </p>
                    <div className="space-y-4">
                        <div>
                            <Label>标题 <span className="text-red-500">*</span></Label>
                            <Input
                                type="text"
                                placeholder="请输入公告标题"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>优先级</Label>
                            <select
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as AnnouncementFormData['priority'])}
                            >
                                <option value="HIGH">高</option>
                                <option value="NORMAL">普通</option>
                                <option value="LOW">低</option>
                            </select>
                        </div>

                        <div>
                            <Label>内容 <span className="text-red-500">*</span></Label>
                            <textarea
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                placeholder="请输入公告内容"
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
                            {isEditMode ? "更新" : "创建"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
