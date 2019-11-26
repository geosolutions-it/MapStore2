/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const {connect} = require('react-redux');
const {Glyphicon, Button} = require('react-bootstrap');
const ConfirmButton = require('../components/buttons/ConfirmButton');
const Dialog = require('../components//misc/Dialog');
const Portal = require('../components/misc/Portal');
const Message = require('./locale/Message');
const {isEqual} = require('lodash');
const {toggleControl} = require('../actions/controls');
const {setSearchConfigProp, updateService, restServiceConfig} = require('../actions/searchconfig');

const ServiceList = require('../components/mapcontrols/searchservicesconfig/ServicesList.jsx');
const WFSServiceProps = require('../components/mapcontrols/searchservicesconfig/WFSServiceProps.jsx');
const ResultsProps = require('../components/mapcontrols/searchservicesconfig/ResultsProps.jsx');
const WFSOptionalProps = require('../components/mapcontrols/searchservicesconfig/WFSOptionalProps.jsx');
const PropTypes = require('prop-types');

/**
 * Text Search Services Editor Plugin. Allow to add and edit additional
 * text serch service used by text search plugin. User has to
 * save the map to persist service changes.
 *
 * @class SearchServicesConfig
 * @memberof plugins
 * @static
 *
 * @prop {string} cfg.id identifier of the Plugin
 * @prop {object} cfg.panelStyle inline style for the panel
 * @prop {string} cfg.panelClassName className for the panel
 * @prop {string} cfg.containerClassName className for the container
 */
class SearchServicesConfigPanel extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        enabled: PropTypes.bool,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        containerClassName: PropTypes.string,
        closeGlyph: PropTypes.string,
        titleText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        toggleControl: PropTypes.func,
        pages: PropTypes.arrayOf(PropTypes.shape({
            Element: PropTypes.func.isRequired,
            validate: PropTypes.func.isRequired
        })),
        page: PropTypes.number,
        service: PropTypes.object,
        initServiceValues: PropTypes.object,
        onPropertyChange: PropTypes.func,
        newService: PropTypes.object.isRequired,
        updateService: PropTypes.func,
        restServiceConfig: PropTypes.func,
        textSearchConfig: PropTypes.object,
        editIdx: PropTypes.number
    };

    static defaultProps = {
        id: "search-services-config-editor",
        enabled: false,
        panelStyle: {
            minWidth: "400px",
            zIndex: 2000,
            position: "absolute",
            // overflow: "auto",
            top: "100px",
            minHeight: "300px",
            left: "calc(50% - 150px)",
            backgroundColor: "white"
        },
        panelClassName: "toolbar-panel",
        containerClassName: '',
        closeGlyph: "1-close",
        titleText: <Message msgId="search.configpaneltitle" />,
        closePanel: () => {},
        onPropertyChange: () => {},
        page: 0,
        newService: {
            type: "wfs",
            name: "",
            displayName: "",
            subTitle: "",
            priority: 1,
            options: {
                url: "",
                typeName: "",
                queriableAttributes: "",
                sortBy: "",
                maxFeatures: 5,
                srsName: "EPSG:4326"}
        }
    };

    canProceed = () => {
        const {page, pages, service} = this.props;
        return pages[page].validate(service);
    };

    isDirty = () => {
        const {service, initServiceValues} = this.props;
        return !isEqual(service, initServiceValues);
    };

    renderFooter = () => {
        const {page, pages} = this.props;
        if (page === 0) {
            return (
                <span role="footer">
                    <Button onClick={this.addService} bsStyle="primary">
                        <Message msgId="search.addbtn" />
                    </Button>
                </span>);
        } else if (page === pages.length - 1) {
            return (
                <span role="footer">
                    <Button onClick={this.prev} bsStyle="primary">
                        <Message msgId="search.prevbtn" />
                    </Button>
                    <Button disabled={!this.canProceed()} onClick={this.update} bsStyle="success">
                        <Message msgId="search.savebtn" />
                    </Button>
                </span>);
        }
        return (
            <span role="footer">
                {page === 1 && this.isDirty() ? (
                    <ConfirmButton onConfirm={this.prev} bsStyle="primary"
                        confirming={{text: <Message msgId="search.cancelconfirm" />}}
                        text={(<Message msgId="search.cancelbtn" />)}/>
                ) : (
                    <Button onClick={this.prev} bsStyle="primary">
                        <Message msgId={page === 1 ? "search.cancelbtn" : "search.prevbtn"} />
                    </Button>)
                }
                <Button disabled={!this.canProceed()} onClick={this.next} bsStyle="primary">
                    <Message msgId="search.nextbtn" />
                </Button>
            </span>);
    };

    render() {
        const { enabled, pages, page, id, panelStyle, panelClassName, titleText, closeGlyph, onPropertyChange, service, textSearchConfig = {}, containerClassName} = this.props;
        const Section = pages && pages[page] || null;
        return enabled ? (
            <Portal>
                <Dialog id={id} style={{...panelStyle, display: enabled ? 'block' : 'none'}} containerClassName={containerClassName}className={panelClassName} draggable={false} modal>
                    <span role="header">
                        <span>{titleText}</span>
                        { this.isDirty() ? (
                            <ConfirmButton className="close" confirming={{
                                text: <Message msgId="search.cancelconfirm" />, className: "btn btn-sm btn-warning services-config-editor-confirm-close"}} onConfirm={this.onClose} bsStyle="primary" text={(<Glyphicon glyph={closeGlyph}/>)}/>) : (<button onClick={this.onClose} className="close">{closeGlyph ? <Glyphicon glyph={closeGlyph}/> : <span>×</span>}</button>)
                        }
                    </span>
                    <div role="body" className="services-config-editor">
                        <Section.Element
                            services={textSearchConfig.services}
                            override={textSearchConfig.override}
                            onPropertyChange={onPropertyChange}
                            service={service}/>
                    </div>
                    {this.renderFooter()}
                </Dialog>
            </Portal>) : null;
    }

    onClose = () => {
        this.props.toggleControl("searchservicesconfig");
        this.props.restServiceConfig(0);
    };

    addService = () => {
        const {newService} = this.props;
        this.props.onPropertyChange("init_service_values", newService);
        this.props.onPropertyChange("service", newService);
        this.props.onPropertyChange("page", 1);
    };

    prev = () => {
        const {page} = this.props;
        if (page > 1) {
            this.props.onPropertyChange("page", page - 1);
        } else if (page === 1 ) {
            this.props.restServiceConfig(0);
        }
    };

    next = () => {
        const {page, pages} = this.props;
        if (page < pages.length - 1) {
            this.props.onPropertyChange("page", page + 1);
        }
    };

    update = () => {
        const {service, editIdx} = this.props;
        this.props.updateService(service, editIdx);
    };
}

const SearchServicesPlugin = connect(({controls = {}, searchconfig = {}}) => ({
    enabled: controls.searchservicesconfig && controls.searchservicesconfig.enabled || false,
    pages: [ServiceList, WFSServiceProps, ResultsProps, WFSOptionalProps],
    page: searchconfig && searchconfig.page || 0,
    service: searchconfig && searchconfig.service,
    initServiceValues: searchconfig && searchconfig.init_service_values,
    textSearchConfig: searchconfig && searchconfig.textSearchConfig,
    editIdx: searchconfig && searchconfig.editIdx
}), {
    toggleControl,
    onPropertyChange: setSearchConfigProp,
    restServiceConfig,
    updateService})(SearchServicesConfigPanel);

module.exports = {
    SearchServicesConfigPlugin: SearchServicesPlugin,
    reducers: {
        searchconfig: require('../reducers/searchconfig')
    }
};
