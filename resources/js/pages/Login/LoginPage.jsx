import { useAuth } from "../../contexts/AuthContext"
import { useState } from "react"
import { handlerApiError } from "../../services/api"

import { Button } from "../../components/UI/Button/Button"
import { Field } from "../../components/UI/Field/Field"
import { Link } from "react-router-dom"
import styles from "./LoginPage.module.scss"

export default function LoginPage() {
    const { login } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
            await login(formData.email, formData.password)
        } catch (error) {
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
                {error && (
                    <div className={styles.error}>{error}</div>
                )}
                <Button type={'submit'} loading={loading} disabled={loading}>Войти</Button>
            </form>
            <Link to='/register' className={styles.main__link}><span>Нет аккаунта?</span> Регистрация</Link>
        </div>
    )
}
