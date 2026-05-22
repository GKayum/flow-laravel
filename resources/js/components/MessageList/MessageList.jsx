import { useEffect, useRef } from "react"
import { useAuth } from "../../contexts/AuthContext"
import MessageItem from "../MessageItem/MessageItem"
import styles from "./MessageList.module.scss"

export default function MessageList({ messages, onDeleteMessage, onEditMessage }) {
    const { user } = useAuth()
    const messageEndRef = useRef(null)

    useEffect(() => {
        messageEndRef.current?.scrollIntoView()
    }, [])

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({
            behavior: 'smooth'
        })
    }, [messages])

    return (
        <div className={styles.messageList}>
            {messages.map((message) => {
                const isCurrentUser = message.user.id === user?.id

                return (
                    <MessageItem 
                        key={message.id} 
                        message={message}
                        isCurrentUser={isCurrentUser}
                        onDelete={onDeleteMessage}
                        onEdit={onEditMessage}
                    />
                )
            })}
            <div ref={messageEndRef}></div>
        </div>
    )
}