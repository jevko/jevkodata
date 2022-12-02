import {escape} from 'https://cdn.jsdelivr.net/gh/jevko/jevkoutils.js@v0.1.6/mod.js'

const strToHeredoc = (str, tag) => `\`/${tag}/${str}/${tag}/`

export const jevkoToPrettyString = (jevko) => {
  const {subjevkos, suffix, tag} = jevko

  if (tag !== undefined) return strToHeredoc(suffix, tag)

  let ret = ''
  for (const {prefix, jevko} of subjevkos) {
    ret += `${escapePrefix(prefix)}${recur(jevko, '  ', '')}\n`
  }
  return ret + escape(suffix)
}

const escapePrefix = (prefix) => prefix === ''? '': escape(prefix) + ' '

//?todo: unhardcode []`
const recur = (jevko, indent, prevIndent) => {
  const {subjevkos, suffix, tag} = jevko

  if (tag !== undefined) return strToHeredoc(suffix, tag)

  let ret = ''
  if (subjevkos.length > 0) {
    ret += '\n'
    for (const {prefix, jevko} of subjevkos) {
      ret += `${indent}${
        escapePrefix(prefix)
      }${recur(jevko, indent + '  ', indent)}\n`
    }
    ret += prevIndent
  }
  return '[' + ret + escape(suffix) + ']'
}