import { useEffect, useState } from 'react'
import styles from './ChatWindow.module.scss'
import { X } from 'lucide-react'
import { Loader } from '../UI/Loader/Loader'
import Avatar from '../UI/Avatar/Avatar'
import MessageList from '../MessageList/MessageList'
import MessageField from '../MessageField/MessageField'
import { api, handlerApiError } from '../../services/api'
import { useChat } from '../../contexts/ChatContext'

export default function ChatWindow() {
    const { selectedChat, onCloseChat } = useChat()
    const [messages, setMessages] = useState([])
    const [messagesLoading, setMessagesLoading] = useState(true)

    useEffect(() => {
        if (!selectedChat) return
        
        (async () => {
            setMessagesLoading(true)
            
            api.get(`/api/message/${selectedChat.id}/list`)
                .then(response => {
                    console.log('messages: ', response.data);
                    setMessages(response.data)
                })
                .catch(error => {
                    console.error('Messages load error:', error.response?.status, error.response?.data)
                })
                .finally(() => setMessagesLoading(false))
        })()
    }, [selectedChat])

    const handleSendMessage = async (content) => {
        try {
            await api.get('/sanctum/csrf-cookie')
            const response = await api.post(`/api/message/${selectedChat.id}/send`, { content })
            setMessages(prev => [...prev, response.data])
        } catch (error) {
            handlerApiError(error, { setValidationErrors: () => {}, setError: () => {} })
        }
    }

    if (!selectedChat) {
        return (
            <div className={styles.not_msgs_block}>
                <h2>Выберите чат для начала общения</h2>
                <p>или создайте новый чат</p>
            </div>
        )
    }

    return (
        <div className={styles.chat}>
            <header className={styles.chat__header}>
                <div className={styles.info}>
                    <Avatar user={selectedChat} size="2.625rem" fontSize="1.3125rem" />
                    <div className={styles.content}>
                        <span className={styles.name}>{selectedChat.name}</span>
                        {/* <span className={styles.messages}>{messages.length} сообщений</span> */}
                        <span className={styles.messages}>{!messagesLoading ? `${messages.length} сообщений` : 'загрузка...'}</span>
                    </div>
                </div>
                <div className={styles.actions}>
                    <button className={styles.btn} onClick={onCloseChat}>
                        <X />
                    </button>
                </div>
            </header>
            <main className={styles.chat__body}>
                {messagesLoading ? (
                    <div className={styles.loaderContainer}>
                        <Loader />
                    </div>
                ) : (
                    messages.length > 0 ? (
                        <MessageList messages={messages} />
                    ) : (
                        <div className={styles.not_msgs_block}>
                            <h2>Здесь пока сообщений нет</h2>
                            <p>Отправьте сообщение</p>
                        </div>
                    )
                )}
            </main>
            <footer className={styles.chat__footer}>
                <MessageField onSendMessage={handleSendMessage} />
            </footer>
        </div>
    )

    // return (
        // <div className={styles.main}>
        //     <header className={styles.main__header}>
        //         <CircleUser  className={styles.user_icon} />
        //         <div className={styles.info}>
        //             <span className={styles.name}>{selectedChat.name}</span>
        //             <span className={styles.messages}>{messages.length} сообщений</span>
        //         </div>
        //         <button onClick={onCloseChat} className={styles.close_btn}>
        //             <X />
        //         </button>
        //     </header>
        //     <main className={styles.main__body}>
        //         {loading ? (
        //             <div className={styles.loader_box}>
        //                 <Loader />
        //             </div>
        //         ) : (
        //             messages.length > 0 ? (
        //                 <>
        //                 <MessageList messages={messages} />
        //                 <div ref={messageEndRef} />
        //                 </>
        //             ) : (
        //                 <div className={styles.not_msgs_block}>
        //                     <h2>Здесь пока сообщений нет</h2>
        //                     <p>Отправьте сообщение</p>
        //                     <div ref={messageEndRef} />
        //                 </div>
        //             )
        //         )}
        //     </main>
        //     <footer className={styles.main__footer}>
        //         <MessageInput onSendMessage={handleSendMessage} />
        //     </footer>
        // </div>
    // )
}