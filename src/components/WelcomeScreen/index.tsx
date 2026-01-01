import GeminiIcon from "@/components/Avatar/GeminiIcon";
import { useContext } from "react";
import { UserStore } from "@/store/User";
import { ReactNode } from "react";

interface SuggestionCardProps {
    icon: string;
    text: string;
    onClick?: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ icon, text, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 px-5 py-3 rounded-full bg-[#f0f4f9] dark:bg-[#2d2e30] hover:bg-[#e8eef5] dark:hover:bg-[#3a3a3a] transition-colors text-left whitespace-nowrap"
        >
            <span className="text-[15px]">{icon}</span>
            <span className="text-[13px] text-gray-700 dark:text-gray-300">{text}</span>
        </button>
    );
};

interface WelcomeScreenProps {
    onSuggestionClick?: (text: string) => void;
    chatInput: ReactNode;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSuggestionClick, chatInput }) => {
    const { userInfo } = useContext(UserStore);
    // 规则: 如果用户名为空或未设置,使用邮箱@前面的内容作为默认用户名
    const userName = userInfo?.name || userInfo?.email?.split('@')[0] || 'Guest';

    const suggestions = [
        { icon: "✍️", text: "制作图片" },
        { icon: "🎬", text: "创作视频" },
        { icon: "🤔", text: "随便写点什么" },
        { icon: "📚", text: "帮我学习" },
        { icon: "⚡", text: "给我的一天注入活力" },
    ];

    return (
        <div className="flex flex-col items-center justify-center h-full px-6 w-full">
            <div className="flex flex-col items-center max-w-4xl w-full">
                {/* Greeting without icon */}
                <h1 className="text-[32px] font-normal text-gray-800 dark:text-gray-200 mb-8">
                    {userName},你好
                </h1>

                {/* Main Question */}
                <h2 className="text-[44px] leading-tight font-medium text-gray-900 dark:text-white mb-12 text-center">
                    需要我为你做些什么?
                </h2>

                {/* Chat Input */}
                <div className="w-full mb-4">
                    {chatInput}
                </div>

                {/* Suggestion Cards - Horizontal */}
                <div className="flex flex-wrap gap-2 justify-center w-full">
                    {suggestions.map((suggestion, index) => (
                        <SuggestionCard
                            key={index}
                            icon={suggestion.icon}
                            text={suggestion.text}
                            onClick={() => onSuggestionClick?.(suggestion.text)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;
