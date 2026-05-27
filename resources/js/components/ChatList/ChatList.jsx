import { CirclePlus } from 'lucide-react'
import ChatItem from '../ChatItem/ChatItem'
import styles from './ChatList.module.scss'
import { useCallback, useState } from 'react'
import { UserRound } from 'lucide-react'
import { UsersRound } from 'lucide-react'
import { Loader } from '../UI/Loader/Loader'
import { useChat } from '../../contexts/ChatContext'
import { api, handlerApiError } from '../../services/api'

export default function ChatList({ onOpenSidebar, onTabChange }) {
    const { setChats, chats, chatsLoading } = useChat()
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const handleDeleteChat = useCallback(async (chatId) => {
        try {
            await api.delete(`api/chat/${chatId}/delete`)

            setChats(prev =>
                prev.filter(chat => chat.id !== chatId)
            )
        } catch (error) {
            handlerApiError(error, { setValidationErrors: () => {}, setError: () => {} })
        }
    }, [])

    const handleExitChat = useCallback(async (chatId) => {
        try {
            await api.post(`api/chat/${chatId}/exit`)

            setChats(prev =>
                prev.filter(chat => chat.id !== chatId)
            )
        } catch (error) {
            handlerApiError(error, { setValidationErrors: () => {}, setError: () => {} })
        }
    }, [])

    return (
        <main className={styles.main}>
            <div className={styles.main__header}>
                <h1 className={styles.title}>Чаты</h1>

                <div className={styles.buttonContainer}>
                    <button 
                        className={`${styles.menuBtn} ${dropdownOpen ? styles.active : ''}`}
                        onClick={() => setDropdownOpen(prev => !prev)}
                    >
                        <CirclePlus />
                    </button>

                    {dropdownOpen && (
                        <div 
                            className={styles.menuDropdown} 
                            onMouseLeave={() => setDropdownOpen(false)}
                        >
                            <div className={styles.menuDropdown__block}>
                                <button 
                                    className={styles.item}
                                    onClick={() => {
                                        onTabChange('searchUsers')
                                        setDropdownOpen(false)
                                        onOpenSidebar()
                                    }}
                                >
                                    <div className={styles.imgContainer}>
                                        <UserRound className={styles.img} />
                                    </div>
                                    <span className={styles.item__text}>Личный чат</span>
                                </button>
                                <button 
                                    className={styles.item}
                                    onClick={() => {
                                        onTabChange('createGroup')
                                        setDropdownOpen(false)
                                        onOpenSidebar()
                                    }}
                                >
                                    <div className={styles.imgContainer}>
                                        <UsersRound className={styles.img} />
                                    </div>
                                    <span className={styles.item__text}>Создать группу</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.main__body}>
                {chatsLoading ? (
                    <div className={styles.loaderContainer}>
                        <Loader />
                    </div>
                ) : (
                    chats.map((chat) => (
                        <ChatItem
                            key={chat.id}
                            chat={chat}
                            onDelete={handleDeleteChat}
                            onExit={handleExitChat}
                        />
                        // <ChatItem 
                        //     type={'button'}
                        //     key={chat.id}
                        //     selected={selectedChat?.id === chat.id}
                        //     onSelectChat={onSelectChat}
                        //     chat={chat}
                        //     lastMessageTime={chat.latest_message ? (
                        //         formatMessageTime(chat.latest_message.created_at)
                        //     ) : ''}
                        //     lastMessage={chat.latest_message?.content ?? 'Нет сообщений'}
                        // />
                    ))
                )}
            </div>
        </main>
    )
}