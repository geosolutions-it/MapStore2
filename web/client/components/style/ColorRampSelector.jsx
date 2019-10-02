const React = require('react');
const PropTypes = require('prop-types');
const colorsSchema = require("./EqualIntervalComponents/ColorRamp");
const ColorRampItem = require('./EqualIntervalComponents/ColorRampItem');
const colors = require("./EqualIntervalComponents/ExtendColorBrewer");
const Combobox = require('react-widgets').Combobox;

class ColorRampSelector extends React.Component {

    static propTypes = {
        colorsSchema: PropTypes.array,
        colors: PropTypes.object,
        classes: PropTypes.number,
        ramp: PropTypes.string
    };

    static defaultProps = {
        colorsSchema,
        colors,
        classes: 5,
        ramp: 'Blues'
    };

    UNSAFE_componentWillMount() {
        this.setState({
            ramp: this.props.ramp
        });
    }

    getColorsSchema = () => {
        return this.props.classes ?
            this.props.colorsSchema.filter((c) => {
                return c.max >= this.props.classes;
            }, this) : this.props.colorsSchema;
    };

    getRampValue = () => {
        let ramp = this.state.ramp;
        if (!this.props.colors[this.state.ramp][this.props.classes]) {
            ramp = this.props.colorsSchema.filter((color) => { return color.max >= this.props.classes; }, this)[0].name;
        }
        return ramp;
    };

    getRamp = () => {
        return this.props.colors[this.state.ramp] ? (
            this.props.colors[this.state.ramp][5].map(c => {
                return <div style={{backgroundColor: c}}></div>;
            })
        ) : null;
    }

    render() {
        return (<div className="mapstore-color-ramp-selector">
            <div className="m-ramp-preview">
                {this.getRamp()}
            </div>
            <Combobox data={this.getColorsSchema()}
                groupBy="schema"
                textField="name"
                itemComponent={ColorRampItem}
                value={this.getRampValue()}
                onChange={(ramp) => {
                    this.setState({
                        ramp: ramp.name
                    });
                }}/>
        </div>);
    }
}

module.exports = ColorRampSelector;
