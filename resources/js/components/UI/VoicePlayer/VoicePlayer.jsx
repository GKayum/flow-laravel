import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./VoicePlayer.module.scss";
import { formatTime } from "../../../utils/formatTime";
import { Pause } from "lucide-react";
import { Play } from "lucide-react";

export default function VoicePlayer({ url, duration }) {
    const audioRef = useRef(null)
    const waveRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [isReady, setIsReady] = useState(false)

    const toggle = () => {
        if (!audioRef.current || !isReady) return
        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
    }
    
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const onLoadedMetadata = () => setIsReady(true)
        const onPlay = () => setIsPlaying(true)
        const onPause = () => setIsPlaying(false)
        const onEnded = () => { setIsPlaying(false); setProgress(0); setCurrentTime(0); }
        const onTimeUpdate = () => {
            setCurrentTime(audio.currentTime)
            setProgress((audio.currentTime / audio.duration) * 100)
        }

        if (audio.readyState >= 1) setIsReady(true)

        audio.addEventListener('loadedmetadata', onLoadedMetadata)
        audio.addEventListener('play', onPlay)
        audio.addEventListener('pause', onPause)
        audio.addEventListener('ended', onEnded)
        audio.addEventListener('timeupdate', onTimeUpdate)

        return () => {
            audio.removeEventListener('loadedmetadata', onLoadedMetadata)
            audio.removeEventListener('play', onPlay)
            audio.removeEventListener('pause', onPause)
            audio.removeEventListener('ended', onEnded)
            audio.removeEventListener('timeupdate', onTimeUpdate)
        }
    }, [url])

    const waveBars = useMemo(() => 
        Array.from({ length: 24 }, (_, i) => 20 + Math.random() * 60), [])

    const activeCount = Math.min(24, Math.floor((progress / 100) * 24))

    const handleSeek = (e) => {
        if (!audioRef.current || !isReady || !waveRef.current) return

        const rect = waveRef.current.getBoundingClientRect()
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))

        const total = (duration && isFinite(duration))
            ? duration
            : audioRef.current.duration

        if (!total || !isFinite(total)) return

        audioRef.current.currentTime = pct * total
        audioRef.current.play()
    }

    return (
        <div className={styles.voicePlayer}>
            <button 
                type="button" 
                className={styles.playBtn} 
                onClick={toggle} 
                disabled={!isReady}
            >
                {isPlaying ? <Pause /> : <Play />}
            </button>

            <div className={styles.voicePlayer__inner}>
                <div className={styles.waveForm} ref={waveRef} onClick={handleSeek}>
                    <div className={styles.waveBars}>
                        {waveBars.map((h, i) => (
                            <div 
                                key={i} 
                                className={`${styles.bar} ${i < activeCount ? styles.active : ''}`} 
                                style={{ height: `${h}%` }} 
                            />
                        ))}
                    </div>
                </div>

                <span className={styles.time}>
                    {isPlaying ? formatTime(currentTime) : formatTime(duration || 0)}
                </span>
            </div>


            <audio ref={audioRef} src={url} preload="metadata" />
        </div>
    )
}