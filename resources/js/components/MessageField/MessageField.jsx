import { SendHorizonal } from "lucide-react"
import styles from "./MessageField.module.scss"
import { Paperclip } from "lucide-react"
import { Field } from "../UI/Field/Field"
import { Smile } from "lucide-react"
import { useState } from "react"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

export default function MessageField({ onSendMessage }) {
    const [message, setMessage] = useState('')
    const [showPicker, setShowPicker] = useState(false)

    const addEmoji = (emoji) => {
        setMessage(message + emoji.native)
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
                        onClickOutside={() => setShowPicker(false)}
                    />
                </div>
            </div>

            <Field
                type="text"
                placeholder="Введите сообщение"
                onChange={e => setMessage(e.target.value)}
                value={message}
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