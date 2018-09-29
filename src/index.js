import JSZip from "jszip/dist/jszip.min";
import saveAs from "file-saver";
import "./styles.css";

// Saving alignment history from the first to the second save
let alignment;

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
 * This is then returned back to the user as `Respec.zks`.
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
            const parsedParty = recursiveFindKeyAndReplaceValue(JSON.parse(partyData), "Recreate", true);

            const totalExperienceInput = document.querySelectorAll(".total-experience-input")[0];
            totalExperienceInput.value = parsedParty.m_EntityData[0].Descriptor.Progression.Experience;

            alignment = parsedParty.m_EntityData[0].Descriptor.Alignment;

            reader.file('header.json', JSON.stringify(parsedHeader));
            reader.file('party.json', JSON.stringify(parsedParty));

            return reader.generateAsync({ type: "blob" });
        })
        .then((blob) => {
            saveAs(blob, "Temp_Respec.zks");
        });
};

/**
 * Reads and downloads the second modified save with the correct experience on all characters.
 * This is then returned back to the user as `Temp_Respec.zks`.
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
            const totalExperienceInput = document.querySelectorAll(".total-experience-input")[0];

            const parsedHeader = Object.assign({}, JSON.parse(headerData), { Name: "Respec" });
            const parsedParty = recursiveFindKeyAndReplaceValue(JSON.parse(partyData), "Experience", totalExperienceInput.value);
            const currentDescriptor = parsedParty.m_EntityData[0].Descriptor;

            currentDescriptor.Alignment = getAlignmentWithBumpedIds(alignment, currentDescriptor["$id"]);

            reader.file('header.json', JSON.stringify(parsedHeader));
            reader.file('party.json', JSON.stringify(parsedParty));

            return reader.generateAsync({ type: "blob" });
        })
        .then((blob) => {
            saveAs(blob, "Respec.zks");
        });
};

/**
 * Returns the passed alignment object with its ids bumped to avoid collision.
 *
 * @param {Object} alignment
 * @param {String} currentDescriptorId
 * @returns {Object}
 */
const getAlignmentWithBumpedIds = (alignment, currentDescriptorId) => {
    const bumpByNumber = 1000000000;
    const clonedAlignment = Object.assign({}, alignment);

    clonedAlignment["$id"] = clonedAlignment["$id"] + bumpByNumber;
    clonedAlignment.m_Owner["$ref"] = currentDescriptorId;

    clonedAlignment.m_History = clonedAlignment.m_History.map((event) => {
        return Object.assign({}, event, {
            "$id": event["$id"] + bumpByNumber
        });
    });

    return clonedAlignment;
};

/**
 * Recursively goes through an object and finds all matches of a given key, replacing it with the passed value.
 *
 * @param {Object} rootObject
 * @param {String} key
 * @param {*} value
 * @returns {Object}
 */
const recursiveFindKeyAndReplaceValue = (rootObject, key, value) => {
    const keys = Object.keys(rootObject);
    const clonedRootObject = Object.assign({}, rootObject);

    keys.forEach((objectKey) => {
        if (objectKey === key) {
            clonedRootObject[objectKey] = value;
            return;
        }

        const objectValue = rootObject[objectKey];

        if (Array.isArray(objectValue)) {
            clonedRootObject[objectKey] = recursiveArrayFindKeyAndReplaceValue(objectValue, key, value);
            return;
        }

        if (typeof objectValue === "object" && objectValue !== null) {
            clonedRootObject[objectKey] = recursiveFindKeyAndReplaceValue(objectValue, key, value);
        }
    });

    return clonedRootObject;
};

/**
 * Recursively goes through an array and finds all matches of a given key, replacing it with the passed value.
 *
 * @param {Array} rootArray
 * @param {String} key
 * @param {*} value
 * @returns {Array}
 */
const recursiveArrayFindKeyAndReplaceValue = (rootArray, key, value) => {
    return rootArray.map((objectValue) => {
        if (Array.isArray(objectValue)) {
            return recursiveArrayFindKeyAndReplaceValue(objectValue, key, value);
        }

        if (typeof objectValue === "object" && objectValue !== null) {
            return recursiveFindKeyAndReplaceValue(objectValue, key, value);
        }

        return objectValue;
    });
};
