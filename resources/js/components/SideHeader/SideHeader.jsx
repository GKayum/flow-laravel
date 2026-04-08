import { Menu } from "lucide-react";
import styles from "./SideHeader.module.scss"
import { Search } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext"
import Avatar from "../UI/Avatar/Avatar";
import { LogOut } from "lucide-react";

export default function SideHeader({ onSidebarClick, setActiveTab }) {
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
                            <button 
                                className={styles.item}
                                onClick={() => {
                                    onSidebarClick()
                                    setDropdownOpen(false)
                                    setActiveTab('profile')
                                }}
                            >
                                <Avatar user={user} />
                                <span className={styles.item__text}>
                                    {user.name}
                                </span>
                            </button>
                        </div>
                        <div className={styles.menuDropdown__block}>
                            <button 
                                className={styles.item}
                                onClick={() => {
                                    onSidebarClick()
                                    setDropdownOpen(false)
                                    setActiveTab('settings')
                                }}
                            >
                                <div className={styles.imgContainer}>
                                    <img src="/icons/settings.svg" className={styles.img} />
                                </div>
                                <span className={styles.item__text}>Настройки</span>
                            </button>
                            <button 
                                className={`${styles.item} ${styles.danger}`}
                                onClick={() => logout()}
                            >
                                <div className={styles.imgContainer}>
                                    <LogOut className={styles.img} />
                                </div>
                                <span className={styles.item__text}>Выйти</span>
                            </button>
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