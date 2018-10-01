import JSZip from "jszip/dist/jszip.min";
import saveAs from "file-saver";
import _ from "lodash";
import "./styles.css";

// We save the character map from the first save to transfer stuff over to the second
let characterDataMap;

// Map between Bluepring and character name
const characterBlueprintMap = {
    "77c11edb92ce0fd408ad96b40fd27121": "Linzi",
    "5455cd3cd375d7a459ca47ea9ff2de78": "Tartuccio",
    "54be53f0b35bf3c4592a97ae335fe765": "Valerie",
    "b3f29faef0a82b941af04f08ceb47fa2": "Amiri",
    "aab03d0ab5262da498b32daa6a99b507": "Harrim",
    "32d2801eddf236b499d42e4a7d34de23": "Jaethal",
    "b090918d7e9010a45b96465de7a104c3": "Regongar",
    "f9161aa0b3f519c47acbce01f53ee217": "Octavia",
    "f6c23e93512e1b54dba11560446a9e02": "Tristian",
    "d5bc1d94cd3e5be4bbc03f3366f67afc": "Ekundayo",
    "ef4e6551044872b4cb99dff10f707971": "Dog",
    "3f5777b51d301524c9b912812955ee1e": "Jubilost",
    "f9417988783876044b76f918f8636455": "Nok-Nok"
}

