import styles from './Field.module.scss'

export function Field(props) {
    return (
        <input {...props} className={styles.input} />
    )
}