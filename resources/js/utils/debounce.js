export function debounce(func, delay = 300) {
    let timeoutId

    const debounced = function (...args) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            func.apply(this, args)
        }, delay);
    }

    debounced.cancel = () => clearTimeout(timeoutId)
    return debounced
}