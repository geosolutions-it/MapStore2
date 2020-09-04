/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {get, find, findIndex, isEqual, uniq} from 'lodash';
import { Controls, getEffectivePath } from '../utils/GeoStoryUtils';
import { SectionTypes, findSectionIdFromColumnId } from './../utils/GeoStoryUtils';
import { isAdminUserSelector } from './security';
import {pathnameSelector} from "./router";
/**
 * Returns a selector using a path inside the current story
 * @param {string} path the path
 * @returns {function} selector that returns the item at the provided path.
 */
export const createPathSelector = path => state => get(state, getEffectivePath(`geostory.currentStory.${path}`, state), "");
/**
 * return the current status of cardPreview, if true, the preview will appear in the builder
 */
export const isCollapsedSelector = state => get(state, "geostory.isCollapsed", false);
/**
 * gets the currentStory from the state
 * @returns {object} the object the represents the state
 */
export const currentStorySelector = state => get(state, "geostory.currentStory");
/**
 * gets the current story page information (sectionId)
 * @param {object} state the application state
 */
export const currentPageSelector = state => get(state, 'geostory.currentPage', {});
/**
 * gets the current mode (view, edit) from the state
 * @returns {string} current mode. One of "view" / "edit"
 */
export const modeSelector = state => get(state, "geostory.mode");

/**
 * Create a selector for the given control
 * @param {string} control the control name
 */
export const controlSelectorCreator = control => state => get(state, `geostory.controls.${control}`);

/**
 * Gets the state of the save dialog ("save" or "saveAs" values typically identify what window is open)
 * @param {object} state the application state
 */
export const saveDialogSelector = state => controlSelectorCreator(Controls.SHOW_SAVE)(state);

/**
 * Gets the resource for geostory (contains authorization and other useful information)
 * **NOTE** don't confuse this with the story resources. This is the single resource
 * of the whole geostory, containing permissions, id, and so on (e.g. the GeoStore resource)
 * @param {object} state application state
 */
export const resourceSelector = state => get(state, 'geostory.resource');
/**
 * Selects the edit permission of the resource
 * @param {object} state the application state
 */
export const canEditSelector = state => get(resourceSelector(state), 'canEdit', false);
/**
 * Get id of current story
 * @param {object} state the application state
 */
export const geostoryIdSelector = state => get(resourceSelector(state), 'id');
/**
 * Selects the edit permission of the resource
 * @param {object} state the application state
 */
export const isEditAllowedSelector = state => canEditSelector(state) || isAdminUserSelector(state);
/**
 * Selects the loading state of geostory.
 * @param {object} state the application state
 */
export const loadingSelector = state => get(state, 'geostory.loading');
/**
 * Selects the errors container for geostory state
 * @param {object} state app state
 */
export const errorsSelector = state => get(state, 'geostory.errors');
/**
 * Selects the error(s) of save operation of a geostory
 * @param {object} state the application state
 */
export const saveErrorSelector = state => get(errorsSelector(state), 'save');
/**
 * @returns the sections array of the current story
 */
export const sectionsSelector = state => get(currentStorySelector(state), "sections", []);
/**
 * @returns the status of toolbar, if true is enabled and usable, otherwise it is disabled i.e. non clickable
 */
export const isToolbarEnabledSelector = state => sectionsSelector(state).length > 0;
/**
 * @returns the status of settings panel, if true is visible
 */
export const isSettingsEnabledSelector = state => get(state, "geostory.isSettingsEnabled", false);
/**
 * @returns the settings of the story
 */
export const settingsSelector = state => {
    // the expanded items are calculated based on checked ones
    const settings = get(currentStorySelector(state), "settings", {});
    const immSections = sectionsSelector(state).filter(({type}) => type === SectionTypes.IMMERSIVE);
    const checked = settings.checked || [];
    const expanded = uniq(checked.map(chId => findSectionIdFromColumnId(immSections, chId)).filter(i => i));
    return {...settings, expanded};
};
/**
 * @returns the checked items in settings of the story
 */
export const settingsCheckedSelector = state => get(settingsSelector(state), "checked", []);
/**
 * @returns the checked elements in the settings
 */
export const visibleItemsSelector = state => get(settingsSelector(state), "checked", []).reduce((p, c) => ({...p, [c]: true}), {});
/**
 * @returns old settings
 */
export const oldSettingsSelector = state => get(state, "geostory.oldSettings", {});
/**
 * @returns the status if settings has changed
 */
export const settingsChangedSelector = state => !isEqual(get(currentStorySelector(state), "settings", {}), oldSettingsSelector(state));
/**
 * @returns the selectedCard
 */
export const selectedCardSelector = state => get(state, "geostory.selectedCard", "");
/**
 * Returns a selector for the section with the provided ID.
 * @param {string} id the ID of the section to get
 * @returns {function} selector that returns the section with the provided ID.
 */
export const sectionSelectorCreator = id => state => find(sectionsSelector(state), {id});
/**
 * Returns a selector for the section at the provided index
 * @param {number} index the index of the section to get
 * @returns {function} selector that returns the section at the provided index.
 */
export const sectionAtIndexSelectorCreator = index => state => (sectionsSelector(state) || [])[index];
/**
 * Returns a selector that fetches resourceId from a path inside the current story
 * @param {string} path the path
 * @returns {function} selector that returns the resourceId at the provided path.
 */
