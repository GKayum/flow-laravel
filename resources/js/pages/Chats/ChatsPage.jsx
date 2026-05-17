import ChatList from '../../components/ChatList/ChatList'
import SideHeader from '../../components/SideHeader/SideHeader'
import Sidebar from '../../layouts/Sidebar/Sidebar'
import styles from './ChatsPage.module.scss'
import ChatWindow from '../../components/ChatWindow/ChatWindow'
import { useChatsPage } from '../../hooks/useChatsPage'
import { ChatProvider } from '../../contexts/ChatContext'

export default function ChatsPage() {
    const {
        sidebarOpen,
        activeTab,
        openSidebar,
        closeSidebar,
        onTabChange,
    } = useChatsPage()

    return (
        <ChatProvider>
        <main className={styles.main}>
            <aside className={styles.aside}>
                <SideHeader onOpenSidebar={openSidebar} onTabChange={onTabChange} />
                <ChatList
                    onOpenSidebar={openSidebar}
                    onTabChange={onTabChange}
                />

                <Sidebar 
                    open={sidebarOpen} 
                    onClose={closeSidebar} 
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                />
            </aside>
            <div className={styles.body}>
                <ChatWindow />
            </div>
        </main>
        </ChatProvider>
    )
}