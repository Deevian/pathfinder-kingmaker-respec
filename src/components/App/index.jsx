import React, { Component, Fragment } from "react";
import { hot } from "react-hot-loader";
import saveAs from "file-saver";
import {
    forEach,
    isEmpty,
    map,
    omitBy,
} from "lodash";

import loadJSONFilesFromSave from "../../utils/loadJSONFilesFromSave";
import makeCancelable from "../../utils/makeCancelable";
import getCharacterMapFromItemMap from "../../utils/getCharacterMapFromItemMap";
import getItemMapFromData from "../../utils/getItemMapFromData";
import updateCharacterMap from "../../utils/updateCharacterMap";
import trimCharacterMap from "../../utils/trimCharacterMap";
import getItemToBlueprintMap from "../../utils/getItemToBlueprintMap";
import getCharacterName from "../../utils/getCharacterName";

import {
    containerCSSClass,
    containerLoadingCSSClass,
    titleCSSClass,
    fileDownloadCSSClass,
    filePathCSSClass,
    fileInputCSSClass,
    descriptionCSSClass,
    firstDownloadCSSClass,
    githubLogoCSSClass,
    characterListCSSClass,
} from "./styles";

/**
 * App
 *
 * Base application component.
 * Contains the main view logic for the respec tool.
 */
class App extends Component {
    /**
     * Initializes the application state.
     */
    constructor() {
        super();

        const storedCharacterMap = localStorage.getItem("characterMap");
        const storedItemToBlueprintMap = localStorage.getItem("itemToBlueprintMap");

        this.state = {
            characterMap: storedCharacterMap && JSON.parse(storedCharacterMap),
            itemToBlueprintMap: storedItemToBlueprintMap && JSON.parse(storedItemToBlueprintMap),

            itemMap: undefined,
            loadFirstFilePromise: undefined,
            loadSecondFilePromise: undefined,

            isLoading: false,
        };

        this.characterCheckboxes = {};

        this.onChangeFirstFile = this.onChangeFirstFile.bind(this);
        this.onChangeSecondFile = this.onChangeSecondFile.bind(this);
        this.readAndDownloadFirstSave = this.readAndDownloadFirstSave.bind(this);
        this.readAndDownloadSecondSave = this.readAndDownloadSecondSave.bind(this);
    }

    /**
     * Handles the loading of the first save file.
     * @param {Event} event
     */
    onChangeFirstFile(event) {
        if (this.state.loadFirstFilePromise) {
            this.state.loadFirstFilePromise.cancel();
        }

        const loadFirstFilePromise = makeCancelable(loadJSONFilesFromSave(event.target.files[0]));

        loadFirstFilePromise.promise.then(([, , partyData]) => {
            const itemMap = getItemMapFromData(partyData);
            const characterMap = getCharacterMapFromItemMap(itemMap);
            const itemToBlueprintMap = getItemToBlueprintMap(itemMap);

            this.setState({ characterMap, itemMap, itemToBlueprintMap });
        });

        this.setState({ loadFirstFilePromise });
    }

    /**
     * Handles the loading of the second save file.
     * @param {Event} event
     */
    onChangeSecondFile(event) {
        if (this.state.loadSecondFilePromise) {
            this.state.loadSecondFilePromise.cancel();
        }


        this.setState({
            loadSecondFilePromise: makeCancelable(loadJSONFilesFromSave(event.target.files[0])),
        });
    }

    /**
     * Reads and downloads the first modified save with the `Recreate` prop as true on all characters
     * This is then returned back to the user as `Temp_Respec.zks`.
     *
     * @param {Event} event
     * @returns {Promise | null}
     */
    readAndDownloadFirstSave(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!this.state.loadFirstFilePromise) {
            // eslint-disable-next-line no-alert
            alert("You need to select a file first!");
            return null;
        }

