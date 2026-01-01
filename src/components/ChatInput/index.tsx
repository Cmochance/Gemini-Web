import { useState, KeyboardEvent } from 'react';
import { Select, Dropdown, MenuProps } from 'antd';
import { PlusOutlined, ToolOutlined, SendOutlined, DownOutlined } from '@ant-design/icons';
import useIsMobile from '@/hooks/useIsMobile';
import { Model } from '@/store/Chat';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
    model: Model;
    onModelChange: (model: Model) => void;
    availableModels: Array<{ id: string; type: string }>;
    disabled?: boolean;
    hideHintText?: boolean;
    hintText?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
    value,
    onChange,
    onSubmit,
    model,
    onModelChange,
    availableModels,
    disabled = false,
    hideHintText = false,
    hintText = "AI 可能会出错,请注意核查",
}) => {
    const isMobile = useIsMobile();

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (!isMobile) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (value.trim()) {
                    onSubmit(value);
                }
            }
        } else {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                if (value.trim()) {
                    onSubmit(value);
                }
            }
        }
    };

    const handleSendClick = () => {
        if (value.trim()) {
            onSubmit(value);
        }
    };

    const toolsMenuItems: MenuProps['items'] = [
        {
            key: 'upload',
            label: '上传文件',
            icon: <PlusOutlined />,
        },
        {
            key: 'image',
            label: '图片模式',
            icon: <ToolOutlined />,
        },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-4">
            {/* 外层大圆角矩形容器 */}
            <div className="bg-white dark:bg-[#2d2e30] border border-gray-300 dark:border-gray-600 rounded-[28px] shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.12),0_-2px_12px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.3),0_-2px_12px_rgba(0,0,0,0.2)] transition-shadow px-4 py-3">
                {/* 第一行：输入框 */}
                <div className="mb-2">
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                        placeholder="问问Gemini"
                        className="w-full bg-transparent border-0 outline-none resize-none text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-[15px]"
                        style={{
                            minHeight: '32px',
                            maxHeight: '200px',
                            lineHeight: '24px',
                        }}
                        rows={1}
                    />
                </div>

                {/* 第二行：工具栏 */}
                <div className="flex items-center justify-between">
                    {/* 左侧：加号 + 工具 */}
                    <div className="flex items-center gap-1">
                        {/* 加号按钮 */}
                        <button
                            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-0 outline-none bg-transparent text-gray-600 dark:text-gray-400"
                            aria-label="添加"
                        >
                            <PlusOutlined className="text-lg" />
                        </button>

                        {/* 工具按钮 */}
                        <Dropdown menu={{ items: toolsMenuItems }} placement="topLeft">
                            <button
                                className="flex items-center gap-1 px-3 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-0 outline-none bg-transparent text-gray-600 dark:text-gray-400 text-sm"
                                aria-label="工具"
                            >
                                <ToolOutlined className="text-base" />
                                <span>工具</span>
                            </button>
                        </Dropdown>
                    </div>

                    {/* 右侧：Pro + 发送按钮 */}
                    <div className="flex items-center gap-2">
                        {/* Pro 选择器 */}
                        <div className="rounded-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:shadow-md transition-all px-3">
                            <Select
                                value={model}
                                onChange={(value) => onModelChange(value as Model)}
                                variant="borderless"
                                size="middle"
                                suffixIcon={<DownOutlined className="text-gray-600 dark:text-gray-400 text-xs" />}
                                options={availableModels.map((m) => ({
                                    label: m.id.toUpperCase(),
                                    value: `chat$${m.id}`,
                                }))}
                                styles={{
                                    popup: {
                                        root: { minWidth: 200 }
                                    }
                                }}
                                placeholder="选择模型"
                                className="text-sm model-select-compact"
                                style={{
                                    color: 'inherit',
                                    minWidth: '85px',
                                }}
                            />
                        </div>

                        {/* 发送按钮 */}
                        <button
                            onClick={handleSendClick}
                            disabled={disabled || !value.trim()}
                            className="w-9 h-9 rounded-full flex items-center justify-center transition-all border-0 outline-none disabled:opacity-40 disabled:cursor-not-allowed bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                            aria-label="发送"
                        >
                            <SendOutlined className="text-lg" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 提示文字 */}
            {!isMobile && !hideHintText && (
                <div className="mt-2 text-[11px] text-center text-gray-400 dark:text-gray-500">
                    {hintText}
                </div>
            )}
        </div>
    );
};

export default ChatInput;
