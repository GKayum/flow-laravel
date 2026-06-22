import { useEffect, useRef } from "react";
import styles from "./Toast.module.scss"

export default function Toast({ type, message, duration = 3000, onClose }) {
    const toastRef = useRef(null)
    const onCloseRef = useRef(onClose)

    onCloseRef.current = onClose

    useEffect(() => {
        const timer = setTimeout(() => {
            onCloseRef.current()
        }, duration)

        return () => clearTimeout(timer)
    }, [duration])

    useEffect(() => {
        function handleClickOutside(e) {
            if (toastRef.current && !toastRef.current.contains(e.target)) {
                onCloseRef.current()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                ref={toastRef}
                className={`${styles.toastBlock} ${type ? styles[type] : ''}`} 
                onClick={(e) => e.stopPropagation()}
            >
                <span>{message}</span>
            </div>
        </div>
    )
}