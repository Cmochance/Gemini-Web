import { useContext, useState } from "react";
import classNames from "classnames";
import { Input, Dropdown } from "antd";
import { DeleteOutlined, EditOutlined, MoreOutlined } from "@ant-design/icons";
import { ChatStore } from "@/store/Chat";
import { useRouter } from "next/navigation";
import type { MenuProps } from "antd";

interface Props {
    title: string;
    uuid: number;
}

const History: React.FC<Props> = ({ uuid, title }) => {
    const { active, history, deleteHistory, updateHistory, chat } = useContext(ChatStore);
    const [isEdit, setIsEdit] = useState(false);
    const [value, setValue] = useState(title);
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();

    // 获取当前对话的聊天数据
    const currentChat = chat.find((item) => item.uuid === uuid);
    const hasMessages = currentChat && currentChat.data.length > 0;

    // 如果有消息且标题是"New Chat"，自动提取第一个问题的前10个字作为标题
    const displayTitle = title === "New Chat" && hasMessages
        ? currentChat.data[0].text.slice(0, 10) + (currentChat.data[0].text.length > 10 ? "..." : "")
        : title;

    const onEditOk = () => {
        updateHistory({ uuid, title: value });
        setIsEdit(false);
    };

    const onBlur = () => {
        // 失去焦点时自动保存
        if (isEdit) {
            onEditOk();
        }
    };

    const onHistoryClick = () => {
        router.push(`/chat/${uuid}`);
    };

    const onDelete = () => {
        deleteHistory(uuid);

        const firstHistory = history.filter((item) => item.uuid !== uuid)[0];
        if (firstHistory) {
            setTimeout(() => router.push(`/chat/${firstHistory.uuid}`), 0);
        } else {
            setTimeout(() => router.push('/'), 0);
        }
    };

    // 下拉菜单配置
    const menuItems: MenuProps['items'] = [
        {
            key: 'rename',
            label: '重命名',
            icon: <EditOutlined />,
            onClick: () => setIsEdit(true),
        },
        {
            key: 'delete',
            label: '删除',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: onDelete,
        },
    ];

    return (
        <button
            className={classNames(
                "relative flex items-center w-full px-3 py-2.5 mb-2 rounded-full text-sm text-left",
                "bg-transparent hover:bg-[#d3e3fd] hover:text-[#1a73e8] dark:hover:bg-[#2d2e30] transition-colors",
                "border-0 outline-none cursor-pointer",
                active === uuid && "bg-[#d3e3fd] text-[#1a73e8] dark:bg-[#2d2e30]"
            )}
            onClick={onHistoryClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-gray-800 dark:text-white">
                {isEdit ? (
                    <Input
                        value={value}
                        className="text-xs h-full p-1"
                        size="small"
                        autoFocus
                        onChange={(e) => setValue(e.target.value)}
                        onPressEnter={onEditOk}
                        onBlur={onBlur}
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span>{displayTitle}</span>
                )}
            </div>
            {(isHovered || active === uuid) && !isEdit && (
                <div className="absolute z-10 flex right-2" onClick={(e) => e.stopPropagation()}>
                    <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                        <span
                            className="ant-btn ant-btn-text flex items-center justify-center p-0 h-6 w-6 cursor-pointer hover:bg-[#c5d9f7] dark:hover:bg-[#3a3a3a] rounded"
                            style={{ color: "#1a73e8" }}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <MoreOutlined />
                        </span>
                    </Dropdown>
                </div>
            )}
        </button>
    );
};

export default History;
