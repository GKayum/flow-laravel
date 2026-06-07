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

export default function MessageField({ onSendMessage, isSubmitting = false, uploadProgress = 0 }) {
    const [message, setMessage] = useState('')
    const [files, setFiles] = useState([])
    const [showPicker, setShowPicker] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [fileAccept, setFileAccept] = useState('*')
    const [hasFileField, setHasFileField] = useState(false)
    const textareaRef = useRef(null)
    const fileInputRef = useRef(null)

    const submitting = isSubmitting
    const progress = uploadProgress

    const generateFileId = () => `file_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files)
        if (selectedFiles.length === 0) return

        const newFiles = selectedFiles.map(file => {
            const mime = file.type
            let type = 'file'
            if (mime.startsWith('image/')) type = 'image'
            else if (mime.startsWith('video/')) type = 'video'

            const preview = (type === 'image' || type === 'video')
                ? URL.createObjectURL(file)
                : null

            return {
                id: generateFileId(),
                file,
                preview,
                type,
            }
        })

        setFiles(prev => [...prev, ...newFiles])
        e.target.value = ''
    }

    const removeFile = (fileId) => {
        setFiles(prev => {
            const file = prev.find(f => f.id === fileId)
            if (file?.preview) URL.revokeObjectURL(file.preview)
            return prev.filter(f => f.id !== fileId)
        })
    }

    useEffect(() => {
        return () => {
            files.forEach(f => {
                if (f.preview) URL.revokeObjectURL(f.preview)
            })
        }
    }, [files])

    useEffect(() => {
        const textarea = textareaRef.current
        if (!textarea) return

        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
    }, [message])

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
        if (!message.trim() && files.length === 0) return
        if (submitting) return

        const formData = new FormData()
        if (message.trim()) formData.append('content', message)
        files.forEach(f => formData.append('files[]', f.file))

        setHasFileField(files.length > 0)

        const savedFiles = [...files]
        setMessage('')
        setFiles([])

        try {
            await onSendMessage(formData)
            savedFiles.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview) })
        } catch (error) {
            console.error('Ошибка при отправке файлов:', error)
            setMessage(formData.get('content') || '')
            setFiles(savedFiles)
        } finally {
            setHasFileField(false)
        }
    }

    const openFilePicker = (acceptType) => {
        setFileAccept(acceptType)
        setDropdownOpen(false)
        setTimeout(() => {
            fileInputRef.current?.click()
        }, 0);
    }

    const renderFilePreview = (file) => {
        if (file.type === 'image' && file.preview) {
            return (
                <div className={styles.previewItem}>
                    <img src={file.preview} alt={file.file.name} className={styles.previewImage} />
                    <button type="button" className={`${styles.actions__button} ${styles.cancel}`} onClick={() => removeFile(file.id)}>
                        <X className={styles.icon} />
                    </button>
                </div>
            )
        } else if (file.type === 'video') {
            return (
                <div className={styles.previewItem}>
                    <video className={styles.previewVideo} controls>
                        <source src={file.preview || ''} type={file.file.type} />
                        Ваш браузер не поддерживает видео.
                    </video>
                    <button type="button" className={`${styles.actions__button} ${styles.cancel}`} onClick={() => removeFile(file.id)}>
                        <X className={styles.icon} />
                    </button>
                </div>
            )
        } else {
            return (
                <div className={styles.previewItemFile}>
                    <FileText className={styles.fileIcon} />
                    <span className={styles.fileName}>{file.file.name}</span>
                    <button type="button" className={`${styles.actions__button} ${styles.cancel}`} onClick={() => removeFile(file.id)}>
                        <X className={styles.icon} />
                    </button>
                </div>
            )
        }
    }

    return (
        <form className={styles.messageForm} onSubmit={handleSubmit}>

            {submitting && hasFileField && progress > 0 && (
                <div className={styles.uploadProgressBarBlock}>
                    <div
                        className={styles.progressBarLine}
                        style={{ width: `${uploadProgress}%` }}
                    />
                </div>
            )}

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

            {(files.length > 0 || (submitting && hasFileField)) && (
                <div className={styles.previewWrapper}>
                    <div className={styles.filesPreviewContainer}>
                        {files.map(file => (
                            <React.Fragment key={file.id}>
                                {renderFilePreview(file)}
                            </React.Fragment>
                        ))}
                    </div>

                    {submitting && hasFileField && (
                        <div className={styles.filesPreviewOverlay}>
                            <span>Загрузка... {uploadProgress}%</span>
                        </div>
                    )}
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

            <button type="submit" className={styles.messageSubmit} disabled={submitting}>
                {submitting && hasFileField ? (
                    <span className={styles.submitProgressText}>{uploadProgress}%</span>
                ) : (
                    <SendHorizonal />
                )}
            </button>
        </form>
    )
}