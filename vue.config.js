const webpack = require('webpack');
const path = require('path');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const productionGzipExtensions = ['js', 'css', 'svg'];

function resolve(dir) {
    return path.join(__dirname, '.', dir);
}

function addStyleResource(rule) {
    rule.use('style-resource')
        .loader('style-resources-loader')
        .options({
            patterns: [
                path.resolve(__dirname, './src/assets/css/common.less')
            ]
        });
}

module.exports = {
    // 基本路径
    publicPath: '/',
    // 输出文件目录
    outputDir: 'dist', // 默认dist
    // 用于嵌套生成的静态资产（js,css,img,fonts）目录
    assetsDir: 'static',
    // 指定生成的 index.html 的输出路径 (相对于 outputDir)。也可以是一个绝对路径
    indexPath: 'index.html',
    filenameHashing: true,
    // 构建多页时使用
    pages: undefined,
    // eslint-loader是否在保存的时候检查
    lintOnSave: false,
    // 是否使用包含运行时编译器的Vue核心的构建
    runtimeCompiler: false,
    // 默认情况下 babel-loader 会忽略所有 node_modules 中的文件。如果你想要通过 Babel 显式转译一个依赖，可以在这个选项中列出来
    transpileDependencies: [],
    // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
    productionSourceMap: false,
    // 如果这个值是一个对象，则会通过 webpack-merge 合并到最终的配置中。如果这个值是一个函数，则会接收被解析的配置作为参数。该函数及可以修改配置并不返回任何东西，也可以返回一个被克隆或合并过的配置版本。
    configureWebpack: config => {
        config.plugins.push(
            new webpack.ProvidePlugin({
                $: 'jquery',
                jquery: 'jquery'
            })
        );
        if (isProduction) {
            config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true;
            config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true;
            config.plugins.push(
                new webpack.DllReferencePlugin({
                    context: path.resolve(__dirname, '..'),
                    manifest: require('./build/vendor-manifest.json')
                })
            );
            config.plugins.push(
                new AddAssetHtmlPlugin({
                    filepath: path.resolve(__dirname, './build/vendor.dll.js'),
                    outputPath: path.posix.join('static', 'js'),
                    publicPath: path.posix.join('/static', 'js'),
                    includeSourcemap: false,
                    hash: true
                })
            );
            config.plugins.push(
                new CompressionWebpackPlugin({
                    filename: '[path].gz[query]',
                    algorithm: 'gzip',
                    test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
                    threshold: 10240,
                    minRatio: 0.8
                })
            );
        }
    },
    //接收一个基于 webpack-chain 的 ChainableConfig 实例，允许对内部的 webpack 配置进行更细粒度的修改。
    chainWebpack: config => {
        config.performance.set('hints', false);
        config.plugins.delete('preload').delete('prefetch');
        config.resolve.alias
            .set('@', resolve('src'))
            .set('@public', resolve('public'))
            .set('@assets', resolve('src/assets'))
            .set('@components', resolve('src/components'))
            .set('@libs', resolve('src/libs'))
            .set('@views', resolve('src/views'))
            .set('service', resolve('src/axios/axios.js'))
            .set('commonHttp', resolve('src/axios/commonHttp.js'));
        config.module
            .rule('images')
            .use('url-loader')
            .loader('url-loader')
            .tap(options => {
                return options;
            });
        if (isProduction) {
            config.module.rule('compile')
                .test(/\.js$/)
                .include
                .add(resolve('src'))
                .add(resolve('node_modules/webpack-dev-server/client'))
                .add(resolve('node_modules'))
                .end()
                .use('babel')
                .loader('babel-loader')
                .options({
                    presets: [
                        ['@babel/preset-env', {
                            modules: false
                        }]
                    ]
                });
            config.optimization.splitChunks({
                chunks: 'all'
            });
        }
        config
            .plugin('html')
            .tap(args => {
                args[0].title = '光子基地管理系统';
                return args;
            });
        const types = ['vue-modules', 'vue', 'normal-modules', 'normal'];
        types.forEach(type => addStyleResource(config.module.rule('less').oneOf(type)));
    },
    // css相关配置
    css: {
        // 启用 CSS modules
        requireModuleExtension: true,
        // 是否使用css分离插件
        extract: isProduction,
        // 开启 CSS source maps
        sourceMap: false
    },
    parallel: require('os').cpus().length > 1,
    // webpack-dev-server 相关配置
    devServer: {
        host: '0.0.0.0',
        port: 8080,
        open: true,
        compress: true,
        hotOnly: false
        // proxy: {
        //     '/api': {
        //         target: 'http://gzsd.banbooyun.com',
        //         changeOrigin: true,
        //         ws: true
        //     }
        // }
    },
    // 第三方插件
    pluginOptions: {}
};
