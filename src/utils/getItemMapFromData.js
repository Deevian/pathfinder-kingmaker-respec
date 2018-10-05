import { forEach, isArray, isObject } from "lodash";

/**
 * Recursively indexes values by key to the passed map.
 *
 * @param {Object} map
 * @param {*} value
 */
const recursivelyIndexValuesByKey = (map, value) => {
    if (isArray(value)) {
        forEach(value, recursivelyIndexValuesByKey.bind(null, map));
        return;
    }

    if (isObject(value)) {
        if (value.$id) {
            // eslint-disable-next-line no-param-reassign
            map[value.$id] = value;
        }

        forEach(value, recursivelyIndexValuesByKey.bind(null, map));
    }
};


/**
 * Returns a global reference map of the data object items indexed by id.
 * @param {Object} data
 */
export default (data) => {
    const itemMap = {};
    recursivelyIndexValuesByKey(itemMap, data);

    return itemMap;
};
