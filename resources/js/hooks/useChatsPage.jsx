import { useCallback, useState } from "react"

export function useChatsPage() {
    const [state, setState] = useState({
        mainOpen: false,
        chatOpen: false,
        mainTab: "",
        chatTab: "",
    })

    const openSidebar = useCallback((name) => {
        setState(prev => ({ ...prev, [`${name}Open`]: true }))
    }, [])

    const closeSidebar = useCallback((name) => {
        setState(prev => ({ ...prev, [`${name}Open`]: false }))
    }, [])

    const onTabChange = useCallback((type, tab) => {
        setState(prev => ({ ...prev, [`${type}Tab`]: tab }))
    }, [])

    return {
        sidebarOpen: state.mainOpen,
        chatSidebarOpen: state.chatOpen,
        activeTab: state.mainTab,
        chatActiveTab: state.chatTab,

        openSidebar,
        closeSidebar,
        onTabChange,
    }
}