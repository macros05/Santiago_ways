// Web stub for `react-native-maps` (native-only). Renders a labelled
// placeholder so map screens can be reviewed/screenshot in a browser.
const React = require('react');
const { View, Text, StyleSheet } = require('react-native');

function MapView(props) {
  return React.createElement(
    View,
    { style: [styles.map, props.style] },
    React.createElement(Text, { style: styles.label }, '🗺  Mapa interactivo (solo nativo)'),
    props.children
  );
}

function Noop() {
  return null;
}

const styles = StyleSheet.create({
  map: {
    backgroundColor: '#16242f',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2a3d4a',
  },
  label: { color: '#9fb4c4', fontSize: 14, fontWeight: '600' },
});

MapView.Marker = Noop;
MapView.Polyline = Noop;
MapView.Callout = Noop;

module.exports = MapView;
module.exports.__esModule = true;
module.exports.default = MapView;
module.exports.Marker = Noop;
module.exports.Polyline = Noop;
module.exports.Polygon = Noop;
module.exports.Circle = Noop;
module.exports.Callout = Noop;
module.exports.PROVIDER_DEFAULT = 'default';
module.exports.PROVIDER_GOOGLE = 'google';
