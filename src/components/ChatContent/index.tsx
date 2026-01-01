import classNames from "classnames";
import { PauseCircleFilled } from "@ant-design/icons";
import Header from "@/components/Header";
import useIsMobile from "@/hooks/useIsMobile";
import useScroll from "@/hooks/useScroll";
import Message from "@/components/Message";
import Button from "@/components/Button";
import Footer from "@/components/Footer";
import { ChatStore } from "@/store/Chat";
import { useContext, useMemo, useState, useEffect } from "react";
import Scrollbar from "@/components/Scrollbar";
import useChatProgress from "@/hooks/useChatProgress";
import WelcomeScreen from "@/components/WelcomeScreen";
import ChatInput from "@/components/ChatInput";

const ChatContent = () => {
    const isMobile = useIsMobile();
    const { chat, history, deleteChat, active } = useContext(ChatStore);
    const [responding, setResponding] = useState(false);
    const [suggestionText, setSuggestionText] = useState("");
    const { scrollRef, scrollToBottom, scrollToTop } = useScroll();
    const { request } = useChatProgress(responding, setResponding);
    const uuid = active || 0;
    const dataSources = useMemo(() => {
        return chat.find((item) => item.uuid === uuid)?.data || [];
    }, [chat, uuid]);
    const currentChatHistory = useMemo(() => {
        return history.find((item) => item.uuid === uuid);
    }, [history, uuid]);

    const onMessageUpdate = () => setTimeout(() => scrollToBottom(), 0);

    // Scroll to bottom when data sources change or component mounts
    useEffect(() => {
        if (dataSources.length > 0) {
            setTimeout(() => scrollToBottom(), 100);
        }
    }, [dataSources.length, uuid]);

    const handleSuggestionClick = (text: string) => {
        setSuggestionText(text);
    };

    return (
        <div className="flex flex-col w-full h-full">
            {isMobile && <Header title={currentChatHistory?.title} scrollToTop={scrollToTop} />}
            <main className="flex-1 overflow-hidden">
                <Scrollbar ref={scrollRef}>
                    {dataSources.length ? (
                        <div
                            id="image-wrapper"
                            className={classNames(
                                "w-full",
                                "max-w-4xl",
                                "m-auto",
                                isMobile ? "p-2" : "p-4"
                            )}
                        >
                            {dataSources.map((item, index) => (
                                <Message
                                    key={index}
                                    {...item}
                                    onRegenerate={() => request(index, onMessageUpdate, true)}
                                    onDelete={() => deleteChat(uuid, index)}
                                />
                            ))}
                            {responding && (
                                <div className="sticky bottom-0 left-0 flex justify-center">
                                    <Button type="primary" onClick={() => setResponding(false)}>
                                        <PauseCircleFilled />
                                        停止对话
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div id="image-wrapper" className="w-full h-full">
                            <WelcomeScreen
                                onSuggestionClick={handleSuggestionClick}
                                chatInput={
                                    <Footer
                                        onMessageUpdate={onMessageUpdate}
                                        responding={responding}
                                        setResponding={setResponding}
                                        suggestionText={suggestionText}
                                        onSuggestionUsed={() => setSuggestionText("")}
                                        hideWrapper={true}
                                    />
                                }
                            />
                        </div>
                    )}
                </Scrollbar>
            </main>
            {dataSources.length > 0 && (
                <Footer
                    onMessageUpdate={onMessageUpdate}
                    responding={responding}
                    setResponding={setResponding}
                    suggestionText={suggestionText}
                    onSuggestionUsed={() => setSuggestionText("")}
                />
            )}
        </div>
    );
};

export default ChatContent;
