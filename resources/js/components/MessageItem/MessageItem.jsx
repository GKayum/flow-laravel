import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Avatar from "../UI/Avatar/Avatar"
import styles from "./MessageItem.module.scss"
import ContextMenu from "../UI/ContextMenu/ContextMenu"
import { Trash } from "lucide-react"
import { Check } from "lucide-react"
import { X } from "lucide-react"
import { Pencil } from "lucide-react"
import { Undo2 } from "lucide-react"
import { Copy } from "lucide-react"
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard"

export default function MessageItem({ message, isCurrentUser, onDelete, onEdit }) {
    const [contextMenu, setContextMenu] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const editDivRef = useRef(null)
    const { copy } = useCopyToClipboard()

    useEffect(() => {
        if (isEditing && editDivRef.current) {
            editDivRef.current.textContent = message.content

            requestAnimationFrame(() => {
                editDivRef.current.focus({ preventScroll: true })
                const range = document.createRange()
                range.selectNodeContents(editDivRef.current)
                range.collapse(false)
                const sel = window.getSelection()
                sel.removeAllRanges()
                sel.addRange(range)
            })
        }
    }, [isEditing, message.content])

    const handleContextMenu = (e) => {
        e.preventDefault()
        
        if (isCurrentUser) {
            setContextMenu({ x: e.clientX, y: e.clientY })
        }
    }

    const closeContextMenu = useCallback(() => setContextMenu(null), [])

    const handleDelete = useCallback(() => onDelete(message.id), [onDelete, message.id])

    const startEdit = useCallback(() => {
        setIsEditing(true)
    }, [])

    const handleSaveEdit = () => {
        const newContent = editDivRef.current?.textContent?.trim() || ''
        if (newContent && newContent !== message.content) {
            onEdit(message.id, newContent)
        }
        setIsEditing(false)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
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

    const menuItems = useMemo(() => [
        { icon: Undo2, label: 'Ответить', action: () => {} },
        { icon: Copy, label: 'Копировать', action: () => copy(message.content) },
        { icon: Pencil, label: 'Изменить', action: startEdit },
        { type: 'danger', icon: Trash, label: 'Удалить', action: handleDelete },
    ], [message.content, handleDelete, copy, startEdit])

    const itemClass = `${styles.messageItem} ${isCurrentUser ? styles.currentUser : ''}`

    return (
        <>
        {contextMenu && (
            <ContextMenu 
                x={contextMenu.x}
                y={contextMenu.y}
                onClose={closeContextMenu}
                items={menuItems}
            />
        )}
        
        <div className={itemClass} onContextMenu={handleContextMenu}>
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
        </>
    )
}