import Avatar from "../../../components/UI/Avatar/Avatar"
import { useAuth } from "../../../contexts/AuthContext"
import styles from "./UsersTab.module.scss"
import TabHeader from "../../../components/TabHeader/TabHeader"
import SearchField from "../../../components/UI/SearchField/SearchField"
import { useEffect, useMemo, useState } from "react"
import { api, handlerApiError } from "../../../services/api"

export default function UsersTab({ onClose }) {
    const { user } = useAuth()
    const [value, setValue] = useState('')
    const [users, setUsers] = useState([])

    const searchUrl = useMemo(() => {
        const params = new URLSearchParams()

        params.set('q', value)

        return `/api/users/search?${params.toString()}`
    }, [value])

    useEffect(() => {
        if (!value.trim()) return
        setUsers([])

        api.get(searchUrl)
            .then(res => setUsers(res.data))
            .catch(error => handlerApiError(error, {}, {}))
    }, [value])
    
    return (
        <>
        <TabHeader onClose={onClose}>
            <SearchField value={value} setValue={setValue} />
        </TabHeader>
        <div className={styles.main}>
            <div className={styles.body}>
                <section className={styles.body__block}>
                    {/* {users.length === 0 ? (
                        <div>Ничего не найдено...</div>
                    ) : (
                        users.map((user) => (
                            <button className={styles.item}>
                                <Avatar user={user} size="2.625rem" fontSize="1.3rem" />
                                <div className={styles.item__body}>
                                    <span className={styles.content}>{user.name}</span>
                                    <label className={styles.label}>был недавно</label>
                                </div>
                            </button>
                        ))
                    )} */}

                    {users && (
                        users.map((user) => (
                            <button className={styles.item}>
                                <Avatar user={user} size="2.625rem" fontSize="1.3rem" />
                                <div className={styles.item__body}>
                                    <span className={styles.content}>{user.name}</span>
                                    <label className={styles.label}>был недавно</label>
                                </div>
                            </button>
                        ))
                    )}
                </section>
            </div>
        </div>
        </>
    )
}