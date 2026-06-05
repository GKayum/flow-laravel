import { Menu } from "lucide-react";
import styles from "./SideHeader.module.scss"
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext"
import Avatar from "../UI/Avatar/Avatar";
import { LogOut } from "lucide-react";
import { Settings } from "lucide-react";
import { UserRoundSearch } from "lucide-react";
import SearchField from "../UI/SearchField/SearchField";

export default function SideHeader({ onOpenSidebar, onTabChange }) {
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
                    <div 
                        className={styles.menuDropdown} 
                        onMouseLeave={() => setDropdownOpen(false)}
                    >
                        <div className={styles.menuDropdown__block}>
                            <button 
                                className={styles.item}
                                onClick={() => {
                                    onOpenSidebar()
                                    setDropdownOpen(false)
                                    onTabChange('profile')
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
                                    onOpenSidebar()
                                    setDropdownOpen(false)
                                    onTabChange('searchUsers')
                                }}
                            >
                                <div className={styles.imgContainer}>
                                    <UserRoundSearch className={styles.img} />
                                </div>
                                <span className={styles.item__text}>Пользователи</span>
                            </button>
                        </div>
                        <div className={styles.menuDropdown__block}>
                            {/* <button 
                                className={styles.item}
                                onClick={() => {
                                    onOpenSidebar()
                                    setDropdownOpen(false)
                                    onTabChange('settings')
                                }}
                            >
                                <div className={styles.imgContainer}>
                                    <Settings className={styles.img} />
                                </div>
                                <span className={styles.item__text}>Настройки</span>
                            </button> */}
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
            <SearchField />
        </div>
    )
}