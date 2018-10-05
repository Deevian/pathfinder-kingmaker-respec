import { forEach } from "lodash";

/**
 * Creates an ID-Blueprint map to be used by the character updater and to
 * avoid storing every item on local storage.
 *
 * @param {Object} itemMap
 */
export default (itemMap) => {
    const itemBlueprintMap = {};

    forEach(itemMap, (item, key) => {
        itemBlueprintMap[key] = item.Blueprint;
    });

    return itemBlueprintMap;
};
