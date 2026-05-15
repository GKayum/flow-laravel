import Avatar from "../UI/Avatar/Avatar"
import styles from "./MessageItem.module.scss"

export default function MessageItem({ message, isCurrentUser }) {
    const itemClass = `${styles.messageItem} ${isCurrentUser ? styles.currentUser : ''}`

    return (
        <div className={itemClass}>
            {!isCurrentUser && <Avatar user={message.user} size="2.5rem" fontSize="1.25rem" />}
            <div className={styles.content}>
                {!isCurrentUser && <span className={styles.name}>{message.user.name}</span>}
                <div className={styles.contentInner}>
                    <span className={styles.message}>{message.content}</span>
                    <span className={styles.time}>{message.time}</span>
                </div>
            </div>
        </div>
    )
}