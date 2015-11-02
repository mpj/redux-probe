import test from 'tape'
import R from 'ramda'
import reducerTest from './reducer-test'

test('basic', (t) => {
  const reducer = (state, action) => {
    if (action.type === 'add') {
      return {
        value: state.value + action.value
      }
    }
  }

  const result = reducerTest(reducer, {
    'basic group': {
      'basic test': {
        givenState: {
          value: 8
        },
        givenAction: {
          type: 'add',
          value: 4
        },
        expectedState: {
          value: 12
        }
      }
    }
  })
  const testResult = result['basic group']['basic test']
  t.equal(testResult.actualState.value, 12);
  t.ok(testResult.success);
  t.end();
});

test('basic failure', (t) => {
  const bug = 666;
  const reducer = (state, action) => {
    if (action.type === 'add') {
      return {
        value: state.value + action.value + bug
      }
    }
  }

  const result = reducerTest(reducer, {
    'my fine suite': {
      'a test': {
        givenState: {
          value: 8
        },
        givenAction: {
          type: 'add',
          value: 4
        },
        expectedState: {
          value: 12
        }
      }
    }
  })
  const testResult = result['my fine suite']['a test']
  t.equal(testResult.actualState.value, 12 + bug);
  t.notOk(testResult.success);
  t.ok(testResult.failure);
  t.equal(testResult.diff.key, 'value');
  t.equal(testResult.diff.actual, 12 + bug);
  t.equal(testResult.diff.expected, 12);
  t.end();
})
