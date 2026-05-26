import { AtSign } from "lucide-react"
import styles from "./UserTab.module.scss"
import { Calendar1 } from "lucide-react"
import TabHeader from "../../../../components/TabHeader/TabHeader"
import { useChatDisplay } from "../../../../hooks/useChatDisplay"
import { useChat } from "../../../../contexts/ChatContext"
import Avatar from "../../../../components/UI/Avatar/Avatar"

export default function UserTab({ onClose }) {
    const { selectedChat } = useChat()
    const chatDisplay = useChatDisplay(selectedChat)

    if (!selectedChat) return null
    
    return (
        <>
        <TabHeader text={'О пользователе'} onClose={onClose} />
        <div className={styles.main}>
            <div className={styles.avatarContainer}>
                <Avatar user={{ name: chatDisplay.displayName, avatar: chatDisplay.displayAvatar }} size="120px" fontSize="40px" />
                <div className={styles.info}>
                    <span className={styles.name}>{chatDisplay.displayName}</span>
                    <span className={styles.status}>был недавно</span>
                </div>
            </div>
            <div className={styles.body}>
                <section className={styles.body__block}>
                    <button className={styles.item}>
                        <AtSign className={styles.icon} />
                        <div className={styles.item__body}>
                            <span className={styles.content}>{chatDisplay.companion?.email}</span>
                            <label className={styles.label}>Email</label>
                        </div>
                    </button>
                    <button className={styles.item}>
                        <Calendar1 className={styles.icon} />
                        <div className={styles.item__body}>
                            <span className={styles.content}>{chatDisplay.companion?.dateOfBirth || 'Не указан'}</span>
                            <label className={styles.label}>Дата рождения</label>
                        </div>
                    </button>
                </section>
            </div>
        </div>
        </>
    )
}