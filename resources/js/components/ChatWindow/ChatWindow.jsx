import { useCallback, useEffect, useState } from 'react'
import styles from './ChatWindow.module.scss'
import { X } from 'lucide-react'
import { Loader } from '../UI/Loader/Loader'
import Avatar from '../UI/Avatar/Avatar'
import MessageList from '../MessageList/MessageList'
import MessageField from '../MessageField/MessageField'
import { api, handlerApiError } from '../../services/api'
import { useChat } from '../../contexts/ChatContext'
import { usePlural } from '../../hooks/usePlural'
import { useChatDisplay } from '../../hooks/useChatDisplay'
import echo from '../../echo'

export default function ChatWindow({ onOpenChatSidebar, onChatTabChange, onClose }) {
    const { selectedChat, selectedChatId, onCloseChat, updateChat } = useChat()
    const chatDisplay = useChatDisplay(selectedChat)
    const [messages, setMessages] = useState([])
    const [messagesLoading, setMessagesLoading] = useState(true)

    const messageWord = usePlural(messages.length, ['сообщение', 'сообщения', 'сообщений'])

    useEffect(() => {
        if (!selectedChat?.id) return
        
        setMessagesLoading(true)
        api.get(`/api/message/${selectedChat.id}/list`)
            .then(response => {
                console.log('messages: ', response.data);
                setMessages(response.data)
            })
            .catch(error => {
                console.error('Messages load error:', error.response?.status, error.response?.data)
            })
            .finally(() => setMessagesLoading(false))
    }, [selectedChatId, selectedChat?.id])

    useEffect(() => {
        if (!selectedChat?.id) return

        const channel = echo.private(`chat.${selectedChat.id}`)

        channel.listen('.message.sent', (data) => {
            setMessages(prev => [...prev, data.message])

            updateChat({
                id: selectedChat.id,
                latestMessage: data.message
            })
        })

        channel.listen('.message.updated', (data) => {
            setMessages(prev => {
                const isLatestMessage = prev.length > 0 && prev[prev.length - 1].id === data.message.id

                if (isLatestMessage) {
                    setTimeout(() => {
                        updateChat({
                            id: selectedChat.id,
                            latestMessage: data.message
                        })
                    }, 0)
                }

                return prev.map(m => m.id === data.message.id ? data.message : m)
            })
        })

        channel.listen('.message.deleted', (data) => {
            setMessages(prev => {
                const isLatestMessage = prev.length > 0 && prev[prev.length - 1].id === data.message.id;
                const updated = prev.filter(m => m.id !== data.message.id)
    
                if (isLatestMessage) {
                    const newLatest = updated.length > 0 ? updated[updated.length - 1] : null

                    setTimeout(() => {
                        updateChat({
                            id: selectedChat.id,
                            latestMessage: newLatest,
                        })
                    }, 0);
                }
    
                return updated
            })
        })

        return () => {
            echo.leave(`chat.${selectedChat.id}`)
        }
    }, [selectedChat?.id, updateChat])

    const handleSendMessage = async (content) => {
        try {
            await api.get('/sanctum/csrf-cookie')
            const response = await api.post(`/api/message/${selectedChat.id}/send`, { content })

            setMessages(prev => [...prev, response.data])

            updateChat({
                id: selectedChat.id,
                latestMessage: response.data
            })
        } catch (error) {
            handlerApiError(error, { setValidationErrors: () => {}, setError: () => {} })
        }
    }

    const handleDeleteMessage = useCallback(async (messageId) => {
        if (!selectedChat) return

        try {
            await api.delete(`/api/message/${messageId}/delete`)

            const isLatestMessage = messages.length > 0 && messages[messages.length - 1].id === messageId;
            const updated = messages.filter(m => m.id !== messageId)
            setMessages(updated)

            if (isLatestMessage) {
                const newLatest = updated.length > 0 ? updated[updated.length - 1] : null
                updateChat({
                    id: selectedChat.id,
                    latestMessage: newLatest,
                })
            }
        } catch (error) {
            handlerApiError(error, { setValidationErrors: () => {}, setError: () => {} })
        }
    }, [selectedChat, updateChat, messages])

    const handleEditMessage = useCallback(async (messageId, newContent) => {
        if (!selectedChat) return

        try {
            const response = await api.put(`/api/message/${messageId}/update`, { content: newContent })

            const isLatestMessage = messages.length > 0 && messages[messages.length - 1].id === messageId;
            const updated = messages.map(m => (m.id === messageId ? { ...m, ...response.data } : m))
            setMessages(updated)

            if (isLatestMessage) {
                updateChat({
                    id: selectedChat.id,
                    latestMessage: response.data
                })
            }
        } catch (error) {
            handlerApiError(error, { setValidationErrors: () => {}, setError: () => {} })
        }
    }, [selectedChat, updateChat, messages])

    const handleClick = () => {
        onChatTabChange(selectedChat?.is_group ? 'chat' : 'user')
        onOpenChatSidebar()
    }

    if (!selectedChat) {
        return (
            <div className={styles.not_msgs_block}>
                <h2>Выберите чат для начала общения</h2>
                <p>или создайте новый чат</p>
            </div>
        )
    }

    return (
        <div className={styles.chat}>
            <header className={styles.chat__header}>
                <div 
                    className={styles.info} 
                    onClick={handleClick}
                >
                    <Avatar user={{ name: chatDisplay?.displayName, avatar: chatDisplay?.displayAvatar }} size="2.625rem" fontSize="1.3125rem" />
                    <div className={styles.content}>
                        <span className={styles.name}>{chatDisplay.displayName}</span>
                        <span className={styles.messages}>{!messagesLoading ? `${messages.length} ${messageWord}` : 'загрузка...'}</span>
                    </div>
                </div>
                <div className={styles.actions}>
                    <button 
                        className={styles.btn} 
                        onClick={() => {
                            onClose()
                            onCloseChat()
                        }}
                    >
                        <X />
                    </button>
                </div>
            </header>
            <main className={styles.chat__body}>
                {messagesLoading ? (
                    <div className={styles.loaderContainer}>
                        <Loader />
                    </div>
                ) : (
                    messages.length > 0 ? (
                        <MessageList 
                            messages={messages}
                            onDeleteMessage={handleDeleteMessage}
                            onEditMessage={handleEditMessage}
                        />
                    ) : (
                        <div className={styles.not_msgs_block}>
                            <h2>Здесь пока сообщений нет</h2>
                            <p>Отправьте сообщение</p>
                        </div>
                    )
                )}
            </main>
            <footer className={styles.chat__footer}>
                <MessageField onSendMessage={handleSendMessage} />
            </footer>
        </div>
    )
}