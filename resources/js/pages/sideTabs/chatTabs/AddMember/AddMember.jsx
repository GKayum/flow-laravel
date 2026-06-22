import styles from "./AddMember.module.scss"
import { useEffect, useMemo, useState } from "react"
import { api, handlerApiError } from "../../../../services/api"
import TabHeader from "../../../../components/TabHeader/TabHeader"
import SearchField from "../../../../components/UI/SearchField/SearchField"
import Avatar from "../../../../components/UI/Avatar/Avatar"
import { useChat } from "../../../../contexts/ChatContext"
import { CircleCheck } from "lucide-react"
import { debounce } from "../../../../utils/debounce"

export default function AddMember({ onChatTabChange, showToast, onClose }) {
    const { selectedChat, updateChat } = useChat()
    const [users, setUsers] = useState([])
    const [members, setMembers] = useState([])
    const selectedIds = useMemo(() => new Set(members.map(m => m.id)), [members])
    const [submitting, setSubmitting] = useState(false)
    const [value, setValue] = useState('')

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

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (members.length === 0) return

        setSubmitting(true)

        try {
            const payload = {
                members: members.map(m => m.id)
            }

            await api.get('/sanctum/csrf-cookie')
            const response = await api.post(`/api/chat/${selectedChat.id}/members`, payload)
            
            updateChat({
                id: selectedChat.id,
                members: response.data.members,
            })

            onChatTabChange('chat')
            setValue('')
            setMembers([])
            showToast(response.data.message)
        } catch (error) {
            handlerApiError(error, { setValidationErrors: () => {}, setError: (error) => showToast(error, 'danger') })
        } finally {
            setSubmitting(false)
        }
    }

    const togglePick = (user) => {
        setMembers(prev => 
            prev.some(m => m.id === user.id)
                ? prev.filter(m => m.id !== user.id)
                : [...prev, user]
        )
    }

    return (
        <>
        <TabHeader text={'Добавить участников'} onClose={onClose} />
        <div className={styles.main}>
            <div className={styles.body}>
                <section className={styles.body__block}>
                    <SearchField value={value} setValue={handleSearchChange} />
                    <div className={styles.membersContainer}>
                        {members?.map((member) => (
                            <button className={styles.memberButton} key={member.id} onClick={() => togglePick(member)}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={selectedIds.has(member.id)}
                                    readOnly
                                />
                                <Avatar user={member} />
                                <span className={styles.content}>{member.name}</span>
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={handleSubmit} 
                        className={`${styles.submitButton} ${members.length > 0 ? styles.visible : ''}`}
                        disabled={submitting}
                    >
                        <CircleCheck />
                    </button>
                </section>
                <section className={styles.body__block}>
                    <div className={styles.usersContainer}>
                        {users?.map((user) => (
                            <button className={styles.userButton} key={user.id} onClick={() => togglePick(user)}>
                                <input 
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={selectedIds.has(user.id)}
                                    readOnly
                                />
                                <Avatar user={user} size="2.625rem" fontSize="1.3rem" />
                                <div className={styles.userButton__body}>
                                    <span className={styles.content}>{user.name}</span>
                                    <label className={styles.label}>был недавно</label>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        </div>
        </>
    )
}