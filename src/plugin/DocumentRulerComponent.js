/* eslint-disable max-len */
/* eslint-disable react/forbid-prop-types */
import React, { Component, Fragment } from 'react';
import { extend } from 'underscore';
import PropTypes from 'prop-types';
import { MiradorMenuButton } from 'mirador/dist/es/src/components/MiradorMenuButton';
import RulerIcon from '@material-ui/icons/Straighten';
import { getCanvasPhysicalDimensionService } from './selectors/canvases';
import { DocumentRuler } from './DocumentRuler';
// eslint-disable-next-line import/no-absolute-path
import { OSDReferences } from './OsdReference';
import { checkDimensionsService } from './util';

/**
 *
 */
class DocumentRulerComponent extends Component {
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
    this.ruler = this.ruler || new DocumentRuler(config);
    this.enable(viewer);

    if (show) {
      this.ruler.show();
    } else {
      this.ruler.hide();
    }

    // ToDo add further handler
  }

  /**
   * componentWillReceiveProps
   * @param {*} props
   * @param {*} state
   * @param {*} context
   */
  componentWillReceiveProps(props, ctx) {
    const { show } = this.props;

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
   * enable the ruler if the preconditions are met
   */
  enable(viewer) {
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
          this.ruler.PixelsPerMillimeter = pixelsPerMillimeter;
          this.setState(state => ({ ...state, rulerEnabled: true }));
          this.ruler.register();

          viewer.addHandler('tile-loaded', (obj) => {
            this.ruler.updateSize();
            this.ruler.refresh(obj.tiledImage);
          });
        }
      });
  }

  /**
   * render
   * @return {String} - HTML markup for the component
   */
  render() {
    const {
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
          <MiradorMenuButton
            aria-label="ruler"
            onClick={this.onMenuButtonClicked}
          >
            <RulerIcon title={show ? 'show ruler' : 'hide ruler'} />
          </MiradorMenuButton>
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
    show,
  };
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
  canvasService: PropTypes.array.isRequired,
  config: PropTypes.object.isRequired,
  hideDocumentRuler: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
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
