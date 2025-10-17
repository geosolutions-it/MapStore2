import React from 'react';
import { Glyphicon } from 'react-bootstrap';

import HTML from '../../I18N/HTML';
import AlertPopover from '../../misc/AlertPopover';
import Button from '../../misc/Button';
import FlexBox from '../../layout/FlexBox';

export default ({loadingError, onToggleQuery = () => {}, buttonStyle = "default"} = {}) => (<FlexBox centerChildrenVertically gap="sm" classNames={['_padding-sm']}>
    {loadingError ? (
        <AlertPopover
            show={loadingError}
            content={<HTML msgId="queryform.loadingError"/>}
            autoDismissSeconds={5}
            placement="right"
        />
    ) : (
        <div className="square-button-md _border-transparent" style={{display: 'flex'}}><Glyphicon glyph="filter"/></div>
    )}
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
