/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Choice = require('./Choice');

const Sheet = React.createClass({
    propTypes: {
        layouts: React.PropTypes.array,
        sheetRegex: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.string]),
        label: React.PropTypes.string,
        onChange: React.PropTypes.func,
        selected: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            layouts: [],
            sheetRegex: /^[^_]+/,
            label: 'Sheet Size',
            onChange: () => {},
            selected: ''
        };
    },
    getSheetFormats() {
        return this.props.layouts.reduce((previous, current) => {
            const layout = current.name.match(this.props.sheetRegex);
            return layout && layout.length > 0 && previous.indexOf(layout[layout.length - 1]) === -1
                && previous.concat([layout[layout.length - 1]]) || previous;
        }, []).map((layout) => ({name: layout, value: layout}));
    },
    render() {
        const {children, sheetRegex, layouts, ...props} = this.props;
        return <Choice {...props} items={this.getSheetFormats()}/>;
    }
});

module.exports = Sheet;
