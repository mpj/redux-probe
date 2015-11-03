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

test('recursive diff', (t) => {
  const bug = 666;
  const reducer = (state, action) => {
    if (action.type === 'add') {
      return {
        outer: {
          inner: {
            value: state.value + action.value + bug
          }
        }
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
          outer: {
            inner: {
              value: 12
            }
          }
        }
      }
    }
  })
  const testResult = result['my fine suite']['a test']
  t.notOk(testResult.success);
  t.ok(testResult.failure);
  t.equal(testResult.diff.key, 'outer.inner.value');
  t.equal(testResult.diff.actual, 12 + bug);
  t.equal(testResult.diff.expected, 12);
  t.end();
})

test('recursive diff (missing tree)', (t) => {
  const bug = {
    otherprop: 1
  }
  const reducer = (state, action) => {
    if (action.type === 'add') {
      return {
        outer: bug
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
          outer: {
            inner: {
              value: 12
            }
          }
        }
      }
    }
  })
  const testResult = result['my fine suite']['a test']
  t.notOk(testResult.success);
  t.ok(testResult.failure);
  t.deepEqual(testResult.actualState, {
    outer: {
      otherprop: 1
    }
  });
  t.equal(testResult.diff.key, 'outer.inner');
  t.equal(testResult.diff.actual, undefined);
  t.deepEqual(testResult.diff.expected, { value: 12 });
  t.end();
})

test('focus', (t) => {
  const reducer = (state, action) => {
    if (action.type === 'dummy') {
      t.fail('should not be passed dummy');
      return;
    }
    return {
      hello: 'world'
    }
  }
  const dummyTest = {
    givenAction: { type: 'dummy' },
    expectedState: {}
  }
  const testResult = reducerTest(reducer, {
    'my suite': {
      'a skipped test': dummyTest,
    },
    'my other suite': {
      'another skipped test': dummyTest,
      'actual test': {
        focus: true,
        givenAction: { type: 'notDummy' },
        expectedState: {
          hello: 'world'
        }
      }
    }
  });
  t.equal(testResult['my suite']['a skipped test'].blur, true);
  t.equal(testResult['my other suite']['another skipped test'].blur, true);
  t.equal(testResult['my other suite']['actual test'].focus, true);
  t.equal(testResult['my other suite']['actual test'].success, true);
  t.deepEqual(testResult['my other suite']['actual test'].actualState, {
    hello: 'world'
  });

})

// TODO: skip test
// TODO: missing givenAction
// TODO: missing expectedState
// TODO: debug/copy thing
// TODO: actionCreatorTest
// TODO: exceptions
