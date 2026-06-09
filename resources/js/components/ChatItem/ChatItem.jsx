import { useCallback, useMemo, useState } from 'react'
import { useChat } from '../../contexts/ChatContext'
import { useChatDisplay } from '../../hooks/useChatDisplay'
import Avatar from '../UI/Avatar/Avatar'
import styles from './ChatItem.module.scss'
import { Trash } from 'lucide-react'
import ContextMenu from '../UI/ContextMenu/ContextMenu'
import { CircleArrowRight } from 'lucide-react'

export default function ChatItem({ chat, onDelete, onExit }) {
    const { onSelectChat, selectedChat } = useChat()
    const chatDisplay = useChatDisplay(chat)
    const [contextMenu, setContextMenu] = useState()

    const handleContextMenu = (e) => {
        e.preventDefault()
        setContextMenu({ x: e.clientX, y: e.clientY })
    }

    const closeContextMenu = useCallback(() => setContextMenu(null), [])

    const handleDelete = useCallback(() => onDelete(chat.id), [onDelete, chat.id])
    const handleExit = useCallback(() => onExit(chat.id), [onExit, chat.id])

    const menuItems = useMemo(() => [
        { icon: CircleArrowRight, label: 'Открыть чат', action: () => onSelectChat(chat) },
        chat.is_group
            ? { type: 'danger', icon: Trash, label: 'Выйти из чата', action: handleExit }
            : { type: 'danger', icon: Trash, label: 'Удалить чат', action: handleDelete }
    ], [handleDelete, handleExit, onSelectChat, chat])
    
    const isSelected = selectedChat?.id === chat.id

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
        <button
            type="button"
            className={`${styles.button} ${isSelected ? styles.selected : ''}`}
            onClick={() => onSelectChat(chat)}
            onContextMenu={handleContextMenu}
        >
            <Avatar user={{ name: chatDisplay.displayName, avatar: chatDisplay.displayAvatar }} size="3.2rem" />
            <div className={styles.button__body}>
                <div className={styles.button__header}>
                    <span className={styles.name}>{chatDisplay.displayName}</span>
                    <span className={styles.time}>{chat.latestMessage?.time ?? '--:--'}</span>
                </div>
                <div className={styles.messageBlock}>
                    {chat?.latestMessage && <span className={styles.name}>{`${chat.latestMessage.user.name}:\u00A0`}</span>}
                    <span className={styles.message}>{chat.latestMessage?.content ?? 'Нет сообщений'}</span>

                    {chat.unread_count > 0 && (
                        <span className={styles.unreadBadge}>
                            {chat.unread_count}
                        </span>
                    )}
                </div>
            </div>
        </button>
        </>
    )
}