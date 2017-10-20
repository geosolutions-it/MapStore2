const React = require('react');
const PropTypes = require('prop-types');
const {head} = require('lodash');
const ColorUtils = require('../../utils/ColorUtils');
const ColorRampItem = require('./EqualIntervalComponents/ColorRampItem');
const Combobox = require('react-widgets').Combobox;
class ColorRangeSelector extends React.Component {

    static propTypes = {
        value: PropTypes.object,
        onChange: PropTypes.funct,
        items: PropTypes.array
    };

    static defaultProps = {
        onChange: () => {},
        items: [ {
            name: 'Blues',
            options: {base: 190, range: 20}
        }, {
            name: 'Reds',
            options: {base: 10, range: 4}
        }, {
            name: 'Browns',
            options: {base: 30, range: 4}
        }, {
            name: 'Purples',
            options: {base: 275, range: 4}
        }, {
            name: 'Random',
            options: {base: 180, range: 360, options: {base: 180, range: 360, s: 0.67, v: 0.67}}
        }]
    };

    componentWillMount() {
        this.setState({
            ramp: this.props.value
        });
    }
    getValue = () => {
        head(this.getItems().filter(i => i.name === (this.props.value && this.props.value.name)));
    }
    getItems = () => {
        return this.props.items.map(({options = {}, ...item}) => ({
            ...item,
            options,
            ramp: ColorUtils.sameToneRangeColors(options.base, options.range, 6, options.options)
        }));
    }

    render() {
        return (<div className="mapstore-color-ramp-selector">
            <Combobox data={this.getItems()}
                groupBy="schema"
                textField="name"
                itemComponent={ColorRampItem}
                value={this.getValue()}
                onChange={(ramp) => {
                    this.props.onChange(ramp);
                }}/>
        </div>);
    }
}

module.exports = ColorRangeSelector;
