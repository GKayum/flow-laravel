import { useAuth } from "../../contexts/AuthContext"
import Avatar from "../UI/Avatar/Avatar"
import styles from "./MessageList.module.scss"

export default function MessageList({ messages }) {
    const { user } = useAuth()

    return (
        <div className={styles.messageList}>
            {messages.map((message) => (
                <div className={styles.messageItem} key={message.id}>
                    <Avatar user={message.user} size="2.5rem" fontSize="1.25rem" />
                    <div className={styles.content}>
                        <span className={styles.name}>{message.user.name}</span>
                        <div className={styles.contentInner}>
                            <span className={styles.message}>{message.content}</span>
                            <span className={styles.time}>{message.time}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}