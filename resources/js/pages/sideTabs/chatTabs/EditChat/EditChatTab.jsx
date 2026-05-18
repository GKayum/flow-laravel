import styles from "./EditChatTab.module.scss"
import { Field } from "../../../../components/UI/Field/Field"
import { useEffect, useState } from "react"
import { api, handlerApiError } from "../../../../services/api"
import { Check } from "lucide-react"
import Alert from "../../../../components/UI/Alert/Alert"
import { X } from "lucide-react"
import TabHeader from "../../../../components/TabHeader/TabHeader"
import { useChat } from "../../../../contexts/ChatContext"
import GroupAvatarCropper from "../../../../components/UI/GroupAvatarCropper/GroupAvatarCropper"
import { CircleCheck } from "lucide-react"

export default function EditChatTab({ onClose }) {
    const { selectedChat, onSelectChat } = useChat()
    const [formData, setFormData] = useState({
        avatar: '',
        name: '',
    })
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [validationErrors, setValidationErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [avatarLoading, setAvatarLoading] = useState(false)

    useEffect(() => {
        if (!selectedChat) return

        setFormData({
            avatar: selectedChat.avatar,
            name: selectedChat.name,
        })
    }, [selectedChat])

    const handleChangeAvatar = async (avatar) => {
        if (!avatar) return
        setError('')
        setValidationErrors({})

        setAvatarLoading(true)

        try {
            const data = new FormData()
            data.append('avatar', avatar, 'avatar.webp')

            await api.get('/sanctum/csrf-cookie')
            const response = await api.post(`/api/chat/${selectedChat.id}/update`, data, {
                headers: {'Content-Type' : 'multipart/form-data'}
            })
            onSelectChat(response.data.chat)
        } catch (error) {
            handlerApiError(error, { setValidationErrors, setError })
        } finally {
            setAvatarLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setValidationErrors({})

        setSubmitting(true)

        try {
            await api.get('/sanctum/csrf-cookie')
            const response = await api.post(`/api/chat/${selectedChat.id}/update`, { name: formData.name })
            onSelectChat(response.data.chat)
            setMessage(response.data.message)            
        } catch (error) {
            handlerApiError(error, { setValidationErrors, setError })
        } finally {
            setSubmitting(false)
        }
    }

    if (!selectedChat) return

    return (
        <>
        <TabHeader text={'Редактирование чата'} onClose={onClose} />
        <div className={styles.main}>
            <div className={styles.avatarContainer}>
                <GroupAvatarCropper 
                    onChangeAvatar={blob => handleChangeAvatar(blob)}
                    avatar={selectedChat.avatar} 
                />
                <span className={styles.avatarContainer__name}>{selectedChat.name}</span>
            </div>
            <div className={styles.body}>
                <form className={styles.body__block} onSubmit={handleSubmit}>
                    <Field
                        id="name"
                        placeholder='Название чата' 
                        type='text'
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        value={formData.name}
                        style={validationErrors.name ? { borderColor: '#FF0001' } : {}}
                    />
                    <button type="submit" className={`${styles.submitButton} ${formData.name ? styles.visible : ''}`}>
                        <CircleCheck />
                    </button>
                </form>
                <section className={styles.body__block}>
                    {message && <Alert icon={Check} content={message} label={'Оповещение'} type={'success'} />}
                    {error && <Alert icon={X} content={error} label={'Оповещение'} type={'danger'} />}
                </section>
            </div>
        </div>
        </>
    )
}