import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext"

const ChatContext = createContext()

export function ChatProvider({ children }) {
    const [chats, setChats] = useState([])
    const [chatsLoading, setChatsLoading] = useState(true)
    const [selectedChatId, setSelectedChatId] = useState(null)

    const { user } = useAuth()

    const [currentMessages, setCurrentMessages] = useState([])
    const [messagesLoading, setMessagesLoading] = useState(false)

    useEffect(() => {
        api.get('/api/chat/list')
            .then(response => {
                setChats(response.data)
                console.log('chats: ', response.data);
            })
            .catch(error => {
                console.error('Chats load error:', error.response?.status, error.response?.data)
            })
            .finally(() => setChatsLoading(false))
    }, [])

    const selectedChat = useMemo(() => {
        return chats.find(chat => chat.id === selectedChatId) || null
    }, [chats, selectedChatId])

    const updateChat = useCallback((updatedChat) => {
        setChats(prev =>
            prev.map(chat =>
                chat.id === updatedChat.id
                    ? { ...chat, ...updatedChat }
                    : chat
            )
        )
    }, [])

    const loadMessages = useCallback(async (chatId) => {
        setMessagesLoading(true)

        try {
            const response = await api.get(`/api/message/${chatId}/list`)
            setCurrentMessages(response.data)
        } catch (error) {
            console.error('Messages load error:', error)
        } finally {
            setMessagesLoading(false)
        }
    }, [])

    useEffect(() => {
        if (selectedChatId) {
            loadMessages(selectedChatId)
        } else {
            setCurrentMessages([])
        }
    }, [selectedChatId, loadMessages])

    useEffect(() => {
        if (!user?.id || !window.Echo) return
        
        const channel = window.Echo.private(`user.${user.id}`)

        channel.listen('.message.sent', (data) => {
            const { chat_id, message } = data

            updateChat({
                id: chat_id,
                latestMessage: message
            })

            if (chat_id === selectedChatId) {
                setCurrentMessages(prev => [...prev, message])
            }
        })

        channel.listen('.message.updated', (data) => {
            const { chat_id, message, is_latest } = data

            if (chat_id === selectedChatId) {
                setCurrentMessages(prev =>
                    prev.map(m => (m.id === message.id ? message : m))
                );
            }

            if (is_latest) {
                updateChat({
                    id: chat_id,
                    latestMessage: message
                })
            }
        })

        channel.listen('.message.deleted', (data) => {
            const { chat_id, message_id, latest_message } = data;

            updateChat({
                id: chat_id,
                latestMessage: latest_message
            })

            if (chat_id === selectedChatId) {
                setCurrentMessages(prev =>
                    prev.filter(m => m.id !== message_id)
                );
            }
        })

        return () => {
            window.Echo.leave(`user.${user.id}`)
        }
    }, [user?.id, selectedChatId, updateChat])

    const openPersonalChat = useCallback(async (userId) => {
        try {
            const response = await api.post('/api/chat/personal', { user_id: userId })
            const personalChat = response.data

            setChats(prev =>
                prev.some(chat => chat.id === personalChat.id)
                    ? prev
                    : [personalChat, ...prev]
            )

            setSelectedChatId(personalChat.id)
        } catch (error) {
            console.error('Ошибка при открытии личного чата:', error)
        }
    }, [])

    const onSelectChat = useCallback((chat) => {
        setSelectedChatId(chat.id)
    }, [])

    const closeChat = useCallback(() => setSelectedChatId(null), [])

    const contextValue = useMemo(() => ({
        chats,
        chatsLoading,
        selectedChat,
        selectedChatId,
        setChats,
        updateChat,
        onSelectChat,
        openPersonalChat,
        onCloseChat: closeChat,
        currentMessages,
        setCurrentMessages,
        messagesLoading,
        setMessagesLoading,
    }), [
        chats, 
        chatsLoading, 
        selectedChat, 
        selectedChatId,
        updateChat,
        onSelectChat,
        openPersonalChat,
        closeChat,
        currentMessages,
        setCurrentMessages,
        messagesLoading,
        setMessagesLoading,
    ])

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    )
}

export function useChat() {
    return useContext(ChatContext)
}