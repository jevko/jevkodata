NOTE: experimental

# jevkodata

Codename .jevkodata.

A [Jevko](https://jevko.org) format for data interchange that translates to JSON.

Gives you the full power of JSON by supporting its data model and JSON literals.

On top of that you get a much simpler and leaner syntax with:

* comments -- more minimal than in any other format
* unquoted autotrimmed strings and keys
* quoted multiline strings and keys
* here documents (heredocs)
* ability to disable (comment out) an entire subtree by prefixing it with `-`

Jevko is closed under concatenation, so there is no need for JSON Lines, NDJSON, or anything like that.

.jevkodata is best used in combination with the [Jevko CLI](https://github.com/jevko/jevko-cli) -- which gives you additional features, such as:

* self-contained .jevkodata documents that know how to convert themselves to specific JSON files
* ability to make .jevkodata documents executable thanks to Jevko CLI support for shebangs -- you can convert a document simply by executing it!

# Example

.jevkodata decodes this Jevko:

```
This is a comment

title [jevkodata Example]

owner [
  name [tester]
  dob `//2020-08-05T20:30:01+09:00[Asia/Tokyo][u-ca=japanese]//
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
  some json `/json/
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
  more json `/json/55/json/
  json string `/json/"\n\tsomething\u0000"/json/
  json array `/json/[1, 2, 3, 4, null]/json/
]
```

into this JSON:

```json
{
  "title": "jevkodata Example",
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
}
```

<!-- todo: edit V -->

The example is based on the one from [TOML's homepage](https://toml.io/en/).

.jevkodata recognizes the following primitive values:

* `true` and `false` (booleans)
* numbers, e.g. `999.99` -- parsed as according to Ecma262 grammar -- `Infinity` and `NaN` are supported
* `null`
* `map` means an empty map `{}`
* `list` means an empty list `[]`
* `'<anything>` or `'<anything>'` means that `<anything>` is meant to be a string, e.g. `'true` or `'true'` is `"true"`
* anything unrecognized is interpreted as a string and autotrimmed

# Heredocs

Heredoc strings are supported like this:

```
<key> `/<tag>/............./<tag>/
```

`<tag>` is any user-defined delimiting identifier, can be empty.

Example:

```
dob `//2020-08-05T20:30:01+09:00[Asia/Tokyo][u-ca=japanese]//
```

parses to:

```json
{
  "dob": "2020-08-05T20:30:01+09:00[Asia/Tokyo][u-ca=japanese]"
}
```

All strings (not just heredocs) may be multiline.

# Comments

```
This is a multiline
comment that precedes
a key [with a value]
```

parses to:

```json
{
  "a key": "with a value"
}
```

Also:

```
array [
  Comment for the
  frist value of an array
  [1]
  Comment for the
  second value
  [2]
]
```

parses to:

```
{
  "array": [1, 2]
}
```

i.e. by default all lines that precede a line with an opening bracket `[` are ignored.

Keys can contain embedded spaces, but leading and trailing whitespace is not considered part of them by default.

The default behavior for keys can be changed by wrapping them in apostrophes. This allows to enter multiline keys, keys that include leading/trailing spaces, as well as the empty key:

```
'' [value of the empty key]
'  key with leading and trailing spaces  ' [value1]
'multiline
key' [value2]
' padded
multiline key ' [value3]
```

converts to:

```json
{
  "": "value of the empty key",
  "  key with leading and trailing spaces  ": "value1",
  "multiline\nkey": "value2",
  " padded\nmultiline key ": "value3"
}
```

# Embedded JSON

JSON values can be embedded in .jevkodata as follows:

```
json object `/json/
{ 
  "id": "b3df0d",
  "count": 55
}
/json/
json number `/json/55/json/
json string `/json/"\n\tsomething\u0000"/json/
json array `/json/[1, 2, 3, 4, null]/json/
```

This will parse to:

```json
{
  "json object": { 
    "id": "b3df0d",
    "count": 55
  },
  "json number": 55,
  "json string": "\n\tsomething\u0000",
  "json array": [
    1,
    2,
    3,
    4,
    null
  ]
}
```
