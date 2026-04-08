import styles from "./Avatar.module.scss"

export default function Avatar({ user, size = '2rem', fontSize = '1rem' }) {
    const avatar = user.avatar || null;

    return (
        <>
            {avatar ? (
                <img 
                    src={avatar} 
                    alt={user.name || 'Аватар'}
                    className={styles.userImg}
                    style={{width: size, height: size}}
                />
            ) : (
                <span
                    className={styles.userSpan}
                    style={{width: size, height: size, fontSize: fontSize}}
                >
                    {user.name[0].toUpperCase() ?? 'U'}
                </span>
            )}
        </>
    )
}