const formattersCache = {
    date: {},
    plural: {},
}

const TRANSLATIONS = {
    'ru-RU': { one: 'год', few: 'года', many: 'лет', other: 'лет' },
    'en-US': { one: 'year', other: 'years' },
}

const getDateTimeFormatter = (locale) => {
    if (!formattersCache.date[locale]) {
        // eslint-disable-next-line react-doctor/js-hoist-intl -- кэширование на уровне модуля, форматтер создается один раз на локаль
        formattersCache.date[locale] = new Intl.DateTimeFormat(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
    }
    return formattersCache.date[locale]
}

const getPluralRules = (locale) => {
    if (!formattersCache.plural[locale]) {
        // eslint-disable-next-line react-doctor/js-hoist-intl -- кэширование на уровне модуля
        formattersCache.plural[locale] = new Intl.PluralRules(locale)
    }
    return formattersCache.plural[locale]
}

export const getAge = (dateString) => {
    if (!dateString) return null
    const birthDate = new Date(dateString)
    if (isNaN(birthDate.getTime())) return null

    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }
    return age
}

export const pluralizeYears = (age, locale = 'ru-RU') => {
    if (age === null) return ''

    const rules = getPluralRules(locale)
    const rule = rules.select(age)
    
    const localeWords = TRANSLATIONS[locale] || TRANSLATIONS['ru-RU']

    return localeWords[rule] || localeWords['other']
}

export function formatDateOfBirthWithAge(dateString, locale = 'ru-RU', emptyText = 'Не указана') {
    if (!dateString) return emptyText
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return emptyText

    const formatter = getDateTimeFormatter(locale)
    const formattedDate = formatter.format(date)

    const age = getAge(dateString)
    if (age === null) return formattedDate

    return `${formattedDate} (${age} ${pluralizeYears(age, locale)})`
}

export function formatDateOfBirthOnly(dateString, locale = 'ru-RU', emptyText = 'Не указана') {
    if (!dateString) return emptyText
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return emptyText

    const formatter = getDateTimeFormatter(locale)
    return formatter.format(date)
}