/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const PropTypes = require('prop-types');
const React = require('react');
const {Row, Col} = require('react-bootstrap');
const Select = require('react-select').default;

const Message = require('../../../I18N/Message');

/**
 * Styler for the gliph, color and shape
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

    renderMarkers = (markers, prefix = '') => {
        return markers.map((marker) => {
            if (marker.markers) {
                return (<div className={"mapstore-annotations-info-viewer-marker-group mapstore-annotations-info-viewer-marker-" + prefix + marker.name}>
                    {this.renderMarkers(marker.markers, marker.name + '-')}
                </div>);
            }
            return (
                <div onClick={() => this.selectStyle(marker)}
                    className={"mapstore-annotations-info-viewer-marker mapstore-annotations-info-viewer-marker-" + prefix + marker.name +
                        (this.isCurrentStyle(marker) ? " mapstore-annotations-info-viewer-marker-selected" : "")} style={marker.thumbnailStyle} />);
        });
    };

    render() {
        const glyphRenderer = (option) => (<div><span className={"fa fa-" + option.value} style={{padding: '0 10px'}}/><span> {option.label}</span></div>);
        return (
            <div>
                <Row>
                    <Col xs={6}>
                        <strong><Message msgId="draw.marker.icon"/></strong>
                    </Col>
                    <Col xs={6} style={{ position: 'static' }}>
                        <Select
                            options={this.props.markersOptions.glyphs.map(g => ({
                                label: g,
                                value: g
                            }))}
                            clearable={false}
                            optionRenderer={glyphRenderer}
                            valueRenderer={glyphRenderer}
                            value={this.props.style.iconGlyph || 'comment'}
                            onChange={(option) => {
                                const iconGlyph = option && option.value || "";
                                this.props.onChange(this.props.style.id, {iconGlyph});
                            }}/>
                    </Col>
                </Row>
                <hr/>
                <Row>
                    <Col xs={12} style={{display: 'flex', justifyItems: 'center'}}>
                        <div style={{margin: 'auto'}}>
                            {this.renderMarkers(this.props.markersOptions.markers)}
                        </div>
                    </Col>
                </Row>
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
}

module.exports = MarkerGlyph;
