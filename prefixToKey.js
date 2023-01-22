// todo: figure this out

export const prefixToKey = (prefix) => {
  let i = 0
  const {length} = prefix
  while (i < length) {
    i = leftTrim(prefix, i)
    if (prefix[i] === "'") return finalTrim(prefix, i)
    const j = skipPastLineBreak(prefix, i)
    if (j === -1) return finalTrim(prefix, i)
    // todo: extract comment line; comments could then be returned along with the key
    i = j
  }
  return ''
}
// this is from https://github.com/jevko/jevkoutils.js
// todo: perhaps more sophisticated https://tc39.es/ecma262/#sec-white-space
// https://tc39.es/ecma262/#sec-trimstring
const isWhitespace = (c) => {
  return ' \n\r\t'.includes(c)
}

const leftTrim = (prefix, i) => {
  for (; i < prefix.length; ++i) {
    if (isWhitespace(prefix[i]) === false) return i
  }
  return i
}

const finalTrim = (prefix, i) => {
  let j = prefix.length - 1
  for (; j >= i; --j) {
    if (isWhitespace(prefix[j]) === false) break
  }
  // todo: perhaps should return the space after
  return prefix.slice(i, j + 1)
}

// https://tc39.es/ecma262/#sec-line-terminators
const skipPastLineBreak = (prefix, i) => {
  let sawCr = false
  for (; i < prefix.length; ++i) {
    //?todo: other kinds of linebreaks -- LS ( U+2028 ) and PS ( U+2029 )
    if (sawCr) {
      if (prefix[i] === '\n') return i + 1 // CR LF
      else return i // CR !LF
    } 
    else if (prefix[i] === '\n') return i + 1 // LF
    else if (prefix[i] === '\r') sawCr = true
  }
  return -1
}

console.log(`|${prefixToKey(`
comment
this that other
'yaba
daba ' 
`)}|`)
console.log(`|${prefixToKey(`
comment
this that other
yaba
daba ' 
`)}|`)