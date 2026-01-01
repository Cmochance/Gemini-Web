import { Avatar as AvatarComp, AvatarProps } from "antd";
import { useContext } from "react";
import Image from "next/image";
import { UserStore } from "@/store/User";
import GeminiIcon from "./GeminiIcon";

interface Props extends AvatarProps {
    isUser?: boolean;
}

const Avatar: React.FC<Props> = ({ isUser, ...props }) => {
    const { userInfo } = useContext(UserStore);

    if (isUser) {
        return (
            <AvatarComp {...props} src={userInfo?.avatar}>
                {userInfo?.name || userInfo?.email?.[0]?.toUpperCase() || "U"}
            </AvatarComp>
        );
    }

    return (
        <div className="flex items-center justify-center w-8 h-8">
            <GeminiIcon />
        </div>
    );
};

export default Avatar;
