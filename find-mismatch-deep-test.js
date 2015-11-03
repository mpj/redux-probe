import test from 'tape'
import findMismatchDeep from './find-mismatch-deep'

test('basic case', t => {
  const pattern = {
    outer: {
      inner: 999
    }
  }
  const actual = {
    outer: {
      inner: 666
    }
  }

  t.deepEqual(findMismatchDeep(pattern, actual), {
    actual: 666,
    expected: 999,
    path: [ 'outer', 'inner' ] }
  )
  t.end()
})


test('array matcher', t => {
  const pattern = {
    abba: {
      bertil: [
        {
          ceasar: [
            {
              dustin: 99
            }
          ]
        },
      ]
    }
  }
  const actual = {
    abba: {
      bertil: [
        {
          ceasar: [
            {
              dustin: 66,
              eric: 4
            },
          ],
          curt: 3
        }
      ],
      burt: 2
    },
    abel: 1
  }
  t.deepEqual(findMismatchDeep(pattern, actual), {
    path: [ 'abba', 'bertil' ],
    expected: [ { ceasar: [ { dustin: 99 } ] } ],
    actual: [ { ceasar: [ { dustin: 66, eric: 4 } ], curt: 3 } ],
  })
  t.end()
})

test('array matcher (second mismatches)', t => {
  const pattern = {
    bertil: [
      {
        cedric: 2
      },
      {
        ceasar: 3
      }
    ]
  }
  const actual = {
    bertil: [
      {
        cedric: 2
      },
      {
        ceasar: 4
      }
    ]
  }
  t.deepEqual(findMismatchDeep(pattern, actual), {
    path: [ 'bertil' ],
    expected: [ { cedric: 2 }, { ceasar: 3 } ],
    actual: [ { cedric: 2 }, { ceasar: 4 } ]
  })
  t.end()
})
