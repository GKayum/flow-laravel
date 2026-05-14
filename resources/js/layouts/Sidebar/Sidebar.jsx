import styles from "./Sidebar.module.scss"
import { useEffect, useState } from "react"
import ProfileTab from "../../pages/sideTabs/Profile/ProfileTab"
import EditProfileTab from "../../pages/sideTabs/EditProfile/EditProfileTab"
import UsersTab from "../../pages/sideTabs/Users/UsersTab"
import CreateGroupTab from "../../pages/sideTabs/CreateGroup/CreateGroupTab"

export default function Sidebar({ open, onClose, activeTab, setActiveTab, setSelectedChat }) {

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
            {(() => {switch (activeTab) {
                case 'profile':
                    return <ProfileTab setActiveTab={setActiveTab} onClose={onClose} />
                case 'editProfile':
                    return <EditProfileTab onClose={onClose} />
                case 'users':
                    return <UsersTab onClose={onClose} setSelectedChat={setSelectedChat} />
                case 'createGroup':
                    return <CreateGroupTab onClose={onClose} setSelectedChat={setSelectedChat} />
                default:
                    break;
            }})()}
        </div>
    )
}