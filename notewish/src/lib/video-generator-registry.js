const manifest = require('../config/template-manifest.json');

function getTemplateById(id) {
  return manifest[id];
}

module.exports = { getTemplateById };
