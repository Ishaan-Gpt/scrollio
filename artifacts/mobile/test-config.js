const config = require('./metro.config.js');
console.log('projectRoot in config:', config.projectRoot);
console.log('watchFolders:', config.watchFolders);
console.log('nodeModulesPaths:', config.resolver?.nodeModulesPaths);
