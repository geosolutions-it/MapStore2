/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from "expect";

import {
    LOAD_PERMALINK,
    LOAD_PERMALINK_ERROR,
    PERMALINK_LOADED,
    LOADING,
    RESET,
    SAVE_PERMALINK,
    UPDATE_SETTINGS,
    loadPermalink,
    loadPermalinkError,
    permalinkLoaded,
    permalinkLoading,
    resetPermalink,
    savePermalink,
    updatePermalinkSettings
} from "../permalink";

describe("Test correctness of the permalink actions", () => {
    it("loadPermalink", () => {
        const action = loadPermalink("test");
        expect(action.type).toBe(LOAD_PERMALINK);
        expect(action.id).toBe("test");
    });
    it("loadPermalinkError", () => {
        const error = {message: "error"};
        const action = loadPermalinkError(error);
        expect(action.type).toBe(LOAD_PERMALINK_ERROR);
        expect(action.error).toEqual(error);
    });
    it("permalinkLoaded", () => {
        const action = permalinkLoaded();
        expect(action.type).toBe(PERMALINK_LOADED);
    });
    it("permalinkLoading", () => {
        const action = permalinkLoading(true);
        expect(action.type).toBe(LOADING);
        expect(action.loading).toBeTruthy();
    });
    it("resetPermalink", () => {
        const action = resetPermalink();
        expect(action.type).toBe(RESET);
    });
    it("savePermalink", () => {
        const saveObj = {name: "test"};
        const action = savePermalink(saveObj);
        expect(action.type).toBe(SAVE_PERMALINK);
        expect(action.value).toEqual(saveObj);
    });
    it("updatePermalinkSettings", () => {
        const settings = {title: "test"};
        const action = updatePermalinkSettings(settings);
        expect(action.type).toBe(UPDATE_SETTINGS);
        expect(action.settings).toEqual(settings);
    });
});
