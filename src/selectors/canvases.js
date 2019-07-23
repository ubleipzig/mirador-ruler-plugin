import { createSelector } from 'reselect';
import { getSelectedCanvases } from 'mirador/dist/es/src/state/selectors';

/**
 *
 */
export const getCanvasPhysicalDimensionService = createSelector(
  [
    getSelectedCanvases,
  ],
  (canvases) => {
    return canvases && canvases[0] && canvases[0].__jsonld && canvases[0].__jsonld.service;
  }
);