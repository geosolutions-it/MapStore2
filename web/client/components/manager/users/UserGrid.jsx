/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Grid, Row, Col} = require('react-bootstrap');
const UserCard = require('./UserCard');
const Spinner = require('react-spinkit');
const Message = require('../../I18N/Message');
var UsersGrid = React.createClass({
    propTypes: {
        loadUsers: React.PropTypes.func,
        onEdit: React.PropTypes.func,
        onDelete: React.PropTypes.func,
        myUserId: React.PropTypes.number,
        fluid: React.PropTypes.bool,
        users: React.PropTypes.array,
        loading: React.PropTypes.bool,
        bottom: React.PropTypes.node,
        colProps: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            loadUsers: () => {},
            onEdit: () => {},
            onDelete: () => {},
            fluid: true,
            colProps: {
                xs: 12,
                sm: 6,
                md: 4,
                lg: 3,
                style: {
                    "marginBottom": "20px"
                }
            }
        };
    },
    componentDidMount() {
        this.props.loadUsers();
    },
    renderLoading() {
        return (<div style={{width: "100px", overflow: "visible", margin: "auto"}}>Loading...<Spinner spinnerName="circle" noFadeIn/></div>);
    },
    renderUsers(users) {
        return users.map((user) => {
            let actions = [{
                     onClick: () => {this.props.onEdit(user); },
                     glyph: "wrench",
                     tooltip: <Message msgId="manager.users.editUser" />
            }];
            if ( user && user.role === "GUEST") {
                actions = [];
            } else if (user.id !== this.props.myUserId) {
                actions.push({
                        onClick: () => {this.props.onDelete(user && user.id); },
                        glyph: "remove-circle",
                        tooltip: <Message msgId="manager.users.deleteUser" />
                });
            }

            return <Col {...this.props.colProps}><UserCard user={user} actions={actions}/></Col>;
        });
    },
    render: function() {
        return (
                <Grid fluid={this.props.fluid}>
                    <Row>
                        {this.props.loading ? this.renderLoading() : this.renderUsers(this.props.users || [])}
                    </Row>
                    <Row>
                        {this.props.bottom}
                    </Row>
                </Grid>
        );
    }
});

module.exports = UsersGrid;
