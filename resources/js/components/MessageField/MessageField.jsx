import { SendHorizonal } from "lucide-react"
import styles from "./MessageField.module.scss"
import { Paperclip } from "lucide-react"
import { Smile } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

export default function MessageField({ onSendMessage }) {
    const [message, setMessage] = useState('')
    const [showPicker, setShowPicker] = useState(false)
    const textareaRef = useRef(null)

    useEffect(() => {
        const textarea = textareaRef.current
        if (!textarea) return

        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
    }, [message])

    const addEmoji = useCallback((emoji) => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const currentValue = textarea.value

        const newValue =
            currentValue.substring(0, start) +
            emoji.native +
            currentValue.substring(end)
        
        setMessage(newValue)
        textarea.focus()
    }, [])

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    const handleClickOutside = (e) => {
        if (!textareaRef.current?.contains(e.target)) {
            setShowPicker(false);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!message.trim()) return

        onSendMessage(message)
        setMessage('')
    }

    return (
        <form className={styles.messageForm} onSubmit={handleSubmit}>

            <div className={styles.pickerContainer}>
                <button 
                    type="button" 
                    className={`${styles.btn} ${showPicker ? styles.active : ''}`} 
                    onClick={(e) => {
                        e.stopPropagation()
                        setShowPicker(prev => !prev)
                    }}
                >
                    <Smile />
                </button>

                <div className={`${styles.pickerBlock} ${showPicker ? styles.visible : ''}`} >
                    <Picker
                        data={data}
                        theme={'light'}
                        locale={'ru'}
                        previewPosition={'none'}
                        onEmojiSelect={addEmoji} 
                        onClickOutside={handleClickOutside}
                    />
                </div>
            </div>

            <textarea
                ref={textareaRef}
                className={styles.messageInput}
                placeholder="Введите сообщение"
                onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                value={message}
                rows={1}
            />
            <button type="button" className={styles.btn}>
                <Paperclip />
            </button>
            <button type="submit" className={styles.messageSubmit}>
                <SendHorizonal />
            </button>
        </form>
    )
}