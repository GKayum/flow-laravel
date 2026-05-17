import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const ChatContext = createContext()

export function ChatProvider({ children }) {
    const [chats, setChats] = useState([])
    const [chatsLoading, setChatsLoading] = useState(true)
    const [selectedChat, setSelectedChat] = useState(null)

    useEffect(() => {
        api.get('/api/chat/list')
            .then(response => {
                console.log(response);
                setChats(response.data)
            })
            .catch(error => {
                console.error('Chats load error:', error.response?.status, error.response?.data)
            })
            .finally(() => setChatsLoading(false))
    }, [])

    const onSelectChat = useCallback((chat) => {
        setSelectedChat(chat)
    }, [])

    const closeChat = useCallback(() => setSelectedChat(null), [])

    return (
        <ChatContext.Provider value={{
            chats,
            chatsLoading,
            selectedChat,
            setChats,
            onSelectChat,
            onCloseChat: closeChat,
        }}>
            {children}
        </ChatContext.Provider>
    )
}

export function useChat() {
    return useContext(ChatContext)
}