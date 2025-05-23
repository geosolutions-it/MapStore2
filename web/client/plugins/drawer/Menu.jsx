/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon, Tooltip } from 'react-bootstrap';
import Sidebar from 'react-sidebar';

import OverlayTrigger from '../../components/misc/OverlayTrigger';
import { Resizable } from 'react-resizable';
import Message from '../../components/I18N/Message';
import Button from '../../components/misc/Button';
import FlexBox from '../../components/layout/FlexBox';
import Text from '../../components/layout/Text';
class Menu extends React.Component {
    static propTypes = {
        title: PropTypes.node,
        alignment: PropTypes.string,
        activeKey: PropTypes.string,
        docked: PropTypes.bool,
        show: PropTypes.bool,
        onToggle: PropTypes.func,
        onChoose: PropTypes.func,
        single: PropTypes.bool,
        width: PropTypes.number,
        dynamicWidth: PropTypes.number,
        overlapMap: PropTypes.bool,
        changeMapStyle: PropTypes.func,
        layout: PropTypes.object,
        resizable: PropTypes.bool,
        onResize: PropTypes.func
    };

    static defaultProps = {
        docked: false,
        single: false,
        width: 300,
        overlapMap: true,
        layout: {},
        resizable: false,
        onResize: () => {}
    };

    componentDidMount() {
        if (!this.props.overlapMap && this.props.show) {
            let style = {left: this.props.width, width: `calc(100% - ${this.props.width}px)`};
            this.props.changeMapStyle(style, "drawerMenu");
        }
    }

    componentDidUpdate(prevProps) {
        if (!this.props.overlapMap && prevProps.show !== this.props.show) {
            let style = this.props.show ? {left: this.props.width, width: `calc(100% - ${this.props.width}px)`} : {};
            this.props.changeMapStyle(style, "drawerMenu");
        }
    }

    getWidth = () => {
        return this.props.dynamicWidth || this.props.width;
    };

    renderChildren = (child, index) => {
        const props = {
            key: child.key ? child.key : index,
            ref: child.ref,
            open: this.props.activeKey && this.props.activeKey === child.props.eventKey
        };
        const {glyph, icon, buttonConfig, ...childProps} = child.props;
        return <child.type {...props} {...childProps}></child.type>;
    };

    renderButtons = () => {
        return this.props.children.map((child) => {
            const button = (<Button key={child.props.eventKey} className={(child.props.buttonConfig && child.props.buttonConfig.buttonClassName) ? child.props.buttonConfig.buttonClassName : "square-button-md _border-transparent"} onClick={this.props.onChoose.bind(null, child.props.eventKey, this.props.activeKey === child.props.eventKey)} bsStyle={this.props.activeKey === child.props.eventKey ? 'default' : 'primary'}>
                {child.props.glyph ? <Glyphicon glyph={child.props.glyph} /> : child.props.icon}
            </Button>);
            if (child.props.buttonConfig && child.props.buttonConfig.tooltip) {
                const tooltip = <Tooltip key={"tooltip." + child.props.eventKey} id={"tooltip." + child.props.eventKey}><Message msgId={child.props.buttonConfig.tooltip}/></Tooltip>;
                return (
                    <OverlayTrigger placement={"bottom"} key={"overlay-trigger." + child.props.eventKey}
                        overlay={tooltip}>
                        {button}
                    </OverlayTrigger>
                );
            }
            return button;
        });
    };

    renderContent = () => {
        const header = this.props.single ?
            (<FlexBox className="navHeader _padding-sm" gap="sm" centerChildrenVertically>
                <FlexBox.Fill>
                    {this.renderButtons()}
                </FlexBox.Fill>
                <Button className="square-button-md _border-transparent"  onClick={this.props.onToggle}>
                    <Glyphicon glyph="1-close"/>
                </Button>
            </FlexBox>)
            : (<FlexBox className="navHeader _padding-sm" centerChildrenVertically>
                <FlexBox.Fill component={Text} fontSize="md" className="_padding-lr-sm">{this.props.title}</FlexBox.Fill>
                <Button className="square-button-md _border-transparent"  onClick={this.props.onToggle}>
                    <Glyphicon glyph="1-close"/>
                </Button>
            </FlexBox>);
        const content = (<div className={"nav-content"}>
            {header}
            <div className={"nav-body"}>
                {this.props.children.filter((child) => !this.props.single || this.props.activeKey === child.props.eventKey).map(this.renderChildren)}
            </div>
        </div>);
        return this.props.resizable ? <Resizable axis="x" resizeHandles={['e']} width={this.getWidth()} onResize={this.resize}>{content}</Resizable> : content;
    };

    render() {
        return (
            <Sidebar styles={{
                sidebar: {
                    ...this.props.layout,
                    zIndex: 1022,
                    width: this.getWidth()
                },
                overlay: {
                    zIndex: 1021
                },
                root: {
                    right: this.props.show ? 0 : 'auto',
                    width: '0',
                    overflow: 'visible'
                },
                content: {
                    overflowY: 'auto'
                }
            }} sidebarClassName="nav-menu" onSetOpen={() => {
                this.props.onToggle();
            }} open={this.props.show} docked={this.props.docked} sidebar={this.renderContent()}>
                <div />
            </Sidebar>
        );
    }


    resize = (event, { size }) => {
        this.props.onResize(size.width);
    };

}

export default Menu;
