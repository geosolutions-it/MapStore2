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
import { connect } from '../../../utils/PluginsUtils';
import { createSelector } from 'reselect';

import { setInputValue, setProjectionsConfig } from '../actions/crsselector';
import { changeMapCrs, zoomToExtent } from '../../../actions/map';
import { error } from '../../../actions/notifications';
import Message from '../../../components/I18N/Message';
import tooltip from '../../../components/misc/enhancers/tooltip';
import { editingSelector } from '../../Annotations/selectors/annotations';
import { measureSelector, printSelector, queryPanelSelector } from '../../../selectors/controls';
import { canEditProjectionSelector, crsInputValueSelector, crsProjectionsConfigSelector } from '../selectors/crsselector';
import { modeSelector } from '../../../selectors/featuregrid';
import { currentBackgroundSelector } from '../../../selectors/layers';
import { projectionDefsSelector, projectionSelector } from '../../../selectors/map';
import { bottomPanelOpenSelector } from '../../../selectors/maplayout';
import { isCesium } from '../../../selectors/maptype';
import { userRoleSelector } from '../../../selectors/security';
import { getAvailableCRS, normalizeSRS } from '../../../utils/CoordinatesUtils';
import { getAvailableProjectionsFromConfig, getProjection } from '../../../utils/ProjectionUtils';
import ButtonRB from '../../../components/misc/Button';
import FlexBox from '../../../components/layout/FlexBox';
import useClickOutside from '../../../hooks/useClickOutside';
import { registerCustomSaveHandler } from '../../../selectors/mapsave';
import Spinner from '../../../components/layout/Spinner';

import {
    dynamicProjectionDefsSelector,
    projectionSearchResultsSelector,
    projectionSearchLoadingSelector,
    projectionSearchTotalSelector,
    projectionLoadingDefsSelector,
    projectionLoadFailedDefsSelector
} from '../../../selectors/projections';

import {
    searchProjections,
    clearProjectionSearch,
    loadProjectionDef,
    removeProjectionDef
} from '../../../actions/projections';

import './CRSSelector.less';

const LazyAvailableProjections = lazy(() =>
    import(/* webpackChunkName: "crs-available-projections-dialog" */ '../components/AvailableProjections')
);

/**
 * Saves crsselector.config (projectionList - the quick-switch membership list).
 * Dynamic projection defs themselves are persisted by a framework-level save
 * handler under the top-level `projections` key (see epics/projections.js),
 * so they are saved and restored regardless of whether this plugin is loaded.
 */
registerCustomSaveHandler('crsSelector', (state) => {
    const config = state?.crsselector?.config;
    return { ...config };
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
    projectionDefsEndpoint,
    availableProjections,
    setCrs = () => {},
    typeInput = () => {},
    enabled = true,
    allowedRoles = ['ALL'],
    currentRole,
    projectionsConfig = {},
    setConfig = () => {},
    searchResultsRemote,
    searchLoading = false,
    searchTotal = 0,
    dynamicDefs = [],
    loadingDefs = [],
    failedDefs = {},
    onSearchRemote = () => {},
    onClearSearch = () => {},
    onLoadProjectionDef = () => {},
    onRemoveProjectionDef = () => {},
    onZoomToProjectionExtent = () => {},
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

    const handleZoomToProjectionExtent = () => {
        const projection = currentCrs ? getProjection(currentCrs) : null;
        const extent = projection?.extent;
        if (extent && extent.length === 4) {
            onZoomToProjectionExtent(extent, currentCrs);
        }
    };

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
            <Button
                bsStyle="link"
                className="ms-crs-zoom-to-extent-button"
                tooltip={<Message msgId="crsSelector.zoomToProjectionExtent"/>}
                tooltipPosition="top"
                onClick={handleZoomToProjectionExtent}
            >
                <Glyphicon glyph="zoom-to" />
            </Button>
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
                                dynamicDefs={dynamicDefs}
                                hasRemoteEndpoint={!!projectionDefsEndpoint}
                                searchResultsRemote={searchResultsRemote}
                                searchLoading={searchLoading}
                                searchTotal={searchTotal}
                                loadingDefs={loadingDefs}
                                failedDefs={failedDefs}
                                onSearchRemote={(query, page = 1) => {
                                    onSearchRemote(projectionDefsEndpoint, query, page, undefined);
                                }}
                                onClearSearch={onClearSearch}
                                onLoadProjectionDef={(crsId) => {
                                    onLoadProjectionDef(projectionDefsEndpoint, crsId);
                                }}
                                onRemoveProjectionDef={onRemoveProjectionDef}
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
    projectionsConfig: PropTypes.object,
    setConfig: PropTypes.func,
    canEditProjection: PropTypes.bool,
    searchResultsRemote: PropTypes.array
};

const CRSSelector = connect(
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
        dynamicProjectionDefsSelector,
        projectionLoadingDefsSelector,
        projectionLoadFailedDefsSelector,
        ( currentRole, currentBackground, selected, projectionDefs, value, mode, cesium, bottomPanel, measureEnabled, queryPanelEnabled, printEnabled, editingAnnotations,
            projectionsConfig,
            canEditProjection,
            searchResultsRemote,
            searchLoading,
            searchTotal,
            dynamicDefs,
            loadingDefs,
            failedDefs) => ({

            currentRole,
            currentBackground,
            selected,
            projectionDefs,
            value,
            enabled: (mode !== 'EDIT') && !cesium && !bottomPanel && !measureEnabled && !queryPanelEnabled && !printEnabled && !editingAnnotations,
            projectionsConfig,
            canEditProjection,
            searchResultsRemote,
            searchLoading,
            searchTotal,
            dynamicDefs,
            loadingDefs,
            failedDefs
        })
    ), {
        typeInput: setInputValue,
        setCrs: changeMapCrs,
        onError: error,
        setConfig: setProjectionsConfig,
        onSearchRemote: searchProjections,
        onClearSearch: clearProjectionSearch,
        onLoadProjectionDef: loadProjectionDef,
        onRemoveProjectionDef: removeProjectionDef,
        onZoomToProjectionExtent: zoomToExtent
    },
    (stateProps, dispatchProps, ownProps) => {
        const { pluginCfg, ...otherProps } = ownProps || {};
        const { filterAllowedCRS = [], additionalCRS = {} } = pluginCfg || {};
        const availableProjections = pluginCfg?.availableProjections || getAvailableProjectionsFromConfig(filterAllowedCRS, additionalCRS);
        const projectionDefsEndpoint = pluginCfg?.projectionDefsEndpoint;
        return {
            ...otherProps,
            ...stateProps,
            ...dispatchProps,
            ...(pluginCfg || {}),
            projectionDefsEndpoint,
            availableProjections
        };
    }
)(Selector);

export default CRSSelector;
