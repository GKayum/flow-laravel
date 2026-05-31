import ChatList from '../../components/ChatList/ChatList'
import SideHeader from '../../components/SideHeader/SideHeader'
import Sidebar from '../../layouts/Sidebar/Sidebar'
import styles from './ChatsPage.module.scss'
import ChatWindow from '../../components/ChatWindow/ChatWindow'
import { useChatsPage } from '../../hooks/useChatsPage'
import { ChatProvider } from '../../contexts/ChatContext'
import ChatSidebar from '../../layouts/ChatSidebar/ChatSidebar'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/UI/Toast/Toast'

export default function ChatsPage() {
    const {
        sidebarOpen,
        chatSidebarOpen,
        activeTab,
        chatActiveTab,
        openSidebar,
        closeSidebar,
        onTabChange,
    } = useChatsPage()

    const { toast, showToast, hideToast } = useToast()

    return (
        <ChatProvider>
        <main className={styles.main}>
            <aside className={styles.aside}>
                <SideHeader 
                    onOpenSidebar={() => openSidebar("main")} 
                    onTabChange={(tab) => onTabChange("main", tab)} 
                />
                <ChatList
                    onOpenSidebar={() => openSidebar("main")}
                    onTabChange={(tab) => onTabChange("main", tab)}
                    onCloseChatSidebar={() => closeSidebar("chat")}
                />

                <Sidebar 
                    open={sidebarOpen} 
                    onClose={() => closeSidebar("main")} 
                    activeTab={activeTab}
                    onTabChange={(tab) => onTabChange("main", tab)}
                    showToast={showToast}
                />
            </aside>
            <div className={styles.body}>
                <ChatWindow 
                    onOpenChatSidebar={() => openSidebar("chat")}
                    onChatTabChange={(tab) => onTabChange("chat", tab)}
                    onClose={() => closeSidebar("chat")}
                />
                <ChatSidebar
                    open={chatSidebarOpen}
                    onClose={() => closeSidebar("chat")}
                    chatActiveTab={chatActiveTab}
                    onChatTabChange={(tab) => onTabChange("chat", tab)}
                />
            </div>
        </main>

        {toast.visible && (
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
        )}
        </ChatProvider>
    )
}