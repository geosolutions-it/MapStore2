/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { has, includes, indexOf } from 'lodash';
import PropTypes from 'prop-types';
import React, { useMemo, useState, lazy, Suspense } from 'react';
import { Dropdown, FormControl, Glyphicon } from 'react-bootstrap';
import { connect } from '../utils/PluginsUtils';
import { createSelector } from 'reselect';

import { setInputValue, setProjectionsConfig } from '../actions/crsselector';
import { changeMapCrs } from '../actions/map';
import { error } from '../actions/notifications';
import Message from '../components/I18N/Message';
import tooltip from '../components/misc/enhancers/tooltip';
import crsselectorReducers from '../reducers/crsselector';
import annotationsReducers from './Annotations/reducers/annotations';
import { editingSelector } from '../plugins/Annotations/selectors/annotations';
import { measureSelector, printSelector, queryPanelSelector } from '../selectors/controls';
import { canEditProjectionSelector, crsInputValueSelector, crsProjectionsConfigSelector } from '../selectors/crsselector';
import { modeSelector } from '../selectors/featuregrid';
import { currentBackgroundSelector } from '../selectors/layers';
import { projectionDefsSelector, projectionSelector } from '../selectors/map';
import { bottomPanelOpenSelector } from '../selectors/maplayout';
import { isCesium } from '../selectors/maptype';
import { userRoleSelector } from '../selectors/security';
import { getAvailableCRS, normalizeSRS } from '../utils/CoordinatesUtils';
import { getAvailableProjectionsFromConfig } from '../utils/ProjectionUtils';
import ButtonRB from '../components/misc/Button';
import FlexBox from '../components/layout/FlexBox';
import useClickOutside from '../hooks/useClickOutside';
import { registerCustomSaveHandler } from '../selectors/mapsave';
import crsselectorEpics  from '../epics/crsselector';
import projectionsEpics from '../epics/projections';
import Spinner from '../components/layout/Spinner';

import {
    dynamicProjectionDefsSelector,
    projectionSearchResultsSelector,
    projectionSearchLoadingSelector,
    projectionSearchTotalSelector
} from '../selectors/projections';

import projectionsReducers from '../reducers/projections';

import { searchProjections, clearProjectionSearch, loadProjectionDef } from '../actions/projections';

const LazyAvailableProjections = lazy(() =>
    import(/* webpackChunkName: "crs-available-projections-dialog" */ '../components/CRSSelector/AvailableProjections')
);

// OLD CODE
// registerCustomSaveHandler('crsSelector', (state) => (state?.crsselector?.config));

/**
 *  Current handler saves crsselector.config (projectionList)
 *  Extended to persist dynamic defs needed by non-admin users at map load time
 */
registerCustomSaveHandler('crsSelector', (state) => {
    const config = state?.crsselector?.config;
    // let's use proper selector and not access the state directly
    const mapProjection = state?.map?.present?.projection;
    const allDynamic = dynamicProjectionDefsSelector(state);

    // CRSSelector has two levels:
    //   1. AvailableProjections (admin/canEdit) - searches endpoint, adds projections
    //      to the map's projectionList. Endpoint may be restricted to admin users only.
    //   2. Quick CRS switcher (all users) - shows projectionList items configured by admin.
    //
    // We must persist dynamic defs for every projection in projectionList so that
    // non-admin / unauthenticated users can use the quick switcher without endpoint access.
    // We also include map.projection in case it was set to a dynamic CRS.
    // Defs that the admin merely browsed but did not add to projectionList are not persisted.
    const requiredCodes = new Set((config?.projectionList || []).map(p => p.value ?? p));
    if (mapProjection) {
        requiredCodes.add(mapProjection);
    }

    const defsToSave = allDynamic.filter(d => requiredCodes.has(d.code));

    return {
        ...config,
        dynamicProjectionDefs: defsToSave.length ? defsToSave : undefined
    };
});

const Button = tooltip(ButtonRB);

