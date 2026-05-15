import { useAuth } from "../../contexts/AuthContext"
import MessageItem from "../MessageItem/MessageItem"
import styles from "./MessageList.module.scss"

export default function MessageList({ messages }) {
    const { user } = useAuth()

    return (
        <div className={styles.messageList}>
            {messages.map((message) => {
                const isCurrentUser = message.user.id === user?.id

                return (
                    <MessageItem 
                        key={message.id} 
                        message={message}
                        isCurrentUser={isCurrentUser} 
                    />
                )
            })}
        </div>
    )
}