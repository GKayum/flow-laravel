import styles from "./ChatSidebar.module.scss"
import ChatTab from "../../pages/sideTabs/chatTabs/Chat/ChatTab"
import EditChatTab from "../../pages/sideTabs/chatTabs/EditChat/EditChatTab"
import AddMember from "../../pages/sideTabs/chatTabs/AddMember/AddMember"
import UserTab from "../../pages/sideTabs/chatTabs/User/UserTab"
import { useChat } from "../../contexts/ChatContext"
import { useEffect } from "react"

export default function ChatSidebar({ open, onClose, chatActiveTab, onChatTabChange }) {
    const { selectedChat } = useChat()

    useEffect(() => {
        if (!open || !selectedChat) return

        const isGroup = selectedChat.is_group
        const allowedTabs = isGroup ? ['chat', 'editChat', 'addMember'] : ['user']
        const defaultTab = isGroup ? 'chat' : 'user'

        if (!allowedTabs.includes(chatActiveTab)) {
            onChatTabChange(defaultTab)
        }
    }, [open, selectedChat, chatActiveTab, onChatTabChange])


    return (
        <div 
            className={styles.main}
            style={{
                width: open ? '420px' : '0'
                // right: open ? '0' : '-100%'
            }}
        >
            {(() => {switch (chatActiveTab) {
                case 'chat':
                    return <ChatTab onChatTabChange={onChatTabChange} onClose={onClose} />
                case 'editChat':
                    return <EditChatTab onClose={onClose} />
                case 'addMember':
                    return <AddMember onChatTabChange={onChatTabChange} onClose={onClose} />
                case 'user':
                    return <UserTab onClose={onClose} />
                default:
                    return null;
            }})()}
        </div>
    )
}