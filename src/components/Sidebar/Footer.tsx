import { Badge } from "antd";
import classNames from "classnames";
import { SettingOutlined, SoundFilled } from "@ant-design/icons";
import Setting from "@/components/Setting";
import { useContext, useState } from "react";
import { AppStore } from "@/store/App";
import ClientOnly from "@/components/ClientOnly";

const Footer: React.FC = () => {
    const [settingOpen, setSettingOpen] = useState(false);
    const { notice } = useContext(AppStore);

    return (
        <>
            <ClientOnly>
                <Badge
                    count={notice ? <SoundFilled className="text-red-500 animate-pulse" /> : null}
                    className="w-full"
                >
                    <button
                        onClick={() => setSettingOpen(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-sm text-gray-700 dark:text-white bg-transparent hover:bg-[#d3e3fd] hover:text-[#1a73e8] dark:hover:bg-[#2d2e30] transition-colors border-0 outline-none"
                    >
                        <SettingOutlined className="text-base" />
                        <span>设置与帮助</span>
                    </button>
                </Badge>
            </ClientOnly>
            <Setting open={settingOpen} notice={notice} onCancel={() => setSettingOpen(false)} />
        </>
    );
};

export default Footer;
