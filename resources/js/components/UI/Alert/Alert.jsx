import styles from "./Alert.module.scss"

export default function Alert({ icon: IconComponent, content, label, type = '' }) {
    return (
        <div className={`${styles.alert} ${styles[type]}`}>
            <IconComponent className={styles.icon} />
            <div className={styles.alert__body}>
                <span className={styles.content}>{content}</span>
                <label className={styles.label}>{label}</label>
            </div>
        </div>
    )
}