import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Avatar from "../UI/Avatar/Avatar"
import styles from "./MessageItem.module.scss"
import ContextMenu from "../UI/ContextMenu/ContextMenu"
import { Pen } from "lucide-react"
import { Trash } from "lucide-react"
import { Check } from "lucide-react"
import { X } from "lucide-react"

export default function MessageItem({ message, isCurrentUser, onDelete, onEdit }) {
    const [contextMenu, setContextMenu] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(message.content)
    const editDivRef = useRef(null)

    useEffect(() => {
        if (isEditing && editDivRef.current) {
            editDivRef.current.focus({ preventScroll: true })
            const range = document.createRange()
            range.selectNodeContents(editDivRef.current)
            range.collapse(false)
            const sel = window.getSelection()
            sel.removeAllRanges()
            sel.addRange(range)
        }
    }, [isEditing])

    useEffect(() => {
        if (isEditing && editDivRef.current) {
            editDivRef.current.textContent = message.content
        }
    }, [isEditing, message.content])

    const handleContextMenu = (e) => {
        e.preventDefault()

        if (isCurrentUser) {
            setContextMenu({ x: e.clientX, y: e.clientY })
        }
    }

    const closeContextMenu = useCallback(() => setContextMenu(null), [])

    const handleDelete = () => onDelete(message.id)

    const startEdit = () => {
        setIsEditing(true)
        setEditContent(message.content)
    }

    const handleSaveEdit = () => {
        const newContent = editDivRef.current?.textContent?.trim() || ''
        if (newContent && newContent !== message.content) {
            onEdit(message.id, newContent)
        }
        setIsEditing(false)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setEditContent(message.content)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSaveEdit()
        } else if (e.key === 'Escape') {
            e.preventDefault()
            handleCancelEdit()
        }
    }

    const handleInput = (e) => {
        setEditContent(e.currentTarget.textContent)
    }

    const menuItems = useMemo(() => [
        { icon: Pen, label: 'Редактировать', action: startEdit },
        { type: 'danger', icon: Trash, label: 'Удалить', action: handleDelete },
    ], [message.id, message.content, onDelete])

    const itemClass = `${styles.messageItem} ${isCurrentUser ? styles.currentUser : ''}`

    return (
        <div className={itemClass} onContextMenu={handleContextMenu}>
            {contextMenu && (
                <ContextMenu 
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={closeContextMenu}
                    items={menuItems}
                />
            )}

            {!isCurrentUser && <Avatar user={message.user} size="2.5rem" fontSize="1.25rem" />}
            <div className={styles.content}>
                {!isCurrentUser && <span className={styles.name}>{message.user.name}</span>}
                <div className={styles.contentInner}>
                    {isEditing ? (
                        <div className={styles.editContainer}>
                            <div
                                ref={editDivRef}
                                className={styles.editInput}
                                contentEditable
                                suppressContentEditableWarning
                                onInput={handleInput}
                                onKeyDown={handleKeyDown}
                            />
                            <div className={styles.actions}>
                                <button className={`${styles.btn} ${styles.confirm}`} onClick={handleSaveEdit}>
                                    <Check className={styles.icon} />
                                </button>
                                <button className={`${styles.btn} ${styles.cancel}`} onClick={handleCancelEdit}>
                                    <X className={styles.icon} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                        <span className={styles.message}>{message.content}</span>
                        <span className={styles.time}>{message.time}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}