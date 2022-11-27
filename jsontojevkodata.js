import {JsonHigh} from 'https://cdn.jsdelivr.net/gh/xtao-org/jsonhilo@v0.3.0/mod.js'
import {escape} from 'https://cdn.jsdelivr.net/gh/jevko/jevkoutils.js@v0.1.6/mod.js'


import {stringToHeredoc} from './lib.js'

const enc = new TextEncoder()
const write = str => Deno.stdout.writeSync(enc.encode(str))

let isEmpty = false
const stream = JsonHigh({
  openArray: () => {
    isEmpty = true
    write('[')
  },
  openObject: () => {
    isEmpty = true
    write('[')
  },
  closeArray: () => {
    if (isEmpty) write('seq')
    write(']')
    isEmpty = false
  },
  closeObject: () => {
    if (isEmpty) write('map')
    write(']')
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
stream.chunk(Deno.readTextFileSync('test.json'))