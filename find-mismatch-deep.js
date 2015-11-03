import isPlainObject from 'is-plain-object'
import R from 'ramda'

export default function findMismatchDeep(expected, actual, path = []) {
  const isBothArrays = Array.isArray(expected) && Array.isArray(actual)
  const isBothPlainObject = isPlainObject(expected) && isPlainObject(actual)

  if (isBothPlainObject) {
    // check that all expected patterns match actual
    const pairsExpected = R.toPairs(expected)
    for (var i = 0; i < pairsExpected.length; i++) {
      const [expectedKey, expectedPatternForKey] = pairsExpected[i]
      const mismatch = findMismatchDeep(
        actual[expectedKey],
        expectedPatternForKey,
        path.concat([expectedKey])
      )
      if (mismatch) return mismatch;
    }
  } else if (expected !== actual) {
    return {
      path,
      actual,
      expected
    }
  }
  return null;
}
