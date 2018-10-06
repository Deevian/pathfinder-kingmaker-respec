/* eslint-disable no-param-reassign */
import {
    forEach,
    map,
    // find,
    findKey,
    isArray,
    isObject,
    // reduce,
} from "lodash";
// import getItemMapFromData from "./getItemMapFromData";
// import FeatsToRestoreEnum from "../enums/FeatsToRestoreEnum";

const bumpByNumber = 1000000000;

/**
 * Recursively corrects all references and ID's inside the passed value to iterate upon.
 * This also takes care of storing items that need to be added in the new save to avoid
 * reference errors by the game.
 *
 * @param {Object} itemMap
 * @param {Object} oldItemMap
 * @param {Object} itemsToBump
 * @param {Array} itemsToAdd
 * @param {*} value
 * @returns {*}
 */
const recursivelyCorrectItems = (itemMap, oldItemMap, itemsToBump, itemsToAdd, value) => {
    // Iterate on top of it if array.
    if (isArray(value)) {
        return map(value, recursivelyCorrectItems.bind(null, itemMap, oldItemMap, itemsToBump, itemsToAdd));
    }

    // Return if not array and not object.
    if (!isObject(value)) {
        return value;
    }

    // We clone the object to avoid reference changes which bork up the ids / refs.
    const clonedValue = Object.assign({}, value);

    // If the object doesn't have a ref, we optionally bump the id and iterate on top of it.
    if (!clonedValue.$ref) {
        if (clonedValue.$id) {
            clonedValue.$id += bumpByNumber;
        }

        forEach(clonedValue, (val, key) => {
            clonedValue[key] = recursivelyCorrectItems(itemMap, oldItemMap, itemsToBump, itemsToAdd, val);
        });

        return clonedValue;
    }

    // If it has a ref, and we can bump the ref, we do so and return the object.
    if (itemsToBump[clonedValue.$ref]) {
        clonedValue.$ref += bumpByNumber;
        return clonedValue;
    }

    // We try to find the item in the old item map.
    const oldItem = oldItemMap[clonedValue.$ref];

    // Item is not available, might be available in another part of the save structure.
    if (!oldItem) {
        // eslint-disable-next-line no-console
        console.error(`ERROR #2, report this to me if you would: ${clonedValue.$ref}`);

        delete clonedValue.$ref;
        return clonedValue;
    }

    // Item is available, but can't be uniquely identified, which is a major bummer.
    if (!oldItem.Blueprint) {
        // eslint-disable-next-line no-console
        console.error(`ERROR #3, report this to me if you would: ${clonedValue.$ref}`);

        delete clonedValue.$ref;
        return clonedValue;
    }

    // We find the ref through the Blueprint.
    const $ref = findKey(itemMap, (item) => item.Blueprint && item.Blueprint === oldItem.Blueprint);

    // If not available in the new item map, we need to manually add it later.
    if (!$ref) {
        if (itemsToAdd) {
            itemsToAdd.push(oldItem);
            clonedValue.$ref += bumpByNumber;
        } else {
            // eslint-disable-next-line no-console
            console.error(`ERROR #4, report this to me if you would: ${clonedValue.$ref}`);

            delete clonedValue.$ref;
        }

        return clonedValue;
    }

    // Otherwise, we set the correct ref and move along with the iteration.
    clonedValue.$ref = $ref;
    return clonedValue;
};

/**
 * Updates a given characterMap by reference based on old version of the same structure.
 *
 * @param {Object} characterMap
 * @param {Object} itemToBlueprintMap
 * @param {Object} oldCharacterMap
 * @param {Object} oldItemToBlueprintMap
 * @returns {*}
 */
