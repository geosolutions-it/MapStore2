const PropTypes = require('prop-types');
/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var SearchResult = require('./SearchResult');
const I18N = require('../../I18N/I18N');
var assign = require('object-assign');


class SearchResultList extends React.Component {
    static propTypes = {
        results: PropTypes.array,
        searchOptions: PropTypes.object,
        mapConfig: PropTypes.object,
        fitToMapSize: PropTypes.bool,
        containerStyle: PropTypes.object,
        sizeAdjustment: PropTypes.object,
        onItemClick: PropTypes.func,
        addMarker: PropTypes.func,
        afterItemClick: PropTypes.func,
        notFoundMessage: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
    };

    static defaultProps = {
        sizeAdjustment: {
            width: 0,
            height: 110
        },
        containerStyle: {
            zIndex: 1000
        },
        onItemClick: () => {},
        addMarker: () => {},
        afterItemClick: () => {}
    };

    onItemClick = (item) => {
        this.props.onItemClick(item, this.props.mapConfig);
    };

    renderResults = () => {
        return this.props.results.map((item, idx)=> {
            const service = this.findService(item) || {};
            return (<SearchResult
                subTitle={service.subTitle}
                idField={service.idField}
                displayName={service.displayName}
                key={item.osm_id || "res_" + idx} item={item} onItemClick={this.onItemClick}/>);
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
    };
}

module.exports = SearchResultList;
