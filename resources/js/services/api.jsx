import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/',
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
})

function handlerApiError(error, { setValidationErrors, setError }) {
    if (error.response) {
        if (error.response.status === 422) {
            setValidationErrors(error.response.data.errors || {})
        } else if (error.response.data && error.response.data.message) {
            setError(error.response.data.message)
        } else {
            console.error(error)
            setError('Ошибка при работе с API')
        }
    } else {
        console.error(error)
        setError('Не удалось соединиться с сервером.')
    }
}

export { api, handlerApiError }