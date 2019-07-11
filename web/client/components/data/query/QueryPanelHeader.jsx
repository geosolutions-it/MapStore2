const React = require('react');

const {Button, Glyphicon} = require('react-bootstrap');
const buttonTooltip = require('../../misc/enhancers/buttonTooltip');
const AlertIcon = buttonTooltip((props) => (<div className="square-button pull-right no-border" style={{display: 'flex'}} {...props}><Glyphicon glyph="exclamation-mark" className="text-primary"/></div>));

module.exports = ({loadingError, onToggleQuery = () => {}} = {}) => (<div className="mapstore-block-width">
    <Button
        id="toc-query-close-button"
        key="menu-button"
        className="square-button no-border"
        onClick={() => onToggleQuery()}>
            <Glyphicon glyph="arrow-left"/>
    </Button>
    {loadingError && (<AlertIcon tooltipId="queryform.loadingError" tooltipPosition="bottom"/>) || (
    <div className="square-button pull-right no-border" style={{display: 'flex'}}><Glyphicon glyph="filter" className="text-primary"/></div>)}
</div>);
