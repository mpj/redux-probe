import test from 'tape'

import {reducerTest, probe, focus} from './probe'


test('basic', (t) => {
  const reducer = (state, action) => {
    if (action.type === 'add') {
      return {
        value: state.value + action.value
      }
    }
  }
  probe({
    'basic group': {
      'basic test': reducerTest(reducer, {
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
      })
    }
  }).then((suiteResult) => {
    const testResult = suiteResult['basic group']['basic test']
    t.equal(testResult.actualState.value, 12);
    t.ok(testResult.success);
    t.end();
  })

});

test('basic failure', (t) => {
  const bug = 666;
  const reducer = (state, action) => {
    if (action.type === 'add') {
      return {
        myValue: state.myValue + action.aValue + bug
      }
    }
  }

  probe({
    'my fine suite': {
      'a test': reducerTest(reducer, {
        givenState: {
          myValue: 8
        },
        givenAction: {
          type: 'add',
          aValue: 4
        },
        expectedState: {
          myValue: 12
        }
      })
    }
  }).then(result => {
    const testResult = result['my fine suite']['a test']
    t.equal(testResult.actualState.myValue, 12 + bug);
    t.notOk(testResult.success);
    t.ok(testResult.failure);

    t.deepLooseEqual(testResult.violation, {
      "message": "Actual state did not match expected state.",
      "sections": [
        {
          "headerLabel": "Offending property",
          "look": "neutral",
          "value": "myValue"
        },
        {
          "headerLabel": "Actual",
          "look": "bad",
          "value": 678
        },
        {
          "headerLabel": "Expected",
          "look": "good",
          "value": 12
        },
        {
          "headerLabel": "Full, actual state",
          "look": "neutral",
          "value": {
            "myValue": 678
          }
        }
      ]
    })
    t.end();
  })

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

  const result = probe({
    'my fine suite': {
      'a test': reducerTest(reducer, {
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
      })
    }
  }).then(result => {
    const testResult = result['my fine suite']['a test']
    t.notOk(testResult.success);
    t.ok(testResult.failure);
    t.deepEqual(testResult.violation, {
      "message": "Actual state did not match expected state.",
      "sections": [
        {
          "headerLabel": "Offending property",
          "look": "neutral",
          "value": "outer.inner.value"
        },
        {
          "headerLabel": "Actual",
          "look": "bad",
          "value": 678
        },
        {
          "headerLabel": "Expected",
          "look": "good",
          "value": 12
        },
        {
          "headerLabel": "Full, actual state",
          "look": "neutral",
          "value": {
            "outer": {
              "inner": {
                "value": 678
              }
            }
          }
        }
      ]
    });
    t.end();
  })

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

  probe({
    'my fine suite': {
      'a test': reducerTest(reducer, {
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
      })
    }
  }).then(result => {
    const testResult = result['my fine suite']['a test']
    t.notOk(testResult.success);
    t.ok(testResult.failure);
    t.deepEqual(testResult.actualState, {
      outer: {
        otherprop: 1
      }
    });

    t.deepEqual(testResult.violation, {
      "message": "Actual state did not match expected state.",
      "sections": [
        {
          "headerLabel": "Offending property",
          "look": "neutral",
          "value": "outer.inner"
        },
        {
          "headerLabel": "Actual",
          "look": "bad",
          "value": undefined,
        },
        {
          "headerLabel": "Expected",
          "look": "good",
          "value": {
            "value": 12
          }
        },
        {
          "headerLabel": "Full, actual state",
          "look": "neutral",
          "value": {
            "outer": {
              "otherprop": 1
            }
          }
        }
      ]
    })
    t.end();
  })

})


const addCatSuite = (reducer) => ({
  'my fine suite': {
    'a test': reducerTest(reducer,{
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
    })
  }
})

test('arrays (correct reducer)', (t) => {
  const correctReducer = (state, action) => {
    return {
      cats: state.cats.concat([action.name])
    }
  }
  probe(addCatSuite(correctReducer)).then(suitesResult => {
    const testResult = suitesResult['my fine suite']['a test'];
    t.ok(testResult.success);
    t.end();
  })

})

test('arrays (buggy reducer)', (t) => {
  const buggyReducer = (state, action) => {
    return {
      cats: state.cats // I won't con-cat!
    }
  }
  probe(addCatSuite(buggyReducer)).then(suitesResult => {
    const testResult = suitesResult['my fine suite']['a test'];
    t.deepEqual(testResult, {
      "probe": false,
      "success": false,
      "failure": true,
      "focus": undefined,
      "actualState": {
        "cats": [
          "waffles",
          "fluffykins"
        ]
      },
      "violation": {
        "message": "Actual state did not match expected state.",
        "sections": [
          {
            "headerLabel": "Offending property",
            "look": "neutral",
            "value": "cats"
          },
          {
            "headerLabel": "Actual",
            "look": "bad",
            "value": [
              "waffles",
              "fluffykins"
            ]
          },
          {
            "headerLabel": "Expected",
            "look": "good",
            "value": [
              "skogsturken"
            ]
          },
          {
            "headerLabel": "Full, actual state",
            "look": "neutral",
            "value": {
              "cats": [
                "waffles",
                "fluffykins"
              ]
            }
          }
        ]
      }
    })
    t.end();
  })
})

test('arrays (matching properties, correct reducer)', (t) => {
  const propReducer = (state, action) => {
    return {
      cats: state.cats.concat([action.cat])
    }
  }
  probe({
    'my fine suite': {
      'a test': reducerTest(propReducer, {
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
      })
    }
  }).then(suitesResult => {
    const testResult = suitesResult['my fine suite']['a test'];
    t.ok(testResult.success);
    t.end();
  })

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
  const dummyTest = reducerTest({
    givenAction: { type: 'dummy' },
    expectedState: {}
  })
  probe({
    'my suite': {
      'a skipped test': dummyTest,
    },
    'my other suite': {
      'another skipped test': dummyTest,
      'actual test': focus(reducerTest(reducer, {
        focus: true,
        givenAction: { type: 'notDummy' },
        expectedState: {
          hello: 'world'
        }
      }))
    }
  }).then(testResult => {
    t.equal(testResult['my suite']['a skipped test'].blur, true);
    t.equal(testResult['my other suite']['another skipped test'].blur, true);
    t.equal(testResult['my other suite']['actual test'].focus, true);
    t.equal(testResult['my other suite']['actual test'].success, true);
    t.deepEqual(testResult['my other suite']['actual test'].actualState, {
      hello: 'world'
    });
    t.end()
  })

})

test('missing expectedState', t => {
  const reducer = _ => {}

  try {
    probe({
      'my suite': {
        'a test': reducerTest(reducer, {
          givenAction: { type: 'lul' },
          expectState: { someprop: 1 } // misspelling! expectedState != expectState
        })
      }
    })
  } catch(e) {
    t.equal(e.message, 'expectedState missing from properties. Maybe you misspelled it? Or, if you want to just check the state output without verifying, set focus: true.')
    t.end()
    return
  }
  t.fail('did not throw exception')

})

test('focus will run without expectedState', t => {
  const reducer = _ => ({ someprop: 123 })
  const testResult = probe({
    'mysuite': {
      'mytest': focus(reducerTest(reducer, {
        givenAction: { type: 'lol' }
      }))
    }
  }).then(testResult => {
    t.equal(testResult['mysuite']['mytest'].probe, true)
    t.equal(testResult['mysuite']['mytest'].actualState.someprop, 123)
    t.end()
  })
})




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
