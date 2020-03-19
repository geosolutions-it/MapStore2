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
class MarkerType extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        pointType: PropTypes.string,
        options: PropTypes.array,
        onChangeType: PropTypes.func,
        width: PropTypes.number
    };

    static defaultProps = {
        style: {},
        options: [{
            label: 'Marker',
            value: 'marker'
        }, {
            label: 'Symbol',
            value: 'symbol'
        }],
        pointType: "marker",
        onChangeType: () => {}
    };

    render() {
        return (
            <div>
                <Row>
                    <Col xs={6}>
                        <strong><Message msgId="draw.marker.type"/></strong>
                    </Col>
                    <Col xs={6} style={{ position: 'static' }}>
                        <Select
                            clearable={false}
                            options={this.props.options}
                            value={this.props.pointType || 'marker'}
                            onChange={(option) => {
                                const pointType = option && option.value;
                                this.props.onChangeType(this.props.style.id, pointType);
                            }}
                        />
                    </Col>
                </Row>
            </div>
        );
    }

}

module.exports = MarkerType;
