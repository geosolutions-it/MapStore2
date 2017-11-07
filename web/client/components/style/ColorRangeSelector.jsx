const React = require('react');
const PropTypes = require('prop-types');
const {head} = require('lodash');
const ColorUtils = require('../../utils/ColorUtils');
const ColorRampItem = require('./EqualIntervalComponents/ColorRampItem');
const DropdownList = require('react-widgets').DropdownList;
class ColorRangeSelector extends React.Component {

    static propTypes = {
        value: PropTypes.object,
        samples: PropTypes.number,
        onChange: PropTypes.funct,
        items: PropTypes.array
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        samples: 5,
        onChange: () => {},
        items: [{
            name: 'global.colors.blue',
            options: {base: 190, range: 20}
        }, {
            name: 'global.colors.red',
            options: {base: 10, range: 4}
        }, {
            name: 'global.colors.green',
            options: {base: 180, range: 4}
        }, {
            name: 'global.colors.brown',
            options: {base: 30, range: 4}
        }, {
            name: 'global.colors.purple',
            options: {base: 275, range: 4}
        }, {
            name: 'global.colors.random',
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
            ramp: ColorUtils.sameToneRangeColors(options.base, options.range, this.props.samples, options.options)
        }));
    }

    render() {
        return (
            <DropdownList
                className="color-range-selector"
                data={this.getItems()}
                groupBy="schema"
                valueComponent={ColorRampItem}
                itemComponent={ColorRampItem}
                value={this.getValue()}
                onChange={(ramp) => {
                    this.props.onChange(ramp);
                }}/>
        );
    }
}

module.exports = ColorRangeSelector;
