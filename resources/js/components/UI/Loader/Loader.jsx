import { Loader2 } from "lucide-react";
import styles from './Loader.module.scss'

export function Loader(props) {
    return <Loader2 {...props} className={styles.loader}/>
}