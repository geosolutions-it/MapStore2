/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const Button = require("../../misc/toolbar/ToolbarButton");
const ContainerDimensions = require('react-container-dimensions').default;
const {Controlled: Codemirror} = require('react-codemirror2');
require('codemirror/lib/codemirror.css');
require('codemirror/mode/sql/sql');
const LocaleUtils = require('../../../utils/LocaleUtils');


class RoiCql extends React.Component {
    static propTypes = {
        wkt: PropTypes.string,
        onChangeFilter: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    constructor(props) {
        super(props);
        this.state = {cql: props.wkt};
    }
    UNSAFE_componentWillReceiveProps({wkt: nw}) {
        if (nw !== this.props.wkt) {
            this.setState({cql: nw});
        }
    }
    onChange = (editor, data, value) => {
        this.setState(() => ({cql: value}));
    }
    render() {
        return (
            <ContainerDimensions>
                {({width}) =>
                    <div style={{width, display: "flex", flexDirection: "column"}}>
                        <Codemirror
                            value={this.state.cql}
                            onBeforeChange={this.onChange}
                            options={{
                                mode: {name: "sql"},
                                lineNumbers: true,
                                lineWrapping: true
                            }}/>
                        <Button disabled={this.props.wkt === this.state.cql} text={LocaleUtils.getMessageById(this.context.messages, "rulesmanager.apply")} onClick={this.apply}/>
                    </div>}
            </ContainerDimensions>);
    }
    apply = () => {
        if (this.props.onChangeFilter) {
            this.props.onChangeFilter(this.state.cql);
        }
    }
}

module.exports = RoiCql;
