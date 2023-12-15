// set env variable to the `tsconfig.json` path before loading mocha (default: './tsconfig.json')

process.env.TS_NODE_PROJECT = './tsconfig.json';

require('ts-mocha');
const { expect } = require('chai');
const { merge } = require('../index.ts');


describe('test react merge', function () {

  it('tests objects merging', () => {
    let firstObject = { "a": 1, "b": { "c": 2, "d": 3 } }
    let result = merge(firstObject, { "a": 1 });
    expect(result).to.be.equal(firstObject);
    result = merge(firstObject, { "a": 2, "b": { "c": 2 } });
    expect(result).to.be.not.equal(firstObject);
    expect(result.b).to.be.equal(firstObject.b);
  })

  it('tests object and array merging', () => {
    let firstObject = { "a": [0, 1, 2, 3] }
    let secondObject = { "a": { "1": 11, "length": 2 } };
    let result = merge(firstObject, secondObject);
    expect(result).to.be.deep.equal({ "a": [0, 11] })
  })

  it('tests default arrays merging', () => {
    let firstObject = { "a": [0, 1, 2, 3] }
    let secondObject = { "a": [] };
    secondObject.a[2] = 22;
    secondObject.a.length = 5;
    let result = merge(firstObject, secondObject);
    expect(result).to.be.deep.equal({ "a": [0, 1, 22, 3, undefined] })
  })

  it('tests del options', () => {
    let firstObject = { "a": 1, "b": { "c": 2, "d": 3 } }
    let secondObject = { "a": undefined };
    let result = merge(firstObject, secondObject, { del: true });
    expect(result).to.be.deep.equal({ "b": { "c": 2, "d": 3 } })

    result = merge(firstObject, secondObject, { del: false });
    expect(result).to.be.deep.equal({ "a": undefined, "b": { "c": 2, "d": 3 } })
  })

  it('tests diff options', () => {
    let firstObject = { "a": 1, "b": { "c": 2, "d": 3 } }
    let secondObject = { "a": 1 };
    let result = merge(firstObject, secondObject, { diff: true });
    expect(result).to.be.not.equal(firstObject);
    expect(result).to.be.not.equal(secondObject);
    expect(result).to.be.deep.equal({ "a": 1 });
    let prev = result;
    result = merge(result, { "a": 1 }, { diff: true });
    expect(result).to.be.equal(prev);
  })
})
