import { useCallback, useEffect, useRef, useState } from 'react'
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
        markChatAsRead,
    } = useChat()

    const [uploadProgress, setUploadProgress] = useState(0)
    const [submittingChatId, setSubmittingChatId] = useState(null)
    const activeChatIdRef = useRef(selectedChat?.id)
    const chatDisplay = useChatDisplay(selectedChat)
    const messageWord = usePlural(currentMessages.length, ['сообщение', 'сообщения', 'сообщений'])

    useEffect(() => {
        activeChatIdRef.current = selectedChat?.id
    }, [selectedChat])

    useEffect(() => {
        if (selectedChat) {
            markChatAsRead(selectedChat.id)
        }
    }, [selectedChat, currentMessages, markChatAsRead]) // Проверить без currentMessages

    const handleSendMessage = useCallback(async (formData) => {
        if (!selectedChat) return
        const sendingChatId = selectedChat.id
        setSubmittingChatId(sendingChatId)
        setUploadProgress(0)

        try {
            await api.get('/sanctum/csrf-cookie')
            const response = await api.post(`/api/message/${sendingChatId}/send`, formData, {
                headers: {'Content-Type' : 'multipart/form-data'},
                onUploadProgress: (progressEvent) => {
                    if (activeChatIdRef.current === sendingChatId) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        setUploadProgress(percentCompleted)
                    }
                }
            })

            setCurrentMessages(prev =>
                activeChatIdRef.current === sendingChatId
                    ? [...prev, response.data]
                    : prev
            )

            updateChat({
                id: sendingChatId,
                latestMessage: response.data
            })
        } catch (error) {
            handlerApiError(error, { setValidationErrors: () => {}, setError: () => {} })
        } finally {
            setSubmittingChatId(null)
            setUploadProgress(0)
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

    const isCurrentChatSubmitting = submittingChatId === selectedChat.id

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
                <MessageField 
                    key={selectedChat.id} 
                    onSendMessage={handleSendMessage}
                    isSubmitting={isCurrentChatSubmitting}
                    uploadProgress={isCurrentChatSubmitting ? uploadProgress : 0}
                />
            </footer>
        </div>
    )
}