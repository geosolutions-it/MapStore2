const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Draggable = require('react-draggable');

const {PrintPlugin} = require('../../../plugins/Print');

class PrintPreview extends React.Component {
    static propTypes = {
        style: PropTypes.object
    };
    state = {
        PrintPlugin: null
    }
    componentWillMount() {
        PrintPlugin.loadPlugin((plugin) => {
            this.setState({PrintPlugin: plugin});
        });
    }
    render() {
        return (
           this.state.PrintPlugin ? <Draggable start={{x: 0, y: 0}} handle=".panel-heading, .panel-heading *">
               <div>
                   <this.state.PrintPlugin style={this.props.style}
                       />
               </div>
           </Draggable> : null
        );
    }
}

module.exports = PrintPreview;
