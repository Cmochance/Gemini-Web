import { Badge, Button, Layout, List } from "antd";
import { useContext, useEffect } from "react";
import useIsMobile from "@/hooks/useIsMobile";
import { AppStore } from "@/store/App";
import History from "./History";
import Footer from "./Footer";
import useTheme from "@/hooks/useTheme";
import Scrollbar from "@/components/Scrollbar";
import { ChatStore, DEFAULT_TITLE } from "@/store/Chat";
import { useRouter } from "next/navigation";
import { LeftOutlined, SettingOutlined, SoundFilled } from "@ant-design/icons";
import classNames from "classnames";
import UserAvatar from "@/components/UserAvatar";
import ClientOnly from "@/components/ClientOnly";

interface Props {}

const Sidebar: React.FC<Props> = () => {
    const { sidebarCollapsed, setData, setSidebarCollapsed, notice } = useContext(AppStore);
    const isMobile = useIsMobile();
    const theme = useTheme();
    const router = useRouter();
    const { history, addHistory, loadHistory } = useContext(ChatStore);

    // Load conversations from backend on mount
    useEffect(() => {
        loadHistory();
    }, []);

    const onAddHistory = () => {
        const uuid = Date.now();
        addHistory({ title: DEFAULT_TITLE, uuid });
        router.push(`/chat/${uuid}`);
    };

    return (
        <>
            <Layout.Sider
                collapsed={sidebarCollapsed}
                collapsedWidth={isMobile ? 0 : 72}
                width={312}
                style={
                    isMobile
                        ? {
                              position: "fixed",
                              top: 0,
                              bottom: 0,
                              zIndex: 50,
                              backgroundColor: "#f0f4f9",
                          }
                        : {
                              backgroundColor: "#f0f4f9",
                          }
                }
                trigger={null}
                className={classNames(
                    "border-0 border-gray-200 border-solid dark:bg-[#1a1a1a]",
                    !sidebarCollapsed && "border-r dark:border-neutral-800"
                )}
            >
                {sidebarCollapsed && !isMobile ? (
                    // 折叠后的视图
                    <div className="flex flex-col items-center h-full bg-[#f0f4f9] dark:bg-[#1a1a1a] py-4 px-3">
                        {/* 顶部折叠按钮 */}
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#d3e3fd] hover:text-[#1a73e8] dark:hover:bg-[#2d2e30] transition-colors mb-4 border-0 outline-none bg-transparent"
                            aria-label="展开侧边栏"
                        >
                            <div className="flex flex-col gap-1 scale-75">
                                <span className="w-5 h-0.5 bg-gray-700 dark:bg-gray-300"></span>
                                <span className="w-5 h-0.5 bg-gray-700 dark:bg-gray-300"></span>
                                <span className="w-5 h-0.5 bg-gray-700 dark:bg-gray-300"></span>
                            </div>
                        </button>

                        {/* 发起新对话圆形按钮 */}
                        <button
                            onClick={onAddHistory}
                            className="w-12 h-12 rounded-full hover:bg-[#d3e3fd] hover:text-[#1a73e8] dark:hover:bg-[#2d2e30] flex items-center justify-center transition-colors mb-auto border-0 outline-none bg-transparent"
                            aria-label="发起新对话"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-300">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>

                        {/* 底部设置按钮 */}
                        <ClientOnly>
                            <Badge
                                count={notice ? <SoundFilled className="text-red-500 animate-pulse text-xs" /> : null}
                            >
                                <button
                                    onClick={() => {
                                        const event = new CustomEvent('openSettings');
                                        window.dispatchEvent(event);
                                    }}
                                    className="w-10 h-10 rounded-full hover:bg-[#d3e3fd] hover:text-[#1a73e8] dark:hover:bg-[#2d2e30] flex items-center justify-center transition-colors border-0 outline-none bg-transparent"
                                    aria-label="设置"
                                >
                                    <SettingOutlined className="text-gray-700 dark:text-gray-300 text-xl" />
                                </button>
                            </Badge>
                        </ClientOnly>
                    </div>
                ) : (
                    // 展开后的视图
                    <div
                        className="flex flex-col h-full bg-[#f0f4f9] dark:bg-[#1a1a1a]"
                        style={
                            isMobile
                                ? {
                                      paddingBottom: "env(safe-area-inset-bottom)",
                                  }
                                : {}
                        }
                    >
                        {/* 顶部区域: 折叠按钮 */}
                        <div className="flex items-center p-3 border-b border-gray-200 dark:border-neutral-800">
                            <button
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#d3e3fd] hover:text-[#1a73e8] dark:hover:bg-[#2d2e30] transition-colors border-0 outline-none bg-transparent"
                                aria-label="折叠侧边栏"
                            >
                                <div className="flex flex-col gap-1 scale-75">
                                    <span className="w-5 h-0.5 bg-gray-700 dark:bg-gray-300"></span>
                                    <span className="w-5 h-0.5 bg-gray-700 dark:bg-gray-300"></span>
                                    <span className="w-5 h-0.5 bg-gray-700 dark:bg-gray-300"></span>
                                </div>
                            </button>
                        </div>

                        {/* 发起新对话按钮 */}
                        <div className="p-3">
                            <button
                                onClick={onAddHistory}
                                className="w-full flex items-center justify-start gap-2 px-3 py-2.5 text-gray-800 dark:text-white bg-transparent hover:bg-[#d3e3fd] hover:text-[#1a73e8] dark:hover:bg-[#2d2e30] rounded-full transition-colors border-0 outline-none"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                <span>发起新对话</span>
                            </button>
                        </div>

                        {/* 对话标题 */}
                        <div className="py-2" style={{ paddingLeft: '17px', paddingRight: '12px' }}>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">对话</h3>
                        </div>

                        {/* 对话列表区域 */}
                        <div className="flex-1 min-h-0 overflow-hidden">
                            <Scrollbar>
                                {history.length ? (
                                    <List
                                        style={{ paddingLeft: '5px', paddingRight: '12px' }}
                                        dataSource={history}
                                        renderItem={(item) => <History {...item} />}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center mt-4 text-center text-gray-400 dark:text-neutral-500">
                                        <span className="text-sm">暂无对话</span>
                                    </div>
                                )}
                            </Scrollbar>
                        </div>

                        {/* 底部固定: 设置与帮助 */}
                        <div className="p-3 border-t border-gray-200 dark:border-neutral-800">
                            <Footer />
                        </div>
                    </div>
                )}
            </Layout.Sider>
            {isMobile && !sidebarCollapsed && (
                <div
                    className="fixed inset-0 z-40 bg-black/40"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
            )}
        </>
    );
};

export default Sidebar;
