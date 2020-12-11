/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import NominatimResult from './NominatimResult';
import { getZoomForExtent, getCenterForExtent } from '../../../../utils/MapUtils';
import { reprojectBbox } from '../../../../utils/CoordinatesUtils';
import I18N from '../../../I18N/I18N';


class ResultList extends React.Component {
    static propTypes = {
        results: PropTypes.array,
        mapConfig: PropTypes.object,
        onItemClick: PropTypes.func,
        addMarker: PropTypes.func,
        afterItemClick: PropTypes.func,
        notFoundMessage: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
    };

    static defaultProps = {
        onItemClick: () => {},
        addMarker: () => {},
        afterItemClick: () => {}
    };

    onItemClick = (item) => {
        // coordinates from nominatim are minY minX maxY maxX   as strings
        var nBbox = item.boundingbox.map( (elem) => {return parseFloat(elem); });
        var bbox = [nBbox[2], nBbox[0], nBbox[3], nBbox[1]];
        // zoom by the max. extent defined in the map's config
        var mapSize = this.props.mapConfig.size;

        var newZoom = getZoomForExtent(reprojectBbox(bbox, "EPSG:4326", this.props.mapConfig.projection), mapSize, 0, 21, null);

        // center by the max. extent defined in the map's config
        var newCenter = getCenterForExtent(bbox, "EPSG:4326");

        this.props.onItemClick(newCenter, newZoom, {
            bounds: {
                minx: bbox[0],
                miny: bbox[1],
                maxx: bbox[2],
                maxy: bbox[3]
            },
            crs: "EPSG:4326",
            rotation: 0
        }, this.props.mapConfig.size, null, this.props.mapConfig.projection);
        this.props.addMarker({lat: newCenter.y, lng: newCenter.x});
        this.props.afterItemClick();
    };

    renderResults = () => {
        return this.props.results.map((item, idx)=> {return <NominatimResult key={item.osm_id || "res_" + idx} item={item} onItemClick={this.onItemClick}/>; });
    };

    render() {
        var notFoundMessage = this.props.notFoundMessage;
        if (!notFoundMessage) {
            notFoundMessage = <I18N.Message msgId="noresultfound" />;
        }
        if (!this.props.results) {
            return null;
        } else if (this.props.results.length === 0) {
            return <div className="search-result-list" style={{padding: "10px", textAlign: "center"}}>{notFoundMessage}</div>;
        }
        return (
            <div className="search-result-list">
                {this.renderResults()}
            </div>
        );
    }

    purgeResults = () => {

    };
}

export default ResultList;
