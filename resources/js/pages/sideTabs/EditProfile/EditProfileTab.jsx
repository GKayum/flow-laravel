import { useAuth } from "../../../contexts/AuthContext"
import styles from "./EditProfileTab.module.scss"
import { Pen } from "lucide-react"
import { Calendar1 } from "lucide-react"
import { Field } from "../../../components/UI/Field/Field"
import { useState } from "react"
import { UserRound } from "lucide-react"
import { SquareAsterisk } from "lucide-react"
import { api, handlerApiError } from "../../../services/api"
import { AtSign } from "lucide-react"
import { Check } from "lucide-react"
import Alert from "../../../components/UI/Alert/Alert"
import { X } from "lucide-react"
import TabHeader from "../../../components/TabHeader/TabHeader"
import UserAvatarCropper from "../../../components/UI/UserAvatarCropper/UserAvatarCropper"

export default function EditProfileTab({ onClose }) {
    const { user, setUser } = useAuth()
    const [formData, setFormData] = useState({
        avatar: user.avatar,
        name: user.name,
        dateOfBirth: user.dateOfBirth ?? '',
        email: user.email,
        password: '',
        passwordConfirmation: '',
    })
    const [formStatus, setFormStatus] = useState({
        message: '',
        error: '',
        validationErrors: {},
        submitting: false,
        avatarLoading: false,
    })
    // const [message, setMessage] = useState('')
    // const [error, setError] = useState('')
    // const [validationErrors, setValidationErrors] = useState({})
    // const [submitting, setSubmitting] = useState(false)
    // const [avatarLoading, setAvatarLoading] = useState(false)

    const handleChangeAvatar = async (avatar) => {
        if (!avatar) return
        setFormStatus(prev => ({ ...prev, error: '' }))
        setFormStatus(prev => ({ ...prev, validationErrors: {} }))

        setFormStatus(prev => ({ ...prev, avatarLoading: true }))

        try {
            const data = new FormData()
            data.append('avatar', avatar, 'avatar.webp')

            await api.get('/sanctum/csrf-cookie')
            const response = await api.post('/api/user/update', data, {
                headers: {'Content-Type' : 'multipart/form-data'}
            })
            setUser(response.data.user)
        } catch (error) {
            handlerApiError(error, { setValidationErrors, setError })
        } finally {
            setFormStatus(prev => ({ ...prev, avatarLoading: false }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormStatus(prev => ({ ...prev, error: '' }))
        setFormStatus(prev => ({ ...prev, message: '' }))
        setFormStatus(prev => ({ ...prev, validationErrors: {} }))

        setFormStatus(prev => ({ ...prev, submitting: true }))

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
            setFormStatus(prev => ({ ...prev, message: response.data.message })) 
            setTimeout(() => {
                setMessage('')            
            }, 2000);
        } catch (error) {
            handlerApiError(error, { setValidationErrors, setError })
            console.log(error);
        } finally {
            setFormStatus(prev => ({ ...prev, submitting: false }))
        }
    }

    return (
        <>
        <TabHeader text={'Редактирование профиля'} onClose={onClose} />
        <div className={styles.main}>
            <div className={styles.avatarContainer}>
                <UserAvatarCropper 
                    onChangeAvatar={blob => handleChangeAvatar(blob)} 
                    avatarLoading={formStatus.avatarLoading}
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
                            style={formStatus.validationErrors.name ? { borderColor: '#FF0001' } : {}}
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
                            style={formStatus.validationErrors.dateOfBirth ? { borderColor: '#FF0001' } : {}}
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
                            style={formStatus.validationErrors.email ? { borderColor: '#FF0001' } : {}}
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
                            style={formStatus.validationErrors.password ? { borderColor: '#FF0001' } : {}}
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
                            style={formStatus.validationErrors.passwordConfirmation ? { borderColor: '#FF0001' } : {}}
                        />
                    </div>
                    <button 
                        type="submit"
                        className={`${styles.item} ${styles.buttonEdit}`}
                    >
                        <Pen className={styles.buttonIcon} />
                        <div className={styles.item__body}>
                            <span className={styles.content}>{formStatus.submitting ? 'Сохранение...' : 'Сохранить изменения'}</span>
                            <label className={styles.label}>Действие</label>
                        </div>
                    </button>
                </form>
                <section className={styles.body__block}>
                    {formStatus.message && <Alert icon={Check} content={formStatus.message} label={'Оповещение'} type={'success'} />}
                    {formStatus.error && <Alert icon={X} content={formStatus.error} label={'Оповещение'} type={'danger'} />}
                </section>
            </div>
        </div>
        </>
    )
}