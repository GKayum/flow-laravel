import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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

    const login = useCallback(async (email, password) => {
        await api.get('/sanctum/csrf-cookie')
        const response = await api.post('/api/login', { email, password })
        setUser(response.data.user)
        navigate('/')
    }, [navigate])

    const register = useCallback(async (email, name, password, passwordConfirmation) => {
        await api.get('/sanctum/csrf-cookie')
        const response = await api.post('/api/register', { email, name, password, password_confirmation: passwordConfirmation })
        setUser(response.data.user)
        navigate('/')
    }, [navigate])

    const logout = useCallback(async () => {
        await api.post('/api/logout')
        setUser(null)
        navigate('/')
    }, [navigate])

    const contextValue = useMemo(() => ({
        user,
        login,
        register,
        logout,
        userLoading,
        setUser
    }), [user, userLoading, login, register, logout])

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}