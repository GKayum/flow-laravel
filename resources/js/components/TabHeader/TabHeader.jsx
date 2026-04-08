import { ArrowLeft } from "lucide-react"
import styles from "./TabHeader.module.scss"

export default function TabHeader({ text, onClose }) {
    return (
        <nav className={styles.mainNav}>
            <button 
                className={styles.mainNav__closeBtn}
                onClick={onClose}
            >
                <ArrowLeft className={styles.icon} />
            </button>
            <span className={styles.mainNav__text}>{text}</span>
        </nav>
    )
}