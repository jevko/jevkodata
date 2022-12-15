import {JsonHigh} from 'https://cdn.jsdelivr.net/gh/xtao-org/jsonhilo@v0.3.0/mod.js'

import {escape, stringToHeredoc as sth, defaultDelimiters} from './deps.js'

// note: this won't work correctly for keys (prefixes), so MUST NOT be used on them
const stringToHeredoc = str => {
  return sth(str, '', defaultDelimiters)
}

const convertKey = key => convertString(key)

const convertString = str => {
  const escaped = escape(str)
  if (str.trim() !== str || str[0] === "'" || str.at(-1) === "'") {
    return `'${escaped}'`
  }
  return escaped
}

const {opener, closer} = defaultDelimiters
const convertValue = value => {
  if (typeof value === 'string') {
    const str = convertString(value)
    // note: convert ' into ['''], '' into [''''] rather than heredocs
    if (str !== "'''" && str !== "''''" && str.length > value.length) return stringToHeredoc(value)
    return opener + str + closer
  }

  return opener + value + closer
}

const makeStream = (write) => {
  let isEmpty = false
  let depth = 0
  const stream = JsonHigh({
    openArray: () => {
      isEmpty = true
      if (depth > 0) write(opener)
      ++depth
    },
    openObject: () => {
      isEmpty = true
      if (depth > 0) write(opener)
      ++depth
    },
    closeArray: () => {
      if (isEmpty) write('seq')
      --depth
      if (depth > 0) write(closer)
      isEmpty = false
    },
    closeObject: () => {
      if (isEmpty) write('map')
      --depth
      if (depth > 0) write(closer)
      isEmpty = false
    },
    key: (key) => {
      write(convertKey(key))
    },
    value: (value) => {
      isEmpty = false
      write(convertValue(value))
    },
  })

  return stream
}

export const fromJsonStr = str => {
  let ret = ''
  const stream = makeStream(str => ret += str)
  stream.chunk(str)
  stream.end()
  return ret
}