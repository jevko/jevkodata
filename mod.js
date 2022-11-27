import {parseJevkoWithHeredocs} from "https://cdn.jsdelivr.net/gh/jevko/parsejevko.js@v0.1.8/mod.js"

export const jevkodata = jevko => {
  return JSON.stringify(convert(jevko))
}

export const fromString = (str) => convert(parseJevkoWithHeredocs(str))

export const convert = (jevko) => inner(prep(jevko))

export const prep = jevko => {
  const {subjevkos, ...rest} = jevko

  const subs = []
  for (const {prefix, jevko} of subjevkos) {
    const trimmed = prefix.trim()
    let key

    // note: support for ' keys '
    if (trimmed.startsWith("'")) {
      key = trimmed
    } else {
      // todo: configurable linebreak
      const lines = prefix.split('\n')
  
      // discard all lines but last:
      key = lines.at(-1).trim()
      // discard all pairs that have name starting with -
      if (key.startsWith('-')) continue
    }

    subs.push({prefix: key, jevko: prep(jevko)})
  }
  return {subjevkos: subs, ...rest}
}

const inner = (jevko) => {
  const {subjevkos, suffix} = jevko

  if (subjevkos.length === 0) {
    const {tag} = jevko

    if (tag === 'json') return JSON.parse(suffix)
    // note: other tags make raw heredoc strings -- untrimmed
    else if (tag !== undefined) return suffix

    const trimmed = suffix.trim()

    if (trimmed.startsWith("'")) {
      // note: allow unclosed string literals
      if (trimmed.at(-1) === "'") return trimmed.slice(1, -1)
      return trimmed.slice(1)
    }

    if (trimmed === 'true') return true
    if (trimmed === 'false') return false
    if (trimmed === 'null' || trimmed === "nil") return null
    if (trimmed === 'map') return Object.create(null)
    if (trimmed === 'list' || trimmed === "seq") return []
  
    if (trimmed === 'NaN') return NaN
  
    const num = Number(trimmed)
  
    if (Number.isNaN(num) === false) return num

    // todo: recognize different primitive types:
    // numbers, 'strings, bools, null, regular strings, =list, =map
    return suffix
  }
  if (suffix.trim() !== '') throw Error('oops')

  const sub0 = subjevkos[0]

  if (sub0.prefix === '') return list(subjevkos)
  return map(subjevkos)
}

export const list = subjevkos => {
  const ret = []
  for (const {prefix, jevko} of subjevkos) {
    if (prefix !== '') throw Error('oops')
    ret.push(inner(jevko))
  }
  return ret
}

export const map = subjevkos => {
  const ret = Object.create(null)
  for (const {prefix, jevko} of subjevkos) {
    if (prefix === '') throw Error('oops')

    let key
    //?todo: extract & dedupe w/ inner
    if (prefix.startsWith("'")) {
      // note: allow unclosed string literals
      if (prefix.at(-1) === "'") key = prefix.slice(1, -1)
      else key = prefix.slice(1)
    } else key = prefix

    if (key in ret) throw Error('dupe')
    ret[key] = inner(jevko)
  }
  return ret
}
