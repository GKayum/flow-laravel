import { useAuth } from "../../../contexts/AuthContext"
import styles from "./EditProfileTab.module.scss"
import { Pen } from "lucide-react"
import { Calendar1 } from "lucide-react"
import { Field } from "../../../components/UI/Field/Field"
import { useReducer, useState } from "react"
import { UserRound } from "lucide-react"
import { SquareAsterisk } from "lucide-react"
import { api, handlerApiError } from "../../../services/api"
import { AtSign } from "lucide-react"
import { Check } from "lucide-react"
import Alert from "../../../components/UI/Alert/Alert"
import { X } from "lucide-react"
import TabHeader from "../../../components/TabHeader/TabHeader"
import UserAvatarCropper from "../../../components/UI/UserAvatarCropper/UserAvatarCropper"
import { useChat } from "../../../contexts/ChatContext"

const initialStatus = {
    message: '',
    error: '',
    validationErrors: {},
    submitting: false,
    avatarLoading: false,
}

function statusReducer(state, action) {
    switch (action.type) {
        case 'START_SUBMIT':
            return { ...initialStatus, submitting: true }
        case 'SUCCESS_SUBMIT':
            return { ...state, submitting: false, message: action.message }
        case 'ERROR_SUBMIT':
            return { ...state, submitting: false, error: action.error || '', validationErrors: action.validationErrors || {} }
        case 'START_AVATAR':
            return { ...initialStatus, avatarLoading: true }
        case 'SUCCESS_AVATAR':
            return { ...state, avatarLoading: false }
        case 'ERROR_AVATAR':
            return { ...state, avatarLoading: false, error: action.error || '', validationErrors: action.validationErrors || {} }
        case 'CLEAR_FIELD':
            return { ...state, [action.field]: '' }
        default:
            return state
    }
}

export default function EditProfileTab({ onClose }) {
    const { user, setUser } = useAuth()
    const { updateMemberInChats, updateMemberInMessages } = useChat()
    const [formData, setFormData] = useState({
        avatar: user.avatar,
        name: user.name,
        dateOfBirth: user.dateOfBirth ?? '',
        email: user.email,
        password: '',
        passwordConfirmation: '',
    })
    const [status, dispatchStatus] = useReducer(statusReducer, initialStatus)

    const handleChangeAvatar = async (avatar) => {
        if (!avatar) return
        dispatchStatus({ type: 'START_AVATAR' })

        try {
            const data = new FormData()
            data.append('avatar', avatar, 'avatar.webp')

            await api.get('/sanctum/csrf-cookie')
            const response = await api.post('/api/user/update', data, {
                headers: {'Content-Type' : 'multipart/form-data'}
            })
            setUser(response.data.user)
            updateMemberInChats(response.data.user)
            updateMemberInMessages(response.data.user)

            dispatchStatus({ type: 'SUCCESS_AVATAR' })
        } catch (error) {
            handlerApiError(error, { 
                setValidationErrors: (errs) => dispatchStatus({ type: 'ERROR_AVATAR', validationErrors: errs }),
                setError: (err) => dispatchStatus({ type: 'ERROR_AVATAR', error: err })
            })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        dispatchStatus({ type: 'START_SUBMIT' })

        try {
            const data = new FormData()
            data.append('name', formData.name);
            data.append('date_of_birth', formData.dateOfBirth);
            data.append('email', formData.email);
            if (formData.password) {
                data.append('password', formData.password)
                data.append('password_confirmation', formData.passwordConfirmation)
            }

            await api.get('/sanctum/csrf-cookie')
            const response = await api.post('/api/user/update', data)

            setUser(response.data.user)
            updateMemberInChats(response.data.user)
            updateMemberInMessages(response.data.user)

            dispatchStatus({ type: 'SUCCESS_SUBMIT', message: response.data.message })
            setTimeout(() => {
                dispatchStatus({ type: 'CLEAR_FIELD', field: 'message' })       
            }, 2000);
        } catch (error) {
            handlerApiError(error, { 
                setValidationErrors: (errs) => dispatchStatus({ type: 'ERROR_SUBMIT', validationErrors: errs }),
                setError: (err) => dispatchStatus({ type: 'ERROR_SUBMIT', error: err })
            })
        }
    }

    return (
        <>
        <TabHeader text={'Редактирование профиля'} onClose={onClose} />
        <div className={styles.main}>
            <div className={styles.avatarContainer}>
                <UserAvatarCropper 
                    onChangeAvatar={blob => handleChangeAvatar(blob)} 
                    avatarLoading={status.avatarLoading}
                />
                <span className={styles.avatarContainer__name}>{user.name}</span>
            </div>
            <div className={styles.body}>
                <form className={styles.body__block} onSubmit={handleSubmit}>
                    <div className={styles.item}>
                        <UserRound className={styles.icon} />
                        <Field
                            id="name"
                            placeholder='Имя' 
                            type='text'
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            value={formData.name}
                            style={status.validationErrors.name ? { borderColor: '#FF0001' } : {}}
                        />
                    </div>
                    <div className={styles.item}>
                        <Calendar1 className={styles.icon} />
                        <Field
                            id="dateOfBirth"
                            placeholder='Дата рождения' 
                            type='date'
                            onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                            value={formData.dateOfBirth}
                            style={status.validationErrors.dateOfBirth ? { borderColor: '#FF0001' } : {}}
                        />
                    </div>
                    <div className={styles.item}>
                        <AtSign className={styles.icon} />
                        <Field
                            id="email" 
                            placeholder='Email' 
                            type='email'
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            value={formData.email}
                            style={status.validationErrors.email ? { borderColor: '#FF0001' } : {}}
                        />
                    </div>
                    <div className={styles.item}>
                        <SquareAsterisk className={styles.icon} />
                        <Field
                            id="password" 
                            placeholder='Пароль' 
                            type='password'
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            value={formData.password}
                            style={status.validationErrors.password ? { borderColor: '#FF0001' } : {}}
                        />
                    </div>
                    <div className={styles.item}>
                        <SquareAsterisk className={styles.icon} />
                        <Field
                            id="password-confirmation" 
                            placeholder='Повторите пароль' 
                            type='password'
                            onChange={e => setFormData({...formData, passwordConfirmation: e.target.value})}
                            value={formData.passwordConfirmation}
                            style={status.validationErrors.passwordConfirmation ? { borderColor: '#FF0001' } : {}}
                        />
                    </div>
                    <button 
                        type="submit"
                        className={`${styles.item} ${styles.buttonEdit}`}
                    >
                        <Pen className={styles.buttonIcon} />
                        <div className={styles.item__body}>
                            <span className={styles.content}>{status.submitting ? 'Сохранение...' : 'Сохранить изменения'}</span>
                            <label className={styles.label}>Действие</label>
                        </div>
                    </button>
                </form>
                <section className={styles.body__block}>
                    {status.message && <Alert icon={Check} content={status.message} label={'Оповещение'} type={'success'} />}
                    {status.error && <Alert icon={X} content={status.error} label={'Оповещение'} type={'danger'} />}
                </section>
            </div>
        </div>
        </>
    )
}