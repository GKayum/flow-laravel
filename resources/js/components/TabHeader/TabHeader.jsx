import { ArrowLeft } from "lucide-react"
import styles from "./TabHeader.module.scss"

export default function TabHeader({ text, onClose, children }) {
    return (
        <nav className={styles.mainNav}>
            <button 
                className={styles.mainNav__closeBtn}
                onClick={onClose}
            >
                <ArrowLeft className={styles.icon} />
            </button>
            {children ? (
                children
            ) : (
                <span className={styles.mainNav__text}>{text}</span>
            )}
        </nav>
    )
}