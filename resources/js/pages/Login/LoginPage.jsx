import { useAuth } from "../../contexts/AuthContext"
import { useReducer, useState } from "react"
import { handlerApiError } from "../../services/api"

import { Button } from "../../components/UI/Button/Button"
import { Field } from "../../components/UI/Field/Field"
import { Link } from "react-router-dom"
import styles from "./LoginPage.module.scss"

const initialSubmit = {
    error: '',
    validationErrors: {},
    loading: false,
}

function submitReducer(state, action) {
    switch (action.type) {
        case 'SUBMIT_START':
            return { ...initialSubmit, loading: true }
        case 'SUBMIT_SUCCESS':
            return { ...state, loading: false }
        case 'SUBMIT_ERROR':
            return { ...state, error: action.error || '', validationErrors: action.validationErrors || {}, loading: false }
        default:
            return state
    }
}

export default function LoginPage() {
    const { login } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [submitState, dispatchSubmit] = useReducer(submitReducer, initialSubmit)
    const { loading, error, validationErrors } = submitState
    const [isFlipped, setIsFlipped] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        dispatchSubmit({ type: 'SUBMIT_START' })

        try {
            await login(formData.email, formData.password)
            dispatchSubmit({ type: 'SUBMIT_SUCCESS' })
        } catch (error) {
            handlerApiError(error, { 
                setValidationErrors: (errs) => dispatchSubmit({ type: 'SUBMIT_ERROR', validationErrors: errs }),
                setError: (err) => dispatchSubmit({ type: 'SUBMIT_ERROR', error: err })
            })
        }
    }

    return (
        <div className={styles.main}>
            <div 
                className={`${styles.titleContainer} ${isFlipped ? styles.flipped : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <h1 className={styles.title}>Flow</h1>
                <h1 className={styles.title}>idup</h1>
            </div>
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
