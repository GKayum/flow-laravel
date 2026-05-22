import { useChat } from '../../contexts/ChatContext'
import Avatar from '../UI/Avatar/Avatar'
import styles from './ChatItem.module.scss'

export default function ChatItem({ chat }) {
    const { onSelectChat, selectedChat } = useChat()
    
    const isSelected = selectedChat?.id === chat.id

    return (
        <button
            className={`${styles.button} ${isSelected ? styles.selected : ''}`}
            onClick={() => onSelectChat(chat)}
        >
            <Avatar user={chat} size="3.2rem" />
            <div className={styles.button__body}>
                <div className={styles.button__header}>
                    <span className={styles.name}>{chat.name}</span>
                    <span className={styles.time}>{chat.latestMessage?.time ?? '--:--'}</span>
                </div>
                <div className={styles.messageBlock}>
                    {chat?.latestMessage && <span className={styles.name}>{`${chat.latestMessage.user.name}:\u00A0`}</span>}
                    <span className={styles.message}>{chat.latestMessage?.content ?? 'Нет сообщений'}</span>
                </div>
            </div>
        </button>
    )
}