// Stats object for an empty character.
// Used to reset main / custom character without resetting entire inventory.
const baseStats = `{"$id":"5349","HitPoints":{"$id":"5350","m_BaseStat":"Constitution","m_Stats":{"$ref":"5349"},"m_BaseStatModifier":null,"Type":"HitPoints","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null},"TemporaryHitPoints":{"$id":"5351","Type":"TemporaryHitPoints","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null},"AC":{"$id":"5352","m_Stats":{"$ref":"5349"},"m_DexBonusLimiters":null,"m_DexBonus":{"$id":"5353","ModDescriptor":"DexterityBonus","StackMode":"Default","ModValue":0,"Source":null,"SourceComponent":null,"ItemSource":null},"Type":"AC","m_BaseValue":10,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":10,"PersistentModifierList":[{"$ref":"5353"},{"$id":"5354","ModDescriptor":"Size","StackMode":"Default","ModValue":0,"Source":null,"SourceComponent":null,"ItemSource":null}]},"AdditionalAttackBonus":{"$id":"5355","Type":"AdditionalAttackBonus","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":[{"$id":"5356","ModDescriptor":"Size","StackMode":"Default","ModValue":0,"Source":null,"SourceComponent":null,"ItemSource":null}]},"AdditionalDamage":{"$id":"5357","Type":"AdditionalDamage","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null},"BaseAttackBonus":{"$id":"5358","Type":"BaseAttackBonus","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null},"AttackOfOpportunityCount":{"$id":"5359","Type":"AttackOfOpportunityCount","m_BaseValue":1,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":1,"PersistentModifierList":null},"Speed":{"$id":"5360","Type":"Speed","m_BaseValue":30,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":30,"PersistentModifierList":null},"Charisma":{"$id":"5361","m_Disabled":{"$id":"5362","m_Count":0},"Type":"Charisma","m_BaseValue":10,"m_Dependents":[{"$id":"5363","$type":"Kingmaker.EntitySystem.Stats.ModifiableValueSkill, Assembly-CSharp","BaseStat":{"$ref":"5361"},"ClassSkill":{"$id":"5364","m_Count":0},"Type":"SkillPersuasion","m_BaseValue":0,"m_Dependents":[{"$id":"5365","$type":"Kingmaker.EntitySystem.Stats.ModifiableValueDependant, Assembly-CSharp","BaseStat":{"$ref":"5363"},"Type":"CheckBluff","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null},{"$id":"5366","$type":"Kingmaker.EntitySystem.Stats.ModifiableValueDependant, Assembly-CSharp","BaseStat":{"$ref":"5363"},"Type":"CheckDiplomacy","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null},{"$id":"5367","$type":"Kingmaker.EntitySystem.Stats.ModifiableValueDependant, Assembly-CSharp","BaseStat":{"$ref":"5363"},"Type":"CheckIntimidate","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null}],"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null},{"$id":"5368","$type":"Kingmaker.EntitySystem.Stats.ModifiableValueSkill, Assembly-CSharp","BaseStat":{"$ref":"5361"},"ClassSkill":{"$id":"5369","m_Count":0},"Type":"SkillUseMagicDevice","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null}],"m_DependentFacts":null,"PermanentValue":10,"PersistentModifierList":null},"AdditionalCMB":{"$id":"5370","Type":"AdditionalCMB","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null},"AdditionalCMD":{"$id":"5371","Type":"AdditionalCMD","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null},"Constitution":{"$id":"5372","m_Disabled":{"$id":"5373","m_Count":0},"Type":"Constitution","m_BaseValue":10,"m_Dependents":[{"$ref":"5350"},{"$id":"5374","$type":"Kingmaker.EntitySystem.Stats.ModifiableValueSavingThrow, Assembly-CSharp","BaseStat":{"$ref":"5372"},"Type":"SaveFortitude","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null}],"m_DependentFacts":null,"PermanentValue":10,"PersistentModifierList":null},"Dexterity":{"$id":"5375","m_Disabled":{"$id":"5376","m_Count":0},"Type":"Dexterity","m_BaseValue":10,"m_Dependents":[{"$ref":"5352"},{"$id":"5377","$type":"Kingmaker.EntitySystem.Stats.ModifiableValueSavingThrow, Assembly-CSharp","BaseStat":{"$ref":"5375"},"Type":"SaveReflex","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null},{"$id":"5378","$type":"Kingmaker.EntitySystem.Stats.ModifiableValueSkill, Assembly-CSharp","BaseStat":{"$ref":"5375"},"ClassSkill":{"$id":"5379","m_Count":0},"Type":"SkillMobility","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null},{"$id":"5380","$type":"Kingmaker.EntitySystem.Stats.ModifiableValueSkill, Assembly-CSharp","BaseStat":{"$ref":"5375"},"ClassSkill":{"$id":"5381","m_Count":0},"Type":"SkillThievery","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null},{"$id":"5382","$type":"Kingmaker.EntitySystem.Stats.ModifiableValueSkill, Assembly-CSharp","BaseStat":{"$ref":"5375"},"ClassSkill":{"$id":"5383","m_Count":0},"Type":"SkillStealth","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":[{"$id":"5384","ModDescriptor":"Size","StackMode":"Default","ModValue":0,"Source":null,"SourceComponent":null,"ItemSource":null}]},{"$id":"5385","$type":"Kingmaker.EntitySystem.Stats.ModifiableValueInitiative, Assembly-CSharp","m_Dexterity":{"$ref":"5375"},"m_DexBonus":{"$id":"5386","ModDescriptor":"DexterityBonus","StackMode":"Default","ModValue":0,"Source":null,"SourceComponent":null,"ItemSource":null},"Type":"Initiative","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":[{"$ref":"5386"}]}],"m_DependentFacts":null,"PermanentValue":10,"PersistentModifierList":null},"Intelligence":{"$id":"5387","m_Disabled":{"$id":"5388","m_Count":0},"Type":"Intelligence","m_BaseValue":10,"m_Dependents":[{"$id":"5389","$type":"Kingmaker.EntitySystem.Stats.ModifiableValueSkill, Assembly-CSharp","BaseStat":{"$ref":"5387"},"ClassSkill":{"$id":"5390","m_Count":0},"Type":"SkillKnowledgeArcana","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null},{"$id":"5391","$type":"Kingmaker.EntitySystem.Stats.ModifiableValueSkill, Assembly-CSharp","BaseStat":{"$ref":"5387"},"ClassSkill":{"$id":"5392","m_Count":0},"Type":"SkillKnowledgeWorld","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null}],"m_DependentFacts":null,"PermanentValue":10,"PersistentModifierList":null},"Owner":{"$ref":"5"},"SaveFortitude":{"$ref":"5374"},"SaveReflex":{"$ref":"5377"},"SaveWill":{"$id":"5393","BaseStat":{"$id":"5394","m_Disabled":{"$id":"5395","m_Count":0},"Type":"Wisdom","m_BaseValue":10,"m_Dependents":[{"$ref":"5393"},{"$id":"5396","$type":"Kingmaker.EntitySystem.Stats.ModifiableValueSkill, Assembly-CSharp","BaseStat":{"$ref":"5394"},"ClassSkill":{"$id":"5397","m_Count":0},"Type":"SkillPerception","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null},{"$id":"5398","$type":"Kingmaker.EntitySystem.Stats.ModifiableValueSkill, Assembly-CSharp","BaseStat":{"$ref":"5394"},"ClassSkill":{"$id":"5399","m_Count":0},"Type":"SkillLoreNature","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null},{"$id":"5400","$type":"Kingmaker.EntitySystem.Stats.ModifiableValueSkill, Assembly-CSharp","BaseStat":{"$ref":"5394"},"ClassSkill":{"$id":"5401","m_Count":0},"Type":"SkillLoreReligion","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null}],"m_DependentFacts":null,"PermanentValue":10,"PersistentModifierList":null},"Type":"SaveWill","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null},"SkillMobility":{"$ref":"5378"},"SkillAthletics":{"$id":"5402","BaseStat":{"$id":"5403","m_Disabled":{"$id":"5404","m_Count":0},"Type":"Strength","m_BaseValue":10,"m_Dependents":[{"$ref":"5402"}],"m_DependentFacts":null,"PermanentValue":10,"PersistentModifierList":null},"ClassSkill":{"$id":"5405","m_Count":0},"Type":"SkillAthletics","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null},"SkillKnowledgeArcana":{"$ref":"5389"},"SkillLoreNature":{"$ref":"5398"},"SkillPerception":{"$ref":"5396"},"SkillThievery":{"$ref":"5380"},"Strength":{"$ref":"5403"},"Wisdom":{"$ref":"5394"},"Initiative":{"$ref":"5385"},"SkillPersuasion":{"$ref":"5363"},"SkillStealth":{"$ref":"5382"},"SkillUseMagicDevice":{"$ref":"5368"},"SkillLoreReligion":{"$ref":"5400"},"SkillKnowledgeWorld":{"$ref":"5391"},"CheckBluff":{"$ref":"5365"},"CheckDiplomacy":{"$ref":"5366"},"CheckIntimidate":{"$ref":"5367"},"SneakAttack":{"$id":"5406","Type":"SneakAttack","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":null},"Reach":{"$id":"5407","Type":"Reach","m_BaseValue":0,"m_Dependents":null,"m_DependentFacts":null,"PermanentValue":0,"PersistentModifierList":[{"$id":"5408","ModDescriptor":"Size","StackMode":"Default","ModValue":5,"Source":null,"SourceComponent":null,"ItemSource":null}]}}`;

