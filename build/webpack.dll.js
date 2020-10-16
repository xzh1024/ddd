'use strict';
const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        vendor: ['vue', 'lodash', 'vuex', 'axios', 'vue-router', 'element-ui', 'babel-polyfill']
    },
    output: {
        path: path.join(__dirname, ''),
        filename: '[name].dll.js',
        library: '[name]_library'
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(__dirname, '.', '[name]-manifest.json'),
            name: '[name]_library',
            context: path.resolve(__dirname, '..')
        })
    ]
};
