import { useCallback, useState } from "react"

export function useChatsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('')

    const openSidebar = useCallback(() => setSidebarOpen(true), [])
    const closeSidebar = useCallback(() => setSidebarOpen(false), [])

    const onTabChange = useCallback((tab) => {
        setActiveTab(tab)
    }, [])

    return {
        sidebarOpen,
        activeTab,
        openSidebar,
        closeSidebar,
        onTabChange,
    }
}