import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./VoicePlayer.module.scss";
import { formatTime } from "../../../utils/formatTime";
import { Pause } from "lucide-react";
import { Play } from "lucide-react";

export default function VoicePlayer({ url, duration }) {
    const audioRef = useRef(null)
    const waveRef = useRef(null)
    const isDraggingRef = useRef(null)
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
            if (isDraggingRef.current) return
            setCurrentTime(audio.currentTime)
            setProgress((audio.currentTime / audio.duration) * 100)
        }

        if (audio.readyState >= 2) setIsReady(true)

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

    const waveBars = useMemo(() => Array.from({ length: 24 }, () => 20 + Math.random() * 60), [])

    const updateProgress = (clientX) => {
        if (!waveRef.current || !audioRef.current) return
        const rect = waveRef.current.getBoundingClientRect()
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
        const total = (duration && isFinite(duration))
            ? duration
            : audioRef.current.duration

        if (!total || !isFinite(total)) return

        setProgress(pct * 100)
        setCurrentTime(pct * total)
        return pct * total
    }

    const handleMouseDown = (e) => {
        if (!isReady || e.button !== 0) return
        isDraggingRef.current = true

        updateProgress(e.clientX)

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    }

    const handleMouseMove = (e) => {
        if (!isDraggingRef.current) return
        updateProgress(e.clientX)
    }

    const handleMouseUp = (e) => {
        if (!isDraggingRef.current) return
        isDraggingRef.current = false

        const finalTime = updateProgress(e.clientX)
        if (audioRef.current && finalTime !== undefined) {
            audioRef.current.currentTime = finalTime
            audioRef.current.play()
        }

        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
    }

    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [])

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
                <div 
                    className={styles.waveForm}
                    ref={waveRef}
                    onMouseDown={handleMouseDown}
                >
                    <div className={styles.waveBars}>
                        {waveBars.map((h, i) => (
                            <div 
                                key={`bg-${i}`} 
                                className={styles.bar} 
                                style={{ height: `${h}%` }} 
                            />
                        ))}
                    </div>
                    <div 
                        className={styles.waveOverlay}
                        style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
                    >
                        <div className={styles.waveBars}>
                            {waveBars.map((h, i) => (
                                <div 
                                    key={`fg-${i}`} 
                                    className={`${styles.bar} ${styles.active}`} 
                                    style={{ height: `${h}%` }} 
                                />
                            ))}
                        </div>
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