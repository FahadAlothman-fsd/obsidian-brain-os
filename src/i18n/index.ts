import Periodic from './periodic'

const EN = {
  HELP: 'Go to the website and ask for help',
  ...Periodic,
}





export const I18N_MAP: Record<string, Record<string, string>> = {
  'en-us': EN,
  en: EN,
}
