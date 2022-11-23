import {fromString} from './mod.js'

const ret = fromString(`
This is a comment

title [jevkoconfig1 Example]

owner [
  name [tester]
  dob \`//2020-08-05T20:30:01+09:00[Asia/Tokyo][u-ca=japanese]//
]

database [
  enabled [true]
  quoted ['true]
  ports [
    [8000]
    [8001]
    [8002]
  ]
  data [ [[delta] [phi]] [3.14] ]
  temp targets [ cpu [79.5] case [72.0] ]
]

servers [
  alpha [
    ip [10.0.0.1]
    role [frontend]
  ]
  beta [
    ip [10.0.0.2]
    role [backend]
  ]

  -discarded key [[with][a][value]]
  -[discarded section]
]

embedded documents [
  some json \`/json/
  { 
    "id": "b3df0d",
    "count": 55,
    "props": {
      "return code": "59503a7b",
      "status": "pending"
    },
    "associated ids": [
      "3adf7c",
      "ff0df7",
      "3aa670"
    ],
    "parent": null 
  }
  /json/
  more json \`/json/55/json/
  json string \`/json/"\\n\\tsomething\\u0000"/json/
  json array \`/json/[1, 2, 3, 4, null]/json/
]
`)

console.log(JSON.stringify(ret, null, 2))
console.log(ret.database.test)

console.log(fromString(`array [
  Comment for the
  frist value of an array
  [1]
  Comment for the
  second value
  [2]
]`))

console.log(fromString(`
owner [
  name [tester]
  dob \`//2020-08-05T20:30:01+09:00[Asia/Tokyo][u-ca=japanese]//
  ' test ' [999]
  '' [value of the empty key]
  '  key with leading and trailing spaces  ' [value1]
  'multiline
  key' [value2]
  ' padded
  multiline key ' [value3]
]
`))