const getLabel = (crs) => {
    if (crs.label === crs.value) return crs.value;
    return `${crs.value} (${crs.label})`;
};

const Selector = ({
    selected,
    value,
    availableCRS = getAvailableCRS(),
    projectionDefs,
    availableProjections,
    projectionDefsEndpoint,
    projectionDefsEndpointAuthority,
    setCrs = () => {},
    typeInput = () => {},
    enabled = true,
    allowedRoles = ['ALL'],
    currentRole,
    projectionsConfig = {},
    setConfig = () => {},
    searchResultsRemote,
    onSearchRemote = () => {},
    onLoadProjectionDef = () => {},
    currentBackground,
    onError = () => {},
    canEditProjection = true
}) => {
    const [toggled, setToggled] = useState(false);
    const [openAvailableProjections, setOpenAvailableProjections] = useState(false);
    const dropdownRef = useClickOutside(() => {
        if (toggled) {
            setToggled(false);
            typeInput('');
        }
    }, toggled);

    const changeCrs = (crs) => {
        const allowedLayerTypes = ["wms", "osm", "tileprovider", "empty"];
        if (indexOf(allowedLayerTypes, currentBackground?.type) > -1
            || (currentBackground.allowedSRS && has(currentBackground.allowedSRS, crs))
        ) {
            setCrs(crs);
        } else {
            onError({
                title: "error",
                message: "notification.incompatibleBackgroundAndProjection",
                action: {
                    label: "close"
                },
                position: "tc",
                uid: "3"
            });
        }
    };

    const list = useMemo(() => {
        if (projectionsConfig && projectionsConfig.projectionList) {
            return projectionsConfig.projectionList;
        }
        return availableProjections;
    }, [availableCRS, availableProjections, projectionsConfig]);

    const filteredList = useMemo(() => {
        if (!value) {
            return list;
        }
        return list.filter(crs =>
            crs.value.toLowerCase().includes(value.toLowerCase())
            || crs.label.toLowerCase().includes(value.toLowerCase())
        );
    }, [list, value]);

    const currentCrs = useMemo(() => {
        return normalizeSRS(selected, availableProjections.map(p => p.value));
    }, [availableProjections, selected]);

    const isAllowedToSwitch = includes(allowedRoles, "ALL") || includes(allowedRoles, currentRole);

    if (!enabled) {
        return null;
    }

    return (
        <FlexBox centerChildrenVertically classNames={['ms-crs-selector-container']}>
            <FlexBox centerChildrenVertically gap="sm" classNames={['ms-crs-selector-inner-container']}>
                <Glyphicon glyph="globe" className="ms-crs-world-icon" />
                <div ref={dropdownRef}>
                    <Dropdown
                        dropup
                        className="ms-crs-dropdown"
                        open={toggled}
                        onToggle={(isToggled) => {
                            setToggled(isToggled);
                            if (!isToggled) {
                                typeInput('');
                            }
                        }}
                        disabled={!isAllowedToSwitch}
                    >
                        <Button
                            bsRole="toggle"
                            bsStyle="link"
                            className="ms-crs-select-button"
                            tooltip={!toggled && isAllowedToSwitch ? <Message msgId="showCrsSelector"/> : null}
                            tooltipPosition="top"
                        >
                            {toggled ? (
                                <FormControl
                                    type="text"
                                    className="ms-crs-filter-input"
                                    value={value || ''}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        typeInput(e.target.value);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    onFocus={(e) => e.stopPropagation()}
                                    placeholder={currentCrs}
                                    autoFocus
                                />
                            ) : (
                                <span className="ms-crs-display-value">{currentCrs}</span>
                            )}
                        </Button>
                        <div bsRole="menu" className="dropdown-menu">
                            {filteredList.map(crs =>
                                <li
                                    key={crs.value}
                                    onClick={() => {
                                        changeCrs(crs.value);
                                        setToggled(false);
                                        typeInput('');
                                    }}
                                    className={currentCrs === crs.value ? 'active' : ''}
                                >
                                    {getLabel(crs)} {currentCrs === crs.value && <Glyphicon glyph="star" /> }
                                </li>
                            )}
                        </div>
                    </Dropdown>
                </div>
            </FlexBox>
            {isAllowedToSwitch && canEditProjection && (
                <>
                    <Button
                        bsStyle="link"
                        className="ms-crs-settings-button"
                        tooltip={<Message msgId="settings"/>}
                        tooltipPosition="top"
                        onClick={() => setOpenAvailableProjections(true)}
                    >
                        <Glyphicon glyph="cog" />
                    </Button>
                    {openAvailableProjections && (
                        <Suspense fallback={<Spinner />}>
                            <LazyAvailableProjections
                                projectionList={availableProjections}
                                open={openAvailableProjections}
                                onClose={() => setOpenAvailableProjections(false)}
                                onSelect={changeCrs}
                                selectedProjection={currentCrs}
                                setConfig={setConfig}
                                projectionDefs={projectionDefs}
                                selectedProjectionList={list}
                                searchResultsRemote={searchResultsRemote}
                                onSearchRemote={(query, page = 1) => {
                                    // searchProjections(endpointUrl, query, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, authority = 'EPSG') { //TODO pass limit in config
                                    onSearchRemote(projectionDefsEndpoint, query, page, undefined, projectionDefsEndpointAuthority);
                                }}
                                onLoadProjectionDef={(crsId) => {
                                    onLoadProjectionDef(projectionDefsEndpoint, crsId);
                                }}
                            />
                        </Suspense>
                    )}
                </>
            )}
        </FlexBox>
    );
};

