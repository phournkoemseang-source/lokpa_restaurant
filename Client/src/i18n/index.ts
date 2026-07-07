import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import kh from './locales/kh.json'

type MessageSchema = typeof en

const i18n = createI18n<[MessageSchema], 'en' | 'kh'>({
  legacy: false,
  locale: localStorage.getItem('locale') || 'kh',
  fallbackLocale: 'kh',
  messages: {
    en,
    kh,
  },
})

export default i18n
