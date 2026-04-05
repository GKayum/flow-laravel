import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { handlerApiError } from "../../services/api"

import { Field } from "../../components/UI/Field/Field"
import { Button } from "../../components/UI/Button/Button"
import { Link } from "react-router-dom"
import styles from "./RegisterPage.module.scss"

export default function RegisterPage() {
    const { register } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        passwordConfirmation: ''
    })
    const [error, setError] = useState('')
    const [validationErrors, setValidationErrors] = useState({})
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setValidationErrors({})

        setLoading(true)

        try {
            await register(formData.email, formData.name, formData.password, formData.passwordConfirmation)
        } catch (error) {
            console.log(error);
            
            handlerApiError(error, { setValidationErrors, setError })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.main}>
            <h1 className={styles.main__title}>Flow</h1>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.form__item}>
                    <label htmlFor="name" className={styles.label}>Имя</label>
                    <Field 
                        id="text" 
                        placeholder='Имя' 
                        type='text' 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        value={formData.name}
                        style={validationErrors.name ? { borderColor: '#FF0001' } : {}}
                    />
                    {validationErrors.name && (
                        <div className={styles.item__error}>{validationErrors.name[0]}</div>
                    )}
                </div>
                <div className={styles.form__item}>
                    <label htmlFor="email" className={styles.label}>Email</label>
                    <Field 
                        id="email" 
                        placeholder='Электронный адрес' 
                        type='email'
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        value={formData.email}
                        style={validationErrors.email ? { borderColor: '#FF0001' } : {}}
                    />
                    {validationErrors.email && (
                        <div className={styles.item__error}>{validationErrors.email[0]}</div>
                    )}
                </div>
                <div className={styles.form__item}>
                    <label htmlFor="password" className={styles.label}>Пароль</label>
                    <Field 
                        id="password" 
                        placeholder='Пароль' 
                        type='password' 
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        value={formData.password}
                        style={validationErrors.password ? { borderColor: '#FF0001' } : {}}
                    />
                    {validationErrors.password && (
                        <div className={styles.item__error}>{validationErrors.password[0]}</div>
                    )}
                </div>
                <div className={styles.form__item}>
                    <label htmlFor="passwordConfirmation" className={styles.label}>Повторите пароль</label>
                    <Field 
                        id="passwordConfirmation" 
                        placeholder='Повторите пароль' 
                        type='password' 
                        onChange={e => setFormData({...formData, passwordConfirmation: e.target.value})}
                        value={formData.passwordConfirmation}
                        style={validationErrors.passwordConfirmation ? { borderColor: '#FF0001' } : {}}
                    />
                    {validationErrors.passwordConfirmation && (
                        <div className={styles.item__error}>{validationErrors.passwordConfirmation[0]}</div>
                    )}
                </div>
                {error && (
                    <div className={styles.error}>{error}</div>
                )}
                <Button type={'submit'} loading={loading} disabled={loading}>Создать профиль</Button>
            </form>
            <Link to='/login' className={styles.main__link}><span>Уже есть профиль?</span> Войти</Link>
        </div>
    )
}