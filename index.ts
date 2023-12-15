import isFunction from "lodash/isFunction";
import isArray from "lodash/isArray";
import isString from "lodash/isString";
import getIn from "lodash/get";
import setIn from "lodash/set";
import isMergeableObject from "is-mergeable-object";

function is(x: any, y: any) {
  // SameValue algorithm
  if (x === y) { // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    return x !== 0 || 1 / x === 1 / y;
  } else {
    // Step 6.a: NaN == NaN
    return x !== x && y !== y;
  }
}

export interface anyObject {
  [key: string]: any;

  [key: number]: any;
}

export declare type PathElement = string | number | symbol;

const objKeys = Object.keys;

const objKeysNSymb = (obj: any): any[] => (objKeys(obj) as any[]).concat(Object.getOwnPropertySymbols(obj));


interface MergeStateResult {
  state: any,
  changes?: any,
}

export interface MergeOptions {
  path?: PathElement[] | string; // path in first object that should be merged with second object
  replace?: replaceType; // force replace for mergeable object instead of merge, can be boolean, object with boolean props or a function of following type (path: any[], objectA: anyObject, objectB: anyObject) => boolean
  arrays?: (path: PathElement[], arrayA: any[], arrayB: any[]) => any[]; // function to merge arrays
  diff?: boolean; // if true then first object is changed in the way to be deeply equal to the second
  del?: boolean;  // remove props with MergeOptions.delSymbol
  delSymbol?: any;  // symbol that marks props that should be removed if MergeOptions.del is true
  noSymbol?: boolean; // if true, then skips symbol props in objects
}

export type replaceType = { [key: string]: boolean | replaceType } | boolean | ((path: PathElement[], objectA: anyObject, objectB: anyObject) => boolean);


function mergeState(state: any, source: any, options: MergeOptions = {}): MergeStateResult {
  const fn = options.noSymbol ? objKeys : objKeysNSymb;
  let { delSymbol, del, diff, replace, arrays, path } = options;
  if (path) {
    if (isString(path)) path = (path as string).split('/');
    source = setIn({}, path, source);
    if (replace && !isFunction(replace))
      replace = setIn({}, path, replace);
  }
  let forceReplace: any = replace;
  if (typeof forceReplace !== 'function') {
    if (!isMergeableObject(replace)) forceReplace = () => false;
    else forceReplace = (path: any) => getIn(replace, path)
  }
  if (replace === true || forceReplace([], state, source) === true) return { state: source, changes: state !== source ? source : undefined };
  if (!isFunction(arrays)) arrays = undefined;

  function recusion(state: any, source: any, track: any[] = []): MergeStateResult {
    const changes: any = {};
    const isSourceArray = isArray(source);
    if (!isMergeableObject(state)) {
      state = isSourceArray ? [] : {};  // return only elements
      if (isArray(state)) changes.length = 0;
    }
    const isStateArray = isArray(state);
    if (!isMergeableObject(source)) return { state };  // merge only mergeable elements, may be throw here

    if (isStateArray && isSourceArray) {
      if (arrays) source = arrays(track, state, source);
      if (state.length != source.length) changes.length = source.length;
    }

    let stateKeys = fn(state);
    if (stateKeys.length == 0 && !del) {
      if (!isStateArray && !isSourceArray)
        return fn(source).length ? { state: source, changes: source } : { state };
      if (isStateArray && isSourceArray) {
        if (state.length == source.length && source.length == 0) return { state };
        return (fn(source).length || source.length !== state.length) ? { state: source, changes: source } : { state };
      }
    }

    let srcKeys = fn(source);

    const changedObjects: any = {};
    const result = (isStateArray ? [] : {});


    if (diff) {
      stateKeys.forEach(key => {
        if (!~srcKeys.indexOf(key))
          changes[key] = delSymbol;
      });
    }

    srcKeys.forEach(key => {
      if (del && source[key] === delSymbol) {
        if (state.hasOwnProperty(key)) changes[key] = delSymbol;
      } else {
        let keyTrack = track.concat(key);
        if (!isMergeableObject(source[key]) || !isMergeableObject(state[key]) || forceReplace(keyTrack, state[key], source[key]) === true) {
          if (!state.hasOwnProperty(key) || !is(state[key], source[key])) changes[key] = source[key];
        } else {
          if (state[key] !== source[key]) {
            let obj = recusion(state[key], source[key], keyTrack);
            if (obj.changes)
              changedObjects[key] = obj;
          }
        }
      }
    });

    let changedObjKeys = fn(changedObjects);
    let changesKeys = fn(changes);
    if (changesKeys.length == 0 && changedObjKeys.length == 0) return { state };
    else {
      Object.assign(result, state);
      changesKeys.forEach(key => {
        if (del && changes[key] === delSymbol || diff && !source.hasOwnProperty(key)) delete result[key];
        else result[key] = changes[key];
      });
      changedObjKeys.forEach(key => {
        result[key] = changedObjects[key].state;
        changes[key] = changedObjects[key].changes
      });
      return { state: result, changes }
    }
  }

  return recusion(state, source)
}

const merge: any = (a: any, b: any, opts: MergeOptions = {}) => mergeState(a, b, opts).state;


merge.all = function (state: any, obj2merge: any[], options: MergeOptions = {}) {
  if (obj2merge.length == 0) return state;  // no changes should be done
  else return obj2merge.reduce((prev, next) => merge(prev, next, options), state);  // merge
};


export { merge, mergeState } // react-merge
