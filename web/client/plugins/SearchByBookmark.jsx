import React from 'react';
import { createPlugin } from '../utils/PluginsUtils';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import MapUtils from "../utils/MapUtils";
const {Glyphicon, Button} = require('react-bootstrap');
const ConfirmButton = require('../components/buttons/ConfirmButton');
const Dialog = require('../components/misc/Dialog');
const Message = require('./locale/Message');
const {mapSelector} = require('../selectors/map');
const {toggleControl} = require('../actions/controls');
const {setSearchBookmarkConfig, resetBookmarkConfig, updateBookmark, filterBookmarks} = require('../actions/searchbookmarkconfig');
const BookmarkList = require('../components/mapcontrols/searchbookmarkconfig/BookmarkList').default;
const AddNewBookmark = require('../components/mapcontrols/searchbookmarkconfig/AddNewBookmark').default;

/**
 * Bookmark search configuration Plugin. Allow to add and edit additional
 * bookmarks used by search by bookmark plugin. User has to
 * save the map to persist service changes.
 *
 * @class SearchByBookmarkPanel
 * @memberof plugins
 * @static
 *
 */
const SearchByBookmarkPanel = (props) => {
    const { enabled, pages, page,
        onPropertyChange,
        bookmark,
        bookmarkSearchConfig = {},
        editIdx
    } = props;

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

// Search by bookmark menu item for Search bar
const searchMenuItem = (onClick, activeTool) => ({
    active: activeTool === "bookmarkSearch",
    onClick: () => onClick('bookmarkSearch'),
    glyph: "bookmark",
    text: <Message msgId="search.searchByBookmark"/>
});

// Search by bookmark config for settings(configuration) button in Search bar
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
    state => state.searchbookmarkconfig || {}
], (map, controls, bookmarkconfig) => ({
    bbox: map && map.bbox && MapUtils.getExtentFromViewport(map.bbox),
    enabled: controls.searchBookmarkConfig && controls.searchBookmarkConfig.enabled || false,
    pages: [BookmarkList, AddNewBookmark],
    page: bookmarkconfig && bookmarkconfig.page || 0,
    bookmark: bookmarkconfig && bookmarkconfig.bookmark,
    bookmarkSearchConfig: bookmarkconfig && bookmarkconfig.bookmarkSearchConfig,
    editIdx: bookmarkconfig && bookmarkconfig.editIdx,
    filter: bookmarkconfig && bookmarkconfig.filter
}));

const SearchByBookmarkPlugin = connect(selector, {
    toggleControl,
    onPropertyChange: setSearchBookmarkConfig,
    resetBookmarkConfig,
    updateBookmark,
    onFilter: filterBookmarks})(SearchByBookmarkPanel);

export default createPlugin('SearchByBookmark', {
    component: SearchByBookmarkPlugin,
    options: {
        disablePluginIf: "{state('userrole') !== 'ADMIN' }" // Plugin should be visible only to admin users
    },
    containers: {
        Search: {
            menuItem: searchMenuItem,
            bookmarkConfig: searchByBookmarkConfig
        }
    },
    reducers: {
        searchbookmarkconfig: require('../reducers/searchbookmarkconfig')
    }
});
