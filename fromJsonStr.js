import {JsonHigh} from 'https://cdn.jsdelivr.net/gh/xtao-org/jsonhilo@v0.3.0/mod.js'

import {escape, stringToHeredoc as sth, defaultDelimiters} from 'https://cdn.jsdelivr.net/gh/jevko/jevko.js@v0.1.4/mod.js'

// note: this won't work correctly for keys (prefixes), so MUST NOT be used on them
const stringToHeredoc = str => {
  return sth(str, '', defaultDelimiters)
}

const convertKey = key => convertString(key)

const convertString = str => {
  const escaped = escape(str)
  if (str.trim() !== str) return `'${escaped}'`
  return escaped
}

const {opener, closer} = defaultDelimiters
const convertValue = value => {
  if (typeof value === 'string') {
    return stringToHeredoc(value)//`[${convertString(value)}]`
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