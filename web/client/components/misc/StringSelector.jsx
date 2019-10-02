const React = require('react');
const {find} = require('lodash');
const PropTypes = require('prop-types');
const {Glyphicon} = require('react-bootstrap');

class StringSelector extends React.Component {
    static propTypes = {
        options: PropTypes.array,
        value: PropTypes.any,
        onSelect: PropTypes.func,
        valueField: PropTypes.string,
        labelField: PropTypes.string,
        labelRenderer: PropTypes.any
    };

    static defaultProps = {
        onSelect: () => {},
        options: []
    };

    state = {
        open: false
    }
    getSelected = () => {
        return find(this.props.options, this.getFindFunciton());
    };
    getValue = (option) => {
        if (this.props.valueField && option && option[this.props.valueField]) {
            return option[this.props.valueField];
        }
        return option;
    }
    getLabel = (option) => {
        if (this.props.labelField && option && option[this.props.labelField]) {
            return option[this.props.labelField];
        }
        return this.getValue(option);
    };
    getFindFunciton = () => {
        if (this.props.valueField) {
            return {
                [this.props.valueField]: this.props.value
            };
        }
        return this.props.value;
    };
    renderLabel = (option) => {
        if (this.props.labelRenderer) {
            return this.props.labelRenderer(option);
        }
        return this.getLabel(option);
    };
    render() {
        return (
            <span ref={node => {this.node = node;}} className="mapstore-string-select">
                <span onClick={this.handleClick}>
                    <strong>{this.renderLabel(this.getSelected())}</strong>
                    <Glyphicon glyph="chevron-down"/>
                </span>
                {this.state.open && <div className="m-options">
                    <ul>
                        {this.props.options.map((o, i) => <li key={i} onClick={() => {
                            this.setState({open: false});
                            this.props.onSelect(this.getValue(o), o);
                        }}>{this.renderLabel(o)}</li>)}
                    </ul>
                </div>}
            </span>
        );
    }
    handleOutsideClick = (e) => {
        // ignore clicks on the component itself
        if (this.node && this.node.contains && !this.node.contains(e.target) && this.state.open) {
            this.handleClick();
        } else if (document && !this.node && this.handleOutsideClick) {
            document.removeEventListener('click', this.handleOutsideClick, false);
        }
    };
    handleClick = () => {
        if (document && !this.state.open) {
            // attach/remove event handler
            document.addEventListener('click', this.handleOutsideClick, false);
        } else {
            document.removeEventListener('click', this.handleOutsideClick, false);
        }
        const open = !this.state.open;
        this.setState({open});
    };
}

module.exports = StringSelector;
