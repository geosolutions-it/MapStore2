const PropTypes = require('prop-types');
/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {DropdownList} = require('react-widgets');
const MapInfoUtils = require('../../../../utils/MapInfoUtils');

module.exports = class extends React.Component {
    static propTypes = {
        element: PropTypes.object,
        label: PropTypes.string,
        defaultInfoFormat: PropTypes.object,
        onInfoFormatChange: PropTypes.func
    };

    static defaultProps = {
        defaultInfoFormat: MapInfoUtils.getAvailableInfoFormat(),
        onInfoFormatChange: () => {}
    };

    render() {
        const data = Object.keys(this.props.defaultInfoFormat).map((infoFormat) => {
            return infoFormat;
        });
        return (
            <div>
                {this.props.element.type === "wms" ?
                [(<label
                    id="mapstore-featureinfoformat-label"
                    key="featureinfoformat-label"
                    className="control-label"
                    style={{marginBottom: "10px"}}>
                    {this.props.label}
                </label>),
                (<DropdownList
                    key="format-dropdown"
                    data={data}
                    value={this.props.element.featureInfo ? this.props.element.featureInfo.format : data[0]}
                    defaultValue={data[0]}
                    onChange={(value) => {
                        this.props.onInfoFormatChange("featureInfo", Object.assign({}, {
                            ['format']: value
                        }));
                    }} />
                )] : null}
            </div>
        );
    }
};