Selector.propTypes = {
    selected: PropTypes.string,
    value: PropTypes.string,
    availableCRS: PropTypes.object,
    projectionDefs: PropTypes.array,
    setCrs: PropTypes.func,
    typeInput: PropTypes.func,
    enabled: PropTypes.bool,
    currentBackground: PropTypes.object,
    onError: PropTypes.func,
    allowedRoles: PropTypes.array,
    currentRole: PropTypes.string,
    availableProjections: PropTypes.array,
    projectionDefsEndpoint: PropTypes.string,
    projectionDefsEndpointAuthority: PropTypes.string,
    projectionsConfig: PropTypes.object,
    setConfig: PropTypes.func,
    canEditProjection: PropTypes.bool,
    searchResultsRemote: PropTypes.array
};

const crsSelector = connect(
    createSelector(
        userRoleSelector,
        currentBackgroundSelector,
        projectionSelector,
        projectionDefsSelector,
        crsInputValueSelector,
        modeSelector,
        isCesium,
        bottomPanelOpenSelector,
        measureSelector,
        queryPanelSelector,
        printSelector,
        editingSelector,
        crsProjectionsConfigSelector,
        canEditProjectionSelector,
        projectionSearchResultsSelector,
        projectionSearchLoadingSelector,
        projectionSearchTotalSelector,
        ( currentRole, currentBackground, selected, projectionDefs, value, mode, cesium, bottomPanel, measureEnabled, queryPanelEnabled, printEnabled, editingAnnotations,
            projectionsConfig,
            canEditProjection,
            searchResultsRemote) => ({

            currentRole,
            currentBackground,
            selected,
            projectionDefs,
            value,
            enabled: (mode !== 'EDIT') && !cesium && !bottomPanel && !measureEnabled && !queryPanelEnabled && !printEnabled && !editingAnnotations,
            projectionsConfig,
            canEditProjection,
            searchResultsRemote
        })
    ), {
        typeInput: setInputValue,
        setCrs: changeMapCrs,
        onError: error,
        setConfig: setProjectionsConfig,
        // NEW CODE
        // endpointUrl comes directly from plugin cfg - no selector needed
        // New Redux connections:
        // searchResultsRemote: projectionSearchResultsSelector,
        searchLoading: projectionSearchLoadingSelector,
        searchTotal: projectionSearchTotalSelector,
        // New actions connected:
        onSearchRemote: searchProjections,          // signature: (endpointUrl, query, page) - page=1 resets, page>1 appends
        onClearSearch: clearProjectionSearch,
        onLoadProjectionDef: loadProjectionDef
    },
    (stateProps, dispatchProps, ownProps) => {
        const { pluginCfg, ...otherProps } = ownProps || {};
        const { filterAllowedCRS = [], additionalCRS = {} } = pluginCfg || {};
        const availableProjections = pluginCfg?.availableProjections || getAvailableProjectionsFromConfig(filterAllowedCRS, additionalCRS);
        const projectionDefsEndpoint = pluginCfg?.projectionDefsEndpoint;
        const projectionDefsEndpointAuthority = pluginCfg?.projectionDefsEndpointAuthority || "EPSG";
        return {
            ...otherProps,
            ...stateProps,
            ...dispatchProps,
            ...(pluginCfg || {}),
            projectionDefsEndpoint,
            projectionDefsEndpointAuthority,
            availableProjections
        };
    }
)(Selector);


