import React, { useEffect, useRef, useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import MessageItem from "../MessageItem/MessageItem"
import styles from "./MessageList.module.scss"

const isDifferentDay = (date1, date2) => {
    if (!date1 || !date2) return false
    return new Date(date1).toLocaleDateString() !== new Date(date2).toLocaleDateString()
}

export default function MessageList({ messages, onDeleteMessage, onEditMessage }) {
    const { user } = useAuth()
    const messageEndRef = useRef(null)
    const [editingMessageId, setEditingMessageId] = useState(null)

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
            {messages.map((message, index) => {
                const isCurrentUser = message.user.id === user?.id

                const messageDate = message.created_at
                const prevMessageDate = messages[index - 1] ? messages[index - 1].created_at : null

                const showDateSeparator = index === 0 || isDifferentDay(messageDate, prevMessageDate)

                return (
                    <React.Fragment key={message.id}>
                        {showDateSeparator && (
                            <div className={styles.dateSeparator}>
                                {new Date(messageDate).toLocaleDateString('ru-RU', {
                                    day: 'numeric',
                                    month: 'long',
                                    // year: 'numeric'
                                })}
                            </div>
                        )}
                        <MessageItem 
                            message={message}
                            isCurrentUser={isCurrentUser}
                            isEditing={editingMessageId === message.id}
                            onStartEdit={() => setEditingMessageId(message.id)}
                            onCancelEdit={() => setEditingMessageId(null)}
                            onDelete={onDeleteMessage}
                            onEdit={onEditMessage}
                        />
                    </React.Fragment>
                )
            })}
            <div ref={messageEndRef}></div>
        </div>
    )
}