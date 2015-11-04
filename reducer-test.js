import R from 'ramda'
import _ from 'lodash'
import changesets from 'diff-json'
import findMismatchDeep from './find-mismatch-deep'

export default function reducerTest(reducer, suites) {

  const hasFocusedTest =
    R.any(suite => R.any(test => test.focus)(R.values(suite)))
  const runHasFocusedTest = hasFocusedTest(R.values(suites))

  return mapObj(suites, suite => {
    return mapObj(suite, test => {
      if (!test.expectedState && !test.focus) {
        throw new Error('expectedState missing from "my test". Maybe you misspelled it? Or, if you want to just check the state output without verifying, set focus: true.')
      }
      if (runHasFocusedTest && !test.focus) {
        return {
          blur: true
        }
      }
      const actualState = reducer(test.givenState, test.givenAction)

      const firstDiff = !!test.expectedState
        ? findMismatchDeep(test.expectedState, actualState)
        : null;



      return {
        probe: !test.expectedState && test.focus,
        focus: test.focus,
        success: !firstDiff,
        failure: !!firstDiff,
        actualState,
        diff: firstDiff
      }

    })
  })
}

const mapObj = R.flip(R.map)
