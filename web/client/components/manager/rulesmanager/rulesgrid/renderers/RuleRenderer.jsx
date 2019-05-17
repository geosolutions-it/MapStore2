/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const PropTypes = require('prop-types');

const accessField = {
    ALLOW: {
        classNameRow: 'ms-allow-row'
    },
    DENY: {
        classNameRow: 'ms-deny-row'
    }
};

class RuleRenderer extends React.Component {
    static propTypes = {
        idx: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number]),
        row: PropTypes.object,
        renderBaseRow: PropTypes.func.isRequired,
        isSelected: PropTypes.bool
    };
    static defaultProps = {
        selected: []
    }
    constructor(props) {
        super(props);
        this.setScrollLeft = (scrollBy) => this.row.setScrollLeft(scrollBy);
    }
    componentWillUnmount() {
        this.setScrollLeft = null;
    }
    render() {
        const {row = {}, isSelected} = this.props;
        const extraClasses = (isSelected && ' ms-row-select ' || '') + ((accessField[row.grant] || {}).classNameRow || ' ');
        return this.props.renderBaseRow({ extraClasses: extraClasses, ...this.props});
    }
}

module.exports = RuleRenderer;
