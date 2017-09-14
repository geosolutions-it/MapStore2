const React = require('react');
const PropTypes = require('prop-types');
const LocaleUtils = require('../../../../utils/LocaleUtils');
const {OverlayTrigger, Tooltip} = require('react-bootstrap');

class AttributeFilter extends React.PureComponent {
    static propTypes = {
        disabled: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
        value: PropTypes.any,
        column: PropTypes.object,
        placeholderMsgId: PropTypes.string,
        tooltipId: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        value: '',
        placeholderMsgId: "featuregrid.filter.placeholders.default"
    };
    renderInput = () => {
        if (this.props.column.filterable === false) {
            return <span/>;
        }
        const placeholder = LocaleUtils.getMessageById(this.context.messages, this.props.placeholderMsgId) || "Search";
        let inputKey = 'header-filter-' + this.props.column.key;
        return (<input disabled={this.props.disabled} key={inputKey} type="text" className="form-control input-sm" placeholder={placeholder} value={this.props.value} onChange={this.handleChange}/>);
    }
    renderTooltip = (cmp) => {
        if (this.props.tooltipId && LocaleUtils.getMessageById(this.context.messages, this.props.tooltipId)) {
            return (<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip">{LocaleUtils.getMessageById(this.context.messages, this.props.tooltipId)}</Tooltip>}>
              {cmp}
          </OverlayTrigger>);
        }
        return cmp;
    }

    render() {
        let inputKey = 'header-filter--' + this.props.column.key;
        return (
            <div key={inputKey} className="form-group">
              {this.renderTooltip(this.renderInput())}
            </div>
        );
    }
    handleChange = (e) => {
        const value = e.target.value;
        this.props.onChange({value, attribute: this.props.column && this.props.column.name});
    }
}

module.exports = AttributeFilter;
