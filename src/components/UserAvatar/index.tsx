import { useContext } from "react";
import { UserStore } from "@/store/User";
import Avatar from "@/components/Avatar";

interface Props {}

const UserAvatar: React.FC<Props> = () => {
    const { userInfo } = useContext(UserStore);

    // 使用 email 作为备用显示名称，如果 name 为空
    const displayName = userInfo?.name || userInfo?.email || "用户";
    const displayDescription = userInfo?.description || "";

    return (
        <div className="flex items-center overflow-hidden p-2 rounded-lg bg-[#f0f4f9] dark:bg-[#2d2e30]">
            <div className="w-10 h-10 overflow-hidden rounded-full shrink-0">
                <Avatar isUser size="large" />
            </div>
            <div className="flex-1 min-w-0 ml-2">
                <h2 className="overflow-hidden font-bold text-base m-0 text-ellipsis whitespace-nowrap text-gray-800 dark:text-white">
                    {displayName}
                </h2>
                <p className="overflow-hidden text-xs m-0 text-gray-500 dark:text-gray-400 text-ellipsis whitespace-nowrap">
                    <span dangerouslySetInnerHTML={{ __html: displayDescription }} />
                </p>
            </div>
        </div>
    );
};

export default UserAvatar;
