/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, {useEffect} from 'react';
import { connect } from 'react-redux';

import { createSelector } from 'reselect';
import {Glyphicon, Button, MenuItem} from 'react-bootstrap';
import { get, isNil } from 'lodash';

import { createPlugin } from '../utils/PluginsUtils';
import {getExtentFromViewport} from "../utils/CoordinatesUtils";
import ConfirmButton from '../components/buttons/ConfirmButton';
import Dialog from '../components/misc/Dialog';
import Message from './locale/Message';
import BookmarkList from '../components/mapcontrols/searchbookmarkconfig/BookmarkList';
import AddNewBookmark from '../components/mapcontrols/searchbookmarkconfig/AddNewBookmark';

import {toggleControl} from '../actions/controls';
import {changeActiveSearchTool} from '../actions/search';
import {setSearchBookmarkConfig, resetBookmarkConfig, updateBookmark, filterBookmarks} from '../actions/searchbookmarkconfig';
import searchbookmarkconfig from '../reducers/searchbookmarkconfig';
import {mapInfoSelector, mapSelector} from '../selectors/map';
import {isLoggedIn, isAdminUserSelector} from '../selectors/security';

const SearchByBookmarkPanel = (props) => {
    const { enabled, pages, page,
        onPropertyChange,
        bookmark,
        bookmarkSearchConfig = {},
        editIdx,
        zoomOnSelect = true,
        bookmarkEditing = "EDIT",
        allowUser
    } = props;

    useEffect(()=>{
        onPropertyChange("zoomOnSelect", zoomOnSelect);
        onPropertyChange("bookmarkEditing", bookmarkEditing);
    }, [onPropertyChange]);

    useEffect(()=>{
        onPropertyChange("allowUser", allowUser);
    }, [allowUser]);

    const onClose = () => {
        props.toggleControl("searchBookmarkConfig");
        props.resetBookmarkConfig();
    };

    const addBookmark = () => {
        onPropertyChange("bookmark", {});
        onPropertyChange("page", 1);
    };

    const prev = () => {
        if (page > 1) {
            onPropertyChange("page", page - 1);
        } else if (page === 1 ) {
            props.resetBookmarkConfig();
        }
    };

    const next = () => {
        if (page < pages.length - 1) {
            onPropertyChange("page", page + 1);
        }
    };

    const update = () => {
        const {layerVisibilityReload = false} = bookmark;
        props.updateBookmark({...bookmark, layerVisibilityReload}, editIdx);
    };

    const canProceed = () => {
        return pages[page].validate(bookmark);
    };

    const getTitleText = () => {
        const title = page === 0 ? "search.b_listpaneltitle" : "search.b_newpaneltitle";
        return <Message msgId={title} />;
    };

    const renderFooter = () => {
        if (page === 0) {
            return (
                <span role="footer">
                    <Button onClick={addBookmark} bsStyle="primary">
                        <Message msgId="search.addbtn" />
                    </Button>
                </span>);
        } else if (page === pages.length - 1) {
            return (
                <span role="footer">
                    <Button onClick={prev} bsStyle="primary">
                        <Message msgId="search.prevbtn" />
                    </Button>
                    <Button disabled={!canProceed()} onClick={update} bsStyle="success">
                        <Message msgId="search.savebtn" />
                    </Button>
                </span>);
        }
        return (
            <span role="footer">
                {page === 1 ? (
                    <ConfirmButton onConfirm={prev} bsStyle="primary"
                        confirming={{text: <Message msgId="search.cancelconfirm" />}}
                        text={(<Message msgId="search.cancelbtn" />)}/>
                ) : (
                    <Button onClick={prev} bsStyle="primary">
                        <Message msgId={page === 1 ? "search.cancelbtn" : "search.prevbtn"} />
                    </Button>)
                }
                <Button disabled={!canProceed()} onClick={next} bsStyle="primary">
                    <Message msgId="search.nextbtn" />
                </Button>
            </span>);
    };
    const Section = pages && pages[page] || null;
    return enabled ? (
        <Dialog id={"bookmark-panel-dialog"}  draggable  modal={false}>
            <span role="header" style={{display: "flex", justifyContent: "space-between"}}>
                <span>{getTitleText()}</span>
                {page === 0 && <button onClick={onClose} className="close"> <Glyphicon glyph="1-close"/></button>}
            </span>
            <div role="body" className="services-config-editor">
                <Section.Element
                    bookmarks={bookmarkSearchConfig.bookmarks}
                    onPropertyChange={onPropertyChange}
                    bookmark={bookmark}
                    {...props}/>
            </div>
            {renderFooter()}
        </Dialog>
    ) : null;

};

/**
 * Check whether the user has required permission for bookmark feature
 * @ignore
 * @param {string} bookmarkEditing user role allowed
 * @param {bool} loggedIn check if the user is logged into mapstore
 * @param {bool} canEdit can user edit the map
 * @param {number} id map id to check for new/existing map
 * @param {bool} isAdmin logged user is an admin user
 */
