import http from "@/service/http";
import { createContext, Dispatch, SetStateAction, useState, useCallback } from "react";

export interface UserInfo {
    avatar: string;
    name: string;
    email: string;
    description: string;
    integral: number;
    inviteCode: string;
    nickName?: string;
    vipUser?: boolean;
}

export interface userStoreInterface {
    userInfo: UserInfo;
    refreshUserInfo: () => Promise<void>;
    setUserInfo: Dispatch<SetStateAction<UserInfo>>;
}

export const UserStore = createContext<userStoreInterface>({} as userStoreInterface);

const User: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userInfo, setUserInfo] = useState({
        avatar: "/author.jpg",
        name: "",  // 初始为空，避免显示错误的默认用户名
        email: "",
        integral: 0,
        inviteCode: "",
        description:
            'Star on <a href="https://github.com/Cmochance/Gemini-Web" class="color-[#3050fb]" target="_blank" >Github</a>',
    });

    // 使用 useCallback 避免在每次渲染时创建新的函数引用
    const refreshUserInfo = useCallback(async () => {
        const data = await http.getUserInfo();
        setUserInfo((prevInfo) => ({
            ...prevInfo,
            ...data,
            name: data.nickName || ""
        }));
    }, []); // 不依赖 userInfo，使用函数式更新

    return (
        <UserStore.Provider value={{ userInfo, refreshUserInfo, setUserInfo }}>
            {children}
        </UserStore.Provider>
    );
};

export default User;
