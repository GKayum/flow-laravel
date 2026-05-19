import Avatar from "../../../components/UI/Avatar/Avatar"
import styles from "./UsersTab.module.scss"
import TabHeader from "../../../components/TabHeader/TabHeader"
import SearchField from "../../../components/UI/SearchField/SearchField"
import { useEffect, useMemo, useState } from "react"
import { api } from "../../../services/api"
import { useDebounce } from "../../../hooks/useDebounce"
import { useChat } from "../../../contexts/ChatContext"

export default function UsersTab({ onClose }) {
    const { onSelectChat } = useChat()
    const [value, setValue] = useState('')
    const [users, setUsers] = useState([])
    const debouncedValue = useDebounce(value)

    const searchUrl = useMemo(() => {
        const params = new URLSearchParams()

        params.set('q', debouncedValue)

        return `/api/users/search?${params.toString()}`
    }, [debouncedValue])

    useEffect(() => {
        if (!value.trim()) setUsers([])
    }, [value])

    useEffect(() => {
        if (!debouncedValue.trim()) return

        api.get(searchUrl)
            .then(res => setUsers(res.data))
            .catch(error => console.error(error))

    }, [debouncedValue])

    // const handleClick = ({ user, isUser }) => {
    //     onSelectChat({ user, isUser })
    //     onClose()
    //     setValue('')
    // }
    
    return (
        <>
        <TabHeader onClose={onClose}>
            <SearchField value={value} setValue={setValue} />
        </TabHeader>
        <div className={styles.main}>
            {users.map((user) => (
                <button className={styles.item} key={user.id}>
                    <Avatar user={user} size="2.625rem" fontSize="1.3rem" />
                    <div className={styles.item__body}>
                        <span className={styles.content}>{user.name}</span>
                        <label className={styles.label}>был недавно</label>
                    </div>
                </button>
            ))}
        </div>
        </>
    )
}