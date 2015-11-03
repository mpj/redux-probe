import R from 'ramda'
export default function reducerTest(reducer, suites) {


  const hasFocusedTest =
    R.any(suite => R.any(test => test.focus)(R.values(suite)))
  const isFocused = hasFocusedTest(R.values(suites))

  return mapObj(suites, suite => {
    return mapObj(suite, test => {
      if (isFocused && !test.focus) {
        return {
          blur: true
        }
      }
      const actualState = reducer(test.givenState, test.givenAction)
      const firstDiff = deepFindFirstDiff(test.expectedState, actualState)

      return {
        focus: isFocused,
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
