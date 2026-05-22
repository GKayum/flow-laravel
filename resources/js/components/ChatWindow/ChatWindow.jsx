import { useEffect, useState } from 'react'
import styles from './ChatWindow.module.scss'
import { X } from 'lucide-react'
import { Loader } from '../UI/Loader/Loader'
import Avatar from '../UI/Avatar/Avatar'
import MessageList from '../MessageList/MessageList'
import MessageField from '../MessageField/MessageField'
import { api, handlerApiError } from '../../services/api'
import { useChat } from '../../contexts/ChatContext'
import { usePlural } from '../../hooks/usePlural'

export default function ChatWindow({ onOpenChatSidebar, onChatTabChange, onClose }) {
    const { selectedChat, onCloseChat, updateChat } = useChat()
    const [messages, setMessages] = useState([])
    const [messagesLoading, setMessagesLoading] = useState(true)

    const messageWord = usePlural(messages.length, ['сообщение', 'сообщения', 'сообщений'])

    useEffect(() => {
        if (!selectedChat) return
        
        (async () => {
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
        })()
    }, [selectedChat])

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

    const handleDeleteMessage = async (messageId) => {
        try {
            await api.delete(`/api/message/${messageId}/delete`)

            setMessages(prev => {
                const isLatestMessage = prev.length > 0 && prev[prev.length - 1].id === messageId;
                const updated = prev.filter(m => m.id !== messageId)

                if (isLatestMessage) {
                    const newLatest = updated.length > 0 ? updated[updated.length - 1] : null
                    
                    updateChat({
                        id: selectedChat.id,
                        latestMessage: newLatest,
                    })
                }

                return updated
            })
        } catch (error) {
            handlerApiError(error, { setValidationErrors: () => {}, setError: () => {} })
        }
    }

    const handleEditMessage = async (messageId, newContent) => {
        try {
            const response = await api.put(`/api/message/${messageId}/update`, { content: newContent })

            setMessages(prev => {
                const isLatestMessage = prev.length > 0 && prev[prev.length - 1].id === messageId;
                const updated = prev.map(m => (m.id === messageId ? { ...m, ...response.data } : m))

                if (isLatestMessage) {
                    updateChat({
                        id: selectedChat.id,
                        latestMessage: response.data
                    })
                }

                return updated
            })
        } catch (error) {
            handlerApiError(error, { setValidationErrors: () => {}, setError: () => {} })
        }
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
                    onClick={() => {
                        onChatTabChange('chat')
                        onOpenChatSidebar()
                    }}
                >
                    <Avatar user={selectedChat} size="2.625rem" fontSize="1.3125rem" />
                    <div className={styles.content}>
                        <span className={styles.name}>{selectedChat.name}</span>
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