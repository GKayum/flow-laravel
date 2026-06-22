import styles from "./CreateGroupTab.module.scss"
import { Field } from "../../../components/UI/Field/Field"
import { useEffect, useMemo, useReducer, useState } from "react"
import { api, handlerApiError } from "../../../services/api"
import TabHeader from "../../../components/TabHeader/TabHeader"
import GroupAvatarCropper from "../../../components/UI/GroupAvatarCropper/GroupAvatarCropper"
import SearchField from "../../../components/UI/SearchField/SearchField"
import Avatar from "../../../components/UI/Avatar/Avatar"
import { CircleCheck } from "lucide-react"
import { useChat } from "../../../contexts/ChatContext"
import { debounce } from "../../../utils/debounce"
import { Loader } from "../../../components/UI/Loader/Loader"

const initialForm = {
    data: { avatar: null, name: '' },
    error: '',
    validationErrors: {},
    submitting: false
}

function formReducer(state, action) {
    switch (action.type) {
        case 'SET_NAME':
            return { ...state, data: { ...state.data, name: action.value } }
        case 'SET_AVATAR':
            return { ...state, data: { ...state.data, avatar: action.value } }
        case 'SUBMIT_START':
            return { ...state, error: '', validationErrors: {}, submitting: true }
        case 'SUBMIT_SUCCESS':
            return { ...state, submitting: false }
        case 'SUBMIT_ERROR':
            return { ...state, submitting: false, error: action.error || '', validationErrors: action.validationErrors || {} }
        case 'CLEAR':
            return initialForm
        default:
            return state
    }
}

const initialSearch = { users: [], query: '' }

function searchReducer(state, action) {
    switch (action.type) {
        case 'SET_QUERY':
            return { ...state, query: action.value }
        case 'SET_USERS':
            return { ...state, users: action.users }
        case 'CLEAR':
            return initialSearch
        default:
            return state
    }
}

export default function CreateGroupTab({ onClose }) {
    const { onSelectChat, setChats } = useChat()
    const [form, dispatchForm] = useReducer(formReducer, initialForm)
    const [search, dispatchSearch] = useReducer(searchReducer, initialSearch)
    const [members, setMembers] = useState([])

    const selectedSet = useMemo(() => new Set(members), [members])

    const debouncedSearch = useMemo(
        () =>
            debounce((searchQuery) => {
                if (!searchQuery.trim()) return

                const params = new URLSearchParams()
                params.set('q', searchQuery)

                api.get(`/api/users/search?${params.toString()}`)
                    .then(res => dispatchSearch({ type: 'SET_USERS', users: res.data }))
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
        dispatchSearch({ type: 'SET_QUERY', value: newValue })

        if (!newValue.trim()) {
            dispatchSearch({ type: 'SET_USERS', users: [] })
            debouncedSearch.cancel()
        } else {
            debouncedSearch(newValue)
        }
    }

    const handleChangeAvatar = (avatar) => {
        if (!avatar) return
        dispatchForm({ type: 'SET_AVATAR', value: avatar })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.data.name) return
        dispatchForm({ type: 'SUBMIT_START' })

        try {
            const data = new FormData()
            data.append('name', form.data.name);
            if (form.data.avatar) {
                data.append('avatar', form.data.avatar, 'avatar.webp')
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
            dispatchSearch({ type: 'CLEAR' })
            setMembers([])
            dispatchForm({ type: 'CLEAR' })
            onSelectChat(response.data.chat)
            setChats(prev => [response.data.chat, ...prev])
        } catch (error) {
            handlerApiError(error, { 
                setValidationErrors: (errs) => dispatchForm({ type: 'SUBMIT_ERROR', validationErrors: errs }),
                setError: (err) => dispatchForm({ type: 'SUBMIT_ERROR', error: err })
            })
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
                        onChange={e => dispatchForm({ type: 'SET_NAME', value: e.target.value })}
                        value={form.data.name}
                        style={form.validationErrors.name ? { borderColor: '#FF0001' } : {}}
                    />
                    <button 
                        type="submit" 
                        className={`${styles.submitButton} ${form.data.name ? styles.visible : ''}`} 
                        disabled={form.submitting}
                    >
                        {form.submitting ? <Loader /> : <CircleCheck />}
                    </button>
                </form>

                <section className={styles.body__block}>
                    <SearchField value={search.query} setValue={handleSearchChange} />
                </section>

                <section className={styles.body__block}>
                    <div className={styles.usersContainer}>
                        {search.users?.map((user) => (
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