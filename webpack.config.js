
var path = require('path')
var buildPath = path.resolve('docs')



module.exports = (env) => ({

    mode: (env && env.prod) ? 'production' : 'development',

    entry: './src/index.js',
    output: {
        path: buildPath,
        filename: 'bundle.js',
    },

    module: {

        rules: [
            {
                // some kind of breaking change affecting Babylon 5 + webpack 5
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false,
                },
            },
        ],
    },

    performance: {
        // change the default size warnings
        maxEntrypointSize: 1.5e6,
        maxAssetSize: 1.5e6,
    },

    stats: {
        modules: false,
    },
    devtool: 'source-map',
    devServer: {
        static: buildPath,
        host: "0.0.0.0",
    },
    // make the dev server's polling use less CPU :/
    watchOptions: {
        aggregateTimeout: 500,
        poll: 1000,
        ignored: ["node_modules"],
    },
    // split out babylon to a separate bundle (since it rarely changes)
    optimization: {
        splitChunks: {
            cacheGroups: {
                babylon: {
                    chunks: 'initial',
                    test: /babylonjs/,
                    filename: 'babylon.js',
                },
            },
        },
    },
})
