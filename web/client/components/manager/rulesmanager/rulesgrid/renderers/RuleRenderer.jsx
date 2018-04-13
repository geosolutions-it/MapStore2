/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const PropTypes = require('prop-types');
const { Row: Rule } = require('react-data-grid');

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
        isSelected: PropTypes.bool
    };
    static defaultProps = {
        selected: []
    }
    constructor(props) {
        super(props);
        this.setScrollLeft = (scrollBy) => this.row.setScrollLeft(scrollBy);
    }
    render() {
        const {row = {}, isSelected} = this.props;
        return (
            <div
                key={this.props.row.check}
                className={(isSelected && ' ms-row-select ' || '') + ((accessField[row.grant] || {}).classNameRow || ' ')}
            >
                <Rule ref={ node => this.row = node } {...this.props} />
            </div>);
    }

}

module.exports = RuleRenderer;
