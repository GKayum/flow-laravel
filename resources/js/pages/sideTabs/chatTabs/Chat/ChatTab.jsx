import Avatar from "../../../../components/UI/Avatar/Avatar"
import styles from "./ChatTab.module.scss"
import { Pen } from "lucide-react"
import TabHeader from "../../../../components/TabHeader/TabHeader"
import { useChat } from "../../../../contexts/ChatContext"
import { useAuth } from "../../../../contexts/AuthContext"

export default function ChatTab({ onChatTabChange, onClose }) {
    const { user } = useAuth()
    const { selectedChat } = useChat()
    
    if (!selectedChat) return

    return (
        <>
        <TabHeader onClose={onClose}>
            <div className={styles.tabHeader}>
                <span className={styles.text}>Информация о чате</span>
                <button className={styles.editBtn} onClick={() => onChatTabChange('editChat')}>
                    <Pen />
                </button>
            </div>
        </TabHeader>
        <div className={styles.main}>
            <div className={styles.avatarContainer}>
                <Avatar user={selectedChat} size="120px" fontSize="40px" />
                <span className={styles.avatarContainer__name}>{selectedChat.name}</span>
                <span className={styles.avatarContainer__members}>10 участников</span>
            </div>
            <div className={styles.body}>
                <div className={styles.membersContainer}>
                    <button className={styles.item} key={user.id}>
                        <Avatar user={user} size="2.625rem" fontSize="1.3rem" />
                        <div className={styles.item__body}>
                            <span className={styles.content}>{user.name}</span>
                            <label className={styles.label}>был недавно</label>
                        </div>
                    </button>
                </div>
            </div>
        </div>
        </>
    )
}