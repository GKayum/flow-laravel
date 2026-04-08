import { useState } from 'react'
import ChatList from '../../components/ChatList/ChatList'
import SideHeader from '../../components/SideHeader/SideHeader'
import Sidebar from '../../layouts/Sidebar/Sidebar'
import styles from './ChatsPage.module.scss'

export default function ChatsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('')

    return (
        <main className={styles.main}>
            <aside className={styles.aside}>
                <SideHeader onSidebarClick={() => setSidebarOpen(true)} setActiveTab={setActiveTab} />
                <ChatList />

                <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} activeTab={activeTab} setActiveTab={setActiveTab}/>
            </aside>
            <div className={styles.body}>
                {/* <Chat selectedChat={selectedChat} onCloseChat={onCloseChat} /> */}
            </div>
        </main>
    )
}