window.onload = () => {
    let firstFile, secondFile;

    // Cache the selectors
    const firstFileInput = document.querySelectorAll(".first-file-input")[0];
    const secondFileInput = document.querySelectorAll(".second-file-input")[0];
    const firstDownloadButton = document.querySelectorAll(".first-download-btn")[0];
    const secondDownloadButton = document.querySelectorAll(".second-download-btn")[0];

    // Fallback to local storage
    characterDataMap = localStorage.getItem("characterDataMap");

    firstFileInput.onchange = (event) => {
        firstFile = event.target.files[0];
    };

    secondFileInput.onchange = (event) => {
        secondFile = event.target.files[0];
    };

    firstDownloadButton.onclick = (event) => {
        event.stopPropagation();
        event.preventDefault();

        readAndDownloadFirstSave(firstFile);
    };

    secondDownloadButton.onclick = (event) => {
        event.stopPropagation();
        event.preventDefault();

        readAndDownloadSecondSave(secondFile);
    };
};

/**
 * Reads and downloads the first modified save with the `Recreate` prop as true on all characters
 * This is then returned back to the user as `Temp_Respec.zks`.
 *
 * @param {Blob} file
 * @returns {PromiseLike<*[] | never>}
 */
const readAndDownloadFirstSave = (file) => {
    const reader = new JSZip();

    return reader.loadAsync(file)
        .then(() => {
            return Promise.all([
                reader.file("header.json").async("string"),
                reader.file("party.json").async("string"),
            ]);
        })
        .then(([headerData, partyData]) => {
            const parsedHeader = Object.assign({}, JSON.parse(headerData), { Name: "Temp Respec" });
            const parsedParty = JSON.parse(partyData);

            characterDataMap = getCharacterDataMap(parsedParty);
            _.forEach(characterDataMap, ({ character, descriptor }) => {
                if (!descriptor.IsEssentialForGame) {
                    descriptor.Recreate = true;
                    return;
                }

                resetMainCharacterDescriptor(descriptor);
            });

            // Store loaded data
            localStorage.setItem("characterDataMap", characterDataMap);

            reader.file('header.json', JSON.stringify(parsedHeader));
            reader.file('party.json', JSON.stringify(parsedParty));

            return reader.generateAsync({ type: "blob" });
        })
        .then((blob) => {
            saveAs(blob, "Temp_Respec.zks");
        });
};

/**
 * Reads and downloads the second modified save with the correct experience and alignment on all characters.
 * This is then returned back to the user as `Respec.zks`.
 *
 * @param {Blob} file
 * @returns {PromiseLike<*[] | never>}
 */
const readAndDownloadSecondSave = (file) => {
    const reader = new JSZip();

    return reader.loadAsync(file)
        .then(() => {
            return Promise.all([
                reader.file("header.json").async("string"),
                reader.file("party.json").async("string"),
            ]);
        })
        .then(([headerData, partyData]) => {
            const parsedHeader = Object.assign({}, JSON.parse(headerData), { Name: "Respec" });
            const parsedParty = JSON.parse(partyData);

            updateCharacterDataMap(getCharacterDataMap(parsedParty), characterDataMap);

            reader.file('header.json', JSON.stringify(parsedHeader));
            reader.file('party.json', JSON.stringify(parsedParty));

            return reader.generateAsync({ type: "blob" });
        })
        .then((blob) => {
            saveAs(blob, "Respec.zks");
        });
};

