/**
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';
import urlUtil from 'url';
import isArray from 'lodash/isArray';
import isNil from 'lodash/isNil';
import pick from 'lodash/pick';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { Alert, Tooltip, Glyphicon } from 'react-bootstrap';

import { ButtonWithTooltip } from '../../../components/misc/Button';
import Loader from '../../../components/misc/Loader';
import WMSJsonLegendIcon from '../../../components/styleeditor/WMSJsonLegendIcon';
import Message from '../../../components/I18N/Message';
import OverlayTrigger from '../../../components/misc/OverlayTrigger';
import {
    addAuthenticationParameter,
    addAuthenticationToSLD,
    clearNilValuesForParams
} from '../../../utils/SecurityUtils';
import { getJsonWMSLegend } from '../../../api/WMS';
import { updateLayerLegendFilter } from '../../../utils/FilterUtils';
import { normalizeSRS } from '../../../utils/CoordinatesUtils';
import { getLayerFilterByLegendFormat, getWMSLegendConfig, INTERACTIVE_LEGEND_ID, LEGEND_FORMAT } from '../../../utils/LegendUtils';
class StyleBasedWMSJsonLegend extends React.Component {
    static propTypes = {
        layer: PropTypes.object,
        legendHeight: PropTypes.number,
        legendWidth: PropTypes.number,
        legendOptions: PropTypes.string,
        style: PropTypes.object,
        currentZoomLvl: PropTypes.number,
        scales: PropTypes.array,
        scaleDependent: PropTypes.bool,
        language: PropTypes.string,
        onChange: PropTypes.func,
        owner: PropTypes.string,
        projection: PropTypes.string,
        mapSize: PropTypes.object,
        mapBbox: PropTypes.object
    };

    static defaultProps = {
        legendHeight: 12,
        legendWidth: 12,
        legendOptions: "forceLabels:on",
        style: {maxWidth: "100%"},
        scaleDependent: true,
        onChange: () => {},
        owner: ''
    };
    state = {
        error: false,
        loading: false,
        jsonLegend: {}
    }
    componentDidMount() {
        this.getLegendData();
    }

    componentDidUpdate(prevProps) {
        const prevLayerStyle = prevProps?.layer?.style;
        const currentLayerStyle = this.props?.layer?.style;

        const prevFilter = getLayerFilterByLegendFormat(prevProps?.layer, LEGEND_FORMAT.JSON);
        const currFilter = getLayerFilterByLegendFormat(this.props?.layer, LEGEND_FORMAT.JSON);

        // get the new json legend and rerender in case of change in style or layer filter
        if (currentLayerStyle !== prevLayerStyle
            || !isEqual(prevFilter, currFilter)
            || !isEqual(prevProps.mapBbox, this.props.mapBbox)
        ) {
            this.getLegendData();
        }
    }

    onResetLegendFilter = () => {
        const newLayerFilter = updateLayerLegendFilter(this.props?.layer?.layerFilter);
        this.props.onChange({ layerFilter: newLayerFilter });
    }
    getLegendData() {
        let jsonLegendUrl = this.getUrl(this.props);
        if (!jsonLegendUrl) {
            this.setState({ error: true });
            return;
        }
        this.setState({ loading: true });
        getJsonWMSLegend(jsonLegendUrl).then(data => {
            this.setState({ jsonLegend: data[0], loading: false });
        }).catch(() => {
            this.setState({ error: true, loading: false });
        });
    }

    getScale = (props) => {
        if (props.scales && props.currentZoomLvl !== undefined && props.scaleDependent) {
            const zoom = Math.round(props.currentZoomLvl);
            const scale = props.scales[zoom] ?? props.scales[props.scales.length - 1];
            return Math.round(scale);
        }
        return null;
    };
    getUrl = (props, urlIdx) => {
        if (props.layer && props.layer.type === "wms" && props.layer.url) {
            const layer = props.layer;
            const idx = !isNil(urlIdx) ? urlIdx : isArray(layer.url) && Math.floor(Math.random() * layer.url.length);

            const url = isArray(layer.url) ?
                layer.url[idx] :
                layer.url.replace(/[?].*$/g, '');

            let urlObj = urlUtil.parse(url);

            const cleanParams = clearNilValuesForParams(layer.params);
            const scale = this.getScale(props);
            const projection = normalizeSRS(props.projection || 'EPSG:3857', layer.allowedSRS);
            const query = {
                ...getWMSLegendConfig({
                    layer,
                    format: LEGEND_FORMAT.JSON,
                    ...pick(props, ['legendHeight', 'legendWidth', 'mapSize', 'legendOptions', 'mapBbox']),
                    projection
                }),
                ...layer.legendParams,
                ...(props.language && layer.localizedLayerStyles ? { LANGUAGE: props.language } : {}),
                ...addAuthenticationToSLD(cleanParams || {}, props.layer),
                ...(cleanParams && cleanParams.SLD_BODY ? { SLD_BODY: cleanParams.SLD_BODY } : {}),
                ...(scale !== null ? { SCALE: scale } : {})
            };
            addAuthenticationParameter(url, query);

            return urlUtil.format({
                host: urlObj.host,
                protocol: urlObj.protocol,
                pathname: urlObj.pathname,
                query: query
            });
        }
        return '';
    }
    renderRules = (rules) => {
        const isLegendFilterIncluded = get(this.props, 'layer.layerFilter.filters', []).find(f => f.id === INTERACTIVE_LEGEND_ID);
        const legendFilters = isLegendFilterIncluded ? isLegendFilterIncluded?.filters : [];
        const isPreviousFilterValid = this.checkPreviousFiltersAreValid(rules, legendFilters);
        return (
            <>
                {!isPreviousFilterValid ? <Alert className="legend-filter-warning" bsStyle="warning">
                    <Message msgId={"layerProperties.interactiveLegend.incompatibleFilterWarning"} />
                    <ButtonWithTooltip
                        bsStyle="primary"
                        className="square-button-md reset-legend-filter"
                        tooltipId="layerProperties.interactiveLegend.resetLegendFilterTooltip"
                        onClick={this.onResetLegendFilter}>
                        <Glyphicon glyph="clear-filter" />
                    </ButtonWithTooltip>
                </Alert> : null}
                {(rules || []).map((rule) => {
                    const activeFilter = legendFilters?.some(f => f.id === rule.filter);
                    const isFilterDisabled = this.props?.layer?.layerFilter?.disabled;
                    return (
                        <div
                            className={`wms-json-legend-rule ${isFilterDisabled || this.props.owner === 'legendPreview' || !rule?.filter ? "" : "filter-enabled "} ${activeFilter ? 'active' : ''}`}
                            key={rule.filter}
                            onClick={() => this.filterWMSLayerHandler(rule.filter)}>
                            <WMSJsonLegendIcon rule={rule} />
                            <span>{rule.name || rule.title || ''}</span>
                        </div>
                    );
                })}
            </>
        );
    };
    render() {
        if (!this.state.error && this.props.layer && this.props.layer.type === "wms" && this.props.layer.url) {
            return <>
                <div className="wms-legend" style={this.props.style}>
                    { this.state.loading ? <Loader size={12} style={{display: 'inline-block'}} /> : this.renderRules(this.state.jsonLegend?.rules || [])}
                </div>
            </>;
        }
        return (<div style={{ display: 'flex' }}>
            <Message msgId="layerProperties.legenderror" />&nbsp;
            <OverlayTrigger placement={"right"} overlay={<Tooltip id={"interactiveLegendInfoError"}>
                <Message msgId={"layerProperties.enableInteractiveLegendInfo.fetchError"} />
            </Tooltip>}>
                <Glyphicon
                    style={{ marginLeft: 4 }}
                    glyph={"info-sign"}
                />
            </OverlayTrigger>
        </div>);
    }
    filterWMSLayerHandler = (filter) => {
        const isFilterDisabled = this.props?.layer?.layerFilter?.disabled;
        if (!filter || isFilterDisabled) return;
        const newLayerFilter = updateLayerLegendFilter(this.props?.layer?.layerFilter, filter);
        this.props.onChange({ layerFilter: newLayerFilter });
    };
    checkPreviousFiltersAreValid = (rules, prevLegendFilters) => {
        const rulesFilters = rules.map(rule => rule.filter);
        return prevLegendFilters?.every(f => rulesFilters.includes(f.id));
    }
}

export default StyleBasedWMSJsonLegend;
