import { CirclePlus } from 'lucide-react'
import ChatItem from '../ChatItem/ChatItem'
import styles from './ChatList.module.scss'
import { useEffect, useState } from 'react'
import { UserRound } from 'lucide-react'
import { UsersRound } from 'lucide-react'
import { api } from '../../services/api'
import { Loader } from '../UI/Loader/Loader'

export default function ChatList({ onSidebarClick, setActiveTab, setSelectedChat }) {
    const [chats, setChats] = useState([])
    const [chatsLoading, setChatsLoading] = useState(true)
    const [dropdownOpen, setDropdownOpen] = useState(false)

    useEffect(() => {
        (async () => {
            api.get('/api/chat/list')
                .then(response => {
                    console.log(response);
                    setChats(response.data)
                })
                .catch(error => {
                    console.error('Chats load error:', error.response?.status, error.response?.data)
                })
                .finally(() => setChatsLoading(false))
        })()
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
                                        setActiveTab('users')
                                        setDropdownOpen(false)
                                        onSidebarClick()
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
                                        setActiveTab('createGroup')
                                        setDropdownOpen(false)
                                        onSidebarClick()
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
                            setSelectedChat={setSelectedChat}
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