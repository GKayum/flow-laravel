import { AtSign } from "lucide-react"
import Avatar from "../../../components/UI/Avatar/Avatar"
import { useAuth } from "../../../contexts/AuthContext"
import styles from "./ProfileTab.module.scss"
import { Pen } from "lucide-react"
import { Trash } from "lucide-react"
import { Calendar1 } from "lucide-react"
import TabHeader from "../../../components/TabHeader/TabHeader"
import { useCopyToClipboard } from "../../../hooks/useCopyToClipboard"
import { formatDateOfBirthOnly, formatDateOfBirthWithAge } from "../../../utils/formatDateOfBirth"

export default function ProfileTab({ onTabChange, onClose, showToast }) {
    const { user } = useAuth()
    const { copy } = useCopyToClipboard()

    const handleCopy = (text, label) => {
        copy(text)
        showToast(`${label} скопирован в буфер обмена`)
    }
    
    return (
        <>
        <TabHeader text={'Профиль'} onClose={onClose} />
        <div className={styles.main}>
            <div className={styles.avatarContainer}>
                <Avatar user={user} size="120px" fontSize="40px" />
                <span className={styles.avatarContainer__name}>{user.name}</span>
            </div>
            <div className={styles.body}>
                <section className={styles.body__block}>
                    <button 
                        type="button" 
                        className={styles.item} 
                        onClick={() => handleCopy(user.email, 'Email')}
                    >
                        <AtSign className={styles.icon} />
                        <div className={styles.item__body}>
                            <span className={styles.content}>{user.email}</span>
                            <label className={styles.label}>Email</label>
                        </div>
                    </button>
                    <button
                        type="button"
                        className={styles.item}
                        onClick={() => handleCopy(formatDateOfBirthOnly(user.dateOfBirth), 'Дата рождения')}
                    >
                        <Calendar1 className={styles.icon} />
                        <div className={styles.item__body}>
                            <span className={styles.content}>{formatDateOfBirthWithAge(user.dateOfBirth)}</span>
                            <label className={styles.label}>Дата рождения</label>
                        </div>
                    </button>
                </section>

                <section className={styles.body__block}>
                    <button 
                        className={`${styles.item} ${styles.buttonEdit}`}
                        onClick={() => onTabChange('editProfile')}
                    >
                        <Pen className={styles.icon} />
                        <div className={styles.item__body}>
                            <span className={styles.content}>Редактировать профиль</span>
                            <label className={styles.label}>Действие</label>
                        </div>
                    </button>
                    {/* <button className={`${styles.item} ${styles.buttonDanger}`}>
                        <Trash className={styles.icon} />
                        <div className={styles.item__body}>
                            <span className={styles.content}>Удалить профиль</span>
                            <label className={styles.label}>Действие</label>
                        </div>
                    </button> */}
                </section>
            </div>
        </div>
        </>
    )
}