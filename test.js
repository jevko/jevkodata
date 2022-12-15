import {fromString, prettyFromJsonStr} from './mod.js'
import { assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test('readme example', () => {
  const ret = fromString(`
  This is a comment
  
  title [jevkoconfig1 Example]
  
  owner [
    name [tester]
    dob \`''2020-08-05T20:30:01+09:00[Asia/Tokyo][u-ca=japanese]''
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
    some json \`'json'
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
    'json'
    more json \`'json'55'json'
    json string \`'json'"\\n\\tsomething\\u0000"'json'
    json array \`'json'[1, 2, 3, 4, null]'json'
  ]
  `)
  
  assertEquals(JSON.stringify(ret, null, 2), String.raw`{
  "title": "jevkoconfig1 Example",
  "owner": {
    "name": "tester",
    "dob": "2020-08-05T20:30:01+09:00[Asia/Tokyo][u-ca=japanese]"
  },
  "database": {
    "enabled": true,
    "quoted": "true",
    "ports": [
      8000,
      8001,
      8002
    ],
    "data": [
      [
        "delta",
        "phi"
      ],
      3.14
    ],
    "temp targets": {
      "cpu": 79.5,
      "case": 72
    }
  },
  "servers": {
    "alpha": {
      "ip": "10.0.0.1",
      "role": "frontend"
    },
    "beta": {
      "ip": "10.0.0.2",
      "role": "backend"
    }
  },
  "embedded documents": {
    "some json": {
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
    },
    "more json": 55,
    "json string": "\n\tsomething\u0000",
    "json array": [
      1,
      2,
      3,
      4,
      null
    ]
  }
}`)
  assertEquals(ret.database.test, undefined)
})

Deno.test('array with comments', () => {
  const obj = fromString(`array [
    Comment for the
    frist value of an array
    [1]
    Comment for the
    second value
    [2]
  ]`)

  const arr = obj.array

  assertEquals(arr.length, 2)
  assertEquals(arr[0], 1)
  assertEquals(arr[1], 2)
})

Deno.test('quoted keys', () => {
  const obj = fromString(`
  owner [
    name [tester]
    dob \`''2020-08-05T20:30:01+09:00[Asia/Tokyo][u-ca=japanese]''
    ' test ' [999]
    '' [value of the empty key]
    '  key with leading and trailing spaces  ' [value1]
    'multiline
    key' [value2]
    ' padded
    multiline key ' [value3]
  ]
  `)

  const owner = obj.owner

  assertEquals(owner.name, 'tester')
  assertEquals(owner.dob, '2020-08-05T20:30:01+09:00[Asia/Tokyo][u-ca=japanese]')
  assertEquals(owner[' test '], 999)
  assertEquals(owner[''], 'value of the empty key')
  assertEquals(owner['  key with leading and trailing spaces  '], 'value1')
  assertEquals(owner['multiline\n    key'], 'value2')
  assertEquals(owner[' padded\n    multiline key '], 'value3')
})

Deno.test('empty string', () => {
  const obj = fromString(`a [] b [  ] c [''] d ['  ']`)
  assertEquals(obj, {
    a: "",
    b: "",
    c: "",
    d: "  ",
  })
})

Deno.test('from json str -- "\'", "\'\'"', () => {
  const jsonStr = `{"'":"'","''":"''"}`
  const pretty = prettyFromJsonStr(jsonStr)
  assertEquals(JSON.stringify(fromString(pretty)), jsonStr)
})