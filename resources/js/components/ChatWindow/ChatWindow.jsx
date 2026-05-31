import { useCallback } from 'react'
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

export default function ChatWindow({ onOpenChatSidebar, onChatTabChange, onClose }) {
    const { 
        selectedChat, 
        onCloseChat, 
        updateChat,
        setCurrentMessages,
        currentMessages,
        messagesLoading,
    } = useChat()

    const chatDisplay = useChatDisplay(selectedChat)

    const messageWord = usePlural(currentMessages.length, ['сообщение', 'сообщения', 'сообщений'])

    const handleSendMessage = useCallback(async (content) => {
        if (!selectedChat) return

        try {
            await api.get('/sanctum/csrf-cookie')
            const response = await api.post(`/api/message/${selectedChat.id}/send`, { content })

            setCurrentMessages(prev => [...prev, response.data])

            updateChat({
                id: selectedChat.id,
                latestMessage: response.data
            })
        } catch (error) {
            handlerApiError(error, { setValidationErrors: () => {}, setError: () => {} })
        }
    }, [selectedChat, setCurrentMessages, updateChat])

    const handleDeleteMessage = useCallback(async (messageId) => {
        if (!selectedChat) return

        try {
            await api.delete(`/api/message/${messageId}/delete`)

            const updated = currentMessages.filter(m => m.id !== messageId)
            setCurrentMessages(updated)

            const newLatest = updated.length > 0 ? updated[updated.length - 1] : null;
            updateChat({ id: selectedChat.id, latestMessage: newLatest });
        } catch (error) {
            handlerApiError(error, { setValidationErrors: () => {}, setError: () => {} })
        }
    }, [selectedChat, updateChat, currentMessages, setCurrentMessages])

    const handleEditMessage = useCallback(async (messageId, newContent) => {
        if (!selectedChat) return

        try {
            const response = await api.put(`/api/message/${messageId}/update`, { content: newContent })

            setCurrentMessages(prev =>
                prev.map(m => m.id === messageId ? response.data : m)
            );

            const isLatestMessage = currentMessages.length > 0 && currentMessages[currentMessages.length - 1].id === messageId;

            if (isLatestMessage) {
                updateChat({
                    id: selectedChat.id,
                    latestMessage: response.data
                })
            }
        } catch (error) {
            handlerApiError(error, { setValidationErrors: () => {}, setError: () => {} })
        }
    }, [selectedChat, updateChat, currentMessages, setCurrentMessages])

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
                        <span className={styles.messages}>{!messagesLoading ? `${currentMessages.length} ${messageWord}` : 'загрузка...'}</span>
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
                    currentMessages.length > 0 ? (
                        <MessageList 
                            messages={currentMessages}
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