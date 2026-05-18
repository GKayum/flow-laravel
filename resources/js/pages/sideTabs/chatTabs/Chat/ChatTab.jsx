import Avatar from "../../../../components/UI/Avatar/Avatar"
import styles from "./ChatTab.module.scss"
import { Pen } from "lucide-react"
import TabHeader from "../../../../components/TabHeader/TabHeader"
import { useChat } from "../../../../contexts/ChatContext"

export default function ChatTab({ onChatTabChange, onClose }) {
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
                <span className={styles.avatarContainer__members}>{selectedChat.members.length} участников</span>
            </div>
            <div className={styles.body}>
                <div className={styles.membersContainer}>
                    {selectedChat.members.map((member) => (
                        <button className={styles.item} key={member.id}>
                            <Avatar user={member} size="2.625rem" fontSize="1.3rem" />
                            <div className={styles.item__body}>
                                <span className={styles.content}>{member.name}</span>
                                <label className={styles.label}>был недавно</label>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
        </>
    )
}