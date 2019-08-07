/* eslint-disable max-len */
/* eslint-disable react/forbid-prop-types */
import React, { Component, Fragment } from 'react';
import { extend } from 'lodash';
import PropTypes from 'prop-types';
import { createCssNs } from 'css-ns';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import RulerIcon from '@material-ui/icons/Straighten';
import { getCanvasPhysicalDimensionService } from './selectors/canvases';
import { getContainerId } from 'mirador/dist/es/src/state/selectors'
import { DocumentRuler } from './DocumentRuler';
import { OSDReferences } from './OsdReference';
import { checkDimensionsService } from './util';
/**
 *
 */
export class DocumentRulerComponent extends Component {
  /**
   * constructor
   * @param {*} props
   */
  constructor(props) {
    super(props);
    this.state = { rulerEnabled: false };
    this.ruler = undefined;
    this.onMenuButtonClicked = this.onMenuButtonClicked.bind(this);
  }

  /**
   *
   */
  componentDidMount() {
    const { config, show } = this.props;
    // eslint-disable-next-line react/destructuring-assignment
    const { windowId } = this.props.targetProps;
    const { viewer } = OSDReferences.get(windowId).current;

    extend(config, {
      show,
      viewer,
    });

    this.enable(viewer, config);
  }

  /**
   * componentWillReceiveProps
   * @param {*} props
   * @param {*} state
   * @param {*} context
   */
  componentWillReceiveProps(props) {
    const { rulerEnabled } = this.state;
    const { show } = props;
    if (!rulerEnabled) return;

    if (show) {
      this.ruler.show();
    } else {
      this.ruler.hide();
    }
  }

  /**
   *
   * @param {*} event
   */
  onMenuButtonClicked(event) {
    const { hideDocumentRuler, show, showDocumentRuler } = this.props;
    if (show) {
      hideDocumentRuler();
    } else {
      showDocumentRuler();
    }
  }

  /**
   * enable the ruler if preconditions are met
   */
  enable(viewer, config) {
    const { canvasService } = this.props;
    checkDimensionsService(canvasService)
      .then((service) => {
        if (service && service.profile === 'http://iiif.io/api/annex/services/physdim') {
          const millimetersPerPhysicalUnit = {
            cm: 10.0,
            in: 25.4,
            mm: 1.0,
          };
          const pixelsPerMillimeter = 1 / (millimetersPerPhysicalUnit[service.physicalUnits] * service.physicalScale);
          this.ruler = this.ruler || new DocumentRuler(config);
          this.ruler.PixelsPerMillimeter = pixelsPerMillimeter;
          this.setState(state => ({ ...state, rulerEnabled: true }));
          this.ruler.register();

          viewer.addHandler('tile-loaded', (obj) => {
            this.ruler.updateSize();
            this.ruler.refresh(obj.tiledImage);
          });
        }
      })
  }

  /**
   * render
   * @return {String} - HTML markup for the component
   */
  render() {
    const {
      containerId,
      show,
      TargetComponent,
      targetProps,
    } = this.props;
    const { rulerEnabled } = this.state;
    return rulerEnabled ? (
      <Fragment>
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        >
          <Tooltip
            PopperProps={{
              container: document.querySelector(`#${containerId} .${createCssNs({ namespace: 'mirador', })('viewer')}`),
            }}
            title='ruler'>
              <IconButton
                onClick={this.onMenuButtonClicked}>
                <RulerIcon title={show ? 'show ruler' : 'hide ruler'} />
              </IconButton>
            </Tooltip>
        </div>
        <TargetComponent {...targetProps} />
      </Fragment>
    ) : (<TargetComponent {...targetProps} />);
  }
}

const actionTypes = {
  HIDE_DOCUMENT_RULER: 'HIDE_DOCUMENT_RULER',
  SHOW_DOCUMENT_RULER: 'SHOW_DOCUMENT_RULER',
};

/**
 * custom reducer that stores the information
 * whether the ruler is activate or not
 */
const documentRulerReducer = (state = {}, action) => {
  switch (action.type) {
    case actionTypes.SHOW_DOCUMENT_RULER:
      return {
        ...state,
        [action.windowId]: {
          show: true,
        },
      };
    case actionTypes.HIDE_DOCUMENT_RULER:
      return {
        ...state,
        [action.windowId]: {
          show: false,
        },
      };
    default:
      return state;
  }
};

/**
 * action creator
 * @param {*} windowId
 */
const showDocumentRuler = windowId => (dispatch, getState) => {
  dispatch({
    type: actionTypes.SHOW_DOCUMENT_RULER,
    windowId,
  });
};

/**
 * action creater for hiding the ruler
 * @param {} windowId
 */
const hideDocumentRuler = windowId => (dispatch, getState) => {
  dispatch({
    type: actionTypes.HIDE_DOCUMENT_RULER,
    windowId,
  });
};

/**
 * injects state to props
 * @param {} state
 * @param {*} props
 */
const mapStateToProps = (state, props) => {
  const { windowId } = props.targetProps;
  const { show } = state.ruler[windowId] || { show: false };

  return {
    canvasService: getCanvasPhysicalDimensionService(state, { windowId }),
    config: {
      color: '#000000',
    },
    containerId: getContainerId(state),
    show,
  }
};

/**
 * injects the action
 */
const mapDispatchToProps = (dispatch, props) => {
  const { windowId } = props.targetProps;
  return {
    hideDocumentRuler: () => dispatch(hideDocumentRuler(windowId)),
    showDocumentRuler: () => dispatch(showDocumentRuler(windowId)),
  };
};

DocumentRulerComponent.propTypes = {
  canvasService: PropTypes.object,
  config: PropTypes.object.isRequired,
  hideDocumentRuler: PropTypes.func.isRequired,
  showDocumentRuler: PropTypes.func.isRequired,
  TargetComponent: PropTypes.func.isRequired,
  targetProps: PropTypes.object.isRequired,
};

export default {
  component: DocumentRulerComponent,
  mapDispatchToProps,
  mapStateToProps,
  mode: 'wrap',
  name: 'DocumentRulerComponent',
  reducers: {
    ruler: documentRulerReducer,
  },
  target: 'WindowCanvasNavigationControls',
};
