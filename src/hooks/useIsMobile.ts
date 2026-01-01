import { useEffect, useState } from "react";
import debounce from "lodash/debounce";

const useIsMobile = (): boolean => {
    const [isMobile, setIsMobile] = useState(() => {
        // 在服务端和客户端首次渲染时都返回 false，避免 hydration 错误
        if (typeof window === 'undefined') return false;

        // 检查 user agent
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return true;
        }

        // 检查窗口宽度
        return window.innerWidth < 768;
    });

    useEffect(() => {
        // 初始检查
        const checkMobile = () => {
            if (
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                    navigator.userAgent
                )
            ) {
                setIsMobile(true);
                return;
            }
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();

        // 监听窗口大小变化
        const updateSize = debounce((): void => {
            setIsMobile(window.innerWidth < 768);
        }, 250);

        window.addEventListener("resize", updateSize);
        return (): void => {
            window.removeEventListener("resize", updateSize);
            updateSize.cancel();
        };
    }, []);

    return isMobile;
};

export default useIsMobile;
