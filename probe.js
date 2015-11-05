import R from 'ramda'
import changesets from 'diff-json'
import findMismatchDeep from './find-mismatch-deep'
import Promise from 'bluebird'

const mapObj = R.flip(R.map)

export function probe(suite) {
  const hasFocusedTest =
    R.any(group => R.any(test => test.___probeFocus)(R.values(group)))
  const runHasFocusedTest = hasFocusedTest(R.values(suite))

  return Promise.props(
    mapObj(suite, (group) =>
      Promise.props(
        mapObj(group, (test) => {
          if (runHasFocusedTest && !test.___probeFocus) {
            return {
              blur: true
            }
          }
          const context = {
            focus: test.___probeFocus
          }
          return test(context)
        })
      )
    )
  )
}

export function focus(test) {
  test.___probeFocus = true
  return test
}

export function reducerTest(reducer, opts) {

  return function (context) {
    if (!opts.expectedState && !context.focus) {
      throw new Error('expectedState missing from properties. Maybe you misspelled it? Or, if you want to just check the state output without verifying, set focus: true.')
    }
    const actualState = reducer(opts.givenState, opts.givenAction)

    const firstDiff = !!opts.expectedState
      ? findMismatchDeep(opts.expectedState, actualState)
      : null;

    return new Promise(resolve => resolve({
      probe: !opts.expectedState && context.focus,
      focus: context.focus,
      success: !firstDiff,
      failure: !!firstDiff,
      actualState,
      diff: firstDiff
    }))
  }

}
