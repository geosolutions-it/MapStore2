import React from 'react';
import { Glyphicon } from 'react-bootstrap';

import Message from '../../I18N/Message';
import popoverTooltip from '../../misc/enhancers/popover';
import Button from '../../misc/Button';

const AlertIcon = popoverTooltip((props) => (<div className="square-button pull-right no-border" style={{display: 'flex'}} {...props}><Glyphicon glyph="exclamation-mark" className="text-danger"/></div>));

export default ({loadingError, onToggleQuery = () => {}, buttonStyle = "default"} = {}) => (<div className="mapstore-block-width">
    <Button
        id="toc-query-close-button"
        key="menu-button"
        className="square-button no-border"
        bsStyle={buttonStyle}
        onClick={() => onToggleQuery()}>
        <Glyphicon glyph="arrow-left"/>
    </Button>
    {loadingError && (<AlertIcon popover={{text: (<Message msgId="queryform.loadingError"/>)}}/>) || (
        <div className="square-button pull-right no-border" style={{display: 'flex'}}><Glyphicon glyph="filter" className="text-primary"/></div>)}
</div>);
