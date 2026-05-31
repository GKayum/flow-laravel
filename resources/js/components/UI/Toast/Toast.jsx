import { useEffect, useRef } from "react";
import styles from "./Toast.module.scss"

export default function Toast({ type, message, duration = 3000, onClose }) {
    const toastRef = useRef(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose()
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    useEffect(() => {
        function handleClickOutside(e) {
            if (toastRef.current && !toastRef.current.contains(e.target)) {
                onClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onClose])

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