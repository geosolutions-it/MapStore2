import React from 'react';
import { Glyphicon } from 'react-bootstrap';

import Message from '../../I18N/Message';
import popoverTooltip from '../../misc/enhancers/popover';
import Button from '../../misc/Button';
import FlexBox from '../../layout/FlexBox';

const AlertIcon = popoverTooltip((props) => (<div className="square-button-md _border-transparent" style={{display: 'flex'}} {...props}><Glyphicon glyph="exclamation-mark" className="text-danger"/></div>));

export default ({loadingError, onToggleQuery = () => {}, buttonStyle = "default"} = {}) => (<FlexBox centerChildrenVertically gap="sm" classNames={['_padding-sm']}>
    {loadingError && (<AlertIcon popover={{text: (<Message msgId="queryform.loadingError"/>)}}/>) || (
        <div className="square-button-md _border-transparent" style={{display: 'flex'}}><Glyphicon glyph="filter"/></div>)}
    <FlexBox.Fill />
    <Button
        id="toc-query-close-button"
        key="menu-button"
        className="square-button-md _border-transparent"
        bsStyle={buttonStyle}
        onClick={() => onToggleQuery()}>
        <Glyphicon glyph="1-close"/>
    </Button>
</FlexBox>);
