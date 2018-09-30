import JSZip from "jszip/dist/jszip.min";
import saveAs from "file-saver";
import _ from "lodash";
import "./styles.css";

// We save the character map from the first save to transfer stuff over to the second
let characterDataMap;

window.onload = () => {
    let firstFile, secondFile;

    // Cache the selectors
    const firstFileInput = document.querySelectorAll(".first-file-input")[0];
    const secondFileInput = document.querySelectorAll(".second-file-input")[0];
    const firstDownloadButton = document.querySelectorAll(".first-download-btn")[0];
    const secondDownloadButton = document.querySelectorAll(".second-download-btn")[0];

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
            _.forEach(characterDataMap, ({ character, descriptor }) => descriptor.Recreate = true);

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
