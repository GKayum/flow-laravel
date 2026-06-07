import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext"
import { useEcho } from "../hooks/useEcho";

const ChatContext = createContext()

export function ChatProvider({ children }) {
    const { user } = useAuth()
    const [chats, setChats] = useState([])
    const [chatsLoading, setChatsLoading] = useState(true)
    const [selectedChatId, setSelectedChatId] = useState(null)
    const [currentMessages, setCurrentMessages] = useState([])
    const [messagesLoading, setMessagesLoading] = useState(false)

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }, [])

    const showBrowserNotification = useCallback((message) => {
        if (document.visibilityState === 'hidden') {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification("Новое сообщение", {
                    body: `${message.user.name}: ${message.content}`,
                    icon: message.user.avatar || '/icons/default-avatar.png',
                })
            }
        }

    }, [])

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

    useEffect(() => {
        if (!selectedChatId) {
            setCurrentMessages([])
            return
        }
        let isCurrentRequest = true
        setMessagesLoading(true)

        api.get(`/api/message/${selectedChatId}/list`)
            .then(response => {
                if (isCurrentRequest) {
                    setCurrentMessages(response.data)
                    console.log(response.data);
                }
            })
            .catch(error => console.error('Messages load error:', error))
            .finally(() => {
                if (isCurrentRequest) setMessagesLoading(false)
            })

        return () => { isCurrentRequest = false }
    }, [selectedChatId])

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

    const updateMemberInChats = useCallback((updatedUser) => {
        const { name, avatar, email, dateOfBirth } = updatedUser

        setChats(prev => prev.map(chat => {
            const hasLatestMessageFromUser = chat.latestMessage?.user?.id === updatedUser.id
            return {
                ...chat,
                members: chat.members?.map(member =>
                    member.id === updatedUser.id 
                        ? { ...member, name, avatar, email, dateOfBirth } 
                        : member
                ),
                latestMessage: hasLatestMessageFromUser
                    ? { ...chat.latestMessage, user: { ...chat.latestMessage.user, ...updatedUser} }
                    : chat.latestMessage
            }
        }))
    }, [])

    const updateMemberInMessages = useCallback((updatedUser) => {
        const { name, avatar, email, dateOfBirth } = updatedUser
        setCurrentMessages(prev =>
            prev.map(message =>
                message.user?.id === updatedUser.id
                    ? { 
                        ...message, 
                        user: { 
                            ...message.user, 
                            name,
                            avatar,
                            email,
                            dateOfBirth,
                        } 
                    }
                    : message
            )
        )
    }, [])

    const channelName = user?.id ? `user.${user.id}` : null

    useEcho(channelName, "message.sent", (data) => {
        updateChat({ id: data.chat_id, latestMessage: data.message })
        showBrowserNotification(data.message)

        if (data.chat_id === selectedChatId) {
            setCurrentMessages(prev => [...prev, data.message])
        }
    }, [selectedChatId, updateChat, showBrowserNotification])

    useEcho(channelName, "message.updated", (data) => {
        if (data.chat_id === selectedChatId) {
            setCurrentMessages(prev =>
                prev.map(m => (m.id === data.message.id ? data.message : m))
            );
        }
        if (data.is_latest) {
            updateChat({ id: data.chat_id, latestMessage: data.message })
        }
    }, [selectedChatId, updateChat])

    useEcho(channelName, "message.deleted", (data) => {
        updateChat({ id: data.chat_id, latestMessage: data.latest_message })
        if (data.chat_id === selectedChatId) {
            setCurrentMessages(prev =>
                prev.filter(m => m.id !== data.message_id)
            );
        }
    }, [selectedChatId, updateChat])

    useEcho(channelName, "chat.created", (data) => {
        setChats(prev => [data.chat, ...prev])
    })

    useEcho(channelName, "chat.updated", (data) => {
        updateChat(data.chat)
    }, [updateChat])

    useEcho(channelName, "chat.deleted", (data) => {        
        setChats(prev =>
            prev.filter(chat => chat.id !== data.chat_id)
        )

        if (selectedChatId === data.chat_id) {
            setSelectedChatId(null)
            setCurrentMessages([])
        }
    }, [selectedChatId])

    useEcho(channelName, "chatmember.added", (data) => {
        setChats(prev =>
            prev.some(chat => chat.id === data.chat.id)
                ? prev.map(chat =>
                    chat.id === data.chat.id
                        ? { ...chat, members: data.members}
                        : chat)
                : [data.chat, ...prev]
        )
    }, [])

    useEcho(channelName, "chatmember.removed", (data) => {
        if (data.member_id === user?.id) {
            setChats(prev =>
                prev.filter(chat => chat.id !== data.chat_id)
            )

            if (selectedChatId === data.chat_id) {
                setSelectedChatId(null)
                setCurrentMessages([])
            }
        } else {
            updateChat({ id: data.chat_id, members: data.members })
        }
    }, [selectedChat, updateChat, user?.id])

    useEcho(channelName, "user.updated", (data) => {
        updateMemberInChats(data.user)
        updateMemberInMessages(data.user)
    }, [updateMemberInChats, updateMemberInMessages])

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
        updateMemberInMessages,
        updateMemberInChats,
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
        messagesLoading,
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