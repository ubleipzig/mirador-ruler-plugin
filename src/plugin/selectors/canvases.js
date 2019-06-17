import { createSelector } from 'reselect';
import { getSelectedCanvases } from 'mirador/dist/es/src/state/selectors';
import ManifestoCanvas from 'mirador/dist/es/src/lib/ManifestoCanvas';

export const getCanvasPhysicalDimensionService = createSelector(
  [
    getSelectedCanvases,
  ],
  (canvases) => {
    if (canvases && canvases[0]) {
      const manifestoCanvas = new ManifestoCanvas(canvases[0]);
      return manifestoCanvas.service;
    }
    return undefined;
  },
);
