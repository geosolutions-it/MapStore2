 /**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */


const React = require('react');
const {
     Table
} = require('react-bootstrap');
module.exports = ({data = []} = {}) => {
    const cols = Object.keys(data.reduce((a, c) => ({...a, ...c}), {}));
    return (<div className="mapstore-widget-table">
     <Table striped>
         <thead>
             <tr>
                 {cols.map( (k, i) => <th>{i > 0 ? `${k}` : k}</th>)}
             </tr>
         </thead>
         <tbody>
             {data.map( d => (<tr>
                 {cols.map( k => <td>{d[k]}</td>)}
             </tr>))}
         </tbody>
     </Table></div>);
};
