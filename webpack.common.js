const path = require("path");
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
    entry: {
        app: path.join(__dirname, "src/index.tsx"),
        background: path.join(__dirname, "src/backend/background.ts"),
        content: path.join(__dirname, "src/backend/messengerParasite.ts"),
        editMessenger: path.join(__dirname, "src/backend/editMessenger.ts")
    },
    output: {
        path: path.join(__dirname, "build"),
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.(jpg|png|gif|svg|pdf|ico)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name]-[hash:8].[ext]'
                        },
                    },
                ]
            },
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: "ts-loader"
            },
            {
                exclude: /node_modules/,
                test: /\.css$/,
                use: [
                    {
                        loader: "style-loader" // Creates style nodes from JS strings
                    },
                    {
                        loader: "css-loader" // Translates CSS into CommonJS
                    },

                    // {
                    //   loader: "sass-loader" // Compiles Sass to CSS
                    // }
                ]
            },

        ]

    },
    plugins: [
        new CopyWebpackPlugin([
            {from: 'public/*', flatten: true}, {from: 'public/resources', to: 'resources', flatten: true}

        ], {})
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    }
};
