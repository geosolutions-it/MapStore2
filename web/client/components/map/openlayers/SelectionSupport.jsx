/**
 * Copyright 2017, Sourcepole AG.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {Style, Fill, Stroke} from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import Draw from 'ol/interaction/Draw';
import DoubleClickZoom from 'ol/interaction/DoubleClickZoom';

export default class SelectionSupport extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        projection: PropTypes.string,
        selection: PropTypes.object,
        changeSelectionState: PropTypes.func
    };

    static defaultProps = {
        selection: {}
    };

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.selection.geomType && newProps.selection.geomType !== this.props.selection.geomType ) {
            this.addDrawInteraction(newProps);
        }

        if (!newProps.selection.geomType) {
            this.removeDrawInteraction();
        }
    }

    render() {
        return null;
    }

    addDrawInteraction = (newProps) => {
        // cleanup old interaction
        if (this.drawInteraction) {
            this.removeDrawInteraction();
        }
        // create a layer to draw on
        let source = new VectorSource();
        let vector = new VectorLayer({
            source: source,
            zIndex: 1000000,
            style: new Style({
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new Stroke({
                    color: '#ffcc33',
                    width: 2
                }),
                image: new CircleStyle({
                    radius: 7,
                    fill: new Fill({
                        color: '#ffcc33'
                    })
                })
            })
        });

        this.props.map.addLayer(vector);

        // create an interaction to draw with
        let draw = new Draw({
            source: source,
            type: /** @type {ol.geom.GeometryType} */ newProps.selection.geomType,
            style: new Style({
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new Stroke({
                    color: 'rgba(0, 0, 0, 0.5)',
                    lineDash: [10, 10],
                    width: 2
                }),
                image: new CircleStyle({
                    radius: 5,
                    stroke: new Stroke({
                        color: 'rgba(0, 0, 0, 0.7)'
                    }),
                    fill: new Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    })
                })
            })
        });

        draw.on('drawstart', (evt) => {
            // preserv the sketch feature of the draw controller
            // to update length/area on drawing a new vertex
            this.sketchFeature = evt.feature;
            // clear previous sketches
            source.clear();
        });
        draw.on('drawend', () => {
            this.updateSelectionState();
        });

        this.props.map.addInteraction(draw);
        this.drawInteraction = draw;
        this.selectionLayer = vector;
        this.setDoubleClickZoomEnabled(false);
    };

    removeDrawInteraction = () => {
        if (this.drawInteraction !== null) {
            this.props.map.removeInteraction(this.drawInteraction);
            this.drawInteraction = null;
            this.props.map.removeLayer(this.selectionLayer);
            this.sketchFeature = null;
            // Delay execution of activation of double click zoom function
            setTimeout(() => this.setDoubleClickZoomEnabled(true), 251);
        }
    };

    updateSelectionState = () => {
        if (!this.sketchFeature) {
            return;
        }
        const sketchCoords = this.sketchFeature.getGeometry().getCoordinates();

        let newSelectionState = {
            geomType: this.props.selection.geomType,
            point: this.props.selection.geomType === 'Point' ?
                [sketchCoords[0], sketchCoords[1]] : null,
            line: this.props.selection.geomType === 'LineString' ?
                sketchCoords.map(coo => [coo[0], coo[1]]) : null,
            polygon: this.props.selection.geomType === 'Polygon' ?
                this.sketchFeature.getGeometry().getLinearRing(0).getCoordinates().map(coo => [coo[0], coo[1]]) : null
        };
        this.props.changeSelectionState(newSelectionState);
    };

    setDoubleClickZoomEnabled = (enabled) => {
        let interactions = this.props.map.getInteractions();
        for (let i = 0; i < interactions.getLength(); i++) {
            let interaction = interactions.item(i);
            if (interaction instanceof DoubleClickZoom) {
                interaction.setActive(enabled);
                break;
            }
        }
    };
}
