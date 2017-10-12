/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const {Button, Row} = require('react-bootstrap');
const Message = require('../../I18N/Message');

/**
 * Provides a base container for wizards.
 * Every child of this component will receive some additional props:
 *  * nextPage
 *  * prevPage
 *  This allows the child component to automatically switch page.
 * It renders only one child a time, identified with the step property. At the bottom, it renders also navigation buttons
 * @prop {number} step current step property
 * @prop {boolean} hideButtons if true hide the next/prev/finish buttons.
 * @prop {function} nextPage function to call on nextPage
 * @prop {function} prevPage function to call on prevPage
 * @prop {function} onFinish function to call when the wizard is finished
 * @prop {function} isStepValid if present, it will be called to get the disabled/enabled state of the next or finish button.
 * The function is called with the step number as agrument.
 * @memberof components.misc.wizard
 * @type WizardContainer
 */
class WizardComponent extends React.Component {
   static propTypes = {
       step: PropTypes.number,
       hideButtons: PropTypes.bool,
       nextPage: PropTypes.func,
       prevPage: PropTypes.func,
       buttonType: PropTypes.node,
       onFinish: PropTypes.func,
       isStepValid: PropTypes.func
   };
   static defaultProps = {
       step: 0,
       isStepValid: () => true,
       hideButtons: false,
       nextPage: () => {},
       prevPage: () => {},
       onFinish: () => {}
   }
   renderButtons = () => {
       let buttons = [];
       const {isStepValid, children = []} = this.props;
       const childrenLenght = children.length >= 0 ? children.length : 1;
       if (this.props.hideButtons) return null;
       if (this.props.step > 0) {
           buttons.push(<Button className="ms-wizard-prev" onClick={() => this.props.prevPage()} ><Message msgId="prev" /></Button>);
       }
       if ( this.props.step >= childrenLenght - 1) {
           buttons.push(<Button className="ms-wizard-finish" onClick={() => this.props.onFinish()} ><Message msgId="finish" /></Button>);
       } else if (this.props.step < childrenLenght - 1 && childrenLenght > 1) {
           buttons.push(<Button className="ms-wizard-next" disabled={!isStepValid(this.props.step)} onClick={() => this.props.nextPage()} ><Message msgId="next" /></Button>);
       }
       return buttons;

   };
   render() {
       const children = this.props.children || [];
       const childrenLenght = children.length >= 0 ? children.length : 1;
       return (
         <div className="ms-wizard">
           {React.Children.map(children, (child, i) => {
               if (i === this.props.step) {
                   return React.cloneElement(child, {
                       nextPage: this.props.step === childrenLenght - 1 ? this.props.onFinish : this.props.nextPage,
                       prevPage: this.props.prevPage
                   });
               }
           })}
           <Row className="ms-wizard-buttons">
              {this.renderButtons()}
           </Row>
         </div>
     );
   }
}
module.exports = WizardComponent;
