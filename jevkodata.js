import {convert} from './mod.js'

export const jevkodata = jevko => {
  return JSON.stringify(convert(jevko))
}