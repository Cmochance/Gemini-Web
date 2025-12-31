import storage from "@/service/localStorage";
import http from "@/service/http";
import { createContext, Dispatch, SetStateAction, useEffect, useState } from "react";

export interface ConversationRequest {
    conversationId?: string;
    parentMessageId?: string;
    isImage?: boolean;
    model?: Model;
    taskId?: string;
    operate?: string;
    operateIndex?: number;
}

export interface History {
    title: string;
    uuid: number;
}

export type Model =
    | "chat$glm-4.5-air"
    | "chat$glm-4.7"
    | "image$cogview-3"
    | "image$cogview-3-plus"
    | "image$cogview-3-plus";

export interface ChatData {
    dateTime: string;
    text: string;
    inversion?: boolean;
    error?: boolean;
    loading?: boolean;
    isImage?: boolean;
    images?: string[];
    taskId?: string;
    model?: Model;
    conversationOptions?: ConversationRequest | null;
    requestOptions: { prompt: string; options?: ConversationRequest | null };
}

export interface Chat {
    active: number | null;
    history: History[];
    chat: { uuid: number; data: ChatData[] }[];
    model: Model;
    setModel: Dispatch<SetStateAction<Model>>;
    addHistory: (history: History) => void;
    deleteHistory: (uuid: number) => void;
    updateHistory: (history: History) => void;
    loadHistory: () => Promise<void>;
    addChat: (uuid: number, chat: ChatData) => void;
    clearChat: (uuid: number) => void;
    updateChat: (uuid: number, index: number, chat: ChatData) => void;
    deleteChat: (uuid: number, index: number) => void;
}

export const ChatStore = createContext<Chat>({} as Chat);

export const DEFAULT_UUID = 1002;
export const LOCAL_NAME = "chatStorage";
export const DEFAULT_TITLE = "New Chat";
const DEFAULT_CHAT = {
    active: DEFAULT_UUID,
    history: [
        {
            uuid: DEFAULT_UUID,
            title: DEFAULT_TITLE,
        },
    ],
    chat: [{ uuid: DEFAULT_UUID, data: [] as ChatData[] }],
};

const chatStorage = storage<Chat>();
const savedData = chatStorage.get(LOCAL_NAME);
const defaultValue = {
    active: savedData?.active || DEFAULT_CHAT.active,
    chat: savedData?.chat || DEFAULT_CHAT.chat,
    history: DEFAULT_CHAT.history, // Don't load history from localStorage
};

const Chat: React.FC<{ children: React.ReactNode; chatId?: string }> = ({ children, chatId }) => {
    const [active, setActive] = useState(chatId ? Number(chatId) : defaultValue.active);
    const [history, setHistory] = useState(defaultValue.history);
    const [chat, setChat] = useState(defaultValue.chat);
    const [model, setModel] = useState<Model>("chat$glm-4.7");

    const addHistory = (h: History) => {
        history.push(h);
        setHistory([...history]);

        // Call backend API to create in database
        http.createConversation({ uuid: h.uuid, title: h.title }).catch((error) => {
            console.error("Failed to create conversation in backend:", error);
        });
    };

    const deleteHistory = (uuid: number) => {
        const newHistory = history.filter((item) => item.uuid !== uuid);
        setHistory(newHistory);

        // Also remove the chat data for this conversation
        const newChat = chat.filter((item) => item.uuid !== uuid);
        setChat(newChat);

        // Call backend API to delete from database
        http.deleteConversation(uuid).catch((error) => {
            console.error("Failed to delete conversation from backend:", error);
        });
    };

    const updateHistory = (h: History) => {
        const newHistory = history.map((item) => (item.uuid === h.uuid ? h : item));
        setHistory(newHistory);

        // Call backend API to update in database
        http.updateConversation(h.uuid, { title: h.title }).catch((error) => {
            console.error("Failed to update conversation in backend:", error);
        });
    };

    const loadHistory = async () => {
        try {
            const conversations = await http.getConversations();
            if (conversations && conversations.length > 0) {
                const historyFromBackend = conversations.map(conv => ({
                    uuid: Number(conv.uuid),
                    title: conv.title
                }));
                setHistory(historyFromBackend);
            } else {
                // If no conversations in backend, use default
                setHistory(DEFAULT_CHAT.history);
            }
        } catch (error) {
            console.error("Failed to load conversations from backend:", error);
            // Keep current history on error
        }
    };

    const addChat = (uuid: number, c: ChatData) => {
        if (!uuid || uuid === 0) {
            return;
        }

        const isNotExists = chat.findIndex((item) => item.uuid === uuid) === -1;
        if (isNotExists) {
            chat.push({ uuid, data: [c] });
        } else {
            chat.forEach((item) => {
                if (item.uuid === uuid) {
                    item.data.push(c);
                }
            });
        }

        setChat([...chat]);
    };

    const updateChat = (uuid: number, index: number, c: ChatData) => {
        if (!uuid || uuid === 0) {
            return;
        }

        chat.forEach((item) => {
            if (item.uuid === uuid) {
                item.data[index] = c;
            }
        });

        setChat([...chat]);
    };

    const deleteChat = (uuid: number, index: number) => {
        if (!uuid || uuid === 0) {
            return;
        }

        chat.forEach((item) => {
            if (item.uuid === uuid) {
                item.data.splice(index, 1);
            }
        });

        setChat([...chat]);
    };

    const clearChat = (uuid: number) => {
        chat.forEach((item) => {
            if (item.uuid === uuid) {
                item.data = [];
            }
        });

        setChat([...chat]);
    };

    useEffect(() => {
        if (chatId) {
            setActive(Number(chatId));
        }
    }, [chatId]);

    useEffect(() => {
        // Only save chat data and active state to localStorage, not history
        // History should be loaded from backend on each session
        chatStorage.set(LOCAL_NAME, { active, chat } as any);
    }, [active, chat]);

    return (
        <ChatStore.Provider
            value={{
                active,
                history,
                chat,
                model,
                setModel,
                addHistory,
                deleteHistory,
                updateHistory,
                loadHistory,
                addChat,
                clearChat,
                updateChat,
                deleteChat,
            }}
        >
            {children}
        </ChatStore.Provider>
    );
};

export default Chat;
