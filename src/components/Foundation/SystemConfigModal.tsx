import {useState} from "react";
import {CreateSystemConfigCommand} from "../../api/SystemConfigApi.ts";
import {Modal} from "../ui/modal";
import Button from "../ui/button/Button";
import {useModal} from "../../hooks/useModal";
import Label from "../form/Label";
import Input from "../form/input/InputField";

interface SystemConfigModalProps {
    onSubmit: (data: CreateSystemConfigCommand) => void;
}

export default function SystemConfigModal({onSubmit}: SystemConfigModalProps) {
    const modal = useModal();
    const [configKey, setConfigKey] = useState('');
    const [configValue, setConfigValue] = useState('');
    const [configType, setConfigType] = useState<'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON'>('STRING');
    const [category, setCategory] = useState<'GENERAL' | 'SECURITY' | 'EMAIL' | 'NOTIFICATION'>('GENERAL');
    const [description, setDescription] = useState('');
    const [isEncrypted, setIsEncrypted] = useState(false);
    const [isReadonly, setIsReadonly] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!configKey.trim() || !configValue.trim()) {
            return;
        }
        setLoading(true);
        try {
            await onSubmit({
                configKey,
                configValue,
                configType,
                category,
                description: description || undefined,
                isEncrypted,
                isReadonly
            });
            handleClose();
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setConfigKey('');
        setConfigValue('');
        setConfigType('STRING');
        setCategory('GENERAL');
        setDescription('');
        setIsEncrypted(false);
        setIsReadonly(false);
        modal.closeModal();
    };

    return (
        <>
            <Button onClick={modal.openModal}>
                创建配置
            </Button>
            <Modal
                isOpen={modal.isOpen}
                onClose={handleClose}
                className="w-full max-w-[600px] p-6 lg:p-10"
            >
                <div>
                    <h4 className="text-title-sm mb-1 font-semibold text-gray-800 dark:text-white/90">
                        创建系统配置
                    </h4>
                    <p className="mb-7 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        填写配置信息，创建新的系统配置项
                    </p>
                    <div className="space-y-4">
                        <div>
                            <Label>配置键 <span className="text-red-500">*</span></Label>
                            <Input
                                type="text"
                                placeholder="例如: system.name"
                                value={configKey}
                                onChange={(e) => setConfigKey(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>配置值 <span className="text-red-500">*</span></Label>
                            <textarea
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                placeholder="请输入配置值"
                                value={configValue}
                                onChange={(e) => setConfigValue(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>配置类型</Label>
                                <select
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    value={configType}
                                    onChange={(e) => setConfigType(e.target.value as 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON')}
                                >
                                    <option value="STRING">字符串</option>
                                    <option value="NUMBER">数字</option>
                                    <option value="BOOLEAN">布尔</option>
                                    <option value="JSON">JSON</option>
                                </select>
                            </div>
                            <div>
                                <Label>分类</Label>
                                <select
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as 'GENERAL' | 'SECURITY' | 'EMAIL' | 'NOTIFICATION')}
                                >
                                    <option value="GENERAL">通用</option>
                                    <option value="SECURITY">安全</option>
                                    <option value="EMAIL">邮件</option>
                                    <option value="NOTIFICATION">通知</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <Label>描述</Label>
                            <Input
                                type="text"
                                placeholder="配置描述（可选）"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-6">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={isEncrypted}
                                    onChange={(e) => setIsEncrypted(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">加密存储</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={isReadonly}
                                    onChange={(e) => setIsReadonly(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">只读</span>
                            </label>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col-reverse sm:flex-row w-full items-center justify-end gap-3">
                        <Button variant="outline" onClick={handleClose} disabled={loading}>
                            取消
                        </Button>
                        <Button onClick={handleSubmit} isLoading={loading}>
                            创建
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