        return this.state.loadFirstFilePromise.promise
            .then(([reader, headerData, partyData]) => {
                const characterMap = omitBy(this.state.characterMap, (characterArray, blueprint) => {
                    return !this.characterCheckboxes[blueprint].checked;
                });

                if (isEmpty(characterMap)) {
                    // eslint-disable-next-line no-alert
                    alert("You need to respec at least one character!");
                    return null;
                }


                forEach(characterMap, (characterArray) => {
                    forEach(characterArray, (descriptor) => {
                        // eslint-disable-next-line no-param-reassign
                        descriptor.Recreate = true;
                    });
                });

                // eslint-disable-next-line react/no-access-state-in-setstate
                const trimmedCharacterMap = trimCharacterMap(characterMap, this.state.itemMap);

                localStorage.setItem("itemToBlueprintMap", JSON.stringify(this.state.itemToBlueprintMap));
                localStorage.setItem("characterMap", JSON.stringify(trimmedCharacterMap));

                this.setState({ isLoading: true });

                reader.file("header.json", JSON.stringify(Object.assign({}, headerData, { Name: "Temp Respec" })));
                reader.file("party.json", JSON.stringify(partyData));

                return reader.generateAsync({ type: "blob" });
            })
            .then((blob) => saveAs(blob, "Temp_Respec.zks"))
            .then(() => this.setState({ isLoading: false }));
    }

    /**
     * Reads and downloads the second modified save with the correct experience and alignment on all characters.
     * This is then returned back to the user as `Respec.zks`.
     *
     * @param {Event} event
     * @returns {Promise | null}
     */
    readAndDownloadSecondSave(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!this.state.characterMap) {
            // eslint-disable-next-line no-alert
            alert("You need to do select and download your first save file first!");
            return null;
        }

        if (!this.state.loadSecondFilePromise) {
            // eslint-disable-next-line no-alert
            alert("You need to select a file first!");
            return null;
        }

        return this.state.loadSecondFilePromise.promise
            .then(([reader, headerData, partyData]) => {
                const itemMap = getItemMapFromData(partyData);
                const characterMap = getCharacterMapFromItemMap(itemMap);

                updateCharacterMap(characterMap, this.state.characterMap, this.state.itemToBlueprintMap);
                this.setState({ isLoading: true });

                reader.file("header.json", JSON.stringify(Object.assign({}, headerData, { Name: "Respec" })));
                reader.file("party.json", JSON.stringify(partyData));

                return reader.generateAsync({ type: "blob" });
            })
            .then((blob) => saveAs(blob, "Respec.zks"))
            .then(() => this.setState({ isLoading: false }));
    }

    /**
     * Renders the application DOM.
     * @returns {*}
     */
    render() {
        return (
            <div className={`${containerCSSClass} ${this.state.isLoading ? containerLoadingCSSClass : ""}`}>
                <h2 className={titleCSSClass}>
                    Pathfinder Kingmaker Respec Tool
                    <a
                        href="https://github.com/Deevian/pathfinder-kingmaker-respec"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img
                            src="https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png"
                            alt="GitHub Logo"
                            className={githubLogoCSSClass}
                            height="30px"
                            width="30px"
                        />
                    </a>
                </h2>
                <section className={descriptionCSSClass}>
                    <p>
                        Hi! If you're here, you've already noticed that, unfortunately, Pathfinder Kingmaker does not
                        support character respeccing.
                        In order to get around that, I've built a small, crude tool that allows you to modify your save
                        files and manually force the respec
                        of all your characters.
                    </p>
                    <p>
                        This is very experimental, so before you do anything, and for the love of god, <b><u>BACKUP YOUR SAVES!</u></b>
                    </p>
                    <p>
                        Also, heads up, there's a bit of an issue that I haven't been able to fix where your main
                        character will lose his / her appearance and will show a blank portrait on first load.
                        This should go away after save and reload, but you won't be able to see the appearance of your
                        character during the respec. Hope you're lucky!
                    </p>
                    <p>
                        ...also, try not to break the tool. Because it'll probably break. Heh.
                    </p>
                    <p>
                        Anyway, on with it. Here are the instructions on how to use this (this was made for Windows, so
                        YMMV):
                    </p>
                    <ol>
                        <li>
                            <p>
                                Store all your items (including those you have equipped) somewhere. You can use the
                                storage in the Capital, Oleg's second story chest, or even the floor, if you're a
                                masochist.
                            </p>
                            <p>
                                <b>If you do not do this, you WILL lose all your items.</b>
                            </p>
                        </li>
                        <li>Save your game.</li>
                        <li>
                            <p>
                                <label htmlFor="first-file">
                                    Select the save file you want to change.
                                </label>
                            </p>
                            <p>
                                <input
                                    id="first-file"
                                    className={`${fileInputCSSClass} first-file-input`}
                                    type="file"
                                    accept=".zks"
                                    onChange={this.onChangeFirstFile}
                                />
                            </p>
                            <p>If you don't know where it is, try here:</p>
                            <pre className={filePathCSSClass}>
                                %systemdrive%\users\%username%\AppData\LocalLow\Owlcat Games\Pathfinder Kingmaker\Saved Games
                            </pre>
                        </li>
                        <li>
                            {this.state.itemMap && this.state.characterMap ? (
                                <div>
                                    Choose the characters you want to respec:
                                    <ul className={characterListCSSClass}>
                                        {map(this.state.characterMap, (characterArray, blueprint) => (
                                            <li key={blueprint}>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        ref={(el) => this.characterCheckboxes[blueprint] = el}
                                                    /> {getCharacterName(characterArray[0])}
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : <i>Waiting for save file to load current party...</i>}

                        </li>
                        <Fragment>
                            <li>
                                <a
                                    className={`${fileDownloadCSSClass} ${firstDownloadCSSClass}`}
                                    href="#"
                                    onClick={this.readAndDownloadFirstSave}
                                >
                                    Press here to change and download your new save file.
                                </a> Store it in the same folder as the previous one.
                            </li>
                            <li>
                                Start your game and load the save named "Temp Respec". Your character should have a white
                                portrait.
                            </li>
                            <li>
                                To keep your alignment changes, level up your main character up to level 1.
                            </li>
                            <li>
                                Save your game again.
                            </li>
                            <li>
                                <p>
                                    <label htmlFor="second-file">
                                        Select the new save file you've created. Same place as before.
                                    </label>
                                </p>
                                <p>
                                    <input
                                        id="second-file"
                                        className={`${fileInputCSSClass} second-file-input`}
                                        type="file"
                                        accept=".zks"
                                        onChange={this.onChangeSecondFile}
                                    />
                                </p>
                            </li>
                        </Fragment>
                        <Fragment>
                            <li>
                                <a
                                    className={fileDownloadCSSClass}
                                    href="#"
                                    onClick={this.readAndDownloadSecondSave}
                                >
                                    Press here to change and download your final save file.
                                </a> Store it in the same folder as before.
                            </li>
                            <li>You're done! Load the save named "Respec" and respec away!</li>
                        </Fragment>
                    </ol>
                </section>
            </div>
        );
    }
}

export default hot(module)(App);
