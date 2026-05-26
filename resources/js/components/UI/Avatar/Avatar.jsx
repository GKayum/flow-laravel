import styles from "./Avatar.module.scss"

export default function Avatar({ user, size = '2rem', fontSize = '1rem' }) {
    const avatar = user.avatar || null;
    const name = user.name;

    return (
        <>
            {avatar ? (
                <img 
                    src={avatar} 
                    alt={name || 'Аватар'}
                    className={styles.userImg}
                    style={{width: size, height: size}}
                />
            ) : (
                <span
                    className={styles.userSpan}
                    style={{width: size, height: size, fontSize: fontSize}}
                >
                    {name ? name[0].toUpperCase() : 'U'}
                </span>
            )}
        </>
    )
}