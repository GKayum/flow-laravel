import { useCallback, useMemo, useState } from "react"
import styles from "./MemberItem.module.scss"
import { Trash } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import ContextMenu from "../UI/ContextMenu/ContextMenu"
import Avatar from "../UI/Avatar/Avatar"
import { ShieldMinus } from "lucide-react"
import { ShieldPlus } from "lucide-react"
import { useChat } from "../../contexts/ChatContext"

const ROLE_LABELS = {
    owner: 'владелец',
    admin: 'админ',
    member: 'участник',
}

export default function MemberItem({ member, onDelete, onChangeRole }) {
    const { user } = useAuth()
    const { openPersonalChat } = useChat()
    const [contextMenu, setContextMenu] = useState(null)

    const handleContextMenu = (e) => {
        e.preventDefault()

        if (user.id !== member.id) {
            setContextMenu({ x: e.clientX, y: e.clientY })
        }
    }

    const closeContextMenu = useCallback(() => setContextMenu(null), [])

    const handleDelete = useCallback(() => onDelete(member.id), [onDelete, member.id])
    const handleChangeRole = useCallback((role) => onChangeRole(member.id, role), [onChangeRole, member.id])

    const menuItems = useMemo(() => [
        { icon: ShieldPlus, label: 'Сделать админом', action: () => handleChangeRole('admin') },
        { icon: ShieldMinus, label: 'Ограничить права', action: () => handleChangeRole('member') },
        { type: 'danger', icon: Trash, label: 'Удалить из группы', action: handleDelete },
    ], [handleChangeRole, handleDelete])

    const handleClick = (member) => {
        if (user.id !== member.id) {
            openPersonalChat(member.id)
        }
    }

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
            className={styles.item} 
            onContextMenu={handleContextMenu}
            onClick={() => handleClick(member)}
        >
            <Avatar user={member} size="2.625rem" fontSize="1.3rem" />
            <div className={styles.item__body}>
                <div className={styles.infoBlock}>
                    <span className={styles.content}>{member.name}</span>
                    <span className={styles.role}>{ROLE_LABELS[member.role]}</span>
                </div>
                <label className={styles.label}>был недавно</label>
            </div>
        </button>
        </>
    )
}