export default (characterMap, oldCharacterMap) => {
    // const itemMap = getItemMapFromData(characterMap);
    // const oldItemMap = getItemMapFromData(oldCharacterMap);

    forEach(characterMap, (characters, key) => {
        forEach(characters, (descriptor, index) => {
            // let itemsToBump;

            if (!oldCharacterMap[key] || !oldCharacterMap[key][index]) {
                return;
            }

            const oldDescriptor = oldCharacterMap[key][index];

            descriptor.IsEssentialForGame = oldDescriptor.IsEssentialForGame;
            descriptor.Progression.Experience = oldDescriptor.Progression.Experience;

            descriptor.Alignment.Vector = Object.assign({}, oldDescriptor.Alignment.Vector);
            descriptor.Alignment.m_History = map(oldDescriptor.Alignment.m_History, (event) => {
                return Object.assign({}, event, { $id: event.$id + bumpByNumber });
            });

            if (!descriptor.IsEssentialForGame) {
                descriptor.UISettings.m_Portrait = oldDescriptor.UISettings.m_Portrait;
            }

            // /**
            //  * >>>>>>>>>>>>>>>>>>>>>>>>>
            //  * RESTORING ESSENTIAL FEATS
            //  * <<<<<<<<<<<<<<<<<<<<<<<<<
            //  */
            //
            // const featsToAdd = reduce(oldDescriptor.Progression.Features.m_Facts, (acc, featEntry) => {
            //     if (!FeatsToRestoreEnum.includes(featEntry.Blueprint)) {
            //         return acc;
            //     }
            //
            //     const featBlueprint = featEntry.$ref ? oldItemToBlueprintMap[featEntry.$ref] : featEntry.Blueprint;
            //     const newFeat = find(itemMap, (item) => item.Blueprint === featBlueprint);
            //     const feat = featEntry.$ref ? oldItemMap[featEntry.$ref] : featEntry;
            //
            //     // Feat already exists in new save, we move on.
            //     if (newFeat) {
            //         return acc;
            //     }
            //
            //     // If we don't have the feat in the old item map, it might be available somewhere else in the
            //     // save structure. It's a bit like finding Wally. Just less fun.
            //     if (!feat) {
            //         // eslint-disable-next-line no-console
            //         console.error(`ERROR #1, report this to me if you would: ${JSON.stringify(featEntry)}`);
            //         return acc;
            //     }
            //
            //
            //     return [].concat(acc, [feat]);
            // }, []);
            //
            // itemsToBump = getItemMapFromData(featsToAdd);
            // const itemsToAdd = [];
            //
            // descriptor.Progression.Features.m_Facts = descriptor.Progression.Features.m_Facts.concat(
            //     map(featsToAdd, recursivelyCorrectItems.bind(null, itemMap, oldItemMap, itemsToBump, itemsToAdd)),
            // );
            //
            // /**
            //  * >>>>>>>>>>>>>>>>>>>>>>>>>
            //  * RESTORING ABILITIES, ACTIVATABLE ABILITIES & FACTS
            //  * <<<<<<<<<<<<<<<<<<<<<<<<<
            //  */
            // itemsToBump = getItemMapFromData(itemsToAdd);
            //
            // forEach(itemsToAdd, (item) => {
            //     const fixedItem = recursivelyCorrectItems(itemMap, oldItemMap, itemsToBump, null, item);
            //
            //     switch (item.$type) {
            //         case "Kingmaker.UnitLogic.Abilities.Ability, Assembly-CSharp":
            //             descriptor.Abilities.m_Facts = descriptor.Abilities.m_Facts.concat([fixedItem]);
            //             break;
            //         case "Kingmaker.UnitLogic.ActivatableAbilities.ActivatableAbility, Assembly-CSharp":
            //             descriptor.ActivatableAbilities.m_Facts = descriptor.ActivatableAbilities.m_Facts.concat([fixedItem]);
            //             break;
            //         case "Kingmaker.Blueprints.Facts.OwnedFact`1[[Kingmaker.UnitLogic.UnitDescriptor, Assembly-CSharp]], Assembly-CSharp":
            //             descriptor.Logic.m_Facts = descriptor.Logic.m_Facts.concat([fixedItem]);
            //             break;
            //         default:
            //             // eslint-disable-next-line no-console
            //             console.error(`ERROR #5, report this to me if you would: ${item.$type}`);
            //     }
            // });
        });
    });
};