/**
 * Updates a given characterDataMap based upon an old version of the same structure.
 *
 * @param {Object} newCharacterDataMap
 * @param {Object} oldCharacterDataMap
 * @returns {*}
 */
const updateCharacterDataMap = (newCharacterDataMap, oldCharacterDataMap) => {
    const bumpByNumber = 1000000000;

    _.forEach(newCharacterDataMap, ({ character, descriptor }, key) => {
        if (!oldCharacterDataMap[key]) {
            return;
        }

        const oldDescriptor = oldCharacterDataMap[key].descriptor;

        descriptor.Progression.Experience = oldDescriptor.Progression.Experience;

        descriptor.Alignment.Vector = Object.assign({}, oldDescriptor.Alignment.Vector);
        descriptor.Alignment.m_History = _.map(oldDescriptor.Alignment.m_History, (event) => {
            return Object.assign({}, event, { "$id": event["$id"] + bumpByNumber });
        });
    });

    return newCharacterDataMap;
};

/**
 * Returns the character data map retrieved from the passed parsed party object.
 * @param {Object} partyObject
 */
const getCharacterDataMap = (partyObject) => {
    const itemIdMap = getItemIdMap(partyObject);
    const controllableCharacterMap = _.filter(itemIdMap, (item) => {
        return item.m_GroupId && item.m_GroupId === "<directly-controllable-unit>";
    });

    const characterDataMap = {};
    _.forEach(controllableCharacterMap, (character) => {
        const descriptor = character.Descriptor["$id"]
            ? character.Descriptor
            : itemIdMap[character.Descriptor["$ref"]];

        if (characterDataMap[character.UniqueId]) {
            return;
        }

        characterDataMap[character.UniqueId] = { character, descriptor };
    });

    return characterDataMap;
};

/**
 * Returns a global map of the party object items indexed by id;
 * @param {Object} partyObject
 */
const getItemIdMap = (partyObject) => {
    const itemIdMap = {};
    recursivelyMapItemIds(itemIdMap, partyObject);

    return itemIdMap;
};

/**
 * Recursively maps the values to the passed itemIdMap.
 *
 * @param {Object} itemIdMap
 * @param {*} value
 */
const recursivelyMapItemIds = (itemIdMap, value) => {
    if (_.isArray(value)) {
        _.forEach(value, recursivelyMapItemIds.bind(null, itemIdMap));
        return;
    }

    if (_.isObject(value)) {
        if (value["$id"]) {
            itemIdMap[value["$id"]] = value;
        }

        _.forEach(value, recursivelyMapItemIds.bind(null, itemIdMap));
    }
};

/**
 * Resets the passed descriptor for the main character.
 * Should also work for custom characters (albeit unecessary).
 *
 * @param {Object} descriptor
 */
const resetMainCharacterDescriptor = (descriptor) => {
    descriptor.Abilities.m_Facts = [];
    descriptor.ActivatableAbilities.m_Facts = [];
    descriptor.Proficiencies.m_ArmorProficiencies.m_Data = [];
    descriptor.Proficiencies.m_WeaponProficiencies.m_Data = [];
    descriptor.Progression.characterLevel = 0;
    descriptor.Progression.ClassSkills = [];
    descriptor.Progression.Classes = [];
    descriptor.Progression.Features.m_Facts = [];
    descriptor.Progression.TotalIntelligenceSkillPoints = 0;
    descriptor.Progression.m_LevelPlans = [];
    descriptor.Progression.m_Progressions = [];
    descriptor.Progression.m_Selections = [];
    descriptor.Resources.PersistantResources = [];
    descriptor.UISettings.Slots = null;
    descriptor.UISettings.m_AlreadyAutomaniclyAdded = [];
    descriptor.Doll = null;
    descriptor.m_Spellbooks = [];
    descriptor.Stats = JSON.parse(baseStats);

    recursiveBumpStatIds(descriptor, descriptor.Stats);
};

/**
 * Recursively bumps ids for stats in order to use character baseline in respec.
 *
 * @param {Object} descriptor
 * @param {*} value
 * @param {String} [key]
 */
const recursiveBumpStatIds = (descriptor, value, key) => {
    const bumpByNumber = 100000000;

    if (_.isArray(value)) {
        _.forEach(value, recursiveBumpStatIds.bind(null, descriptor));
        return;
    }

    if (!_.isObject(value)) {
        return;
    }

    if (key && key === "Owner") {
        value["$ref"] = descriptor["$id"];
    } else if (value["$id"]) {
        value["$id"] = value["$id"] + bumpByNumber;
    } else if (value["$ref"]) {
        value["$ref"] = value["$ref"] + bumpByNumber;
    }

    _.forEach(value, recursiveBumpStatIds.bind(null, descriptor));
};
