import { useAuth } from "../contexts/AuthContext";

export function useChatDisplay(chat) {
    const { user: currentUser } = useAuth()
    
    if (!chat) return null

    const isGroup = !!chat.is_group
    const members = chat.members || []

    if (!isGroup) {
        const companion = members.find(member => member.id !== currentUser.id)
        return {
            displayName: companion?.name,
            displayAvatar: companion?.avatar || null,
            isGroup: false,
            companion,
            originalChat: chat,
        }
    }

    return {
        displayName: chat.name,
        displayAvatar: chat.avatar,
        isGroup,
        members,
        originalChat: chat,
    }
}