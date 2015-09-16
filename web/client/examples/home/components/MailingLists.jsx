/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

var MailingLists = React.createClass({
    render() {
        return (
            <div id="mailinglists">
                <h1 className="color2" style={{align: "center", fontWeight: "bold", margin: "10px"}} align="center"> Keep in touch and stay up-to-date with the mailing lists </h1>
                    <table border="0" cellSpacing="5" style={{margin: "10px auto", borderSpacing: "10px", "borderCollapse": "separate"}}>
                        <tr>
                            <td>
                                <table border="0" style={{backgroundColor: "#fff", padding: "5px"}} cellSpacing="0">
                                    <tr>
                                        <td>
                                            <img src="examples/home/img/groups_logo_sm.gif" height="30" width="136" alt="Google Groups" />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{paddingLeft: "10px", paddingRight: "10px"}}>
                                            <b>Subscribe Users Mailing List</b>
                                        </td>
                                    </tr>
                                    <form action="http://groups.google.com/group/mapstore-users/boxsubscribe">
                                    <tr>
                                        <td style={{paddingLeft: "10px", paddingRight: "10px"}}>
                                            Email: <input type="text" name="email" />
                                        <input type="submit" name="sub" value="Subscribe" />
                                        </td>
                                    </tr>
                                    </form>
                                    <tr>
                                        <td align="right">
                                            <a className="link-white-bg" href="http://groups.google.com/group/mapstore-users">Visit this group</a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                            <td>
                                <table border="0" style={{backgroundColor: "#fff", padding: "5px"}} cellSpacing="0">
                                    <tr>
                                        <td>
                                            <img src="examples/home/img/groups_logo_sm.gif" height="30" width="136" alt="Google Groups" />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{paddingLeft: "10px", paddingRight: "10px"}}>
                                            <b>Subscribe Developers Mailing List</b>
                                        </td>
                                    </tr>
                                    <form action="http://groups.google.com/group/mapstore-developers/boxsubscribe">
                                    <tr>
                                        <td style={{paddingLeft: "10px", paddingRight: "10px"}}>
                                            Email: <input type="text" name="email" />
                                        <input type="submit" name="sub" value="Subscribe" />
                                        </td>
                                    </tr>
                                    </form>
                                    <tr>
                                        <td align="right">
                                            <a className="link-white-bg" href="http://groups.google.com/group/mapstore-developers">Visit this group</a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

				<br/><br/>
			</div>
        );
    }
});

module.exports = MailingLists;
