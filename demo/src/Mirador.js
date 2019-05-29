import React, { Component } from 'react';
import PropTypes from 'prop-types';
import mirador from 'mirador';

/**
 *
 */
class Mirador extends Component {
  /**
   *
  */
  componentDidMount() {
    const { config, plugins } = this.props;
    mirador.viewer(config, plugins);
  }

  /**
   *
   */
  render() {
    const { config } = this.props;
    return <div id={config.id} />;
  }
}

Mirador.propTypes = {
  config: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  plugins: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default Mirador;
