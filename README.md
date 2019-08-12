## Mirador 3 Ruler Plugin

A plugin for Mirador 3 that adds a vertical and horizontal ruler, if a physical dimensions service is available for a given canvas. This plugin is an adaption of the [physical document ruler](https://github.com/dbmdz/mirador-plugins#physical-document-ruler) provided by morpheus87.

Continous Deployment: [![Netlify Status](https://api.netlify.com/api/v1/badges/e8d24f01-4ec5-4ee8-a196-a9de862aa17f/deploy-status)](https://app.netlify.com/sites/agitated-turing-9ac6ed/deploys)

More information about Mirador's plugin system can be found here: [M3 Mirador 3 plugins](https://github.com/ProjectMirador/mirador/wiki/M3---Mirador-3-plugins, "M3 plugins")

## Usage

The plugin provides a create method, you can use to instantiate the plugin, as shown below. Please notice that you also habe to pass the OSDReference plugin as well.

```javascript
class Mirador extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {

    const documentRuler = plugins.createPlugin({
      color: '#ff0000'
    });

    return (
      <Provider store={this.state.store}>
        <PluginProvider
          plugins={[documentRuler, plugins.OsdReference]}
          createRootReducer={createRootReducer}
        >
          <MiradorApp />
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
```

You can use the following configuration attributes:

| Configuration Key | Type | Description |
| ----------------- | ---- | ----------- |
| color | string | color for rulers and labels |
| location | string | string | the ruler's origin |
| smallDashSize | number | size of the small dashes in pixels |
| largeDashSize | number | size of the large dashes in pixels |
| labelsEvery | number | draw ruler labels every n centimeters/inches |
| imperialUnits | boolean | Use imperial units instead of metric |