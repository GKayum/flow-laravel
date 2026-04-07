import { ChatItem } from '../ChatItem/ChatItem'
import styles from './ChatList.module.scss'

export default function ChatList() {
    return (
        <main className={styles.main}>
            <div className={styles.main__header}>
                <h1 className={styles.title}>Чаты</h1>
            </div>
            <div className={styles.main__body}>
                <ChatItem />
                <ChatItem />
                <ChatItem />
                <ChatItem />
                <ChatItem />
                <ChatItem />
                <ChatItem />
                <ChatItem />
                <ChatItem />
                <ChatItem />
                <ChatItem />
                <ChatItem />
                <ChatItem />
                <ChatItem />
                <ChatItem />
                <ChatItem />
            </div>
        </main>
    )
}