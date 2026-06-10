import { SendHorizonal } from "lucide-react"
import styles from "./MessageField.module.scss"
import { Paperclip } from "lucide-react"
import { Smile } from "lucide-react"
import React, { useCallback, useEffect, useRef, useState } from "react"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { X } from "lucide-react"
import { FileImage } from "lucide-react"
import { FileText } from "lucide-react"
import { deleteAttachment, uploadAttachment } from "../../services/api"

export default function MessageField({ onSendMessage, isSubmitting = false }) {
    const [message, setMessage] = useState('')
    const [attachments, setAttachments] = useState([])
    const [showPicker, setShowPicker] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [fileAccept, setFileAccept] = useState('*')
    const textareaRef = useRef(null)
    const fileInputRef = useRef(null)

    const genId = () => `att_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files)
        if (!selectedFiles.length) return

        selectedFiles.forEach(file => {
            const localId = genId()
            const mime = file.type
            let type = 'file'
            if (mime.startsWith('image/')) type = 'image'
            else if (mime.startsWith('video/')) type = 'video'

            const preview = (type === 'image' || type === 'video')
                ? URL.createObjectURL(file)
                : null

            const att = { localId, id: null, file, name: file.name, type, preview, url: null, uploading: true, progress: 0, error: null }
            setAttachments(prev => [...prev, att])

            uploadAttachment(file, (percent) => {
                setAttachments(prev => prev.map(a => a.localId === localId ? {
                    ...a, progress: percent} : a))
            })
            .then(res => {
                setAttachments(prev => prev.map(a =>
                    a.localId === localId
                        ? { ...a, id: res.data.id, url: res.data.url, uploading: false, progress: 100 }
                        : a
                ))
            })
            .catch(err => {
                console.error(err)
                setAttachments(prev => prev.map(a =>
                    a.localId === localId ? { ...a, uploading: false, error: 'Ошибка при загрузке' } : a
                ))
            })
        })

        e.target.value = ''
    }

    const removeAttachment = (localId) => {
        const att = attachments.find(a => a.localId === localId)
        if (!att) return

        if (att.id && !att.uploading) {
            deleteAttachment(att.id).catch(console.error)
        }
        if (att.preview) URL.revokeObjectURL(att.preview)

        setAttachments(prev => prev.filter(a => a.localId !== localId))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const uploadingCount = attachments.filter(a => a.uploading).length
        if (uploadingCount > 0) return

        if (!message.trim() && attachments.length === 0) return
        if (isSubmitting) return

        const attachmentIds = attachments.filter(a => a.id && !a.error).map(a => a.id)

        const payload = {
            content: message.trim() || null,
            ...(attachmentIds.length ? { attachment_ids: attachmentIds } : {})
        }

        const previews = attachments.map(a => a.preview).filter(Boolean)
        setMessage('')
        setAttachments([])

        try {
            await onSendMessage(payload)
            previews.forEach(URL.revokeObjectURL)
        } catch (error) {
            console.error('Ошибка отправки:', error)
        }
    }

    useEffect(() => {
        const textarea = textareaRef.current
        if (!textarea) return

        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
    }, [message])

    const addEmoji = useCallback((emoji) => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart, end = textarea.selectionEnd

        setMessage(prev => prev.substring(0, start) + emoji.native + prev.substring(end))
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

    const openFilePicker = (acceptType) => {
        setFileAccept(acceptType)
        setDropdownOpen(false)
        setTimeout(() => fileInputRef.current?.click(), 0);
    }

    const renderPreview = (att) => {
        if (att.type === 'image' && att.preview) {
            return (
                <div className={styles.previewItem}>
                    <img src={att.preview} alt={att.name} className={styles.previewImage} />
                    {att.uploading && <div className={styles.previewOverlay}><span>{att.progress}%</span></div>}
                    {att.error && <div className={styles.previewError}><span>{att.error}</span></div>}
                    <button type="button" className={`${styles.actions__button} ${styles.cancel}`} onClick={() => removeAttachment(att.localId)}>
                        <X className={styles.icon} />
                    </button>
                </div>
            )
        }
        if (att.type === 'video') {
            return (
                <div className={styles.previewItem}>
                    <video className={styles.previewVideo} controls={!att.uploading}>
                        <source src={att.preview || att.url || ''} type={att.file?.type} />
                    </video>
                    {att.uploading && <div className={styles.previewOverlay}><span>{att.progress}%</span></div>}
                    <button type="button" className={`${styles.actions__button} ${styles.cancel}`} onClick={() => removeAttachment(att.localId)}>
                        <X className={styles.icon} />
                    </button>
                </div>
            )
        }
        return (
            <div className={styles.previewItemFile}>
                <FileText className={styles.fileIcon} />
                <span className={styles.fileName}>{att.name}</span>
                {att.uploading && <span className={styles.fileProgress}>{att.progress}%</span>}
                <button type="button" className={`${styles.actions__button} ${styles.cancel}`} onClick={() => removeAttachment(att.localId)}>
                    <X className={styles.icon} />
                </button>
            </div>
        )
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

            {attachments.length > 0 && (
                <div className={styles.previewWrapper}>
                    <div className={styles.filesPreviewContainer}>
                        {attachments.map(att => (
                            <React.Fragment key={att.localId}>
                                {renderPreview(att)}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            <input 
                type="file"
                accept={fileAccept}
                multiple
                onChange={handleFileSelect}
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
                        onClick={() => openFilePicker('image/*,video/*')}
                    >
                        <FileImage className={styles.icon} />
                        <span className={styles.text}>Фото и видео</span>
                    </button>
                    <button
                        type="button"
                        className={styles.menuItem}
                        onClick={() => openFilePicker('.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar')}
                    >
                        <FileText className={styles.icon} />
                        <span className={styles.text}>Файл</span>
                    </button>
                </div>
            </div>

            <button type="submit" className={styles.messageSubmit} disabled={isSubmitting || attachments.some(a => a.uploading)}>
                <SendHorizonal />
            </button>
        </form>
    )
}