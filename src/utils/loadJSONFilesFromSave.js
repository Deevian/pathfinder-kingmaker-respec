import JSZip from "jszip/dist/jszip.min";
import { memoize } from "lodash";

/**
 * Loads the passed save file and handles the unzipping of the child JSON files.
 * This is also memoized to avoid re-loading the same save file multiple times.
 *
 * @param {Blob} file
 */
export default memoize((file) => {
    const reader = new JSZip();

    return reader.loadAsync(file)
        .then(() => Promise.all([
            reader,
            reader.file("header.json").async("string"),
            reader.file("party.json").async("string"),
        ]))
        .then(([r, headerData, partyData]) => [r, JSON.parse(headerData), JSON.parse(partyData)]);
}, (file) => `${file.name}_${file.lastModified}`);
