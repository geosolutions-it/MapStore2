/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
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
        {layers.map((layer, index) => (<div key={index} className={`widget-legend-toc${(layer.expanded || legendExpanded) ? ' expanded' : ''}`}>
            <div className="toc-default-layer-head">
                {!disableVisibility && <LayersTool
                    tooltip={'toc.toggleLayerVisibility'}
                    className={"visibility-check" + (layer.visibility ? " checked" : "")}
                    data-position={layer.storeIndex}
                    glyph={layer.visibility ? "eye-open" : "eye-close"}
                    onClick={()=> updateProperty('visibility', !layer.visibility, layer.id)}
                />}
                <Title node={layer} currentLocale={currentLocale} tooltip/>
                {!legendExpanded && layer.type === "wms" && <LayersTool
                    node={layer}
                    tooltip="toc.displayLegendAndTools"
                    key="toollegend"
                    className={`toc-legend-icon ${layer.expanded ? 'expanded' : ''}`}
                    glyph="chevron-left"
                    onClick={()=> updateProperty('expanded', !layer.expanded, layer.id)} />}
            </div>
            <div>
                {(layer.expanded || legendExpanded)
                    ? <div key="legend" className="expanded-legend-view">
                        <WMSLegend
                            node={{ ...layer }}
                            currentZoomLvl={currentZoomLvl}
                            scales={scales}
                            language={language}
                            {...legendProps} />
                    </div>
                    : null}
                {renderOpacitySlider(layer)}
            </div>
        </div>))}
    </div>);
};
