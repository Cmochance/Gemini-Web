import { AppStore } from "@/store/App";
import { ChatStore } from "@/store/Chat";
import { useContext, useEffect, useRef } from "react";

const useChatProgress = (responding: boolean, setResponding: (e: boolean) => void) => {
    const { chat, updateChat, active } = useContext(ChatStore);
    const { token } = useContext(AppStore);
    const controller = useRef<AbortController>();
    const uuid = active || 0;

    const request = async (index: number, onMessageUpdate?: () => void) => {
        const conversationList = chat.find((item) => item.uuid === uuid)?.data || [];
        const currentChat = conversationList[index];
        if (!currentChat) return;

        const message = currentChat.requestOptions?.prompt ?? "";
        const options = currentChat.requestOptions?.options ?? {};

        if (currentChat.text) {
            updateChat(uuid, index, {
                ...currentChat,
                dateTime: new Date().toLocaleString(),
                text: "",
                loading: true,
                error: false,
            });
        }

        setResponding(true);
        try {
            controller.current = new AbortController();
            const { signal } = controller.current;

            // Use native fetch for true streaming support
            const response = await fetch("/api/chat-progress", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: token,
                },
                body: JSON.stringify({
                    prompt: message,
                    options,
                }),
                signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("Response body is not readable");
            }

            const decoder = new TextDecoder();
            let buffer = "";
            let lastParsedText = ""; // Track last successfully parsed text

            // Process streaming response with ReadableStream
            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    // Stream完成,解析最后一行设置最终状态
                    const lines = buffer.trim().split('\n').filter(line => line.trim());
                    if (lines.length > 0) {
                        const lastLine = lines[lines.length - 1];
                        try {
                            const data = JSON.parse(lastLine);
                            updateChat(uuid, index, {
                                dateTime: new Date().toLocaleString(),
                                text: data.text ?? lastParsedText,
                                inversion: false,
                                error: false,
                                loading: false,
                                conversationOptions: {
                                    conversationId: data.conversationId,
                                    parentMessageId: data.id,
                                },
                                requestOptions: { prompt: message, options: { ...options } },
                            });
                            onMessageUpdate?.();
                        } catch {
                            // Use last successfully parsed text
                            updateChat(uuid, index, {
                                dateTime: new Date().toLocaleString(),
                                text: lastParsedText,
                                inversion: false,
                                error: false,
                                loading: false,
                                conversationOptions: null,
                                requestOptions: { prompt: message, options: { ...options } },
                            });
                            onMessageUpdate?.();
                        }
                    }
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                //  if the response is image
                if (options.isImage) {
                    try {
                        const { data = [] } = JSON.parse(buffer);
                        const images = data.map((item: { url: string }) => item.url);
                        const taskIds = data.map((item: { taskId: string }) => item.taskId);
                        updateChat(uuid, index, {
                            dateTime: new Date().toLocaleString(),
                            text: images.join(","),
                            images,
                            taskId: taskIds[0],
                            isImage: true,
                            inversion: false,
                            error: false,
                            loading: false,
                            model: currentChat.model,
                            conversationOptions: null,
                            requestOptions: { prompt: message, options: { ...options } },
                        });
                        onMessageUpdate?.();
                    } catch {
                        // 未完整接收,继续等待
                    }
                } else {
                    // Process streaming text response - parse all complete lines immediately
                    const lines = buffer.split('\n');

                    // Process all complete lines except the last (which might be incomplete)
                    for (let i = 0; i < lines.length - 1; i++) {
                        const line = lines[i].trim();
                        if (line) {
                            try {
                                const data = JSON.parse(line);
                                const newText = data.text ?? "";
                                // Only update if text changed to avoid unnecessary renders
                                if (newText !== lastParsedText) {
                                    lastParsedText = newText;
                                    updateChat(uuid, index, {
                                        dateTime: new Date().toLocaleString(),
                                        text: newText,
                                        inversion: false,
                                        error: false,
                                        loading: true, // Keep loading while streaming
                                        conversationOptions: {
                                            conversationId: data.conversationId,
                                            parentMessageId: data.id,
                                        },
                                        requestOptions: { prompt: message, options: { ...options } },
                                    });
                                    onMessageUpdate?.();
                                }
                            } catch {
                                // Skip malformed lines
                            }
                        }
                    }

                    // Keep the last line in buffer (might be incomplete)
                    buffer = lines[lines.length - 1];
                }
            }
        } catch (error: any) {
            if (!error && !currentChat.isImage) {
                return;
            }

            // 提取详细的错误信息
            let errorMessage = "好像出错了，请稍后再试";

            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (error?.statusText) {
                errorMessage = `${error.status} ${error.statusText}`;
            }

            // 在控制台输出完整错误信息，方便调试
            console.error("聊天请求失败:", {
                message: errorMessage,
                fullError: error,
                response: error?.response,
            });

            updateChat(uuid, index, {
                dateTime: new Date().toLocaleString(),
                text: `❌ ${errorMessage}`,
                inversion: false,
                error: true,
                loading: false,
                isImage: currentChat.isImage,
                model: currentChat.model,
                images: [],
                conversationOptions: null,
                requestOptions: { prompt: message, options: { ...options } },
            });
            onMessageUpdate?.();
        } finally {
            setResponding(false);
        }
    };

    useEffect(() => {
        if (!responding && controller.current) {
            controller.current.abort();
        }
    }, [responding]);

    useEffect(() => {
        if (controller.current) {
            controller.current.abort();
        }
    }, [uuid]);

    return { request };
};

export default useChatProgress;
