/**
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import get from 'lodash/get';
import Portal from '../components/misc/Portal';
import ResizableModal from '../components/misc/ResizableModal';
import Message from '../components/I18N/Message';
import {FormControl, FormGroup} from 'react-bootstrap';
import {setControlProperties} from '../actions/controls';
import {addGroup} from '../actions/layers';
import { createPlugin } from '../utils/PluginsUtils';

class AddGroup extends Component {
    static propTypes = {
        enabled: PropTypes.bool,
        parent: PropTypes.string,
        onClose: PropTypes.func,
        onAdd: PropTypes.func
    };

    static defaultProps = {
        enabled: false,
        parent: null,
        onClose: () => {},
        onAdd: () => {}
    };

    state = {
        groupName: ""
    };

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.enabled && !this.props.enabled) {
            this.setState({
                groupName: ""
            });
        }
    }

    render() {
        return (<Portal>
            <ResizableModal
                size="xs"
                clickOutEnabled={false}
                showClose={false}
                title={<Message msgId="toc.addGroup" />}
                show={this.props.enabled}
                buttons={[{
                    text: <Message msgId="cancel" />,
                    onClick: () => {
                        this.props.onClose();
                    }
                }, {
                    bsStyle: "primary",
                    disabled: !this.isValid(this.state.groupName),
                    text: <Message msgId="addgroup.addbtn" />,
                    onClick: () => {
                        this.props.onAdd(this.state.groupName, this.props.parent);
                        this.props.onClose();
                    }
                }]}>
                <div id="mapstore-add-toc-group">
                    <FormGroup>
                        <label htmlFor="groupName"><Message msgId="addgroup.groupName"/></label>
                        <FormControl name="groupName" onChange={this.changeName} value={this.state.groupName}/>
                    </FormGroup>
                </div>
            </ResizableModal>
        </Portal>);
    }

    changeName = (el) => {
        this.setState({
            groupName: el.target.value
        });
    };

    isValid = (name) => {
        return name !== '';
    };
}

const AddGroupPlugin = connect((state) => ({
    enabled: get(state, "controls.addgroup.enabled", false),
    parent: get(state, "controls.addgroup.parent", null)
}), {
    onClose: setControlProperties.bind(null, "addgroup", "enabled", false, "parent", null),
    onAdd: addGroup
})(AddGroup);

/**
 * AddGrouo. Add to the TOC the possibility to add layer group.
 * @memberof plugins
 * @requires plugins.TOC
 */
export default createPlugin('AddGroup', {
    component: AddGroupPlugin,
    containers: {
        TOC: {
            doNotHide: true,
            name: "AddGroup"
        }
    }
});
