import { useRef, useState } from "react"
import styles from "./AvatarCropper.module.scss"
import Avatar from "../UI/Avatar/Avatar"
import { useAuth } from "../../contexts/AuthContext"
import { Camera } from "lucide-react"
import Cropper from "react-easy-crop"
import { Check } from "lucide-react"
import { X } from "lucide-react"
import { Loader } from "../UI/Loader/Loader"

export default function AvatarCropper({ onChangeAvatar, avatarLoading }) {
    const { user } = useAuth()
    const [image, setImage] = useState(null)
    const inputRef = useRef()

    const [crop, setCrop] = useState({x: 0, y: 0})
    const [zoom, setZoom] = useState(1)
    const [croppedArea, setCroppedArea] = useState(null)

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
        setCroppedArea(croppedAreaPixels)
    }

    const onCropDone = async (croppedArea) => {
        if (!image) return
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
                    const url = URL.createObjectURL(blob)
                    console.log('url: ', url)
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
                        onClick={() => onCropDone(croppedArea)}
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
                    className={styles.button}
                    onClick={() => inputRef.current.click()}
                >
                    {avatarLoading ? (
                        <Loader style={{ color: '#fff', strokeWidth: '3px' }} width='32px' height='32px' />
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