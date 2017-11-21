var PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

/**
 * Render the given html code into a <div>
 *
 * Properties:
 *  - html: {string} a html string
 *  - id: {string} a custom id for this component
 */
class HtmlRenderer extends React.Component {
    static propTypes = {
        html: PropTypes.string,
        id: PropTypes.string
    };

    getSourceCode = () => {
        return {
            __html: this.props.html
        };
    };

    render() {
        return <div id={this.props.id} dangerouslySetInnerHTML={this.getSourceCode()} />;
    }
}

module.exports = HtmlRenderer;
