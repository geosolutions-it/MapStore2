/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {DropdownList} = require('react-widgets');
const MapInfoUtils = require('../../../../utils/MapInfoUtils');
const {Grid} = require('react-bootstrap');
const Message = require('../../../I18N/Message');
/**
 * FeatureInfoFormat shows the infoformat selected for that layer or the default one taken
 * from the general settings.
 * @class
 * @memberof components.toc
 * @prop {object} [element] the layer options
 * @prop {object} [label] the label shown for the combobox
 * @prop {object} [defaultInfoFormat] the object used to show options labels
 * @prop {string} [generalInfoFormat] the infoFormat value set in the general settings
 * @prop {function} [onInfoFormatChange] it updates the infoFormat and/or viewer for the given layer
 */
module.exports = class extends React.Component {
    static propTypes = {
        element: PropTypes.object,
        label: PropTypes.object,
        defaultInfoFormat: PropTypes.object,
        generalInfoFormat: PropTypes.string,
        onChange: PropTypes.func
    };

    static defaultProps = {
        defaultInfoFormat: MapInfoUtils.getAvailableInfoFormat(),
        generalInfoFormat: "text/plain",
        onChange: () => {},
        label: <Message msgId="layerProperties.featureInfoFormatLbl"/>
    };

    getInfoFormat = (infoFormats) => {
        return Object.keys(infoFormats).map((infoFormat) => {
            return infoFormat;
        });
    }
    render() {
        // the selected value if missing on that layer should be set to the general info format value and not the first one.
        const data = this.getInfoFormat(this.props.defaultInfoFormat);
        const checkDisabled = !!(this.props.element.featureInfo && this.props.element.featureInfo.viewer);
        return (
            <Grid fluid style={{paddingTop: 15, paddingBottom: 15}}>
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
                        value={this.props.element.featureInfo ? this.props.element.featureInfo.format : MapInfoUtils.getLabelFromValue(this.props.generalInfoFormat)}
                        defaultValue={data[0]}
                        disabled={checkDisabled}
                        onChange={(value) => {
                            this.props.onChange("featureInfo", Object.assign({}, {
                                ['format']: value,
                                ['viewer']: this.props.element.featureInfo ? this.props.element.featureInfo.viewer : undefined
                            }));
                        }} />
                    )] : null}
            </Grid>
        );
    }
};
