import ChatList from '../../components/ChatList/ChatList'
import SideHeader from '../../components/SideHeader/SideHeader'
import styles from './ChatsPage.module.scss'

export default function ChatsPage() {
    return (
        <main className={styles.main}>
            <aside className={styles.aside}>
                <SideHeader />
                <ChatList />
            </aside>
            <div className={styles.body}>
                {/* <Chat selectedChat={selectedChat} onCloseChat={onCloseChat} /> */}
            </div>
        </main>
    )
}