import R from 'ramda'
export default function reducerTest(reducer, suites) {
  return mapObj(suites, suite => {
    return mapObj(suite, test => {
      // TODO check for givenAction
      const actualState = reducer(test.givenState, test.givenAction)

      const firstDiff = deepFindFirstDiff(test.expectedState, actualState)

      return {
        success: !firstDiff,
        failure: !!firstDiff,
        actualState,
        diff: firstDiff
      }

    })
  })
}

const mapObj = R.flip(R.map)

function deepFindFirstDiff(pattern, actual) {
  const keys = R.keys(pattern)
  for (var i=0; i<keys.length; i++) {
    const key = keys[i];
    if (pattern[key] !== actual[key])
      return {
        key,
        actual: actual[key],
        expected: pattern[key]
      }
  }
  return null;
}
