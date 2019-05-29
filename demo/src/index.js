import React from 'react';
import ReactDOM from 'react-dom';
import Mirador from './Mirador';
import { DocumentRulerComponent, OSDReferenceComponent } from '../../src';

ReactDOM.render(
  <Mirador
    config={{
      id: 'ruler-demo',
      windows: [{
        loadedManifest: 'https://api.digitale-sammlungen.de/iiif/presentation/v2/bsb00122140/manifest',
      }],
    }}
    plugins={[
      OSDReferenceComponent,
      DocumentRulerComponent,
    ]}
  />,
  document.getElementById('root'),
);
