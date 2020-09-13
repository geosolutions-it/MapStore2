/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { isNil, isObject } = require('lodash');
const SideGrid = require('../../misc/cardgrids/SideGrid');
const { Glyphicon, Grid, Row, Col} = require('react-bootstrap');
const Slider = require('../../misc/Slider');
const WMSLegend = require('../../TOC/fragments/WMSLegend');

module.exports = ({
    layers = [],
    onChange = () => {},
    legendProps = {},
    currentZoomLvl,
    disableOpacitySlider = true,
    disableVisibility = true,
    scales,
    language,
    currentLocale
}) => <SideGrid
    className="compact-legend-grid"
    size="sm"
    items={layers.map(layer => ({
        title: layer.title && isObject(layer.title) && (layer.title[currentLocale] || layer.title.default) || layer.title,
        preview: disableVisibility
            ? null
            : <Glyphicon className="text-primary"
                glyph={layer.visibility ? 'eye-open' : 'eye-close'}
            />, // TODO: manage onClick
        style: {
            opacity: layer.visibility ? 1 : 0.4
        },
        body: !layer.visibility ? null
            : (
                <div>
                    <Grid fluid>
                        <Row>
                            <Col xs={12} className="ms-legend-container">
                                <WMSLegend
                                    node={{ ...layer }}
                                    currentZoomLvl={currentZoomLvl}
                                    scales={scales}
                                    language={language}
                                    {...legendProps} />
                            </Col>
                        </Row>
                    </Grid>
                    {!disableOpacitySlider && <div className="mapstore-slider" onClick={(e) => { e.stopPropagation(); }}>
                        <Slider
                            disabled={!layer.visibility}
                            start={[isNil(layer.opacity) ? 100 : Math.round(layer.opacity * 100)]}
                            range={{ min: 0, max: 100 }}
                            onChange={(value) => onChange(layer.id, 'layers', { opacity: parseFloat((value[0] / 100).toFixed(2)) })} />
                    </div>}
                </div>
            )
    })
    )} />;
