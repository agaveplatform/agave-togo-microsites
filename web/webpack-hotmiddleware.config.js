var webpack = require('webpack');
var hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=60000&reload=true';

module.exports = {
    context: __dirname,
    entry: {
        login: ["./src/js/login/app.js", hotMiddlewareScript],
        room: ['./src/js/app.js', hotMiddlewareScript],
        screen: ['./src/js/screen/app.js', hotMiddlewareScript],
        whiteboard: ['./src/js/whiteboard/app.js', hotMiddlewareScript],
    },
    output: {
        path: __dirname + '/public/js/',
        publicPath: '/js/',
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
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            filename: "commons.min.js",
            name: "commons"
        })
    ]
};
