import useIsMobile from "@/hooks/useIsMobile";
import Button from "@/components/Button";
import classNames from "classnames";
import { useContext, useEffect, useMemo, useState } from "react";
import { DownloadOutlined, ProfileOutlined, SendOutlined } from "@ant-design/icons";
import { Mentions, Modal, App, Select } from "antd";
import { ChatStore, DEFAULT_TITLE, Model } from "@/store/Chat";
import useChatProgress from "@/hooks/useChatProgress";
import downloadAsImage from "@/utils/downloadAsImage";
import { useAppStore } from "@/stores/useAppStore";
import { useUserStore } from "@/stores/useUserStore";
import http from "@/service/http";
import ChatInput from "@/components/ChatInput";

interface Props {
    responding: boolean;
    onMessageUpdate: () => void;
    setResponding: (value: boolean) => void;
}

const Footer: React.FC<Props> = ({ onMessageUpdate, responding, setResponding }) => {
    const isMobile = useIsMobile();
    const { message } = App.useApp();
    const { chat, model, history, addChat, setModel, clearChat, updateHistory, active } =
        useContext(ChatStore);
    const hasContext = useAppStore((state) => state.hasContext);
    const setHasContext = useAppStore((state) => state.setHasContext);
    const userInfo = useUserStore((state) => state.user);
    const [value, setValue] = useState("");
    const [availableModels, setAvailableModels] = useState<Array<{ id: string; type: string }>>([]);
    const { request } = useChatProgress(responding, setResponding);
    const uuid = active || 0;

    // 根据 base URL 推断模型提供商并返回默认模型列表
    const getDefaultModelsByProvider = (baseUrl: string): Array<{ id: string; type: string }> => {
        const url = baseUrl.toLowerCase();

        // 智谱 AI (GLM)
        if (url.includes('bigmodel.cn') || url.includes('zhipuai')) {
            return [
                { id: 'glm-4.7', type: 'chat' },
                { id: 'glm-4.6', type: 'chat' },
                { id: 'glm-4.5', type: 'chat' },
                { id: 'glm-4.5-air', type: 'chat' },
                { id: 'glm-4-flash', type: 'chat' },
            ];
        }

        // OpenAI
        if (url.includes('openai.com') || url.includes('api.openai')) {
            return [
                { id: 'gpt-4o', type: 'chat' },
                { id: 'gpt-4o-mini', type: 'chat' },
                { id: 'gpt-4-turbo', type: 'chat' },
                { id: 'gpt-3.5-turbo', type: 'chat' },
            ];
        }

        // Anthropic (Claude)
        if (url.includes('anthropic') || url.includes('claude')) {
            return [
                { id: 'claude-3-5-sonnet-20241022', type: 'chat' },
                { id: 'claude-3-5-haiku-20241022', type: 'chat' },
                { id: 'claude-3-opus-20240229', type: 'chat' },
            ];
        }

        // Google (Gemini)
        if (url.includes('google') || url.includes('gemini')) {
            return [
                { id: 'gemini-2.0-flash-exp', type: 'chat' },
                { id: 'gemini-exp-1206', type: 'chat' },
                { id: 'gemini-1.5-pro', type: 'chat' },
                { id: 'gemini-1.5-flash', type: 'chat' },
            ];
        }

        // DeepSeek
        if (url.includes('deepseek')) {
            return [
                { id: 'deepseek-chat', type: 'chat' },
                { id: 'deepseek-coder', type: 'chat' },
            ];
        }

        // 默认返回通用模型列表
        return [
            { id: 'gpt-4o', type: 'chat' },
            { id: 'gpt-4o-mini', type: 'chat' },
            { id: 'gpt-3.5-turbo', type: 'chat' },
        ];
    };
    const conversationList = useMemo(() => {
        return chat.find((item) => item.uuid === uuid)?.data || [];
    }, [chat, uuid]);
    const currentHistory = useMemo(() => {
        return history.find((item) => item.uuid === uuid);
    }, [history, uuid]);
    const mentionOptions = useMemo(() => {
        const options = [
            {
                label: "图片模式-CogView-3",
                value: "image$cogview-3",
            },
            {
                label: "图片模式-CogView-3-Plus",
                value: "image$cogview-3-plus",
            },
        ];

        return options;
    }, []);

    // Fetch available models on component mount
    useEffect(() => {
        const fetchModels = async () => {
            try {
                // 1. 尝试从 API 获取模型列表
                const response = await http.getModels('chat');
                if (response?.data && response.data.length > 0) {
                    console.log('Successfully fetched models from API:', response.data);
                    setAvailableModels(response.data);
                    return;
                }
            } catch (error) {
                console.warn("Failed to fetch models from API, using fallback:", error);
            }

            // 2. API 失败或返回空列表，使用基于 base URL 的默认模型列表
            try {
                // 从后端获取当前配置的 base URL
                const configResponse = await fetch('/api/v1/openai/v1/config');
                if (configResponse.ok) {
                    const config = await configResponse.json();
                    const baseUrl = config?.data?.baseURL || 'https://api.openai.com/v1';
                    console.log('Using default models for base URL:', baseUrl);
                    const defaultModels = getDefaultModelsByProvider(baseUrl);
                    setAvailableModels(defaultModels);
                } else {
                    // 如果配置获取也失败，使用智谱 AI 的默认模型（因为 .env 中配置的是智谱）
                    console.log('Using default GLM models');
                    setAvailableModels([
                        { id: 'glm-4.7', type: 'chat' },
                        { id: 'glm-4.6', type: 'chat' },
                        { id: 'glm-4.5', type: 'chat' },
                        { id: 'glm-4.5-air', type: 'chat' },
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch config, using GLM defaults:", error);
                // 最终后备：使用智谱 AI 默认模型
                setAvailableModels([
                    { id: 'glm-4.7', type: 'chat' },
                    { id: 'glm-4.6', type: 'chat' },
                    { id: 'glm-4.5', type: 'chat' },
                ]);
            }
        };
        fetchModels();
    }, []);

    const submit = async (text: string) => {
        let message = text.trim();
        if (!message || message === "/image") return;

        const isImage = message.startsWith("/image");
        if (isImage) {
            message = message.replace("/image", "").trim();
        }

        if (currentHistory?.title && currentHistory.title === DEFAULT_TITLE) {
            updateHistory({ title: message, uuid });
        }

        addChat(uuid, {
            dateTime: new Date().toLocaleString(),
            text: message,
            inversion: true,
            isImage,
            error: false,
            conversationOptions: null,
            requestOptions: { prompt: message, options: null },
        });
        setValue("");
        onMessageUpdate();

        const responseList = conversationList.filter((item) => !item.inversion && !item.error);
        const lastContext = responseList[responseList.length - 1]?.conversationOptions;
        const options =
            lastContext && hasContext ? { ...lastContext, isImage, model } : { isImage, model };
        addChat(uuid, {
            dateTime: new Date().toLocaleString(),
            text: "",
            loading: true,
            inversion: false,
            isImage,
            model,
            error: false,
            conversationOptions: null,
            requestOptions: { prompt: message, options },
        });
        onMessageUpdate();

        //  if converationList is empty, update index should be 1, because there are two addChat method executes
        request(conversationList.length ? conversationList.length - 1 : 1, onMessageUpdate);
    };

    const onChangeContext = () => {
        setHasContext(!hasContext);
        message.success("当前会话已" + (hasContext ? "关闭" : "开启") + "上下文");
    };

    const onDownload = () => {
        const dom = document.querySelector("#image-wrapper") as HTMLElement;
        const title = currentHistory?.title || DEFAULT_TITLE;
        if (dom) {
            downloadAsImage(dom, title.substring(0, 10));
        }
    };

    const onPressEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!isMobile) {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit((e.target as HTMLTextAreaElement).value);
            }
        } else {
            if (e.key === "Enter" && e.ctrlKey) {
                e.preventDefault();
                submit((e.target as HTMLTextAreaElement).value);
            }
        }
    };

    const onInputChange = (value: string) => {
        const regx = new RegExp("/image\\$\\s*([^\\s]+)");
        setValue(value.replace(regx, "/image"));
    };

    return (
        <footer
            className={classNames(
                isMobile
                    ? ["sticky", "left-0", "bottom-0", "right-0", "overflow-hidden"]
                    : []
            )}
        >
            <ChatInput
                value={value}
                onChange={onInputChange}
                onSubmit={submit}
                model={model}
                onModelChange={setModel}
                availableModels={availableModels}
                disabled={responding}
            />
        </footer>
    );
};

export default Footer;
