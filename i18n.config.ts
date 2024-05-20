import en from './locales/en.json'
import ru from './locales/ru.json'
import ua from './locales/ua.json'
export default defineI18nConfig(() => {
    return {
        legacy: false,
        messages: {
            en,
            ru,
            ua
        }
    }
})