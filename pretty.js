import {parseJevkoWithHeredocs} from "https://cdn.jsdelivr.net/gh/jevko/parsejevko.js@v0.1.8/mod.js"
import {escape} from 'https://cdn.jsdelivr.net/gh/jevko/jevkoutils.js@v0.1.6/mod.js'
import {stringToHeredoc} from './lib.js'

const jevkoToPrettyString = (jevko) => {
  const {subjevkos, suffix, tag} = jevko

  if (tag !== undefined) return stringToHeredoc(suffix)

  let ret = ''
  for (const {prefix, jevko} of subjevkos) {
    ret += `${escapePrefix(prefix)}${recur(jevko, '  ', '')}\n`
  }
  return ret + escape(suffix)
}

const escapePrefix = (prefix) => prefix === ''? '': escape(prefix) + ' '

const recur = (jevko, indent, prevIndent) => {
  const {subjevkos, suffix, tag} = jevko

  if (tag !== undefined) return stringToHeredoc(suffix)

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

const parsed = parseJevkoWithHeredocs(Deno.readTextFileSync('test.jevkodata'))

// todo: heredoc-aware pretty printer
console.log(jevkoToPrettyString(parsed))