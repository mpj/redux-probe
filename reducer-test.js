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
      if (!test.expectedState) {
        throw new Error('expectedState missing from "my test"')
      }
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
