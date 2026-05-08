import { useEffect, useRef, useState } from 'react'
import styles from './ChatWindow.module.scss'
import { CircleUser, X } from 'lucide-react'
import { Loader } from '../UI/Loader/Loader'
import Avatar from '../UI/Avatar/Avatar'
import { useAuth } from '../../contexts/AuthContext'
import MessageList from '../MessageList/MessageList'
import MessageField from '../MessageField/MessageField'

export default function ChatWindow() {
    const { user } = useAuth()
    // if (!selectedChat) {
        // return (
        //     <div className={styles.not_msgs_block}>
        //         <h2>Выберите чат для начала общения</h2>
        //         <p>или создайте новый чат</p>
        //     </div>
        // )
    // }

    return (
        <div className={styles.chat}>
            <header className={styles.chat__header}>
                <div className={styles.info}>
                    <Avatar user={user} size="2.625rem" fontSize="1.3125rem" />
                    <div className={styles.content}>
                        <span className={styles.name}>Kayum</span>
                        <span className={styles.messages}>10 сообщений</span>
                    </div>
                </div>
                <div className={styles.actions}>
                    <button className={styles.btn}>
                        <X />
                    </button>
                </div>
            </header>
            <main className={styles.chat__body}>
                <MessageList />
            </main>
            <footer className={styles.chat__footer}>
                <MessageField />
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