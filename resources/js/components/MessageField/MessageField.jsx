import { SendHorizonal } from "lucide-react"
import styles from "./MessageField.module.scss"
import { Paperclip } from "lucide-react"
import { Field } from "../UI/Field/Field"
import { Smile } from "lucide-react"
import { useState } from "react"

export default function MessageField({ onSendMessage }) {
    const [message, setMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!message.trim()) return

        onSendMessage(message)
        setMessage('')
    }

    return (
        <form className={styles.messageForm} onSubmit={handleSubmit}>
            <button type="button" className={styles.btn}>
                <Smile />
            </button>
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