/**
  * CRSSelector Plugin is a plugin that switches from to the pre-configured projections.
  * it gets displayed into the mapFooter plugin
  * @name CRSSelector
  * @memberof plugins
  * @class
  * @prop {object[]} projectionDefs list of additional project definitions
  * @prop {array} cfg.allowedRoles list of the authorized roles that can use the plugin, if you want all users to access the plugin, add a "ALL" element to the array.
  * @prop {array} cfg.availableProjections list of the available projections to be displayed in the combobox.
  *
  * @prop {string[]} cfg.filterAllowedCRS (deprecated) list of allowed crs in the combobox list to used as filter for the one of retrieved proj4.defs()
  * @prop {object} cfg.additionalCRS (deprecated) additional crs added to the list. The label param is used after in the combobox.
  * @prop {string} cfg.projectionDefsEndpoint (optional) if provided, the plugin will fetch available projections from this endpoint.
  * @prop {string} cfg.projectionDefsEndpointAuthority (optional) if provided, the plugin will use this authority for the projections endpoint.
  *
  * @example
  * // If you want to add some crs you need to provide a definition and adding it in the additionalCRS property
  * // Put the following lines at the first level of the localconfig
  * {
  *   "projectionDefs": [{
  *     "code": "EPSG:3003",
  *     "def": "+proj=tmerc +lat_0=0 +lon_0=9 +k=0.9996 +x_0=1500000 +y_0=0 +ellps=intl+towgs84=-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68 +units=m +no_defs",
  *     "extent": [1241482.0019, 973563.1609, 1830078.9331, 5215189.0853],
  *     "worldExtent": [6.6500, 8.8000, 12.0000, 47.0500]
  *   }]
  * }
  * @example
  * // And configure the new projection for the plugin as below:
  * { "name": "CRSSelector",
  *   "cfg": {
  *     "projectionDefsEndpoint": "https://example.com/geoserver/rest/crs",
  *     "projectionDefsEndpointAuthority": "EPSG",
  *     "availableProjections": [
  *       { "value": "EPSG:4326", "label": "EPSG:4326" },
  *       { "value": "EPSG:3857", "label": "EPSG:3857" },
  *       { "value": "EPSG:3003", "label": "EPSG:3003" }
  *     ],
  *     "allowedRoles" : ["ADMIN", "USER", "ALL"]
  *   }
  * }
*/
export default {
    CRSSelectorPlugin: Object.assign(crsSelector, {
        disablePluginIf: "{state('mapType') === 'leaflet'}",
        MapFooter: {
            name: "crsSelector",
            position: 10,
            target: 'right-footer',
            priority: 1
        }
    }),
    reducers: {
        crsselector: crsselectorReducers,
        annotations: annotationsReducers,
        projections: projectionsReducers
    },
    epics: {
        ...crsselectorEpics,
        ...projectionsEpics
    }
};
