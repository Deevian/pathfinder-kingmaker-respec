import { forEach } from "lodash";
import getResolvedProperty from "./getResolvedProperty";
import CharacterBlueprintEnum from "../enums/CharacterBlueprintEnum";

/**
 * Trims the passed character map to the required props to get around
 * local storage size restrictions.
 *
 * @param {Object} characterMap
 * @param {Object} itemMap
 */
export default (characterMap, itemMap) => {
    const trimmedMap = {};

    forEach(characterMap, (characterArray, uniqueId) => {
        if (!CharacterBlueprintEnum[uniqueId] && !characterArray[0].IsEssentialForGame) {
            return;
        }

        trimmedMap[uniqueId] = characterArray.map((character) => ({
            $id: character.$id,
            CustomName: character.CustomName,
            Blueprint: character.Blueprint,
            IsEssentialForGame: character.IsEssentialForGame,
            Abilities: getResolvedProperty(character.Abilities, itemMap),
            ActivatableAbilities: getResolvedProperty(character.ActivatableAbilities, itemMap),
            Alignment: getResolvedProperty(character.Alignment, itemMap),
            Logic: getResolvedProperty(character.Logic, itemMap),
            Progression: getResolvedProperty(character.Progression, itemMap),
            UISettings: getResolvedProperty(character.UISettings, itemMap),
            Stats: getResolvedProperty(character.Stats, itemMap),
            m_Parts: getResolvedProperty(character.m_Parts, itemMap),
            m_Spellbooks: getResolvedProperty(character.m_Spellbooks, itemMap),
        }));
    });

    return trimmedMap;
};
