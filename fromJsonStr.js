import {JsonHigh} from 'https://cdn.jsdelivr.net/gh/xtao-org/jsonhilo@v0.3.0/mod.js'
import {escape} from 'https://cdn.jsdelivr.net/gh/jevko/jevkoutils.js@v0.1.6/mod.js'

// note: this won't work correctly for keys (prefixes), so MUST NOT be used on them
const stringToHeredoc = str => {
  let id = ''
  let tok = '//'
  let stret = `${str}${tok}`
  while (stret.indexOf(tok) !== str.length) {
    //?todo: more sophisticated id-generation algo
    id += '='
    tok = `/${id}/`
    stret = `${str}${tok}`
  }
  return `\`${tok}${stret}`
}

const convertKey = key => convertString(key)

const convertString = str => {
  const escaped = escape(str)
  if (str.trim() !== str) return `'${escaped}'`
  return escaped
}

const convertValue = value => {
  if (typeof value === 'string') {
    return stringToHeredoc(value)//`[${convertString(value)}]`
  }

  return `[${value}]`
}

// stream.chunk('{"tuple": [null, true, false, 1.2e-3, "[demo]"], "empty": []}')
// stream.chunk(Deno.readTextFileSync('test.json'))

// const enc = new TextEncoder()
// const write = str => Deno.stdout.writeSync(enc.encode(str))

const makeStream = (write) => {
  let isEmpty = false
  let depth = 0
  const stream = JsonHigh({
    openArray: () => {
      isEmpty = true
      if (depth > 0) write('[')
      ++depth
    },
    openObject: () => {
      isEmpty = true
      if (depth > 0) write('[')
      ++depth
    },
    closeArray: () => {
      if (isEmpty) write('seq')
      --depth
      if (depth > 0) write(']')
      isEmpty = false
    },
    closeObject: () => {
      if (isEmpty) write('map')
      --depth
      if (depth > 0) write(']')
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