import { Search } from "lucide-react"
import styles from "./SearchField.module.scss"
import { X } from "lucide-react"

export default function SearchField({ value, setValue }) {
    return (
        <form className={styles.search__form}>
            <input 
                className={styles.search__input} 
                type="input" 
                placeholder="Поиск" 
                value={value}
                onChange={e => setValue(e.target.value)}
            />
            {value ? (
                <X className={styles.search__icon} onClick={() => setValue('')} />
            ) : (
                <Search className={styles.search__icon} />
            )}
        </form>
    )
}