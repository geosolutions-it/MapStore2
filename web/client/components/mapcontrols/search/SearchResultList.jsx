/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { find } from 'lodash';
import assign from 'object-assign';

import SearchResult from './SearchResult';
import I18N from '../../I18N/I18N';

import OverlayTriggerCustom from '../../misc/OverlayTriggerCustom';

import { showGFIForService, layerIsVisibleForGFI } from '../../../utils/SearchUtils';

export default class SearchResultList extends React.Component {
    static propTypes = {
        results: PropTypes.array,
        layers: PropTypes.array,
        searchOptions: PropTypes.object,
        mapConfig: PropTypes.object,
        fitToMapSize: PropTypes.bool,
        containerStyle: PropTypes.object,
        sizeAdjustment: PropTypes.object,
        onItemClick: PropTypes.func,
        addMarker: PropTypes.func,
        afterItemClick: PropTypes.func,
        showGFI: PropTypes.func,
        notFoundMessage: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
    };

    static defaultProps = {
        layers: [],
        sizeAdjustment: {
            width: 0,
            height: 110
        },
        containerStyle: {
            zIndex: 1000
        },
        onItemClick: () => {},
        addMarker: () => {},
        afterItemClick: () => {},
        showGFI: () => {}
    };

    onItemClick = (item) => {
        this.props.onItemClick(item, this.props.mapConfig);
    };

    renderResults = () => {
        return this.props.results.map((item, idx)=> {
            const service = this.findService(item) || {};
            const searchLayerObj = find(this.props.layers, {name: service.options?.typeName});
            const visible = showGFIForService(service);
            const disabled = !layerIsVisibleForGFI(searchLayerObj, service);
            return (<SearchResult
                subTitle={service.subTitle}
                idField={service.idField}
                displayName={service.displayName}
                key={item.osm_id || item.id || "res_" + idx}
                item={item}
                onItemClick={this.onItemClick}
                tools={[{
                    id: 'open-gfi',
                    keyProp: 'open-gfi',
                    visible,
                    disabled,
                    glyph: 'info-sign',
                    tooltipId: visible && disabled ? 'search.layerMustBeVisible' : 'search.showGFI',
                    customOverlayTrigger: OverlayTriggerCustom, // to make sure that a tooltip is triggered in chrome when the button is disabled
                    onClick: e => {
                        e.stopPropagation();
                        this.props.showGFI(item);
                    }
                }]}/>);
        });
    };

    render() {
        var notFoundMessage = this.props.notFoundMessage;
        if (!notFoundMessage) {
            notFoundMessage = <I18N.Message msgId="noresultfound" />;
        }
        let containerStyle = this.props.containerStyle;
        let mapSize = this.props.mapConfig && this.props.mapConfig.size;
        if (this.props.fitToMapSize && mapSize) {
            let maxWidth = mapSize.width - this.props.sizeAdjustment.width;
            let maxHeight = mapSize.height - this.props.sizeAdjustment.height;
            containerStyle = assign({}, this.props.containerStyle, {
                maxWidth,
                maxHeight
            });
        }
        if (!this.props.results) {
            return null;
        } else if (this.props.results.length === 0) {
            return <div className="search-result-list" style={assign({padding: "10px", textAlign: "center"}, containerStyle)}>{notFoundMessage}</div>;
        }
        return (
            <div className="search-result-list" style={containerStyle}>
                {this.renderResults()}
            </div>
        );
    }

    findService = (item) => {
        const services = this.props.searchOptions && this.props.searchOptions.services;
        if (item.__SERVICE__ !== null) {
            if (services && typeof item.__SERVICE__ === "string" ) {
                for (let i = 0; i < services.length; i++) {
                    if (services[i] && services[i].id === item.__SERVICE__) {
                        return services[i];
                    }
                }
                for (let i = 0; i < services.length; i++) {
                    if (services[i] && services[i].type === item.__SERVICE__) {
                        return services[i];
                    }
                }

            } else if (typeof item.__SERVICE__ === "object") {
                return item.__SERVICE__;
            }
        }
        return null;
    };
}
