import styles from "./ChatSidebar.module.scss"
import ChatTab from "../../pages/sideTabs/chatTabs/Chat/ChatTab"
import EditChatTab from "../../pages/sideTabs/chatTabs/EditChat/EditChatTab"

export default function ChatSidebar({ open, onClose, chatActiveTab, onChatTabChange }) {
    return (
        <div 
            className={styles.main}
            style={{
                width: open ? '420px' : '0'
            }}
        >
            {(() => {switch (chatActiveTab) {
                case 'chat':
                    return <ChatTab onChatTabChange={onChatTabChange} onClose={onClose} />
                case 'editChat':
                    return <EditChatTab onClose={onClose} />
                default:
                    break;
            }})()}
        </div>
    )
}