const isAllowedUser = (
    bookmarkEditing,
    loggedIn,
    {canEdit, id},
    isAdmin) => {
    const canEditMap = loggedIn && (canEdit || isNil(id));
    return  (bookmarkEditing === "ALL"
    || bookmarkEditing === "EDIT" && canEditMap
    || bookmarkEditing === "ADMIN" && isAdmin);
};

/**
 * Search by bookmark menu item for Search bar burgermenu
 * @ignore
 * @param {object} props Component props
 * @param {bool} props.show enable/disable bookmark menu item
 * @param {func} props.onClick toggle bookmark search
 * @param {bool} props.active name of the active search tool
 */
const BookmarkMenuItem = connect(createSelector([
    state => state?.search?.activeSearchTool || null,
    state => state?.searchbookmarkconfig || {}
], (searchTool, config, ) => ({
    active: searchTool === "bookmarkSearch",
    show: config?.allowUser || !!get(config, "bookmarkSearchConfig.bookmarks", []).length
})), {
    onClick: changeActiveSearchTool
})(({show, onClick, active}) => {
    return show ? (
        <MenuItem active={active} onClick={() => {
            onClick('bookmarkSearch');
            document.dispatchEvent(new MouseEvent('click'));
        }}>
            <Glyphicon glyph={"bookmark"}/> <Message msgId="search.searchByBookmark"/>
        </MenuItem>
    ) : null;
});

/**
 * Search by bookmark config for settings(configuration) button in Search bar
 * @ignore
 * @memberof SearchByBookmark plugin
 * @param {func} toggleConfig enable/disable bookmark config
 * @param {bool} enabled bookmark config toggle status
 * @param {string} activeTool name of the active search tool
 * @return {object} Bookmark configuration for search setting
 */
const searchByBookmarkConfig = (toggleConfig, enabled, activeTool) => ({
    onClick: () => {
        if (!enabled) {
            toggleConfig("searchBookmarkConfig");
        }
    },
    glyph: "cog",
    className: "square-button-md no-border ",
    tooltipId: "search.bookmarksettings",
    tooltipPosition: "bottom",
    bsStyle: "default",
    pullRight: true,
    visible: activeTool === "bookmarkSearch"
});

const selector = createSelector([
    mapSelector,
    state => state.controls || {},
    state => state.searchbookmarkconfig || {},
    isLoggedIn,
    isAdminUserSelector,
    mapInfoSelector
], (map, controls, bookmarkconfig, loggedIn, isAdmin, mapInfo = {}) => ({
    bbox: map && map.bbox && getExtentFromViewport(map.bbox),
    enabled: controls.searchBookmarkConfig && controls.searchBookmarkConfig.enabled || false,
    pages: [BookmarkList, AddNewBookmark],
    page: bookmarkconfig && bookmarkconfig.page || 0,
    bookmark: bookmarkconfig && bookmarkconfig.bookmark,
    bookmarkSearchConfig: bookmarkconfig && bookmarkconfig.bookmarkSearchConfig,
    editIdx: bookmarkconfig && bookmarkconfig.editIdx,
    filter: bookmarkconfig && bookmarkconfig.filter,
    allowUser: isAllowedUser(get(bookmarkconfig, "bookmarkEditing"), loggedIn, mapInfo, isAdmin)
}));

const SearchByBookmarkPlugin = connect(selector, {
    toggleControl,
    onPropertyChange: setSearchBookmarkConfig,
    resetBookmarkConfig,
    updateBookmark,
    onFilter: filterBookmarks})(SearchByBookmarkPanel);

/**
 * Bookmark search configuration Plugin. Allow to add and edit additional
 * bookmarks used by search by bookmark plugin. User has to
 * save the map to persist service changes.
 *
 * @name SearchByBookmark
 * @memberof plugins
 * @class
 * @param {bool} cfg.zoomOnSelect cfg.zoomOnSelect zooms to the extent on selecting a value from the bookmark drop down
 * rather than clicking search icon
 * @param {string} cfg.bookmarkEditing cfg.bookmarkEditing "ADMIN"|"EDIT"|"ALL" sets the user permission restriction
 * for bookmark edit feature
 * - "ADMIN": only admin can edit bookmarks
 * - "EDIT": only users with edit permission on the current map can edit bookmarks
 * - "ALL": everyone can edit bookmarks
 * @example
 * {
 *     cfg: {
 *         zoomOnSelect: true,
 *         bookmarkEditing: "ADMIN"
 *     }
 * }
 */
export default createPlugin('SearchByBookmark', {
    component: SearchByBookmarkPlugin,
    containers: {
        Search: {
            menuItem: BookmarkMenuItem,
            bookmarkConfig: searchByBookmarkConfig
        }
    },
    reducers: {
        searchbookmarkconfig
    }
});
