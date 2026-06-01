import { useEffect } from "react";

export function useEcho(channelName, eventName, callback, dependencies = []) {
    useEffect(() => {
        if (!channelName || !window.Echo) return

        const cleanChannelName = channelName.replace(/^private-/, '')
        const channel = window.Echo.private(cleanChannelName)

        const formattedEvent = eventName.startsWith('.') ? eventName : `.${eventName}`

        channel.listen(formattedEvent, callback)

        return () => {
            channel.stopListening(formattedEvent)
        }
    }, [channelName, eventName, ...dependencies])
}