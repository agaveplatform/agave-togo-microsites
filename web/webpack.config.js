var webpack = require('webpack');

module.exports = {
    resolve: {
        modulesDirectories: ["web_modules", "node_modules", "bower_components"]
    },
    entry: {
        login: "./src/js/login/app.js",
        room: './src/js/app.js',
        screen: './src/js/screen/app.js',
        whiteboard: './src/js/whiteboard/app.js'
    },
    output: {
        path: './public/js/',
        filename: "[name].bundle.min.js",
        chunkFilename: "[id].chunk.min.js"
    },
    devtool: 'source-map',
    module: {
        loaders: [
            {test: /\.css$/, loader: 'style!css'}
        ]
    },
    plugins: [
        new webpack.ResolverPlugin(
            new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin(".bower.json", ["main"])
        ),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            warnings: false,
            mangle: {
                except: ['$q', '$ocLazyLoad']
            },
            sourceMap: false
        }),
        new webpack.optimize.CommonsChunkPlugin({
            filename: "commons.min.js",
            name: "commons"
        }),
        new webpack.DefinePlugin({
            ON_DEMO: process.env.NODE_ENV === 'demo'
        })
    ]
};
