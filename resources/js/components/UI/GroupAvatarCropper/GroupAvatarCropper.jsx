import Cropper from "react-easy-crop"
import { useReducer, useRef, useState } from "react"
import { Loader } from "../Loader/Loader"
import { Camera, Check, X } from "lucide-react"
import styles from "./GroupAvatarCropper.module.scss"

const initialMedia = {
    image: null,
    previewUrl: null,
    loading: false,
}

function mediaReducer(state, action) {
    switch (action.type) {
        case 'SET_IMAGE':
            return { ...state, image: action.image, loading: false }
        case 'SET_PREVIEW':
            return { ...state, previewUrl: action.url, image: null, loading: false }
        case 'START_CROP':
            return { ...state, loading: true }
        case 'RESET_IMAGE':
            return { ...state, image: null }
        default:
            return state
    }
}

export default function GroupAvatarCropper({ onChangeAvatar, avatar = null }) {
    const [media, dispatchMedia] = useReducer(mediaReducer, initialMedia)
    const inputRef = useRef()

    const [crop, setCrop] = useState({x: 0, y: 0})
    const [zoom, setZoom] = useState(1)
    const croppedAreaRef = useRef(null)

    const onInputChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader()
            reader.readAsDataURL(e.target.files[0])
            reader.onload = function () {
                dispatchMedia({ type: 'SET_IMAGE', image: reader.result })          
            }
        }
    }

    const onCropComplete = (_, croppedAreaPixels) => {
        croppedAreaRef.current = croppedAreaPixels
    }

    const onCropDone = async () => {
        if (!media.image) return
        const croppedArea = croppedAreaRef.current
        if (!croppedArea) return

        dispatchMedia({ type: 'START_CROP' })
        
        const img = new Image()
        img.src = media.image
        img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = croppedArea.width
            canvas.height = croppedArea.height

            const ctx = canvas.getContext('2d')
            ctx.imageSmoothingQuality = 'high'
            ctx.imageSmoothingEnabled = true
            ctx.drawImage(
                img, 
                croppedArea.x,
                croppedArea.y,
                croppedArea.width,
                croppedArea.height,
                0,
                0,
                croppedArea.width,
                croppedArea.height
            )

            canvas.toBlob(
                (blob) => {
                    if (!blob) return
                    const url = URL.createObjectURL(blob)
                    dispatchMedia({ type: 'SET_PREVIEW', previewUrl: url })
                    onChangeAvatar(blob)
                },
                'image/webp',
                1
            )
        }
    }

    const currentAvatarSrc = media.previewUrl || avatar

    return (
        <div className={styles.avatarCropperContainer}>
            {media.image ? (
                <>
                <div className={styles.avatarCropperContainer__cropper}>
                    <Cropper
                        image={media.image}
                        aspect={1 / 1}
                        crop={crop}
                        zoom={zoom}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>
                <div className={styles.actions}>
                    <button
                        className={`${styles.actions__button} ${styles.confirm}`}
                        onClick={() => onCropDone()}
                    >
                        <Check className={styles.icon} />
                    </button>
                    <button
                        className={`${styles.actions__button} ${styles.cancel}`}
                        onClick={() => dispatchMedia({ type: 'RESET_IMAGE' })}
                    >
                        <X className={styles.icon} />
                    </button>
                </div>
                </>
            ) : (
                <>
                <input 
                    type="file"
                    accept="image/*"
                    onChange={onInputChange}
                    ref={inputRef}
                    className={styles.input}
                />
                <button
                    type="button"
                    className={styles.button}
                    onClick={() => inputRef.current.click()}
                >
                    {media.loading ? (
                        <Loader style={{ color: '#fff' }} width='32px' height='32px' />
                    ) : (
                        <Camera className={styles.icon} />
                    )}
                </button>
                <div className={styles.container}>
                    {currentAvatarSrc && (
                        <img
                            src={currentAvatarSrc}
                            alt="Аватар чата"
                        />
                    )}
                </div>
                </>
            )}
        </div>
    )
}