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
