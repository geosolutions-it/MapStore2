/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import { Grid, Row, Col } from 'react-bootstrap';
import WMSLegend from '../../TOC/fragments/WMSLegend';
import OpacitySlider from "../../TOC/fragments/OpacitySlider";
import Title from "../../TOC/fragments/Title";
import LayersTool from "../../TOC/fragments/LayersTool";

export default ({
    layers = [],
    updateProperty = () => {},
    legendProps = {},
    currentZoomLvl,
    disableOpacitySlider = false,
    disableVisibility = false,
    legendExpanded = false,
    scales,
    language,
    currentLocale
}) => {

    const renderOpacitySlider = (layer) => (
        !disableOpacitySlider && layer?.type !== '3dtiles' && <div
            className="mapstore-slider"
            onClick={(e) => { e.stopPropagation(); }}>
            <OpacitySlider
                opacity={layer.opacity}
                disabled={!layer.visibility}
                hideTooltip={false}
                onChange={opacity => updateProperty('opacity', opacity, layer.id)}/>
        </div>
    );

    return (<div className={"legend-widget"}>
        {layers.map((layer, index) => (<div key={index} className="widget-legend-toc">
            <div className="toc-default-layer-head">
                {!disableVisibility && <LayersTool
                    tooltip={'toc.toggleLayerVisibility'}
                    className={"visibility-check" + (layer.visibility ? " checked" : "")}
                    data-position={layer.storeIndex}
                    glyph={layer.visibility ? "eye-open" : "eye-close"}
                    onClick={()=> updateProperty('visibility', !layer.visibility, layer.id)}
                />}
                <Title node={layer} currentLocale={currentLocale}/>
                {!legendExpanded && <LayersTool
                    node={layer}
                    tooltip="toc.displayLegendAndTools"
                    key="toollegend"
                    className={`toc-legend-icon ${layer.expanded ? 'expanded' : ''}`}
                    glyph="chevron-left"
                    onClick={()=> updateProperty('expanded', !layer.expanded, layer.id)} />}
                {!layer.expanded && renderOpacitySlider(layer)}
            </div>
            {(layer.expanded || legendExpanded) ? <div key="legend" className="expanded-legend-view">
                <Grid fluid>
                    <Row>
                        <Col xs={12}>
                            <WMSLegend
                                node={{ ...layer }}
                                currentZoomLvl={currentZoomLvl}
                                scales={scales}
                                language={language}
                                {...legendProps} />
                        </Col>
                    </Row>
                </Grid>
                {renderOpacitySlider(layer)}
            </div> : null}
        </div>))}
    </div>);
};
