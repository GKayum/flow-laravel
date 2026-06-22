import styles from "./EditChatTab.module.scss"
import { Field } from "../../../../components/UI/Field/Field"
import { useEffect, useReducer, useState } from "react"
import { api, handlerApiError } from "../../../../services/api"
import { Check } from "lucide-react"
import Alert from "../../../../components/UI/Alert/Alert"
import { X } from "lucide-react"
import TabHeader from "../../../../components/TabHeader/TabHeader"
import { useChat } from "../../../../contexts/ChatContext"
import GroupAvatarCropper from "../../../../components/UI/GroupAvatarCropper/GroupAvatarCropper"
import { CircleCheck } from "lucide-react"
import { Trash } from "lucide-react"
import { Loader } from "../../../../components/UI/Loader/Loader"

const initialStatus = {
    message: '',
    error: '',
    validationErrors: {},
    submitting: false,
}

function statusReducer(state, action) {
    switch (action.type) {
        case 'START':
            return { ...initialStatus, submitting: true }
        case 'SUCCESS':
            return { ...state, submitting: false, message: action.message }
        case 'ERROR':
            return { ...state, submitting: false, error: action.error || '', validationErrors: action.validationErrors || {} }
        case 'CLEAR_FIELD':
            return { ...state, [action.field]: '' }
        case 'CLEAR':
            return { ...initialStatus }
        default:
            return state
    }
}

export default function EditChatTab({ onClose }) {
    const { selectedChat, updateChat, setChats } = useChat()
    const [formData, setFormData] = useState({
        avatar: '',
        name: '',
    })
    const [statusState, dispatchStatus] = useReducer(statusReducer, initialStatus)
    const { message, error, validationErrors, submitting } = statusState

    useEffect(() => {
        if (!selectedChat) return

        setFormData({
            avatar: selectedChat.avatar,
            name: selectedChat.name,
        })
    }, [selectedChat])

    const handleApiCatch = (error) => {
        handlerApiError(error, { 
            setValidationErrors: (errs) => dispatchStatus({ type: 'ERROR', validationErrors: errs }),
            setError: (err) => dispatchStatus({ type: 'ERROR', error: err })
        })
        setTimeout(() => dispatchStatus({ type: 'CLEAR_FIELD', field: 'error' }), 2000)
    }

    const handleChangeAvatar = async (avatar) => {
        if (!avatar) return
        dispatchStatus({ type: 'START' })

        try {
            const data = new FormData()
            data.append('avatar', avatar, 'avatar.webp')

            await api.get('/sanctum/csrf-cookie')
            const response = await api.post(`/api/chat/${selectedChat.id}/update`, data, {
                headers: {'Content-Type' : 'multipart/form-data'}
            })

            updateChat(response.data.chat)

            dispatchStatus({ type: 'SUCCESS', message: response.data.message })
            setTimeout(() => dispatchStatus({ type: 'CLEAR_FIELD', field: 'message' }), 2000)
        } catch (error) {
            handleApiCatch(error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.name === selectedChat.name) return
        dispatchStatus({ type: 'START' })

        try {
            await api.get('/sanctum/csrf-cookie')
            const response = await api.post(`/api/chat/${selectedChat.id}/update`, { name: formData.name })

            updateChat(response.data.chat)

            dispatchStatus({ type: 'SUCCESS', message: response.data.message })
            setTimeout(() => dispatchStatus({ type: 'CLEAR_FIELD', field: 'message' }), 2000)
        } catch (error) {
            handleApiCatch(error)
        }
    }

    const handleDeleteChat = async () => {
        dispatchStatus({ type: 'START' })

        try {
            await api.delete(`api/chat/${selectedChat.id}/delete`)

            setChats(prev =>
                prev.filter(chat => chat.id !== selectedChat.id)
            )
            onClose()
        } catch (error) {
            handlerApiError(error, { setValidationErrors: () => {}, setError: () => {} })
        }
    }

    if (!selectedChat) return null

    return (
        <>
        <TabHeader text={'Редактирование чата'} onClose={onClose} />
        <div className={styles.main}>
            <div className={styles.avatarContainer}>
                <GroupAvatarCropper
                    key={selectedChat.id}
                    avatar={selectedChat.avatar}
                    onChangeAvatar={blob => handleChangeAvatar(blob)}
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
                    <button 
                        type="submit" 
                        className={`${styles.submitButton} ${formData.name ? styles.visible : ''}`}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <Loader />
                        ) : (
                            <CircleCheck />
                        )}
                    </button>
                </form>
                <section className={styles.body__block}>
                    <button className={`${styles.button} ${styles.buttonDanger}`} onClick={handleDeleteChat}>
                        <Trash className={styles.icon} />
                        <div className={styles.buttonBody}>
                            <span className={styles.content}>Удалить чат</span>
                            <label className={styles.label}>Действие</label>
                        </div>
                    </button>
                    {message && <Alert icon={Check} content={message} label={'Оповещение'} type={'success'} />}
                    {error && <Alert icon={X} content={error} label={'Оповещение'} type={'danger'} />}
                </section>
            </div>
        </div>
        </>
    )
}