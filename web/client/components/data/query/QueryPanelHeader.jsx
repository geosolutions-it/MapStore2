const React = require('react');
const Message = require('../../I18N/Message');
const {Button, Glyphicon} = require('react-bootstrap');
const popoverTooltip = require('../../misc/enhancers/popover');
const AlertIcon = popoverTooltip((props) => (<div className="square-button pull-right no-border" style={{display: 'flex'}} {...props}><Glyphicon glyph="exclamation-mark" className="text-danger"/></div>));

module.exports = ({loadingError, onToggleQuery = () => {}} = {}) => (<div className="mapstore-block-width">
    <Button
        id="toc-query-close-button"
        key="menu-button"
        className="square-button no-border"
        onClick={() => onToggleQuery()}>
        <Glyphicon glyph="arrow-left"/>
    </Button>
    {loadingError && (<AlertIcon popover={{text: (<Message msgId="queryform.loadingError"/>)}}/>) || (
        <div className="square-button pull-right no-border" style={{display: 'flex'}}><Glyphicon glyph="filter" className="text-primary"/></div>)}
</div>);
