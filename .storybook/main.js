const path = require('path');

module.exports = {
  stories: ['../components/**/*.stories.@(js|jsx|ts|tsx)', '../components/**/*.stories.mdx'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  webpackFinal(config) {
    Object.assign(config.resolve.alias, {
      '@': path.resolve(__dirname, '../'),
    });
    return config;
  },
};
