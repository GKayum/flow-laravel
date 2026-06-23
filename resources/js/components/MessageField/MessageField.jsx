import React, { useCallback, useEffect, useRef, useState } from "react"
import { deleteAttachment, uploadAttachment } from "../../services/api"
import { useVoiceRecorder } from "../../hooks/useVoiceRecorder"
import { formatTime } from "../../utils/formatTime"
import { Loader } from "../UI/Loader/Loader"
import styles from "./MessageField.module.scss"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Paperclip } from "lucide-react"
import { Smile } from "lucide-react"
import { SendHorizonal } from "lucide-react"
import { X } from "lucide-react"
import { FileImage } from "lucide-react"
import { FileText } from "lucide-react"
import { Mic } from "lucide-react"

const genId = () => `att_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

function AttachmentPreview({ attachment, onRemove }) {
    const { type, preview, name, uploading, progress, error, localId, file, url } = attachment

    if (type === 'image' && preview) {
        return (
            <div className={styles.previewItem}>
                <img src={preview} alt={name} className={styles.previewImage} />
                {uploading && <div className={styles.previewOverlay}><span>{progress}%</span></div>}
                {error && <div className={styles.previewError}><span>{error}</span></div>}
                <button type="button" className={`${styles.actions__button} ${styles.cancel}`} onClick={() => onRemove(localId)}>
                    <X className={styles.icon} />
                </button>
            </div>
        )
    }
    if (type === 'video') {
        return (
            <div className={styles.previewItem}>
                <video className={styles.previewVideo} controls={!uploading}>
                    <source src={preview || url || ''} type={file?.type} />
                </video>
                {uploading && <div className={styles.previewOverlay}><span>{progress}%</span></div>}
                <button type="button" className={`${styles.actions__button} ${styles.cancel}`} onClick={() => onRemove(localId)}>
                    <X className={styles.icon} />
                </button>
            </div>
        )
    }
    return (
        <div className={styles.previewItemFile}>
            <FileText className={styles.fileIcon} />
            <span className={styles.fileName}>{name}</span>
            {uploading && <span className={styles.fileProgress}>{progress}%</span>}
            <button type="button" className={`${styles.actions__button} ${styles.cancel}`} onClick={() => onRemove(localId)}>
                <X className={styles.icon} />
            </button>
        </div>
    )
}

export default function MessageField({ onSendMessage, isSubmitting = false }) {
    const [message, setMessage] = useState('')
    const [attachments, setAttachments] = useState([])
    const [showPicker, setShowPicker] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [isSendingVoice, setIsSendingVoice] = useState(false)
    const textareaRef = useRef(null)
    const fileInputRef = useRef(null)
    const fileAcceptRef = useRef('*')

    const {
        isRecording, duration, audioBlob,
        startRecording, stopRecording, resetRecording,
    } = useVoiceRecorder(300)

    const durationRef = useRef(duration)
    durationRef.current = duration

    useEffect(() => {
        if (!audioBlob) return

        const ext = audioBlob.type.includes('webm') ? 'webm'
            : audioBlob.type.includes('mp4') ? 'm4a'
            : 'ogg'
        const file = new File([audioBlob], `voice_${Date.now()}.${ext}`, { type: audioBlob.type })

        setIsSendingVoice(true)

        uploadAttachment(file, null, { duration: durationRef.current })
            .then(res => {
                return onSendMessage({
                    content: null,
                    attachment_ids: [res.data.id],
                })
            })
            .catch(error => {
                console.error('Ошибка отправки голосового сообщения:', error)
            }).finally(() => {
                setIsSendingVoice(false)
                resetRecording()
            })
    }, [audioBlob])

    const handleFileSelect = (e) => {
        if (isRecording || isSendingVoice) return
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

    const removeAttachment = useCallback((localId) => {
        setAttachments(prev => {
            const att = prev.find(a => a.localId === localId)
            if (!att) return prev

            if (att.id && !att.uploading) {
                deleteAttachment(att.id).catch(console.error)
            }
            if (att.preview) URL.revokeObjectURL(att.preview)

            return prev.filter(a => a.localId !== localId)
        })
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isRecording || isSendingVoice) return

        const uploadingCount = attachments.filter(a => a.uploading).length
        if (uploadingCount > 0) return

        if (!message.trim() && attachments.length === 0) return
        if (isSubmitting) return

        const attachmentIds = attachments.flatMap(a => (a.id && !a.error) ? [a.id] : [])

        const payload = {
            content: message.trim() || null,
            ...(attachmentIds.length ? { attachment_ids: attachmentIds } : {})
        }

        const previews = attachments.flatMap(a => a.preview ? [a.preview] : [])
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
        if (isRecording || isSendingVoice) return
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart, end = textarea.selectionEnd

        setMessage(prev => prev.substring(0, start) + emoji.native + prev.substring(end))
        textarea.focus()
    }, [isRecording, isSendingVoice])

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
        fileAcceptRef.current = acceptType
        setDropdownOpen(false)
        setTimeout(() => fileInputRef.current?.click(), 0);
    }

    const hasText = message.trim().length > 0
    const hasAttachments = attachments.length > 0
    const isUploading = attachments.some(a => a.uploading)
    const canSubmit = (hasText || hasAttachments) && !isUploading
    const isBusy = isRecording || isSendingVoice

    return (
        <form className={styles.messageForm} onSubmit={handleSubmit}>
            <div className={styles.pickerContainer}>
                <button 
                    type="button" 
                    className={`${styles.btn} ${showPicker ? styles.active : ''}`}
                    disabled={isBusy}
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
                                <AttachmentPreview attachment={att} onRemove={removeAttachment} />
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            <input 
                type="file"
                accept={fileAcceptRef.current}
                multiple
                onChange={handleFileSelect}
                ref={fileInputRef}
                style={{ display: 'none' }}
            />

            {!isBusy ? (
                <textarea
                    ref={textareaRef}
                    className={styles.messageInput}
                    placeholder="Введите сообщение"
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    value={message}
                    rows={1}
                />
            ) : isRecording ? (
                <div className={styles.recordingPlaceholder}>
                    <span className={styles.recordingDot} />
                    <span className={styles.recordingLabel}>{formatTime(duration)}</span>
                </div>
            ) : (
                <div className={styles.recordingPlaceholder}>
                    <span className={styles.sendingLabel}>Отправка голосового сообщения...</span>
                </div>
            )}

            <div className={styles.buttonContainer}>
                <button 
                    type="button" 
                    className={`${styles.btn} ${dropdownOpen ? styles.active : ''}`} 
                    onClick={() => setDropdownOpen(prev => !prev)}
                    disabled={isBusy}
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

            {isRecording ? (
                <button
                    type="button"
                    className={`${styles.messageSubmit} ${styles.recording}`}
                    onClick={stopRecording}
                >
                    <Mic />
                </button>
            ) : isSendingVoice ? (
                <button type="button" className={styles.messageSubmit} disabled>
                    <Loader />
                </button>
            ) : canSubmit ? (
                <button type="submit" className={styles.messageSubmit} disabled={isSubmitting || !canSubmit}>
                    <SendHorizonal />
                </button>
            ) : (
                <button type="button" className={styles.messageSubmit} onClick={startRecording} disabled={isSubmitting || isUploading}>
                    <Mic />
                </button>
            )}
        </form>
    )
}