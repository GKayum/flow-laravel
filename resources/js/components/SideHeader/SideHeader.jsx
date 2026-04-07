import { Menu } from "lucide-react";
import styles from "./SideHeader.module.scss"
import { Search } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext"
import Avatar from "../UI/Avatar/Avatar";

export default function SideHeader() {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const { user, logout } = useAuth()

    return (
        <div className={styles.main}>
            <div className={styles.buttonContainer}>
                <button 
                    className={styles.menuBtn}
                    onClick={() => setDropdownOpen(prev => !prev)}
                >
                    <Menu />
                </button>

                {dropdownOpen && (
                    <div className={styles.menuDropdown} onMouseLeave={() => setDropdownOpen(false)}>
                        <div className={styles.menuDropdown__block}>
                            <div className={styles.item}>
                                <Avatar user={user} />
                                <span className={styles.item__text}>
                                    {user.name}
                                </span>
                            </div>
                            <div className={styles.item}>
                                <div className={styles.item__img}>🔄️</div>
                                <span className={styles.item__text}>Настройки Настройки</span>
                            </div>
                        </div>
                        <div className={styles.menuDropdown__block}>
                            Мои
                        </div>
                    </div>
                )}
            </div>
            <form action="" className={styles.search__form}>
                <input className={styles.search__input} type="input" placeholder="Поиск" />
                <Search className={styles.search__icon} />
            </form>
        </div>
    )
}