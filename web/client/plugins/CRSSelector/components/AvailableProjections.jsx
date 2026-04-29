/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Glyphicon, FormControl as FC } from 'react-bootstrap';

import Message from '../../../components/I18N/Message';
import Dialog from '../../../components/misc/Dialog';
import Portal from '../../../components/misc/Portal';
import FlexBox from '../../../components/layout/FlexBox';
import Spinner from '../../../components/layout/Spinner';
import MapView from './MapView';
import { getProjection } from '../../../utils/ProjectionUtils';
import { getMessageById } from '../../../utils/LocaleUtils';
import localizedProps from '../../../components/misc/enhancers/localizedProps';
import { ProjectionList } from './ProjectionList';
import { ProjectionRemoteSuggestions } from './ProjectionRemoteSuggestions';

import './AvailableProjections.less';

const FormControl = localizedProps("placeholder")(FC);

// Minimum number of characters before triggering a remote search.
// CRS codes are short numeric tokens, so even a single character is a
// meaningful query (e.g. "0", "3" narrow the list). The 300ms epic debounce
// coalesces rapid typing.
const REMOTE_SEARCH_MIN_LENGTH = 1;

const AvailableProjections = ({
    open,
    onClose,
    projectionList,
    selectedProjection,
    setConfig,
    onSelect,
    projectionDefs,
    selectedProjectionList,
    dynamicDefs,
    hasRemoteEndpoint,
    searchLoading,
    searchResultsRemote,
    searchTotal,
    loadingDefs,
    failedDefs,
    onSearchRemote,
    onClearSearch,
    onLoadProjectionDef,
    onRemoveProjectionDef
}, context) => {

    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredCrs, setHoveredCrs] = useState(null);
    const [remotePopoverOpen, setRemotePopoverOpen] = useState(false);
    const [remoteNextPage, setRemoteNextPage] = useState(2);
    // Codes the user has clicked to add but whose WKT fetch is still in
    // flight. Tracked locally so we know which dynamicDefs arrivals were
    // user-initiated from this dialog (vs. arriving from map-config restore).
    const [pendingAdds, setPendingAdds] = useState(() => new Set());

    const searchAreaRef = useRef(null);

    // Reset transient UI state whenever the dialog is opened.
    useEffect(() => {
        if (open) {
            setHoveredCrs(null);
            setSearchQuery('');
            setRemotePopoverOpen(false);
            setRemoteNextPage(2);
            setPendingAdds(new Set());
        }
    }, [open]);

    // Union of every projection the user might want to see in the dialog,
    // built from the most-stable sources first so toggling a checkbox does
    // not visibly reorder rows:
    //   1. plugin's static availableProjections (projectionList prop) - never
    //      changes during a session
    //   2. registry-known defs (projectionDefs) - changes only on add/remove,
    //      not on quick-switch toggle
    //   3. the live quick-switch list (selectedProjectionList) - contributes
    //      only items that aren't already present (e.g. just-added dynamic
    //      defs that are mid-WKT-fetch)
    //   4. the current map projection - safety net so it stays visible even
    //      if it isn't in any of the above (e.g. OL built-in like
    //      EPSG:4326/3857 that we don't put in the registry)
    const projectionsList = useMemo(() => {
        const seen = new Set();
        const out = [];
        const push = (item) => {
            if (!item || !item.value || seen.has(item.value)) return;
            seen.add(item.value);
            out.push(item);
        };
        (projectionList || []).forEach(push);
        (projectionDefs || []).forEach(d => push({ value: d.code, label: d.label || d.code }));
        (selectedProjectionList || []).forEach(push);
        if (selectedProjection) {
            push({ value: selectedProjection, label: selectedProjection });
        }
        return out;
    }, [selectedProjectionList, projectionList, projectionDefs, selectedProjection]);

    const filteredProjections = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) {
            return projectionsList;
        }
        return projectionsList.filter(({ label, value }) =>
            label.toLowerCase().includes(query) ||
            value.toLowerCase().includes(query)
        );
    }, [projectionsList, searchQuery]);

    const map = useMemo(() => ({
        mapInfoControl: true,
        zoomControl: false,
        projection: "EPSG:4326",
        units: "degrees",
        center: { x: 0, y: 0 },
        zoom: 0,
        maxExtent: [-180, -90, 180, 90],
        layers: [
            {
                type: 'osm',
                title: 'Open Street Map',
                name: 'mapnik',
                source: 'osm',
                group: 'background',
                visibility: true
            }
        ],
        mapOptions: {
            interactions: {
                dragPan: false,
                mouseWheelZoom: false,
                doubleClickZoom: false,
                pinchZoom: false
            }
        }
    }), []);

    const layers = useMemo(() => {
        if (hoveredCrs) {
            const projection = getProjection(hoveredCrs);
            const worldExtent = projection.worldExtent || projection.extent;
            const [minx, miny, maxx, maxy] = worldExtent;

            // When minx > maxx (or miny > maxy) the worldExtent crosses the
            // antimeridian / pole and represents a wrap. Split it into one
            // rectangle per quadrant so the preview shows two pieces instead
            // of an inverted polygon spanning the entire world.
            const xWraps = minx > maxx;
            const yWraps = miny > maxy;
            const xRanges = xWraps ? [[minx, 180], [-180, maxx]] : [[minx, maxx]];
            const yRanges = yWraps ? [[miny, 90], [-90, maxy]] : [[miny, maxy]];
            const rectangles = [];
            xRanges.forEach(([x0, x1]) => {
                yRanges.forEach(([y0, y1]) => {
                    rectangles.push([[
                        [x0, y0], [x0, y1], [x1, y1], [x1, y0], [x0, y0]
                    ]]);
                });
            });
            const geometry = (xWraps || yWraps)
                ? { type: 'MultiPolygon', coordinates: rectangles }
                : { type: 'Polygon', coordinates: rectangles[0] };

            const projectionFeatures = {
                id: 'projection-feature-1',
                type: 'Feature',
                geometry
            };
            const hoveredLayer = [{
                id: "projection-features-layer",
                title: "Projection features",
                group: 'Layer',
                type: 'vector',
                hidden: false,
                expanded: false,
                features: [projectionFeatures],
                wrapX: false,
                hideLoading: true
            }];
            return [...map.layers, ...hoveredLayer];
        }
        return map.layers;
    }, [hoveredCrs, map]);

    // Codes currently in the quick-switch list - rendered as checked rows in
    // ProjectionList and marked "already added" in the remote popover.
    const configuredCodes = useMemo(
        () => new Set((selectedProjectionList || []).map(p => p.value)),
        [selectedProjectionList]
    );

    // Codes that came from the dynamic (endpoint-sourced) defs - only these
    // can be removed via the trash icon. Static defs from localConfig are
    // managed at deployment time and stay read-only.
    const dynamicCodes = useMemo(
        () => new Set((dynamicDefs || []).map(d => d.code)),
        [dynamicDefs]
    );

    const remoteSuggestions = useMemo(
        () => Array.isArray(searchResultsRemote) ? searchResultsRemote : [],
        [searchResultsRemote]
    );

    // Codes shown as "loading" in the popover are the union of:
    //   - Redux loadingDefs (the WKT fetch is in flight)
    //   - pendingAdds (still waiting for the resolve effect to commit)
    // This avoids a one-render flash from spinner -> plus -> green check
    // when the def lands in dynamicDefs but projectionList hasn't been
    // updated yet.
    const popoverLoadingCodes = useMemo(() => {
        const merged = new Set(loadingDefs || []);
        pendingAdds.forEach(c => merged.add(c));
        return merged;
    }, [loadingDefs, pendingAdds]);

    const canLoadMore = remoteSuggestions.length < (searchTotal ?? 0);

    const handleClose = useCallback(() => {
        setHoveredCrs(null);
        setSearchQuery('');
        setRemotePopoverOpen(false);
        if (onClearSearch) {
            onClearSearch();
        }
        onClose();
    }, [onClearSearch, onClose]);

    // Live config updates - dispatched on every checkbox toggle. Also
    // performs an auto-fallback when the current map projection is no
    // longer in the quick-switch list, so the map never ends up in a CRS
    // that isn't accessible via the dropdown.
    const setProjectionList = useCallback((nextList) => {
        setConfig({ projectionList: nextList });
        if (selectedProjection
            && !nextList.some(p => p.value === selectedProjection)
            && nextList.length > 0) {
            onSelect(nextList[0].value);
        }
    }, [setConfig, selectedProjection, onSelect]);

    const handleSearchInputChange = (event) => {
        const value = event.target.value;
        setSearchQuery(value);
        if (!hasRemoteEndpoint) return;
        const trimmed = value.trim();
        if (trimmed.length >= REMOTE_SEARCH_MIN_LENGTH) {
            setRemoteNextPage(2);
            setRemotePopoverOpen(true);
            // Epic debounces page-1 by 300ms, so dispatching on every keystroke is fine.
            onSearchRemote(trimmed, 1);
            return;
        }
        setRemotePopoverOpen(false);
        if (onClearSearch) onClearSearch();
    };

    const handleLoadMore = () => {
        if (!searchQuery.trim()) return;
        onSearchRemote(searchQuery.trim(), remoteNextPage);
        setRemoteNextPage(remoteNextPage + 1);
    };

    const handleAddRemote = (crsId) => {
        const id = String(crsId);
        if (configuredCodes.has(id)) return;
        // Track intent locally and kick off the fetch. The Configured list is
        // updated only when the def actually arrives (see resolve effect
        // below), or the row is left in a "failed" state in the popover so
        // the user can retry.
        setPendingAdds(prev => new Set([...prev, id]));
        onLoadProjectionDef(id);
    };

    // Resolve pending adds by watching dynamicDefs (success) and failedDefs
    // (failure). Codes that succeed are appended to the quick-switch list;
    // codes that fail are simply dropped from pendingAdds, leaving the
    // popover row in the failed state until the user retries.
    // We test failure by key existence rather than value truthiness because
    // the error message can be empty/undefined for some axios failure modes
    // (e.g. CORS) - using truthy would leave the spinner running forever.
    useEffect(() => {
        if (pendingAdds.size === 0) return;
        const newDefs = [];
        const resolvedCodes = [];
        const failedMap = failedDefs || {};
        pendingAdds.forEach((code) => {
            const def = (dynamicDefs || []).find(d => d.code === code);
            if (def) {
                newDefs.push({ value: def.code, label: def.label || def.code });
                resolvedCodes.push(code);
                return;
            }
            if (Object.prototype.hasOwnProperty.call(failedMap, code)) {
                resolvedCodes.push(code);
            }
        });
        if (resolvedCodes.length === 0) return;
        if (newDefs.length > 0) {
            setProjectionList([...(selectedProjectionList || []), ...newDefs]);
        }
        setPendingAdds(prev => {
            const next = new Set(prev);
            resolvedCodes.forEach(code => next.delete(code));
            return next;
        });
    }, [pendingAdds, dynamicDefs, failedDefs, selectedProjectionList, setProjectionList]);

    const handleRemoveDynamic = (code) => {
        // Remove from quick-switch list if present, then drop the def from
        // Redux + ProjectionRegistry via the dispatched action.
        if (configuredCodes.has(code)) {
            // setProjectionList handles the auto-fallback when the removed
            // code is the current map projection.
            setProjectionList((selectedProjectionList || []).filter(p => p.value !== code));
        } else if (selectedProjection === code) {
            // Edge case: the removed code is the current map projection but
            // isn't in the quick-switch list. Pick the first available item
            // as a fallback before unregistering.
            const fallback = (selectedProjectionList || [])[0]?.value;
            if (fallback) {
                onSelect(fallback);
            }
        }
        onRemoveProjectionDef(code);
    };

    const handleUseAsMapProjection = (value) => {
        // Setting a CRS as the map projection implies it should also be in
        // the quick-switch list - otherwise the dropdown wouldn't let users
        // switch back to it without re-opening this dialog.
        if (!configuredCodes.has(value)) {
            const item = projectionsList.find(p => p.value === value)
                || { value, label: value };
            setProjectionList([...(selectedProjectionList || []), item]);
        }
        onSelect(value);
    };

    // Click-outside / Escape: close the popover.
    useEffect(() => {
        const handlePointerDown = (event) => {
            if (searchAreaRef.current && !searchAreaRef.current.contains(event.target)) {
                setRemotePopoverOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setRemotePopoverOpen(false);
            }
        };
        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const showRemotePopover = remotePopoverOpen
        && hasRemoteEndpoint
        && searchQuery.trim().length >= REMOTE_SEARCH_MIN_LENGTH;

    return open ? (
        <Portal>
            <Dialog
                id="crs-available-projections-dialog"
                draggable={false}
                modal
                containerClassName="crs-available-projections-dialog-container"
            >
                <FlexBox role="header" centerChildrenVertically gap="sm" classNames={['_flex-space-between']}>
                    <FlexBox centerChildrenVertically gap="sm">
                        <Glyphicon glyph="globe" />
                        <Message msgId="crsSelector.availableProjections" />
                    </FlexBox>
                    <button
                        onClick={handleClose}
                        className="settings-panel-close close"
                    >
                        <Glyphicon glyph="1-close" />
                    </button>
                </FlexBox>
                <div role="body">
                    <div className="ms-crs-search-area" ref={searchAreaRef}>
                        <FormGroup>
                            <div className="ms-crs-search-input-wrapper">
                                <FormControl
                                    type="text"
                                    value={searchQuery}
                                    placeholder={getMessageById(
                                        context.messages,
                                        hasRemoteEndpoint
                                            ? "crsSelector.searchProjectionUnified"
                                            : "crsSelector.searchProjection"
                                    )}
                                    onChange={handleSearchInputChange}
                                    onFocus={() => {
                                        if (hasRemoteEndpoint
                                            && searchQuery.trim().length >= REMOTE_SEARCH_MIN_LENGTH) {
                                            setRemotePopoverOpen(true);
                                        }
                                    }}
                                />
                                {searchLoading && (
                                    <span className="ms-crs-search-spinner">
                                        <Spinner />
                                    </span>
                                )}
                            </div>
                        </FormGroup>
                        {showRemotePopover && (
                            <ProjectionRemoteSuggestions
                                suggestions={remoteSuggestions}
                                addedCodes={configuredCodes}
                                loadingCodes={popoverLoadingCodes}
                                failedCodes={failedDefs}
                                loading={searchLoading}
                                total={searchTotal}
                                canLoadMore={canLoadMore}
                                onLoadMore={handleLoadMore}
                                onPick={handleAddRemote}
                                addedTitle={getMessageById(context.messages, "crsSelector.alreadyAdded")}
                                loadingTitle={getMessageById(context.messages, "crsSelector.loadingProjection")}
                                failedTitle={getMessageById(context.messages, "crsSelector.failedToLoad")}
                            />
                        )}
                    </div>
                    <div className="ms-crs-projections-list">
                        <ProjectionList
                            filteredProjections={filteredProjections}
                            projectionList={selectedProjectionList || []}
                            selectedProjection={selectedProjection}
                            dynamicCodes={dynamicCodes}
                            onToggle={setProjectionList}
                            onUseAsMapProjection={handleUseAsMapProjection}
                            onRemoveDynamic={handleRemoveDynamic}
                            setHoveredCrs={setHoveredCrs}
                        />
                    </div>
                    <div className="ms-crs-projections-map">
                        <MapView
                            id="crs-available-projections-map"
                            options={{ style: { height: '100%' }, registerHooks: false}}
                            map={map}
                            layers={layers}
                            interactive={false}
                        />
                    </div>
                </div>
            </Dialog>
        </Portal>
    ) : null;
};

AvailableProjections.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    projectionList: PropTypes.array,
    selectedProjection: PropTypes.string,
    setConfig: PropTypes.func,
    onSelect: PropTypes.func,
    projectionDefs: PropTypes.array,
    selectedProjectionList: PropTypes.array,
    dynamicDefs: PropTypes.array,
    hasRemoteEndpoint: PropTypes.bool,
    searchResultsRemote: PropTypes.array,
    searchLoading: PropTypes.bool,
    searchTotal: PropTypes.number,
    loadingDefs: PropTypes.array,
    failedDefs: PropTypes.object,
    onSearchRemote: PropTypes.func,
    onClearSearch: PropTypes.func,
    onLoadProjectionDef: PropTypes.func,
    onRemoveProjectionDef: PropTypes.func
};

AvailableProjections.defaultProps = {
    projectionList: [],
    selectedProjection: null,
    setConfig: () => {},
    onSelect: () => {},
    projectionDefs: [],
    selectedProjectionList: [],
    dynamicDefs: [],
    hasRemoteEndpoint: false,
    searchResultsRemote: [],
    searchLoading: false,
    searchTotal: 0,
    loadingDefs: [],
    failedDefs: {},
    onSearchRemote: () => {},
    onClearSearch: () => {},
    onLoadProjectionDef: () => {},
    onRemoveProjectionDef: () => {}
};

export default AvailableProjections;
