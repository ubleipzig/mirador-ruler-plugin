import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import PluginProvider from 'mirador/dist/es/src/extend/PluginProvider';
import MiradorApp from 'mirador/dist/es/src/containers/App'
import createStore from 'mirador/dist/es/src/state/createStore'
import createRootReducer from 'mirador/dist/es/src/state/reducers/rootReducer';
import settings from 'mirador/dist/es/src/config/settings'
import * as actions from 'mirador/dist/es/src/state/actions'
import plugins from '../src/index'

class Mirador extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentWillMount() {
    const store = createStore()
    const manifest = "https://api.digitale-sammlungen.de/iiif/presentation/v2/bsb00079445/manifest"

    store.dispatch(actions.setConfig(settings))
    store.dispatch(actions.setWorkspaceAddVisibility(true))
    store.dispatch(actions.fetchManifest(manifest))
    store.dispatch(actions.addWindow({manifestId: manifest}))
    store.dispatch(actions.setWorkspaceAddVisibility(false));
    this.setState({ store: store })
  }

  render() {
    return (
      <Provider store={this.state.store}>
        <PluginProvider
          plugins={[plugins.DocumentRulerComponent, plugins.OsdReference]}
          createRootReducer={createRootReducer}
        >
          <MiradorApp/>
        </PluginProvider>
      </Provider>
    )
  }
}

const el = document.createElement('div');
el.setAttribute('id', 'mirador')
document.body.appendChild(el);

ReactDOM.render(
  <Mirador />,
  document.getElementById('mirador')
);