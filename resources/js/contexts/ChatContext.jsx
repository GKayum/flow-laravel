import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext"
import { useEcho } from "../hooks/useEcho";

const ChatContext = createContext()

const messagesReducer = (state, action) => {
    switch (action.type) {
        case 'CLEAR':
            return { data: [], loading: false };
        case 'LOAD_START':
            return { data: [], loading: true };
        case 'LOAD_SUCCESS':
            return { data: action.payload, loading: false };
        case 'LOAD_ERROR':
            return { ...state, loading: false };
        case 'APPEND':
            return { ...state, data: [...state.data, action.payload] };
        case 'UPDATE':
            const hasMessage = state.data.some(m => m.id === action.id)
            if (!hasMessage) return state

            return { ...state, data: state.data.map(m => m.id === action.id ? action.payload : m) };
        case 'DELETE':
            return { ...state, data: state.data.filter(m => m.id !== action.id) };
        case 'UPDATE_MEMBER':
            return {
                ...state,
                data: state.data.map(message =>
                    message.user?.id === action.payload.id
                        ? {
                            ...message,
                            user: { ...message.user, ...action.payload }
                        }
                        : message
                )
            }
        default:
            return state;
    }
}

export function ChatProvider({ children }) {
    const { user } = useAuth()
    const [chats, setChats] = useState([])
    const [chatsLoading, setChatsLoading] = useState(true)
    const [selectedChatId, setSelectedChatId] = useState(null)
    const [messagesState, messagesDispatch] = useReducer(messagesReducer, { data: [], loading: false })
    const currentMessages = messagesState.data
    const messagesLoading = messagesState.loading

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }, [])

    const showBrowserNotification = useCallback((message) => {
        if (document.visibilityState === 'hidden') {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification("Flow", {
                    body: `${message.user.name}: ${message.content}`,
                    icon: message.user.avatar || '/icons/default-avatar.png',
                })
            }
        }

    }, [])

    const markChatAsRead = useCallback(async (chatId) => {
        const chat = chats.find(c => c.id === chatId)
        if (!chat || chat.unread_count === 0) return

        try {
            await api.post(`/api/chat/${chatId}/read`)

            setChats(prev => prev.map(chat =>
                chat.id === chatId ? { ...chat, unread_count: 0 } : chat
            ))
        } catch (error) {
            console.error('Ошибка при markChatAsRead:', error)
        }
    }, [chats])

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
            messagesDispatch({ type: 'CLEAR' })
            return
        }
        let isCurrentRequest = true
        messagesDispatch({ type: 'LOAD_START' })

        api.get(`/api/message/${selectedChatId}/list`)
            .then(response => {
                if (isCurrentRequest) {
                    messagesDispatch({ type: 'LOAD_SUCCESS', payload: response.data })
                    console.log(response.data);
                }
            })
            .catch(error => {
                console.error('Messages load error:', error)
                if (isCurrentRequest) messagesDispatch({ type: 'LOAD_ERROR' })
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
        messagesDispatch({
            type: 'UPDATE_MEMBER',
            payload: updatedUser
        })
    }, [messagesDispatch])

    const channelName = user?.id ? `user.${user.id}` : null

    useEcho(channelName, "message.sent", (data) => {
        showBrowserNotification(data.message)

        if (data.chat_id === selectedChatId) {
            messagesDispatch({ type: 'APPEND', payload: data.message })
            markChatAsRead(data.chat_id)
        }

        setChats(prev => prev.map(chat => {
            if (chat.id === data.chat_id) {
                const isCurrentActive = selectedChatId === data.chat_id
                return {
                    ...chat,
                    latestMessage: data.message,
                    unread_count: isCurrentActive ? 0 : (chat.unread_count ?? 0) + 1
                }
            }
            return chat
        }))
    }) // [selectedChatId, markChatAsRead, showBrowserNotification]

    useEcho(channelName, "message.updated", (data) => {
        messagesDispatch({ type: 'UPDATE', id: data.message.id, payload: data.message })

        if (data.is_latest) {
            updateChat({ id: data.chat_id, latestMessage: data.message })
        }
    }) // [selectedChatId, updateChat]

    useEcho(channelName, "message.deleted", (data) => {
        if (data.chat_id === selectedChatId) {
            messagesDispatch({ type: 'DELETE', id: data.message_id })
        }

        setChats(prev => prev.map(chat => {
            if (chat.id !== data.chat_id) return chat

            return {
                ...chat,
                latestMessage: data.latest_message,
                unread_count: (chat.unread_count > 0)
                    ? chat.unread_count - 1
                    : chat.unread_count
            }
        }))
    }) // [selectedChatId]

    useEcho(channelName, "chat.created", (data) => {
        setChats(prev => [data.chat, ...prev])
    })

    useEcho(channelName, "chat.updated", (data) => {
        updateChat(data.chat)
    }) // [updateChat]

    useEcho(channelName, "chat.deleted", (data) => {        
        setChats(prev =>
            prev.filter(chat => chat.id !== data.chat_id)
        )

        if (selectedChatId === data.chat_id) {
            setSelectedChatId(null)
            messagesDispatch({ type: 'CLEAR' })
        }
    }) // [selectedChatId]

    useEcho(channelName, "chatmember.added", (data) => {
        setChats(prev =>
            prev.some(chat => chat.id === data.chat.id)
                ? prev.map(chat =>
                    chat.id === data.chat.id
                        ? { ...chat, members: data.members}
                        : chat)
                : [data.chat, ...prev]
        )
    }) // []

    useEcho(channelName, "chatmember.removed", (data) => {
        if (data.member_id === user?.id) {
            setChats(prev =>
                prev.filter(chat => chat.id !== data.chat_id)
            )

            if (selectedChatId === data.chat_id) {
                setSelectedChatId(null)
                messagesDispatch({ type: 'CLEAR' })
            }
        } else {
            updateChat({ id: data.chat_id, members: data.members })
        }
    }) // [selectedChat, updateChat, user?.id]

    useEcho(channelName, "user.updated", (data) => {
        updateMemberInChats(data.user)
        updateMemberInMessages(data.user)
    }) // [updateMemberInChats, updateMemberInMessages]

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

    const sortedChats = useMemo(() => {
        return chats.toSorted((a, b) => {
            const timeA = a.latestMessage?.created_at ? new Date(a.latestMessage.created_at).getTime() : 0
            const timeB = b.latestMessage?.created_at ? new Date(b.latestMessage.created_at).getTime() : 0
            return timeB - timeA
        })
    }, [chats])

    const contextValue = useMemo(() => ({
        chats: sortedChats,
        chatsLoading,
        selectedChat,
        selectedChatId,
        setChats,
        updateChat,
        onSelectChat,
        openPersonalChat,
        onCloseChat: closeChat,
        currentMessages,
        messagesLoading,
        messagesDispatch,
        updateMemberInMessages,
        updateMemberInChats,
        markChatAsRead,
    }), [
        sortedChats, 
        chatsLoading, 
        selectedChat, 
        selectedChatId,
        updateChat,
        onSelectChat,
        openPersonalChat,
        closeChat,
        currentMessages,
        messagesLoading,
        updateMemberInChats,
        updateMemberInMessages,
        markChatAsRead
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