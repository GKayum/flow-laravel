import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { api } from "../services/api"

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [userLoading, setUserLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        api.get('/api/user/profile')
            .then(response => {
                console.log('Profile loaded:', response.data)
                setUser(response.data)
            })
            .catch(error => {
                console.error('Profile load error:', error.response?.status, error.response?.data)
                setUser(null)
            })
            .finally(() => setUserLoading(false))
    }, [])

    const login = async (email, password) => {
        await api.get('/sanctum/csrf-cookie')
        const response = await api.post('/api/login', { email, password })
        setUser(response.data.user)
        navigate('/')
    }

    const register = async (email, name, password, passwordConfirmation) => {
        await api.get('/sanctum/csrf-cookie')
        const response = await api.post('/api/register', { email, name, password, password_confirmation: passwordConfirmation })
        setUser(response.data.user)
        navigate('/')
    }

    const logout = async () => {
        await api.post('/api/logout')
        setUser(null)
        navigate('/')
    }

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            userLoading,
            setUser
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}