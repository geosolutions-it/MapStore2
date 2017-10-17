const React = require('react');
const PropTypes = require('prop-types');
const {Panel} = require('react-bootstrap');
const SwitchButton = require('./SwitchButton');

class SwitchPanel extends React.Component {

    static propTypes = {
        title: PropTypes.string,
        expanded: PropTypes.bool,
        onSwitch: PropTypes.func,
        locked: PropTypes.bool
    };

    static defaultProps = {
        title: '',
        expanded: false,
        onSwitch: () => {},
        locked: false
    };

    componentWillMount() {
        this.setState({
            expanded: this.props.expanded
        });
    }

    renderHeader() {
        return (<div>
            <div className="pull-left">{this.props.title}</div>
            <div className="pull-right">
                {!this.props.locked ? <SwitchButton
                    checked={this.props.expanded}
                    onSwitch={(checked) => {
                        this.props.onSwitch(checked);
                        this.setState({
                            expanded: checked
                        });
                    }}/> : null}
            </div>
        </div>);
    }

    renderBody() {
        return (<div>
            {this.props.children}
        </div>);
    }

    render() {
        return (<div className="mapstore-switch-panel">
            <Panel header={this.renderHeader()}>
                {this.state.expanded ? this.renderBody() : null}
            </Panel>
        </div>);
    }
}

module.exports = SwitchPanel;
