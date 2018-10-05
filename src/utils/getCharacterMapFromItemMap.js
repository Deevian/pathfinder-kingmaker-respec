import { filter, forEach } from "lodash";

/**
 * Returns the character data map retrieved from the passed referenced item map.
 * @param {Object} itemMap
 */
export default (itemMap) => {
    const controllableCharacterMap = filter(itemMap, (item) => {
        return item.m_GroupId && item.m_GroupId === "<directly-controllable-unit>";
    });

    const characterDataMap = {};

    forEach(controllableCharacterMap, (character) => {
        const descriptor = character.Descriptor.$id
            ? character.Descriptor
            : itemMap[character.Descriptor.$ref];

        if (!characterDataMap[descriptor.Blueprint]) {
            characterDataMap[descriptor.Blueprint] = [];
        }

        characterDataMap[descriptor.Blueprint].push(descriptor);
    });

    return characterDataMap;
};
