import Periodic from './periodic'
import { TAG, FOLDER, INDEX, MESSAGE, ERROR_MESSAGE, PLUGIN_NAME } from '../constants'
import Para from './para'


const EN = {
  HELP: 'Go to the website and ask for help',

  ...Periodic.EN,
  ...Para.EN,

  [TAG]: 'Tag',
  [FOLDER]: 'Folder',
  [INDEX]: 'Index',
  [PLUGIN_NAME]: 'BrainOS',
  QUICK_JUMP: 'Double click to open periodic note for this ',
  [`${TAG}ToolTip`]:
    'Tags in PARA notes serve as the unique identifiers for indexing tasks, notes, and files',
  [`${FOLDER}ToolTip`]:
    'The folder where PARA notes are located, is used to store notes related to the corresponding theme',
  [`${INDEX}ToolTip`]:
    'The index filename of PARA notes is used to index tasks, records, and files scattered across various locations. The required formats are LifeOS.README.md/README.md, or the same as the name of the folder it resides in',
  [`${TAG}Required`]: 'A unique id tag is required',
  [`${TAG}Required2`]: `The unique id can't contain spaces`,
  [`${FOLDER}Required`]: 'The folder is required',
  [`${INDEX}Required`]: 'The index file name is required',

  [`${ERROR_MESSAGE}NO_APP_EXIST`]: 'The app variable does not exist',
  [`${ERROR_MESSAGE}NO_DIR_EXIST`]: 'The directory was not passed',
  [`${ERROR_MESSAGE}NO_FRONT_MATTER_TAG`]:
    'Please add the tags field for properties !',
  [`${ERROR_MESSAGE}NO_DATAVIEW_INSTALL`]:
    'You need to install dataview first!',
  [`${ERROR_MESSAGE}FAILED_DATAVIEW_API`]: 'Dataview API enable failed!',
  [`${ERROR_MESSAGE}NO_VIEW_PROVIDED`]:
    'Please provide the name of the view you want to query!',
  [`${ERROR_MESSAGE}NO_VIEW_EXISTED`]: 'There is no this view in LifeOS plugin',
  [`${ERROR_MESSAGE}NO_INDEX_FILE_EXIST`]:
    'There is no Index file exists(README.md/xxx.README.md/the same as the name of the folder it resides in)',
  [`${ERROR_MESSAGE}NO_TEMPLATE_EXIST`]: 'There is no template file exist',
  [`${ERROR_MESSAGE}TAGS_MUST_INPUT`]: 'Please input tags!',
  [`${ERROR_MESSAGE}NO_TAGS_EXIST`]: 'There are no tags in the PARA type you are looking for',
  [`${ERROR_MESSAGE}RESOURCE_FETCH_FAILED`]: 'Fetch resource failed',
  [`${ERROR_MESSAGE}NO_PARA_ENTRIES`]:
    'There are no entries for the PARA type you are trying to access in the dir: ',
  [`${ERROR_MESSAGE}NO_DAILY_RECORD_API`]:
    'Please set daily usememos API in LifeOS plugin',
  [`${ERROR_MESSAGE}NO_DAILY_RECORD_TOKEN`]:
    'Please set usememos token in LifeOS plugin',
  [`${ERROR_MESSAGE}NO_DAILY_FILE_EXIST`]:
    'Daily file not exists, please create it first: ',
}





export const I18N_MAP: Record<string, Record<string, string>> = {
  'en-us': EN,
  en: EN,
}
