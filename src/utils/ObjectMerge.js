//import merge from "deepmerge";
/*
// Merge a `source` object to a `target` recursively
const ObjectMerge = (target, source) => {
  // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object) {
      if (typeof target[key] === "undefined") target[key] = {};

      Object.assign(target[key], ObjectMerge(target[key], source[key]));
    }
  }

  // Join `target` and modified `source`
  Object.assign(target || {}, source);
  return target;
};
*/
const ObjectMerge = (target, source) => {
  // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object) {
      if (typeof target[key] === "undefined") target[key] = {};
      Object.assign(source[key], ObjectMerge(target[key], source[key]));
    }
  }

  // Join `target` and modified `source`
  Object.assign(target || {}, source);
  return target;
};
export default ObjectMerge;
