

<!-- toc -->



<!-- tocstop -->

## Overview
`react-merge` - function that merge 2 (or more) objects in a proper "react"-way. I.e. if second object doesn't change first then the result object is strictly equals first object.
```
import merge from 'react-merge';
let firstObject = {"a":1, "b": {"c":2, "d":3}}
let result = merge(fisrtObject, {"a":1});
console.log(result === firstObject); // true
result = merge(fisrtObject, {"a":2, "b":{"c":2}});
console.log(result === firstObject); // false
console.log(result.b === firstObject.b); // true
```


## Installation

To install the stable version:

```
npm install --save react-merge
```
## Usage
```
import {merge} from 'react-merge'
```

## Documentation

#### merge(objectA: any, objectB: any, options: MergeOptions)
Merges `objectA` with `objectB` in react-way. 

If `objectB` is not mergeable then `objectA` is returned as result. 

If `objectA` is not mergeable then new object deeply equal to `objectB` is returned as result. 

If both are not mergeable then empty object is returned. 

If `objectA` is array and `objectB` is not array then the result is array with props of `objectB`.

`options` - object with following properties:
  - `path?: string | any[]` - // path in first object that should be merged with second object
  - `replace?: replaceType` - force replace for mergeable object instead of merge, can be boolean, object with boolean or function props or a function of the following type `(path: any[], objectA: anyObject, objectB: anyObject) => boolean`
  - `arrays?: Function` - function to merge arrays of the following type `(path: any[], arrayA: any[], arrayB: any[]) => any[]`. Example, to concat arrays `(t, a, b) => a.concat(b)`, to replace `(t, a, b) => b`
  - `del?: boolean` - remove props with `MergeOptions.delSymbol`
  - `delSymbol?: any` - symbol that marks props that should be removed if MergeOptions.del is true, default is `undefined`
  - `noSymbol?: boolean` - if true, then skips symbol props in objects
  - `diff?: boolean` - if true then first object is changed in the way to be deeply equal to the second.

#### merge.all(objectA: any, objectsB: any[], options: MergeOptions)
Merges `objectA` with `objectsB` array.

## Examples: 

##### merge array with object
```
import merge from 'react-merge';
let firstObject = {"a":[0, 1, 2, 3]}
let secondObject = {"a": {"1": 11, "length":2}};
let result = merge(fisrtObject, secondObject);
console.log(result); // {"a": [0, 11]}

```

##### default array merging
```
import merge from 'react-merge';
let firstObject = {"a":[0, 1, 2, 3]}
let secondObject = {"a": []};
secondObject.a[2] = 22;
secondObject.a.length = 5;
let result = merge(fisrtObject, secondObject);
console.log(result); // {"a": [0, 1, 22, 3, undefined]}
```

##### del options
```
import merge from 'react-merge';
let firstObject = {"a": 1, "b": {"c":2, "d":3}}
let secondObject = {"a": undefined};
let result = merge(fisrtObject, secondObject, {del:true});
console.log(result); // {"b": {"c":2, "d":3}}

result = merge(fisrtObject, secondObject, {del:false});
console.log(result); // {"a": undefined, "b": {"c":2, "d":3}}
```

##### diff options
```
import merge from 'react-merge';
let firstObject = {"a": 1, "b": {"c":2, "d":3}}
let secondObject = {"a": 1};
let result = merge(fisrtObject, secondObject, {diff:true});
console.log(result === firstObject); // false
console.log(result === secondObject); // false
console.log(result); // {"a": 1}
```


  

