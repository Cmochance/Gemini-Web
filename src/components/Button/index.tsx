import dynamic from "next/dynamic";
import { ButtonProps } from "antd";
import { useContext, useRef } from "react";
import { UserStore } from "@/store/User";

export default dynamic(
    () =>
        import("antd").then((mod) => {
            const { Button } = mod;
            const HookButton = ({ onClick, ...props }: ButtonProps) => {
                const buttonRef = useRef<HTMLButtonElement | null>(null);
                const { userInfo } = useContext(UserStore);

                return (
                    <Button
                        {...props}
                        ref={buttonRef}
                        onClick={(e) => {
                            // 如果 umami 统计工具存在，则记录点击事件
                            if (typeof window !== 'undefined' && window.umami) {
                                const name = buttonRef.current?.innerText;
                                const icon = buttonRef.current
                                    ?.querySelector(".anticon")
                                    ?.getAttribute("aria-label");
                                window.umami.track(name || icon || "未知的按钮", {
                                    email: userInfo?.email,
                                    nickName: userInfo?.nickName,
                                });
                            }
                            onClick?.(e as any);
                        }}
                    />
                );
            };
            return HookButton;
        }),
    {
        ssr: false,
    }
);
