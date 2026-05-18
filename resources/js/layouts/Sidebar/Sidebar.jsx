import styles from "./Sidebar.module.scss"
import ProfileTab from "../../pages/sideTabs/Profile/ProfileTab"
import EditProfileTab from "../../pages/sideTabs/EditProfile/EditProfileTab"
import UsersTab from "../../pages/sideTabs/Users/UsersTab"
import CreateGroupTab from "../../pages/sideTabs/CreateGroup/CreateGroupTab"

export default function Sidebar({ open, onClose, activeTab, onTabChange }) {
    return (
        <div 
            className={styles.main}
            style={{
                transform: open ? 'translateX(0px)' : 'translateX(-100%)'
            }}
        >
            {(() => {switch (activeTab) {
                case 'profile':
                    return <ProfileTab onTabChange={onTabChange} onClose={onClose} />
                case 'editProfile':
                    return <EditProfileTab onClose={onClose} />
                case 'users':
                    return <UsersTab onClose={onClose} />
                case 'createGroup':
                    return <CreateGroupTab onClose={onClose} />
                default:
                    break;
            }})()}
        </div>
    )
}