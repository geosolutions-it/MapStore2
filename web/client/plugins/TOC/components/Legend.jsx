/**
 * Copyright 2015, GeoSolutions Sas.
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

import {
    addAuthenticationToSLD,
    clearNilValuesForParams
} from '../../../utils/SecurityUtils';
import Message from '../../../components/I18N/Message';
import SecureImage from '../../../components/misc/SecureImage';

import { randomInt } from '../../../utils/RandomUtils';
import { normalizeSRS } from '../../../utils/CoordinatesUtils';
import { getWMSLegendConfig, LEGEND_FORMAT } from '../../../utils/LegendUtils';

/**
 * Legend renders the wms legend image
 * @prop {object} layer layer options
 * @prop {object} style style of legend image
 * @prop {number} currentZoomLvl map zoom level
 * @prop {array} scales list of available scales on the map
 * @prop {string} legendOptions options for the WMS get legend graphic LEGEND_OPTIONS parameter
 * @prop {boolean} scaleDependent if true add the scale parameter to the legend graphic request
 * @prop {string} language current language code
 * @prop {number} legendWidth width of the legend symbols
 * @prop {number} legendHeight height of the legend symbols
 */
class Legend extends React.Component {
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
        projection: PropTypes.string,
        mapSize: PropTypes.object,
        bbox: PropTypes.object
    };

    static defaultProps = {
        legendHeight: 12,
        legendWidth: 12,
        legendOptions: "forceLabels:on",
        style: {maxWidth: "100%"},
        scaleDependent: true
    };
    state = {
        error: false
    }
    UNSAFE_componentWillReceiveProps(nProps) {
        if ( this.state.error && this.getUrl(nProps, 0) !== this.getUrl(this.props, 0)) {
            this.setState(() => ({error: false}));
        }
    }
    onImgError = () => {
        this.setState(() => ({error: true}));
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
            const idx = !isNil(urlIdx) ? urlIdx : isArray(layer.url) && Math.floor(randomInt(layer.url.length));

            const url = isArray(layer.url) ?
                layer.url[idx] :
                layer.url.replace(/[?].*$/g, '');

            let urlObj = urlUtil.parse(url);

            const cleanParams = clearNilValuesForParams(layer.params);
            const scale = this.getScale(props);
            const projection = normalizeSRS(this.props.projection || 'EPSG:3857', layer.allowedSRS);
            const query = {
                ...getWMSLegendConfig({
                    layer,
                    format: LEGEND_FORMAT.IMAGE,
                    ...pick(props, ['legendHeight', 'legendWidth', 'mapSize', 'legendOptions', 'mapBbox']),
                    projection
                }),
                ...layer.legendParams,
                ...(props.language && layer.localizedLayerStyles ? { LANGUAGE: props.language } : {}),
                ...addAuthenticationToSLD(cleanParams || {}, props.layer),
                ...(cleanParams && cleanParams.SLD_BODY ? { SLD_BODY: cleanParams.SLD_BODY } : {}),
                ...(scale !== null ? { SCALE: scale } : {})
            };

            return urlUtil.format({
                host: urlObj.host,
                protocol: urlObj.protocol,
                pathname: urlObj.pathname,
                query: query
            });
        }
        return '';
    }
    render() {
        if (!this.state.error && this.props.layer && this.props.layer.type === "wms" && this.props.layer.url) {
            const url = this.getUrl(this.props);
            return (
                <SecureImage
                    onImgError={this.onImgError}
                    onLoad={(e) => this.validateImg(e.target)}
                    src={url}
                    style={this.props.style}
                />
            );
        }
        return <Message msgId="layerProperties.legenderror" />;
    }
    validateImg = (img) => {
        // GeoServer response is a 1x2 px size when legend is not available.
        // In this case we need to show the "Legend Not available" message
        if (img.height <= 1 && img.width <= 2) {
            this.onImgError();
        }
    }
}

export default Legend;
