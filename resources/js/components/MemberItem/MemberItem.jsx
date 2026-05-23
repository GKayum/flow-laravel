import { useCallback, useMemo, useState } from "react"
import styles from "./MemberItem.module.scss"
import { ShieldUser } from "lucide-react"
import { Trash } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import ContextMenu from "../UI/ContextMenu/ContextMenu"
import Avatar from "../UI/Avatar/Avatar"

export default function MemberItem({ member, onDelete, onChangeRole }) {
    const { user } = useAuth()
    const [contextMenu, setContextMenu] = useState(null)

    const handleContextMenu = (e) => {
        e.preventDefault()

        if (user.id !== member.id) {
            setContextMenu({ x: e.clientX, y: e.clientY })
        }
    }

    const closeContextMenu = useCallback(() => setContextMenu(null), [])

    const handleDelete = () => onDelete(member.id)
    const handleChangeRole = () => onChangeRole(member.id, 'admin')

    const menuItems = useMemo(() => [
        { icon: ShieldUser, label: 'Сделать админом', action: handleChangeRole },
        { type: 'danger', icon: Trash, label: 'Удалить из группы', action: handleDelete },
    ], [handleChangeRole, handleDelete])

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
        >
            <Avatar user={member} size="2.625rem" fontSize="1.3rem" />
            <div className={styles.item__body}>
                <div className={styles.infoBlock}>
                    <span className={styles.content}>{member.name}</span>
                    <span className={styles.role}>{member.role}</span>
                </div>
                <label className={styles.label}>был недавно</label>
            </div>
        </button>
        </>
    )
}