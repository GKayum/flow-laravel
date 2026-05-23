import { useCallback, useState } from "react";

export function useCopyToClipboard() {
    const [copiedText, setCopiedText] = useState(null)
    const [isCopied, setIsCopied] = useState(false)

    const copy = useCallback(async (text) => {
        if (!navigator?.clipboard) {
            console.warn('Clipboard API не поддерживается в этом браузере')
            return
        }

        try {
            await navigator.clipboard.writeText(text)
            setCopiedText(text)
            setIsCopied(true)

            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error('Не удалось скопировать текст: ', error)
            setCopiedText(null)
            setIsCopied(false)
        }
    }, [])

    return { isCopied, copiedText, copy }
}