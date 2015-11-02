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

function deepFindFirstDiff(pattern, actual, path = []) {
  const keys = R.keys(pattern)
  for (var i=0; i<keys.length; i++) {
    const key = keys[i];
    if (R.is(Object, pattern[key]) && R.is(Object, actual[key])) {
      const innerDiff = deepFindFirstDiff(pattern[key], actual[key], path.concat([key]))
      if(innerDiff) return innerDiff;
    } else if (pattern[key] !== actual[key])
      return {
        key: path.concat([key]).join('.'),
        actual: actual[key],
        expected: pattern[key]
      }
  }
  return null;
}
