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
  t.deepEqual(testResult.diff.path, ['value']);
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
  t.deepEqual(testResult.diff.path, ['outer', 'inner', 'value' ]);
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
  t.deepEqual(testResult.diff.path, ['outer','inner']);
  t.equal(testResult.diff.actual, undefined);
  t.deepEqual(testResult.diff.expected, { value: 12 });
  t.end();
})


const addCatTest = {
  'my fine suite': {
    'a test': {
      givenState: {
        cats: [ 'waffles', 'fluffykins' ]
      },
      givenAction: {
        type: 'addCat',
        name: 'skogsturken'
      },
      expectedState: {
        cats: [ 'skogsturken' ]
      },
    }
  }
}

test('arrays (correct reducer)', (t) => {
  const correctReducer = (state, action) => {
    return {
      cats: state.cats.concat([action.name])
    }
  }
  const suitesResult = reducerTest(correctReducer, addCatTest);
  const testResult = suitesResult['my fine suite']['a test'];
  t.ok(testResult.success);
  t.end();
})

test('arrays (buggy reducer)', (t) => {
  const buggyReducer = (state, action) => {
    return {
      cats: state.cats // I won't con-cat!
    }
  }
  const suitesResult = reducerTest(buggyReducer, addCatTest);
  const testResult = suitesResult['my fine suite']['a test'];
  t.ok(testResult.failure);
  t.deepEqual(testResult.diff.path, ['cats']);
  t.deepEqual(testResult.diff.actual, [ 'waffles', 'fluffykins' ])
  t.deepEqual(testResult.diff.expected, [ 'skogsturken' ])
  t.end();
})

test('arrays (matching properties, correct reducer)', (t) => {
  const propReducer = (state, action) => {
    return {
      cats: state.cats.concat([action.cat])
    }
  }
  const propTest = {
    'my fine suite': {
      'a test': {
        givenState: {
          cats: [
            { name: 'waffles', otherprop: 456 },
            { name: 'fluffykins', otherprop: 789 }
          ]
        },
        givenAction: {
          type: 'addCat',
          cat: { name: 'skogsturken', otherprop: 123 }
        },
        expectedState: {
          cats: [ { name: 'skogsturken' } ]
        },
      }
    }
  }
  const suitesResult = reducerTest(propReducer, propTest);
  const testResult = suitesResult['my fine suite']['a test'];
  t.ok(testResult.success);
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
  t.end()
})

test('missing expectedState', t => {
  const reducer = _ => {}

  try {
    reducerTest(reducer, {
      'my suite': {
        'a test': {
          givenAction: { type: 'lul' },
          expectState: { someprop: 1 } // misspelling! expectedState != expectState
        }
      }
    })
  } catch(e) {
    t.equal(e.message, 'expectedState missing from "my test". Maybe you misspelled it? Or, if you want to just check the state output without verifying, set focus: true.')
    t.end()
    return
  }
  t.fail('did not throw exception')

})

test('focus will run without expectedState', t => {
  const reducer = _ => ({ someprop: 123 })
  const testResult = reducerTest(reducer, {
    'mysuite': {
      'mytest': {
        focus: true,
        givenAction: { type: 'lol' }
      }
    }
  })
  t.equal(testResult['mysuite']['mytest'].probe, true)
  t.equal(testResult['mysuite']['mytest'].actualState.someprop, 123)
  t.end()
})

// TODO: missing expectedState
// TODO: allow not having expectedState when focusing

// TODO: skip test
// TODO: missing givenAction

// TODO: hint about exception in GUI in case console isn't open

// TODO: debug/copy thing

// TODO: actionCreatorTest
// TODO: exceptions
// TODO: node runner
// TODO: auto-locate unneccessary properties for test (just remove props and run many times)
// TODO: copy output
// TODO: invalid properties on tests (misseplling of givenState etc)''
