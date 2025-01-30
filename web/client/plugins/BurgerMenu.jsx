/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import assign from 'object-assign';
import { DropdownButton, Glyphicon, MenuItem } from 'react-bootstrap';

import tooltip from "../components/misc/enhancers/tooltip";
import ToolsContainer from './containers/ToolsContainer';
import Message from './locale/Message';
import { createPlugin } from '../utils/PluginsUtils';
import {setControlProperty} from "../actions/controls";
import {burgerMenuSelector} from "../selectors/controls";

import './burgermenu/burgermenu.css';

const TDropdownButton = tooltip(DropdownButton);
const Container = ({children, ...props}) => (
    <TDropdownButton
        noCaret
        pullRight
        bsStyle="primary"
        title={<Glyphicon glyph="menu-hamburger"/>}
        tooltipId="options"
        tooltipPosition="bottom"
        {...props}
    >
        {children}
    </TDropdownButton>
);

const InnerContainer = ({children, ...props}) => (
    <div {...props}>
        {children}
    </div>
);

const AnchorElement = ({children, href, target, onClick}) => (
    <a href={href} target={target} onClick={onClick}>{children}</a>
);

const BurgerMenuMenuItem = ({
    active,
    onClick,
    glyph,
    labelId,
    className
}) => {
    return (
        <MenuItem
            active={active}
            className={className}
            onClick={() => onClick(!active)}
        >
            <Glyphicon glyph={glyph}/><Message msgId={labelId}/>
        </MenuItem>
    );
};

class BurgerMenu extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        dispatch: PropTypes.func,
        items: PropTypes.array,
        title: PropTypes.node,
        onItemClick: PropTypes.func,
        onInit: PropTypes.func,
        onDetach: PropTypes.func,
        controls: PropTypes.object,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        className: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object,
        router: PropTypes.object
    };

    static defaultProps = {
        id: "mapstore-burger-menu",
        className: 'square-button',
        items: [],
        onItemClick: () => {},
        title: <MenuItem header><Message msgId="options"/></MenuItem>,
        controls: [],
        panelStyle: {
            minWidth: "300px",
            right: "52px",
            zIndex: 100,
            position: "absolute",
            overflow: "auto"
        },
        panelClassName: "toolbar-panel",
        onInit: () => {},
        onDetach: () => {}
    };

    componentDidMount() {
        const { onInit } = this.props;
        onInit();
    }

    componentDidUpdate(prevProps) {
        const { onInit } = this.props;
        prevProps.isActive === false && onInit();
    }

    componentWillUnmount() {
        const { onDetach } = this.props;
        onDetach();
    }


    getPanels = items => {
        return items.filter((item) => item.panel)
            .map((item) => assign({}, item, {panel: item.panel === true ? item.plugin : item.panel})).concat(
                items.filter((item) => item.tools).reduce((previous, current) => {
                    return previous.concat(
                        current.tools.map((tool, index) => ({
                            name: current.name + index,
                            panel: tool,
                            cfg: current.cfg.toolsCfg ? current.cfg.toolsCfg[index] : {}
                        }))
                    );
                }, [])
            );
    };

    getTools = () => {
        const processChildren = (children = []) => {
            const childTools = children.map(child => ({
                ...child,
                ...processChildren(child.children)
            })).sort((a, b) => a.position - b.position);
            const innerProps = {
                container: InnerContainer,
                containerWrapperStyle: {position: 'static'},
                className: 'burger-menu-submenu',
                toolStyle: 'primary',
                activeStyle: 'default',
                stateSelector: 'burgermenu',
                eventSelector: 'onSelect',
                tool: MenuItem,
                // tool: ({ children: c, ...props }) => <MenuItem componentClass={AnchorElement} {...props} >{c}</MenuItem>,
                panelStyle: this.props.panelStyle,
                panelClassName: this.props.panelClassName
            };
            return children.length > 0 ? {
                containerWrapperStyle: {position: 'static'},
                style: {position: 'relative'},
                childTools,
                childPanels: this.getPanels(children),
                innerProps
            } : {};
        };

        return [
            {
                element:
                    <span key="burger-menu-title">
                        {this.props.title}
                    </span>
            },
            ...this.props.items.map(item => ({
                ...item,
                ...processChildren(item.children)
            })).sort((a, b) => a.position - b.position)
        ];
    };

    render() {
        return (
            <ToolsContainer id={this.props.id} className={this.props.className}
                container={Container}
                toolStyle="primary"
                activeStyle="default"
                stateSelector="burgermenu"
                eventSelector="onSelect"
                tool={({ children: c, ...props }) => <MenuItem componentClass={AnchorElement} {...props} >{c}</MenuItem>}
                tools={this.getTools()}
                panels={this.getPanels(this.props.items)}
                panelStyle={this.props.panelStyle}
                panelClassName={this.props.panelClassName}
                toolComponent={BurgerMenuMenuItem}
            />);
    }
}

const BurgerMenuPlugin = connect((state) =>({
    controls: state.controls,
    active: burgerMenuSelector(state)
}), {
    onInit: setControlProperty.bind(null, 'burgermenu', 'enabled', true),
    onDetach: setControlProperty.bind(null, 'burgermenu', 'enabled', false)
})(BurgerMenu);

/**
 * Menu button that can contain other plugins entries.
 * Usually rendered inside {@link #plugins.OmniBar|plugins.OmniBar}
 * You can render an item inside burger menu by adding the following to the `containers` entry of your plugin.
 * It is a wrapper for `ToolsContainer` so all the properties of the tools of {@link #plugins.containers.ToolContainer|ToolContainer} can be used here (action, selector ...).
 * ```
 * BurgerMenu: {
 *      name: 'my_entry', // name of your entry
 *      position: 1000, // the position you want
 *      text: <Message msgId="details.title"/>, // the text to show in the menu entry
 *      icon: <Glyphicon glyph="sheet"/>, // the icon to use
 *      // the following are some examples from ToolContainer property
 *      action: openDetailsPanel, // the function to call when the menu entry is clicked
 *      selector: a function that can return some additional properties for the menu entry. Is used typically to hide the menu returning, under certain contdition `{ style: {display: "none"} }`
 *  },
 * ```
 * @name BurgerMenu
 * @class
 * @memberof plugins
 */
export default createPlugin(
    'BurgerMenu',
    {
        component: BurgerMenuPlugin,
        containers: {
            OmniBar: {
                name: "burgermenu",
                position: 2,
                tool: true,
                priority: 1
            },
            BrandNavbar: {
                position: 8,
                priority: 2,
                target: 'right-menu',
                Component: connect(() => ({ id: 'ms-burger-menu', className: 'square-button-md' }))(BurgerMenuPlugin)
            }
        }
    }
);
