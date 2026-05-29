import Avatar from "../../../components/UI/Avatar/Avatar"
import styles from "./SearchTab.module.scss"
import TabHeader from "../../../components/TabHeader/TabHeader"
import SearchField from "../../../components/UI/SearchField/SearchField"
import { useEffect, useMemo, useState } from "react"
import { api } from "../../../services/api"
import { useChat } from "../../../contexts/ChatContext"
import { debounce } from "../../../utils/debounce"

export default function SearchTab({ onClose }) {
    const { openPersonalChat } = useChat()
    const [value, setValue] = useState('')
    const [users, setUsers] = useState([])

    const debouncedSearch = useMemo(
        () => 
            debounce((searchQuery) => {
                if (!searchQuery.trim()) return

                const params = new URLSearchParams()
                params.set('q', searchQuery)

                api.get(`/api/users/search?${params.toString()}`)
                    .then(res => setUsers(res.data))
                    .catch(error => console.error(error))
            }),
        []
    )

    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch])

    const handleSearchChange = (newValue) => {
        setValue(newValue)

        if (!newValue.trim()) {
            setUsers([])
            debouncedSearch.cancel()
        } else {
            debouncedSearch(newValue)
        }
    }

    const handleClick = (user) => {
        openPersonalChat(user.id)
        setValue('')
        onClose()
    }
    
    return (
        <>
        <TabHeader onClose={onClose}>
            <SearchField value={value} setValue={handleSearchChange} />
        </TabHeader>
        <div className={styles.main}>
            {users.map((user) => (
                <button className={styles.item} key={user.id} onClick={() => handleClick(user)}>
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