import { memo, useEffect, useLayoutEffect, useRef, useState } from "react"
import styles from "./ContextMenu.module.scss"

export default memo(function ContextMenu({ x, y, onClose, items  }) {
    const menuRef = useRef(null)
    const [coords, setCoords] = useState({ top: y, left: x })

    useLayoutEffect(() => {
        if (!menuRef.current) return

        const rect = menuRef.current.getBoundingClientRect()
        const screenWidth = window.innerWidth
        const screenHeight = window.innerHeight

        let adjustedX = x
        let adjustedY = y

        if (x + rect.width > screenWidth) {
            adjustedX = screenWidth - rect.width - 10
        }
        if (adjustedX < 10) adjustedX = 10

        if (y + rect.height > screenHeight) {
            adjustedY = screenHeight - rect.height - 10
        }
        if (adjustedY < 10) adjustedY = 10

        setCoords({ top: adjustedY, left: adjustedX })
    }, [x, y])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose()
            }
        }
        const handleEsc = (e) => e.key === 'Escape' && onClose()
        const handleWheel = () => onClose()

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEsc)
        document.addEventListener('wheel', handleWheel, { passive: true })

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEsc)
            document.removeEventListener('wheel', handleWheel)
        }
    }, [onClose])
    
    return (
        <div
            ref={menuRef}
            className={styles.contextMenu}
            style={{ top: coords.top, left: coords.left, position: 'fixed', zIndex: 10 }}
        >
            {items.map((item) => (
                <button
                    key={item.label}
                    className={`${styles.menuItem} ${styles[item.type]}`}
                    onClick={() => {
                        item.action()
                        onClose()
                    }}
                >
                    <item.icon className={styles.icon} />
                    <span className={styles.text}>{item.label}</span>
                </button>
            ))}
        </div>
    )
})