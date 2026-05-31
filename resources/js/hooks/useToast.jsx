import { useCallback, useState } from "react";

export function useToast() {
    const [toast, setToast] = useState({ 
        visible: false, 
        message: '',
        type: '',
    })

    const showToast = useCallback((message, type = '') => {
        setToast({ visible: true, message, type })
    }, [])

    const hideToast = useCallback(() => {
        setToast({ visible: false, message: '', type: '' })
    }, [])

    return { toast, showToast, hideToast }
}