/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const PropTypes = require('prop-types');

const React = require('react');
const Filter = require('../../../misc/Filter');
const MarkerPropertyPicker = require( "../../MarkerPropertyPicker").default;
const Message = require('../../../I18N/Message');

/**
 * Styler for the glyph, color and shape
*/
class MarkerGlyph extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        markersOptions: PropTypes.object,
        onChange: PropTypes.func,
        width: PropTypes.number
    };

    static defaultProps = {
        style: {},
        onChange: () => {}
    };

    // eslint-disable-next-line no-unused-vars
    renderMarkers = (markers, prefix = '') => {
        return markers.map((marker) => {
            if (marker.markers) {
                return this.renderMarkers(marker.markers, marker.name + '-');
            }
            return (
                <div
                    onClick={() => this.selectStyle(marker)}
                    style={{
                        ...marker.thumbnailStyle,
                        ...(this.isCurrentStyle(marker) && {border: '2px solid #1bd2f5'})
                    }}
                />);
        });
    };

    render() {
        const selectedMarker = this.props.markersOptions.markers.reduce((acc, { markers }) => [...acc, ...markers], []).find((marker) => this.isCurrentStyle(marker)) || {};
        return (
            <div className={"marker-container"}>
                <div className={"marker-icon"}>
                    <div style={{ flex: 1 }}>
                        <Message msgId="draw.marker.icon"/>
                    </div>
                    <div style={{ flex: 1 }}>
                        <MarkerPropertyPicker
                            triggerNode={
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 20,
                                        cursor: 'pointer',
                                        margin: 'auto'
                                    }}>
                                    <i className={`fa fa-${this.props.style.iconGlyph}`}/>
                                </div>
                            }>
                            <div
                                style={{
                                    width: 256,
                                    height: 256,
                                    overflow: 'auto',
                                    position: 'relative',
                                    backgroundColor: '#ffffff'
                                }}>
                                <div style={{ position: 'sticky', top: 0 }}>
                                    <Filter filterPlaceholder="Filter icons..." filterText={this.props.markersOptions.filter} onFilter={this.props.markersOptions.onFilterMarker}/>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center'
                                }}>
                                    {this.props.markersOptions.glyphs.map(glyph => {
                                        if (this.filterMarkerGlyph(glyph)) {
                                            return (
                                                <div
                                                    style={{
                                                        width: 32,
                                                        height: 32,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: 20,
                                                        cursor: 'pointer',
                                                        ...(glyph === this.props.style.iconGlyph && {border: '2px solid #1bd2f5'})
                                                    }}
                                                    onClick={() => {
                                                        this.props.onChange(this.props.style.id, {iconGlyph: glyph});
                                                    }}>
                                                    <i className={`fa fa-${glyph}`}/>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        </MarkerPropertyPicker>
                    </div>
                </div>

                <div className={"marker-shape"}>
                    <div style={{ flex: 1 }}>
                        <Message msgId="draw.marker.shape"/>
                    </div>
                    <div style={{ flex: 1 }}>
                        <MarkerPropertyPicker
                            triggerNode={
                                <div style={{
                                    ...selectedMarker.thumbnailStyle,
                                    margin: 'auto'
                                }}/>
                            }>
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center',
                                    backgroundColor: '#ffffff',
                                    width: 256,
                                    height: 256,
                                    overflow: 'auto'
                                }}>
                                {this.renderMarkers(this.props.markersOptions.markers)}
                            </div>
                        </MarkerPropertyPicker>
                    </div>
                </div>
            </div>
        );
    }

    isCurrentStyle = (m) => {
        // TODO change this
        return this.props.markersOptions.markersConfig.matches(this.props.style, m.style);
    }

    selectStyle = (marker) => {
        return this.props.onChange(this.props.style.id, {...this.props.markersOptions.markersConfig.getStyle(marker.style)});
    };

    filterMarkerGlyph = (marker) =>{
        return marker && marker.toLowerCase().indexOf(this.props.markersOptions?.filter?.toLowerCase() || '') !== -1;
    };
}

module.exports = MarkerGlyph;
