import { useEffect, useRef } from "react";

export function useEcho(channelName, eventName, callback) {
    const callbackRef = useRef(callback)
    callbackRef.current = callback

    useEffect(() => {
        if (!channelName || !window.Echo) return

        const cleanChannelName = channelName.replace(/^private-/, '')
        const channel = window.Echo.private(cleanChannelName)

        const formattedEvent = eventName.startsWith('.') ? eventName : `.${eventName}`

        const listener = (data) => callbackRef.current(data)
        channel.listen(formattedEvent, listener)

        return () => {
            channel.stopListening(formattedEvent, listener)
        }
    }, [channelName, eventName])
}