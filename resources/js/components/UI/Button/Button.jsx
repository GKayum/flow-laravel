import { Loader } from '../Loader/Loader'
import styles from './Button.module.scss'

export function Button({ loading, type, children }) {
    return (
        <button
            className={styles.button} 
            type={type}
        >
            {loading ? <Loader /> : children }
        </button>
    )
}