export const resourceIdSelectorCreator = path => state => createPathSelector(`${path}.resourceId`)(state);
/**
 * Returns a selector for the resources of the currentStory
 * @param {object} state
 * @returns {function} selector
 */
export const resourcesSelector = state => get(currentStorySelector(state), "resources", []);
/**
 * gets the resource specified by id among resources of the currentStory
 * @param {string} id
 * @returns {function} function that returns a selector
 */
export const resourceByIdSelectorCreator = id => state => find(resourcesSelector(state), {id});
/**
 * gets the total number of sections
 * @returns {function} function that returns a selector
 */
/**
  * it creates a single array of sections and their contents,
  * with special behaviour for paragraph where column is ignored
  * @prop {object} options to configure how the items will be returned
  * @prop {boolean} options.withImmersiveSection to include or not the immersive section item
  * @prop {boolean} options.includeAlways itf true, the item will be included in the list, if not it will be checked
  */
export const navigableItemsSelectorCreator = ({withImmersiveSection = false, includeAlways = true} = {}) => state => {
    const sections = sectionsSelector(state);
    const visibleItems = visibleItemsSelector(state);
    return sections.reduce((p, c) => {
        if (c.type === SectionTypes.TITLE && (includeAlways || visibleItems[c.id])) {
            // include only the section
            return [...p, c];
        }
        if (c.type === SectionTypes.PARAGRAPH && (includeAlways || visibleItems[c.id])) {
            // include only the section
            return [...p, c];
        }
        if (c.type === SectionTypes.BANNER && (includeAlways || visibleItems[c.id])) {
            // include only the section
            return [...p, c];
        }
        if (c.type === SectionTypes.IMMERSIVE) {
            // include immersive sections || contents
            const allImmContents = c.contents && c.contents.reduce((pImm, column) => {
                if (includeAlways || visibleItems[column.id]) {
                    return [ ...pImm, {...column, sectionId: pImm.id}];
                }
                return pImm;
            }, []) || [];
            if (withImmersiveSection) {
                return [ ...p, c, ...allImmContents];
            }
            return [...p, ...allImmContents];
        }
        return p;
    }, []);
};

/**
 * gets the current position of currentPage
 * @returns {function} function that returns a selector
 */
export const totalItemsSelector = state => navigableItemsSelectorCreator({includeAlways: true})(state).length;
export const currentPositionSelector = state => findIndex(navigableItemsSelectorCreator({includeAlways: true})(state), {
    id: currentPageSelector(state).columns &&
        currentPageSelector(state).columns[currentPageSelector(state).sectionId]
        ? currentPageSelector(state).columns[currentPageSelector(state).sectionId]
        : currentPageSelector(state).sectionId || ""
});

/**
 * return if at least one content has its exclusive focus active
 * @param {object} state
 */
export const isFocusOnContentSelector = state => get(state, "geostory.focusedContent.target") !== undefined;
/**
 * return focused content
 * @param {object} state
 */
export const getFocusedContentSelector = state => get(state, "geostory.focusedContent");

/**
 * return current focused content obj
 * @param {object} state
 */
export const getCurrentFocusedContentEl = state =>  createPathSelector(get(state, "geostory.focusedContent.path", ""))(state);

/**
 * return the items to be shown in the checkbox tree in settings panel
 * @param {*} state application state
 */
export const settingsItemsSelector = state => {
    const sections = sectionsSelector(state);
    return sections.reduce((p, c) => {
        if (c.type === SectionTypes.IMMERSIVE) {
            const children = c.contents && c.contents.map((column) => {
                return {label: column.title || "", value: column.id};
            }) || [];
            return [ ...p, {label: c.title || "", value: c.id, children}];
        }
        return [...p, {label: c.title || "", value: c.id}];
    }, []);
};


/**
 * Traverse story elements tree checking if passed resource is used.
 * @param {*} rId Media resource id
 * @param {object} story content
 */
const findMediaResourceInContent = (rId, {contents, background, resourceId}) => {
    if (resourceId === rId) {
        return true;
    }
    if (background && background.resourceId === rId) {
        return true;
    }
    if (contents) {
        return !!find(contents, e => findMediaResourceInContent(rId, e));
    }
    return false;
};

/**
 * Return true if passed resource is used somewhere in the current story tree
 * @param {object*} state Application state
 * @param {*} resId Media resource id
 */
export const isMediaResourceUsed = (state, resId) => !!find(sectionsSelector(state), section => findMediaResourceInContent(resId, section));

/**
 * It checks if is a shared story or not
 * @param {object} state application state
 */
export const isSharedStory = (state = {}) => pathnameSelector(state).includes("geostory/shared");

export const hasPendingChanges = (state = {}) => state?.geostory?.pendingChanges;

/**
 * It checks if updateUrlOnScroll is on
 * @param {object} state application state
 */
export const updateUrlOnScrollSelector = state => get(state, 'geostory.updateUrlOnScroll', false);

/**
 * Gets the currentStoryFonts that were loaded from config
 * @param {object} state application state
 */
export const currentStoryFonts = state => get(state, "geostory.currentStory.settings.theme.fontFamilies", []);
