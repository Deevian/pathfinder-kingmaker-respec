import CharacterBlueprintEnum from "../enums/CharacterBlueprintEnum";

/**
 * Returns the name for the passed character.
 *
 * @param {Object} descriptor
 * @returns {string}
 */
export default (descriptor) => {
    return CharacterBlueprintEnum[descriptor.Blueprint] || descriptor.CustomName || "Unknown";
};
