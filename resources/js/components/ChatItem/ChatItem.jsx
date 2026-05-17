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
                    <span className={styles.time}>17:00</span>
                </div>
                <span className={styles.message}>Последнее сообщение</span>
            </div>
        </button>
    )
}