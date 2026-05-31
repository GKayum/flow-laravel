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

    useEffect(() => {
        if (!selectedChatId) {
            setCurrentMessages([])
            return
        }

        setMessagesLoading(true)

        api.get(`/api/message/${selectedChatId}/list`)
            .then(response => setCurrentMessages(response.data))
            .catch(error => console.error('Messages load error:', error))
            .finally(() => setMessagesLoading(false))
    }, [selectedChatId])

    useEffect(() => {
        if (!user?.id || !window.Echo) return
        
        const channel = window.Echo.private(`user.${user.id}`)

        channel.listen('.message.sent', (data) => {
            updateChat({
                id: data.chat_id,
                latestMessage: data.message
            })

            if (data.chat_id === selectedChatId) {
                setCurrentMessages(prev => [...prev, data.message])
            }
        })

        channel.listen('.message.updated', (data) => {
            if (data.chat_id === selectedChatId) {
                setCurrentMessages(prev =>
                    prev.map(m => (m.id === data.message.id ? data.message : m))
                );
            }

            if (data.is_latest) {
                updateChat({
                    id: data.chat_id,
                    latestMessage: data.message
                })
            }
        })

        channel.listen('.message.deleted', (data) => {
            updateChat({
                id: data.chat_id,
                latestMessage: data.latest_message
            })

            if (data.chat_id === selectedChatId) {
                setCurrentMessages(prev =>
                    prev.filter(m => m.id !== data.message_id)
                );
            }
        })

        channel.listen('.chat.created', (data) => {
            // if (!data?.chat) return

            setChats(prev => [data.chat, ...prev])
        })

        channel.listen('.chat.updated', (data) => {
            // if (!data?.chat) return

            updateChat(data.chat)
        })

        channel.listen('.chat.deleted', (data) => {
            // if (!data?.chat_id) return

            setChats(prev =>
                prev.filter(chat => chat.id !== data.chat_id)
            )

            if (selectedChatId === data.chat_id) {
                setSelectedChatId(null)
                setCurrentMessages([])
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