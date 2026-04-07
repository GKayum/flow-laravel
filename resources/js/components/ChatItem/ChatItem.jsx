import styles from './ChatItem.module.scss'

export function ChatItem() {
    return (
        <button
            className={styles.button}
        >
            <div className={styles.chat__img}>U</div>
            <div className={styles.button__body}>
                <div className={styles.button__header}>
                    <span className={styles.name}>Название чата Название чffffата Название чата Название чата</span>
                    <span className={styles.time}>17:00</span>
                </div>
                <span className={styles.message}>Последнее сообщение Последнее сообщение Последнее сообщение Последнее сообщение</span>
            </div>
        </button>
    )
}