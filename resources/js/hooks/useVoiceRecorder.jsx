import { useCallback, useEffect, useRef, useState } from "react";

const getSupportedMimeType = () => {
    const types = [
        'audio/webm;codecs=opus',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav',
    ]
    return types.find(t => MediaRecorder.isTypeSupported(t)) || 'audio/webm'
}

export function useVoiceRecorder(maxDuration = 300) {
    const [isRecording, setIsRecording] = useState(false)
    const [duration, setDuration] = useState(0)
    const [audioBlob, setAudioBlob] = useState(null)

    const mediaRecorderRef = useRef(null)
    const streamRef = useRef(null)
    const chunksRef = useRef([])
    const timerRef = useRef(null)
    const startTimeRef = useRef(0)
    // const pausedTimeRef = useRef(0)

    const clear = useCallback(() => {
        clearInterval(timerRef.current)
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop())
            streamRef.current = null
        }
        mediaRecorderRef.current = null
        chunksRef.current = []
    }, [])

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
        }
    }, [])

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream

            const mimeType = getSupportedMimeType()
            const recorder = new MediaRecorder(stream, { mimeType })
            mediaRecorderRef.current = recorder
            chunksRef.current = []

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }
            
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType })
                setAudioBlob(blob)
                clear()
                setIsRecording(false)
            }

            recorder.onerror = (e) => {
                console.error('MediaRecorder error:', e)
                clear()
                setIsRecording(false)
            }

            recorder.start(1000)
            setIsRecording(true)
            setIsRecording(true)
            setAudioBlob(null)
            startTimeRef.current = Date.now()
            // pausedTimeRef.current = 0
            setDuration(0)

            timerRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)

                setDuration(elapsed)
                if (elapsed >= maxDuration) {
                    stopRecording()
                }
            }, 1000)
        } catch (error) {
            console.error('Ошибка доступа к микрофону:', error)
        }
    }, [maxDuration, clear, stopRecording])

    const resetRecording = useCallback(() => {
        clear()
        setAudioBlob(null)
        setDuration(0)
        setIsRecording(false)
    }, [clear])

    useEffect(() => {
        return () => clear()
    }, [clear])

    return {
        isRecording,
        duration,
        audioBlob,
        startRecording,
        stopRecording,
        resetRecording,
    }
}