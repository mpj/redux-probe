import test from 'tape'

import {genericTest, probe, focus} from './probe'

test('genericTest (success)', (t) => {

  const result = probe({
    'basic group': {
      'basic test': genericTest((result) =>
        result(true))
    }
  }).then(result => {
    const testResult = result['basic group']['basic test']
    t.ok(testResult.success);
    t.end();
  })

});

test('genericTest (failure)', (t) => {

  const result = probe({
    'basic group': {
      'basic test': genericTest((result) =>
        result(false))
    }
  }).then(result => {
    const testResult = result['basic group']['basic test']
    t.notOk(testResult.success);
    t.ok(testResult.failure);
    t.end();
  })

});

test('genericTest (undefined)', (t) => {

  probe({
    'basic group': {
      'basic test': genericTest((result) =>
        result()) // undefined
    }
  }).catch(e => {
    t.equal(e.message, 'Must provide boolean to result callback.')
    t.end()
  })


});
