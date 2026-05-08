import { useAuth } from "../../contexts/AuthContext"
import Avatar from "../UI/Avatar/Avatar"
import styles from "./MessageList.module.scss"

export default function MessageList() {
    const { user } = useAuth()

    return (
        <div className={styles.messageList}>
            <div className={styles.messageItem}>
                <Avatar user={user} size="2.5rem" fontSize="1.25rem" />
                <div className={styles.content}>
                    <span className={styles.name}>{user.name}</span>
                    <div className={styles.contentInner}>
                        <span className={styles.message}>1Lorem ipsum dolor sit amet consectetur adipisicing elit.</span>
                        <span className={styles.time}>13:45</span>
                    </div>
                </div>
            </div>
            
            <div className={styles.messageItem}>
                <Avatar user={user} size="2.5rem" fontSize="1.25rem" />
                <div className={styles.content}>
                    <span className={styles.name}>{user.name}</span>
                    <div className={styles.contentInner}>
                        <span className={styles.message}>2Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet consectetur adipisicing elit.</span>
                        <span className={styles.time}>13:45</span>
                    </div>
                </div>
            </div>

            <div className={styles.messageItem}>
                <Avatar user={user} size="2.5rem" fontSize="1.25rem" />
                <div className={styles.content}>
                    <span className={styles.name}>{user.name}</span>
                    <div className={styles.contentInner}>
                        <span className={styles.message}>3Lorem ipsum dolor sit amet consectetur adipisicing elit.</span>
                        <span className={styles.time}>13:45</span>
                    </div>
                </div>
            </div>

            <div className={styles.messageItem}>
                <Avatar user={user} size="2.5rem" fontSize="1.25rem" />
                <div className={styles.content}>
                    <span className={styles.name}>{user.name}</span>
                    <div className={styles.contentInner}>
                        <span className={styles.message}>4Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet consectetur adipisicing elit.</span>
                        <span className={styles.time}>13:45</span>
                    </div>
                </div>
            </div>

            <div className={styles.messageItem}>
                <Avatar user={user} size="2.5rem" fontSize="1.25rem" />
                <div className={styles.content}>
                    <span className={styles.name}>{user.name}</span>
                    <div className={styles.contentInner}>
                        <span className={styles.message}>5Lorem ipsum dolor sit amet consectetur adipisicing elit.</span>
                        <span className={styles.time}>13:45</span>
                    </div>
                </div>
            </div>

            <div className={styles.messageItem}>
                <Avatar user={user} size="2.5rem" fontSize="1.25rem" />
                <div className={styles.content}>
                    <span className={styles.name}>{user.name}</span>
                    <div className={styles.contentInner}>
                        <span className={styles.message}>6Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet consectetur adipisicing elit.</span>
                        <span className={styles.time}>13:45</span>
                    </div>
                </div>
            </div>

            <div className={styles.messageItem}>
                <Avatar user={user} size="2.5rem" fontSize="1.25rem" />
                <div className={styles.content}>
                    <span className={styles.name}>{user.name}</span>
                    <div className={styles.contentInner}>
                        <span className={styles.message}>7Lorem ipsum dolor sit amet consectetur adipisicing elit.</span>
                        <span className={styles.time}>13:45</span>
                    </div>
                </div>
            </div>

            <div className={styles.messageItem}>
                <Avatar user={user} size="2.5rem" fontSize="1.25rem" />
                <div className={styles.content}>
                    <span className={styles.name}>{user.name}</span>
                    <div className={styles.contentInner}>
                        <span className={styles.message}>8Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet consectetur adipisicing elit.</span>
                        <span className={styles.time}>13:45</span>
                    </div>
                </div>
            </div>

            <div className={styles.messageItem}>
                <Avatar user={user} size="2.5rem" fontSize="1.25rem" />
                <div className={styles.content}>
                    <span className={styles.name}>{user.name}</span>
                    <div className={styles.contentInner}>
                        <span className={styles.message}>9Lorem ipsum dolor sit amet consectetur adipisicing elit.</span>
                        <span className={styles.time}>13:45</span>
                    </div>
                </div>
            </div>
        </div>
    )
}