
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon, Table, Tooltip } from 'react-bootstrap';

import OverlayTrigger from '../../misc/OverlayTrigger';
import Message from '../../I18N/Message';
import Button from '../../misc/Button';

class UsersTable extends React.Component {
    static propTypes = {
        users: PropTypes.array,
        deleteToolTip: PropTypes.string,
        onRemove: PropTypes.func
    };

    static defaultProps = {
        users: [],
        deleteToolTip: "usergroups.removeUser",
        onRemove: () => {}
    };

    render() {
        return (<Table striped condensed hover><tbody>{this.props.users.map((user) => {
            let tooltip = <Tooltip id="tooltip"><Message msgId={this.props.deleteToolTip} /></Tooltip>;
            return (<tr>
                <td><Glyphicon glyph="user" /> {user.name}</td>
                <td>
                    <OverlayTrigger placement="left" overlay={tooltip}>
                        <Button style={{"float": "right"}} bsSize="xs" onClick={() => {
                            this.props.onRemove(user);
                        }}>
                            <Glyphicon glyph="remove-circle"/>
                        </Button>
                    </OverlayTrigger>
                </td>
            </tr>
            );
        })}</tbody></Table>);
    }
}

export default UsersTable;
