import { SendHorizonal } from "lucide-react"
import styles from "./MessageField.module.scss"
import { Paperclip } from "lucide-react"
import { Smile } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { X } from "lucide-react"
import { FileImage } from "lucide-react"
import { FileText } from "lucide-react"
import { Check } from "lucide-react"

export default function MessageField({ onSendMessage }) {
    const [message, setMessage] = useState('')
    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [showPicker, setShowPicker] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const textareaRef = useRef(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        const textarea = textareaRef.current
        if (!textarea) return

        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
    }, [message])

    const onFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            setImage(file)

            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = function () {
                setImagePreview(reader.result)
            }
        }
    }

    const removeImage = () => {
        setImage(null)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const addEmoji = useCallback((emoji) => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const currentValue = textarea.value

        const newValue =
            currentValue.substring(0, start) +
            emoji.native +
            currentValue.substring(end)
        
        setMessage(newValue)
        textarea.focus()
    }, [])

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    const handleClickOutside = (e) => {
        if (!textareaRef.current?.contains(e.target)) {
            setShowPicker(false);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!message.trim() && !image) return

        const formData = new FormData()
        if (message.trim()) formData.append('content', message)
        if (image) formData.append('image', image)

        try {
            await onSendMessage(formData)
            setMessage('')
            removeImage()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <form className={styles.messageForm} onSubmit={handleSubmit}>

            <div className={styles.pickerContainer}>
                <button 
                    type="button" 
                    className={`${styles.btn} ${showPicker ? styles.active : ''}`} 
                    onClick={(e) => {
                        e.stopPropagation()
                        setShowPicker(prev => !prev)
                    }}
                >
                    <Smile />
                </button>

                <div className={`${styles.pickerBlock} ${showPicker ? styles.visible : ''}`} >
                    <Picker
                        data={data}
                        theme={'light'}
                        locale={'ru'}
                        previewPosition={'none'}
                        onEmojiSelect={addEmoji} 
                        onClickOutside={handleClickOutside}
                    />
                </div>
            </div>

            {imagePreview && (
                <div className={styles.imagePreviewBlock}>
                    <img src={imagePreview} alt="Предпросмотр изображения" className={styles.image} />
                    <div className={styles.actions}>
                        {/* <button
                            className={`${styles.actions__button} ${styles.confirm}`}
                        >
                            <Check className={styles.icon} />
                        </button> */}
                        <button
                            className={`${styles.actions__button} ${styles.cancel}`}
                            onClick={removeImage}
                        >
                            <X className={styles.icon} />
                        </button>
                    </div>
                </div>
            )}

            <input 
                type="file"
                accept="image/*"
                onChange={onFileChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
            />

            <textarea
                ref={textareaRef}
                className={styles.messageInput}
                placeholder="Введите сообщение"
                onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                value={message}
                rows={1}
            />

            <div className={styles.buttonContainer}>
                <button 
                    type="button" 
                    className={`${styles.btn} ${dropdownOpen ? styles.active : ''}`} 
                    onClick={() => setDropdownOpen(prev => !prev)}
                >
                    <Paperclip />
                </button>

                <div 
                    className={`${styles.menuDropdown} ${dropdownOpen ? styles.visible : ''}`} 
                    onMouseLeave={() => setDropdownOpen(false)}
                >
                    <button
                        type="button"
                        className={styles.menuItem}
                        onClick={() => {
                            fileInputRef.current?.click()
                            setDropdownOpen(false)
                        }}
                    >
                        <FileImage className={styles.icon} />
                        <span className={styles.text}>Изображение</span>
                    </button>
                    {/* <button
                        type="button"
                        className={styles.menuItem}
                        onClick={() => {
                            setDropdownOpen(false)
                        }}
                    >
                        <FileText className={styles.icon} />
                        <span className={styles.text}>Файл</span>
                    </button> */}
                </div>
            </div>

            <button type="submit" className={styles.messageSubmit}>
                <SendHorizonal />
            </button>
        </form>
    )
}