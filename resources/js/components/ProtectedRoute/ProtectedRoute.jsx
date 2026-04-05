import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Loader } from '../UI/Loader/Loader'
import styles from './ProtectedRoute.module.scss'

export function ProtectedRoute() {
    const { user, userLoading } = useAuth()

    if (userLoading) {
        return (
            <main className={styles.main}>
                <Loader className={styles.loader} />
            </main>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}