/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from "expect";
import {
    CREATE_NEW_MAP,
    createNewMap,
    HAS_CONTEXTS,
    hasContexts,
    SET_NEW_MAP_CONTEXT,
    setNewMapContext,
    SHOW_NEW_MAP_DIALOG,
    showNewMapDialog,
    LOADING,
    loading
} from "../createnewmap";

describe("createnewmap actions", () => {
    it("should create an action to show the new map dialog", () => {
        const show = true;
        const expectedAction = {
            type: SHOW_NEW_MAP_DIALOG,
            show
        };
        expect(showNewMapDialog(show)).toEqual(expectedAction);
    });

    it("should create an action to create a new map", () => {
        const context = { id: 1, name: "Test Context" };
        const openInNewTab = true;
        const expectedAction = {
            type: CREATE_NEW_MAP,
            context,
            openInNewTab
        };
        expect(createNewMap(context, openInNewTab)).toEqual(expectedAction);
    });

    it("should create an action to set hasContexts", () => {
        const value = true;
        const expectedAction = {
            type: HAS_CONTEXTS,
            value
        };
        expect(hasContexts(value)).toEqual(expectedAction);
    });

    it("should create an action to set a new map context", () => {
        const context = { id: 2, name: "Another Context" };
        const expectedAction = {
            type: SET_NEW_MAP_CONTEXT,
            context
        };
        expect(setNewMapContext(context)).toEqual(expectedAction);
    });

    it("should create an action to set loading state", () => {
        const value = true;
        const name = "loading";
        const expectedAction = {
            type: LOADING,
            name,
            value
        };
        expect(loading(value, name)).toEqual(expectedAction);
    });

    it("should create an action to set loading state with default name", () => {
        const value = false;
        const expectedAction = {
            type: LOADING,
            name: "loading",
            value
        };
        expect(loading(value)).toEqual(expectedAction);
    });
});
