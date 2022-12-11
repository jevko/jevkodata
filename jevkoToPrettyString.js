import {escape, defaultDelimiters} from 'https://cdn.jsdelivr.net/gh/jevko/jevko.js@v0.1.4/mod.js'

const {opener, closer, escaper, quoter} = defaultDelimiters

const strToHeredoc = (str, tag) => `${escaper}${quoter}${tag}${quoter}${str}${quoter}${tag}${quoter}`

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
  return opener + ret + escape(suffix) + closer
}