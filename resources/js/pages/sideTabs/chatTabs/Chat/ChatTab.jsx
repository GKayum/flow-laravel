import Avatar from "../../../../components/UI/Avatar/Avatar"
import styles from "./ChatTab.module.scss"
import { Pen } from "lucide-react"
import TabHeader from "../../../../components/TabHeader/TabHeader"
import { useChat } from "../../../../contexts/ChatContext"
import { usePlural } from "../../../../hooks/usePlural"
import MemberItem from "../../../../components/MemberItem/MemberItem"
import { api, handlerApiError } from "../../../../services/api"
import { useCallback } from "react"
import { UserRoundPlus } from "lucide-react"

export default function ChatTab({ onChatTabChange, showToast, onClose }) {
    const { selectedChat, updateChat } = useChat()

    const memberWord = usePlural(selectedChat?.members.length, ['участник', 'участника', 'участников'])

    const handleDeleteUser = useCallback(async (memberId) => {
        if (!selectedChat) return
        try {
            await api.delete(`/api/chat/${selectedChat.id}/member/${memberId}`)

            const updatedMembers = selectedChat.members.filter(m => m.id !== memberId)
            updateChat({
                id: selectedChat.id,
                members: updatedMembers,
            })
            showToast(response.data.message)
        } catch (error) {
            handlerApiError(error, { setValidationErrors: () => {}, setError: (error) => showToast(error, 'danger') })
        }
    }, [selectedChat, updateChat])

    const handleChangeRole = useCallback(async (memberId, newRole = 'admin') => {
        if (!selectedChat) return
        try {
            const response = await api.put(`/api/chat/${selectedChat.id}/member/${memberId}/role`, {
                role: newRole,
            })

            const updatedMember = response.data.user
            const updatedMembers = selectedChat.members.map(m => 
                m.id === memberId ? { ...m, ...updatedMember } : m
            )
            updateChat({
                id: selectedChat.id,
                members: updatedMembers,
            })
            showToast(response.data.message)
        } catch (error) {
            handlerApiError(error, { setValidationErrors: () => {}, setError: (error) => showToast(error, 'danger') })
        }
    }, [selectedChat, updateChat, showToast])

    if (!selectedChat) return null

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
                <span className={styles.avatarContainer__members}>{selectedChat.members.length} {memberWord}</span>
            </div>
            <div className={styles.body}>
                <div className={styles.membersContainer}>
                    {selectedChat.members.map((member) => (
                        <MemberItem
                            key={member.id}
                            member={member}
                            onDelete={handleDeleteUser}
                            onChangeRole={handleChangeRole}
                        />
                    ))}
                </div>
                <button 
                    type="button"
                    className={styles.changeTabBtn}
                    onClick={() => onChatTabChange('addMember')}
                >
                    <UserRoundPlus />
                </button>
            </div>
        </div>
        </>
    )
}