const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Choice = require('./Choice');
const {isFunction} = require('lodash');

class Sheet extends React.Component {
    static propTypes = {
        layouts: PropTypes.array,
        sheetRegex: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
        label: PropTypes.string,
        onChange: PropTypes.func,
        selected: PropTypes.string,
        layoutNames: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
    };

    static defaultProps = {
        layouts: [],
        sheetRegex: /^[^_]+/,
        label: 'Sheet Size',
        onChange: () => {},
        selected: ''
    };

    getLayoutName = (layout) => {
        if (this.props.layoutNames) {
            if (isFunction(this.props.layoutNames)) {
                return this.props.layoutNames(layout);
            }
            return this.props.layoutNames[layout] || layout;
        }
        return layout;
    };

    getSheetFormats = () => {
        return this.props.layouts.reduce((previous, current) => {
            const layout = current.name.match(this.props.sheetRegex);
            return layout && layout.length > 0 && previous.indexOf(layout[layout.length - 1]) === -1
                && previous.concat([layout[layout.length - 1]]) || previous;
        }, []).map((layout) => ({name: this.getLayoutName(layout), value: layout}));
    };

    render() {
        const {children, sheetRegex, layouts, ...props} = this.props;
        return <Choice {...props} items={this.getSheetFormats()}/>;
    }
}

module.exports = Sheet;
