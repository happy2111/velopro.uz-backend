// javascript
const os = require('os');

function getNetworkAddress() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      const isIPv4 =
        net.family === 'IPv4' || net.family === 4; // совместимость с разными версиями Node
      if (isIPv4 && !net.internal) {
        return net.address;
      }
    }
  }
  // если ничего не нашли (нет активной сети), оставим localhost
  return 'localhost';
}

module.exports = { getNetworkAddress };