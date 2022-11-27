

// note: this won't work for keys (prefixes)
export const stringToHeredoc = str => {
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