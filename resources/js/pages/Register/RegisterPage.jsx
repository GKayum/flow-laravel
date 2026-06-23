import { useReducer, useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { handlerApiError } from "../../services/api"

import { Field } from "../../components/UI/Field/Field"
import { Button } from "../../components/UI/Button/Button"
import { Link } from "react-router-dom"
import styles from "./RegisterPage.module.scss"

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

export default function RegisterPage() {
    const { register } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        passwordConfirmation: ''
    })
    const [submitState, dispatchSubmit] = useReducer(submitReducer, initialSubmit)
    const { error, validationErrors, loading } = submitState
    const [isFlipped, setIsFlipped] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        dispatchSubmit({ type: 'SUBMIT_START' })

        try {
            await register(formData.email, formData.name, formData.password, formData.passwordConfirmation)
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