import { forEach, isArray, isObject } from "lodash";

/**
 * @param {Object} itemMap
 * @param {*} value
 */
const recursivelyFindBrokenReferences = (itemMap, value) => {
    if (isArray(value)) {
        forEach(value, recursivelyFindBrokenReferences.bind(null, itemMap));
        return;
    }

    if (!isObject(value)) {
        return;
    }

    if (value.$ref && (!itemMap[value.$ref] || !itemMap[value.$ref].$id)) {
        // eslint-disable-next-line no-console
        console.error("Broken reference found", value.$ref);
    }

    forEach(value, recursivelyFindBrokenReferences.bind(null, itemMap));
};

/**
 * Debug tool, finds broken references in item map.
 * @param {Object} itemMap
 */
export default (itemMap) => {
    recursivelyFindBrokenReferences(itemMap, itemMap);
};
