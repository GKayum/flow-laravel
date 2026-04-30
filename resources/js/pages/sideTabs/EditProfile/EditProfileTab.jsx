import { useAuth } from "../../../contexts/AuthContext"
import styles from "./EditProfileTab.module.scss"
import { Pen } from "lucide-react"
import { Calendar1 } from "lucide-react"
import { Field } from "../../../components/UI/Field/Field"
import { useState } from "react"
import { UserRound } from "lucide-react"
import { SquareAsterisk } from "lucide-react"
import AvatarCropper from "../../../components/AvatarCropper/AvatarCropper"
import { api, handlerApiError } from "../../../services/api"
import { AtSign } from "lucide-react"
import { Check } from "lucide-react"
import Alert from "../../../components/UI/Alert/Alert"
import { X } from "lucide-react"
import TabHeader from "../../../components/TabHeader/TabHeader"

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
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [validationErrors, setValidationErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [avatarLoading, setAvatarLoading] = useState(false)

    const handleChangeAvatar = async (avatar) => {
        if (!avatar) return
        setError('')
        setValidationErrors({})

        setAvatarLoading(true)

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
            setMessage(response.data.message)            
        } catch (error) {
            handlerApiError(error, { setValidationErrors, setError })
            console.log(error);
            
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
        <TabHeader text={'Редактирование профиля'} onClose={onClose} />
        <div className={styles.main}>
            <div className={styles.avatarContainer}>
                <AvatarCropper onChangeAvatar={blob => handleChangeAvatar(blob)} avatarLoading={avatarLoading} />
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
                            style={validationErrors.name ? { borderColor: '#FF0001' } : {}}
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
                            style={validationErrors.dateOfBirth ? { borderColor: '#FF0001' } : {}}
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
                            style={validationErrors.email ? { borderColor: '#FF0001' } : {}}
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
                            style={validationErrors.password ? { borderColor: '#FF0001' } : {}}
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
                            style={validationErrors.passwordConfirmation ? { borderColor: '#FF0001' } : {}}
                        />
                    </div>
                    <button 
                        type="submit"
                        className={`${styles.item} ${styles.buttonEdit}`}
                    >
                        <Pen className={styles.buttonIcon} />
                        <div className={styles.item__body}>
                            <span className={styles.content}>{submitting ? 'Сохранение...' : 'Сохранить изменения'}</span>
                            <label className={styles.label}>Действие</label>
                        </div>
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