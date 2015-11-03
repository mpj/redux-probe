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
        expectedPatternForKey,
        actual[expectedKey],
        path.concat([expectedKey])
      )

      if (mismatch) return mismatch;
    }
  } else if (isBothArrays) {
    // check that all array patterns match actual
    for (var i = 0; i < expected.length; i++) {
      let matched = false;
      let firstMismatch = null;
      for (var j = 0; j < actual.length; j++) {
        const mismatch = findMismatchDeep(
          expected[i],
          actual[j],
          path.concat([i]))

        if (!mismatch) {
          matched = true;
          break;
        }
      }
      if (!matched) {
        return {
          path,
          expected: expected,
          actual
        }
      }
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
