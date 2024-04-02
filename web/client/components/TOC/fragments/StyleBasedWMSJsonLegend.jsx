/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import urlUtil from 'url';

import { isArray, isNil } from 'lodash';
import assign from 'object-assign';
import PropTypes from 'prop-types';
import React from 'react';
import Loader from '../../misc/Loader';
import WMSJsonLegendIcon from '../../styleeditor/WMSJsonLegendIcon';
import {
    addAuthenticationParameter,
    addAuthenticationToSLD,
    clearNilValuesForParams
} from '../../../utils/SecurityUtils';
import { getJsonWMSLegend } from '../../../api/WMS';
import Message from '../../I18N/Message';

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
        onLayerFilterByLegend: PropTypes.func
    };

    static defaultProps = {
        legendHeight: 12,
        legendWidth: 12,
        legendOptions: "forceLabels:on",
        style: {maxWidth: "100%"},
        scaleDependent: true,
        onLayerFilterByLegend: () => {}
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
        if (currentLayerStyle !== prevLayerStyle) {
            this.getLegendData();
        }
    }

    getLegendData() {
        let jsonLegendUrl = this.getUrl(this.props);
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
            let query = assign({}, {
                service: "WMS",
                request: "GetLegendGraphic",
                format: "application/json",
                height: props.legendHeight,
                width: props.legendWidth,
                layer: layer.name,
                style: layer.style || null,
                version: layer.version || "1.3.0",
                SLD_VERSION: "1.1.0",
                LEGEND_OPTIONS: props.legendOptions
            }, layer.legendParams || {},
            props.language && layer.localizedLayerStyles ? {LANGUAGE: props.language} : {},
            addAuthenticationToSLD(cleanParams || {}, props.layer),
            cleanParams && cleanParams.SLD_BODY ? {SLD_BODY: cleanParams.SLD_BODY} : {},
            scale !== null ? { SCALE: scale } : {});
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
        const isLegendFilterIncluded = this.props.layer?.layerFilter?.filters?.find(f=>f.id === 'interactiveLegend');
        const prevFilter = isLegendFilterIncluded ? isLegendFilterIncluded?.filters?.[0]?.id : '';
        const filterWMSLayerHandler = (filter) => {
            if (!filter) return;
            this.props.onLayerFilterByLegend(this.props.layer.id, 'layers', filter === prevFilter ? '' : filter);
        };
        return (rules || []).map((rule) => {
            return (<div className={`wms-json-legend-rule ${rule.filter && prevFilter === rule.filter ? 'active' : ''}`} key={rule.filter} onClick={() => filterWMSLayerHandler(rule.filter)}>
                <WMSJsonLegendIcon rule={rule} />
                <span>{rule.name || rule.title || ''}</span>
            </div>);
        });
    };
    render() {
        if (!this.state.error && this.props.layer && this.props.layer.type === "wms" && this.props.layer.url) {
            return <>
                <div className="wms-legend" style={this.props.style}>
                    { this.state.loading ? <Loader size={12} style={{display: 'inline-block'}} /> : this.renderRules(this.state.jsonLegend?.rules || [])}
                </div>
            </>;
        }
        return <Message msgId="layerProperties.legenderror" />;
    }
}

export default StyleBasedWMSJsonLegend;
