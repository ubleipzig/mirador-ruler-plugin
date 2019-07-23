import React from 'react';
import PropTypes from 'prop-types';
/**
 *
 */
export class OSDReferenceComponent extends React.Component {
  /**
   * constructor
   * @param {*} props
   */
  constructor(props) {
    super(props);
    const { windowId } = props.targetProps;
    this.osdRef = React.createRef();
    OSDReferences.set(windowId, this.osdRef);
  }

  /**
   *
   */
  render() {
    const { targetProps } = this.props;
    return <this.props.TargetComponent {...targetProps} ref={this.osdRef} />;
  }
}

export const OSDReferences = {

  /**
   * getter for the windowId
   */
  get(windowId) {
    return this.refs[windowId];
  },

  refs: {},

  /**
   * setter for the windowId
   * @param {*} windowId the windowId
   * @param {*} ref
   */
  set(windowId, ref) {
    this.refs[windowId] = ref;
  },
};

OSDReferenceComponent.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  targetProps: PropTypes.object.isRequired,
};

export default {
  component: OSDReferenceComponent,
  mode: 'wrap',
  target: 'OpenSeadragonViewer',
};
