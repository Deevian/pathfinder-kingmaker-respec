/**
 * Returns resolved property.
 *
 * @param {Object} prop
 * @param {Object} itemMap
 * @returns {*}
 */
export default (prop, itemMap) => {
    if (!prop.$ref) {
        return prop;
    }

    return itemMap[prop.$ref];
};
