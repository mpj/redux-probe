import R from 'ramda'
import _ from 'lodash'
import changesets from 'diff-json'
import findMismatchDeep from './find-mismatch-deep'

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
      const firstDiff = findMismatchDeep(test.expectedState, actualState)

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

/*

function deepFindFirstDiff(pattern, actual, path = []) {

  if (_.isPlainObject(pattern) && _.isPlainObject(actual)) {
    R.toPairs(pattern).forEach(([key, value]) => {
      // every pattern prop should exist among actuals
      const existsAmongActualProperties =
    })
    const innerDiff = deepFindFirstDiff(pattern, actual, path.concat([key]))
    if(innerDiff) return innerDiff;
  } else if (_.isArray(pattern) && _.isArray(actual)) {
    const patterns = pattern;
    const actuals = actual;
    const unmatchedPattern =
      patterns.find((pattern) => {
        const matchesPattern = (actual) => {
          console.log('dffd', pattern, actual, deepFindFirstDiff(pattern, actual))
          return deepFindFirstDiff(pattern, actual)
        }

        const matchesSomeActual = actuals.find(matchesPattern)
        return !matchesSomeActual;
      })

    console.log('unmatchedPattern',unmatchedPattern, patterns,actuals)
    if (unmatchedPattern) {
      return {
        key: path.concat([key]).join('.'),
        actual: actual,
        expected: pattern
      };
    }
  } else if (pattern !== actual)
    return {
      key: path.concat([key]).join('.'),
      actual: actual,
      expected: pattern
    }
  }
}*/
