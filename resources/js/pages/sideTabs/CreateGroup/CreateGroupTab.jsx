import styles from "./CreateGroupTab.module.scss"
import { Field } from "../../../components/UI/Field/Field"
import { useEffect, useMemo, useState } from "react"
import { api, handlerApiError } from "../../../services/api"
import TabHeader from "../../../components/TabHeader/TabHeader"
import GroupAvatarCropper from "../../../components/UI/GroupAvatarCropper/GroupAvatarCropper"
import SearchField from "../../../components/UI/SearchField/SearchField"
import Avatar from "../../../components/UI/Avatar/Avatar"
import { CircleCheck } from "lucide-react"
import { useChat } from "../../../contexts/ChatContext"
import { debounce } from "../../../utils/debounce"

export default function CreateGroupTab({ onClose }) {
    const { onSelectChat, setChats } = useChat()
    const [formData, setFormData] = useState({ avatar: null, name: '' })
    const [users, setUsers] = useState([])
    const [members, setMembers] = useState([])
    const selectedSet = useMemo(() => new Set(members), [members])
    const [error, setError] = useState('')
    const [validationErrors, setValidationErrors] = useState({})
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

    const handleChangeAvatar = (avatar) => {
        if (!avatar) return
        setFormData(prev => ({ ...prev, avatar: avatar }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name) return
        setError('')
        setValidationErrors({})

        setSubmitting(true)

        try {
            const data = new FormData()
            data.append('name', formData.name);
            if (formData.avatar) {
                data.append('avatar', formData.avatar, 'avatar.webp')
            }
            if (members && members.length > 0) {
                members.forEach((id, index) => {
                    data.append(`members[${index}][id]`, id);
                });
            }

            await api.get('/sanctum/csrf-cookie')
            const response = await api.post('/api/chat/create', data, {
                headers: {'Content-Type' : 'multipart/form-data'}
            })
            onClose()
            setUsers([])
            setValue('')
            setMembers([])
            onSelectChat(response.data.chat)
            setChats(prev => [response.data.chat, ...prev])
        } catch (error) {
            handlerApiError(error, { setValidationErrors, setError })
        } finally {
            setSubmitting(false)
        }
    }

    const togglePick = (userId) => {
        setMembers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(x => x !== userId)
            }
            return [...prev, userId]
        })
    }

    return (
        <>
        <TabHeader text={'Создание группы'} onClose={onClose} />
        <div className={styles.main}>
            <div className={styles.avatarContainer}>
                <GroupAvatarCropper key="new-group-avatar" onChangeAvatar={blob => handleChangeAvatar(blob)} />
            </div>
            <div className={styles.body}>
                <form className={styles.body__block} onSubmit={handleSubmit}>
                    <Field
                        id="name"
                        placeholder='Название группы' 
                        type='text'
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        value={formData.name}
                        style={validationErrors.name ? { borderColor: '#FF0001' } : {}}
                    />
                    <button type="submit" className={`${styles.submitButton} ${formData.name ? styles.visible : ''}`}>
                        <CircleCheck />
                    </button>
                </form>
                <section className={styles.body__block}>
                    <SearchField value={value} setValue={handleSearchChange} />
                </section>
                <section className={styles.body__block}>
                    <div className={styles.usersContainer}>
                        {users?.map((user) => (
                            <button className={styles.userButton} key={user.id} onClick={() => togglePick(user.id)}>
                                <input 
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={selectedSet.has(user.id)}
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