import { useRef, useState } from "react"
import Cropper from "react-easy-crop"
import { Camera, Check, X } from "lucide-react"
import { Loader } from "../Loader/Loader"
import Avatar from "../../UI/Avatar/Avatar"
import styles from "./UserAvatarCropper.module.scss"
import { useAuth } from "../../../contexts/AuthContext"

export default function UserAvatarCropper({ onChangeAvatar, avatarLoading = null }) {
    const { user } = useAuth()
    const [image, setImage] = useState(null)
    const [loading, setLoading] = useState(false)
    const inputRef = useRef()

    const [crop, setCrop] = useState({x: 0, y: 0})
    const [zoom, setZoom] = useState(1)
    const croppedAreaRef = useRef(null)

    const onInputChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader()
            reader.readAsDataURL(e.target.files[0])
            reader.onload = function () {
                setImage(reader.result)
            }
        }
    }

    const onCropComplete = (croppedAreaPercentage, croppedAreaPixels) => {
        croppedAreaRef.current = croppedAreaPixels
    }

    const onCropDone = async () => {
        const croppedArea = croppedAreaRef.current

        if (!image || !croppedArea) return
        setLoading(true)
        setImage(null)

        const img = new Image()
        img.src = image
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
                    setLoading(false)
                    const url = URL.createObjectURL(blob)
                    onChangeAvatar(blob)
                },
                'image/webp',
                1
            )
        }
    }

    return (
        <div className={styles.avatarCropperContainer}>
            {image ? (
                <>
                <div className={styles.avatarCropperContainer__cropper}>
                    <Cropper
                        image={image}
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
                        onClick={onCropDone}
                    >
                        <Check className={styles.icon} />
                    </button>
                    <button
                        className={`${styles.actions__button} ${styles.cancel}`}
                        onClick={() => setImage(null)}
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
                    {loading || avatarLoading ? (
                        <Loader style={{ color: '#fff' }} width='32px' height='32px' />
                    ) : (
                        <Camera className={styles.icon} />
                    )}
                </button>
                <Avatar user={user} size="120px" fontSize="40px" />
                </>
            )}
        </div>
    )
}