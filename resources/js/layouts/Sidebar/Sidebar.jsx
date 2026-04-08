import styles from "./Sidebar.module.scss"
import { useEffect, useState } from "react"
import TabHeader from "../../components/TabHeader/TabHeader"
import ProfileTab from "../../pages/sideTabs/Profile/ProfileTab"
import EditProfileTab from "../../pages/sideTabs/EditProfile/EditProfileTab"

const TABS = [
    { key: 'profile',    label: 'Профиль' },
    { key: 'contacts', label: 'Контакты' },
    { key: 'editProfile',    label: 'Редактирование профиля' },
    { key: 'settings',    label: 'Настройки' },
]

export default function Sidebar({ open, onClose, activeTab, setActiveTab }) {

    useEffect(() => {
        console.log(activeTab)
    }, [activeTab])

    return (
        <div 
            className={styles.main}
            style={{
                transform: open ? 'translateX(0px)' : 'translateX(-100%)'
            }}
        >
            {TABS.map(tab =>
                tab.key === activeTab && <TabHeader key={tab.key} text={tab.label} onClose={onClose} />
            )}

            <div className={styles.body}>
                {/* {activeTab === 'settings' && (
                    <h1>Настройки</h1>                    
                )} */}
                {(() => {switch (activeTab) {
                    case 'profile':
                        return <ProfileTab setActiveTab={setActiveTab} />
                        break;
                    case 'editProfile':
                        return <EditProfileTab />
                        break;
                    default:
                        break;
                }})()}
            </div>
        </div>
    )
}