/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import React from 'react';

import PropTypes from 'prop-types';
import { getMessageById } from '../../../../utils/LocaleUtils';
import { Tooltip } from 'react-bootstrap';
import OverlayTrigger from '../../../misc/OverlayTrigger';

class AttributeFilter extends React.PureComponent {
    static propTypes = {
        valid: PropTypes.bool,
        disabled: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
        value: PropTypes.any,
        column: PropTypes.object,
        placeholderMsgId: PropTypes.string,
        tooltipMsgId: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        value: '',
        valid: true,
        onChange: () => {},
        column: {},
        placeholderMsgId: "featuregrid.filter.placeholders.default"
    };
    renderInput = () => {
        if (this.props.column.filterable === false) {
            return <span/>;
        }
        const placeholder = getMessageById(this.context.messages, this.props.placeholderMsgId) || "Search";
        let inputKey = 'header-filter-' + this.props.column.key;
        return (<input disabled={this.props.disabled} key={inputKey} type="text" className="form-control input-sm" placeholder={placeholder} value={this.props.value} onChange={this.handleChange}/>);
    }
    renderTooltip = (cmp) => {
        if (this.props.tooltipMsgId && getMessageById(this.context.messages, this.props.tooltipMsgId)) {
            return (<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip">{getMessageById(this.context.messages, this.props.tooltipMsgId)}</Tooltip>}>
                {cmp}
            </OverlayTrigger>);
        }
        return cmp;
    }

    render() {
        let inputKey = 'header-filter--' + this.props.column.key;
        return (
            <div key={inputKey} className={`form-group${(this.props.valid ? "" : " has-error")}`}>
                {this.renderTooltip(this.renderInput())}
            </div>
        );
    }
    handleChange = (e) => {
        const value = e.target.value;
        this.props.onChange({value, attribute: this.props.column && this.props.column.key});
    }
}

export default AttributeFilter;
