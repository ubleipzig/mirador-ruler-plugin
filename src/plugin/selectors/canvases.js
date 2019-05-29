import { createSelector } from 'reselect';
import { getSelectedCanvases } from 'mirador/dist/es/src/state/selectors';
import ManifestoCanvas from '/home/glefi/git/mirador/src/lib/ManifestoCanvas';

export const getCanvasPhysicalDimensionService = createSelector(
  [
    getSelectedCanvases,
  ],
  // ToDo what shell we do if we are in book view?
  (canvases) => {
    if (canvases && canvases[0]) {
      const manifestoCanvas = new ManifestoCanvas(canvases[0]);
      return manifestoCanvas.service;
    }
    return undefined;
  },
);
