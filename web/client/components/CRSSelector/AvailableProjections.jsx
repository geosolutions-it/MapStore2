/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Glyphicon, FormControl as FC, Button } from 'react-bootstrap';

import Message from '../I18N/Message';
import Dialog from '../misc/Dialog';
import Portal from '../misc/Portal';
import FlexBox from '../layout/FlexBox';
import MapView from './MapView';
import { getAvailableCRS } from '../../utils/CoordinatesUtils';
import { getProjection } from '../../utils/ProjectionUtils';
import { getMessageById } from '../../utils/LocaleUtils';
import localizedProps from '../misc/enhancers/localizedProps';
import ProjectionList from './ProjectionList';

const FormControl = localizedProps("placeholder")(FC);

const AvailableProjections = ({ open, onClose, projectionList, selectedProjection, setConfig, onSelect }, context) => {
    const [filterText, setFilterText] = useState('');
    const [hoveredCrs, setHoveredCrs] = useState(null);
    const [currentProjectionList, setCurrentProjectionList] = useState(projectionList);
    const [currentSelectedProjection, setCurrentSelectedProjection] = useState(selectedProjection);

    // Sync local state with incoming props when dialog is opened
    useEffect(() => {
        if (open) {
            setCurrentProjectionList(projectionList);
            setCurrentSelectedProjection(selectedProjection);
        }
    }, [open, projectionList, selectedProjection]);

    // Transform projections prop to the format needed for display
    const availableCRS = useMemo(() => getAvailableCRS(), []);
    const projectionsList = useMemo(() => {
        return Object.keys(availableCRS).map(crs => ({
            label: availableCRS[crs].label,
            authorityId: crs
        }));
    }, [availableCRS]);

    // Filter projections based on filterText
    const filteredProjections = useMemo(() => {
        if (!filterText.trim()) {
            return projectionsList;
        }
        const searchText = filterText.toLowerCase();
        return projectionsList.filter(({ label, authorityId }) =>
            label.toLowerCase().includes(searchText) ||
            authorityId.toLowerCase().includes(searchText)
        );
    }, [projectionsList, filterText]);

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

            const projectionFeatures = {
                id: 'projection-feature-1',
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[minx, miny], [minx, maxy], [maxx, maxy], [maxx, miny], [minx, miny]]]
                }
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

    const handleClose = () => {
        setHoveredCrs(null);
        setFilterText('');
        onClose();
    };

    const handleAdd = () => {
        setConfig({ projectionList: currentProjectionList });
        onSelect(currentSelectedProjection);
        handleClose();
    };

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
                    <div>
                        <FormGroup>
                            <FormControl
                                type="text"
                                value={filterText}
                                placeholder={getMessageById(context.messages, "crsSelector.searchProjection")}
                                onChange={(event) => setFilterText(event.target.value)}
                            />
                        </FormGroup>
                    </div>
                    <div className="ms-crs-projections-list">
                        <ProjectionList
                            filteredProjections={filteredProjections}
                            projectionList={currentProjectionList}
                            selectedProjection={currentSelectedProjection}
                            setConfig={({ defaultCrs, projectionList: updatedList }) => {
                                if (updatedList) {
                                    setCurrentProjectionList(updatedList);
                                }
                                if (defaultCrs) {
                                    setCurrentSelectedProjection(defaultCrs);
                                }
                            }}
                            setHoveredCrs={setHoveredCrs}
                        />
                    </div>
                    <div className="ms-crs-projections-map">
                        <MapView
                            id="crs-available-projections-map"
                            options={{ style: { height: '100%' }}}
                            map={map}
                            layers={layers}
                            interactive={false}
                        />
                    </div>
                </div>
                <div role="footer">
                    <Button
                        onClick={handleClose}
                        bsStyle="default"
                    >
                        <Message msgId="crsSelector.close" />
                    </Button>
                    <Button
                        onClick={handleAdd}
                        bsStyle="primary"
                    >
                        <Message msgId="crsSelector.save" />
                    </Button>
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
    onSelect: PropTypes.func
};

AvailableProjections.defaultProps = {
    projectionList: [],
    selectedProjection: null,
    setConfig: () => {},
    onSelect: () => {}
};

export default AvailableProjections;
