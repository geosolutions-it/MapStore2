/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import PropTypes from 'prop-types';
import DecimalCoordinateEditor from './DecimalCoordinateEditor';

/**
 This component renders a custom coordiante inpout for decimal degrees for default coordinate CRS and current map CRS as well
*/
class DecimalCoordinateEditorSearch extends DecimalCoordinateEditor {

    static propTypes = {
        idx: PropTypes.number,
        value: PropTypes.number,
        constraints: PropTypes.object,
        format: PropTypes.string,
        coordinate: PropTypes.string,
        onChange: PropTypes.func,
        onKeyDown: PropTypes.func,
        onSubmit: PropTypes.func,
        disabled: PropTypes.bool
    };
    static defaultProps = {
        format: "decimal",
        coordinate: "lat",
        constraints: {
            decimal: {
                lat: {
                    min: -90,
                    max: 90
                },
                lon: {
                    min: -180,
                    max: 180
                }
            }
        },
        onKeyDown: () => {},
        disabled: false
    }
    constructor(props, context) {
        super(props, context);
        this.state = {
            value: this.props.value
        };
    }
    componentDidUpdate(prevProps) {
        const isClearInputs = (prevProps.value && !this.props.value);
        // (!prevProps.value && this.props.value) in case intiate the component with a prev defined values
        // like switch from default coordinate search to current map crs coordinate search
        if (isClearInputs || (!prevProps.value && this.props.value)) {
            this.setState({value: this.props.value});
        }
    }
	validateDecimalX = (xCoordinate) => {
	    const min = this.props.constraints[this.props.format].xCoord.min;
	    const max = this.props.constraints[this.props.format].xCoord.max;

	    const xCoord = parseFloat(xCoordinate);
	    if (isNaN(xCoord) || xCoord < min || xCoord > max ) {
	        return "error";
	    }
	    return null; // "success"
	};
    validateDecimalY = (yCoordinate) => {
        const min = this.props.constraints[this.props.format].yCoord.min;
        const max = this.props.constraints[this.props.format].yCoord.max;
        const yCoord = parseFloat(yCoordinate);
        if (isNaN(yCoord) || yCoord < min || yCoord > max ) {
            return "error";
        }
        return null; // "success"
    }

}

export default DecimalCoordinateEditorSearch;
