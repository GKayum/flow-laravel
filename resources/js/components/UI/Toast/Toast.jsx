import { useEffect } from "react";
import styles from "./Toast.module.scss"

export default function Toast({ type, message, duration = 3000, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose()
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div 
                className={`${styles.toastBlock} ${type ? styles[type] : ''}`} 
                onClick={(e) => e.stopPropagation()}
            >
                <span>{message}</span>
            </div>
        </div>
    )
}