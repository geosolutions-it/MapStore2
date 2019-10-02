/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Dialog = require('./Dialog');
const { Glyphicon } = require('react-bootstrap');
/**
 * StandardDialog implements standard options you want from a Dialog.
 * @prop {boolean} show display the dialog
 * @prop {boolean} modal make the dialog modal
 * @prop {boolean} draggable makes the dialog draggable. false by default.
 * @prop {boolean} closable. If false, disable auto close on click out for modals and hides the close button.
 * @prop {function} onClose Called when user try to close the dialog
 * @prop {node} header Elements to show in the header (title)
 * @prop {node} footer Elements to show in the footer
 * @prop {children} the body of the modal
 *
 */
module.exports = ({
    show,
    style = {},
    modal,
    draggable = false,
    closeGlyph = "1-close",
    closable = true,
    onClose = () => {},
    title,
    header,
    footer,
    children,
    ...props
}) => show ? (<Dialog modal={modal} onClickOut={(closable && modal) ? () => onClose() : null} style={{ ...style, display: show ? "block" : "none" }} draggable={draggable} {...props}>
    <span role="header">
        {title ? title : header || <span>&nbsp;</span>}
        {closable ? <button onClick={() => onClose()} className="settings-panel-close close"><Glyphicon glyph={closeGlyph} /></button> : null}
    </span>
    <span role="body">{children}</span>
    {footer ? <span role="footer">{footer}</span> : null}
</Dialog>) : null;
