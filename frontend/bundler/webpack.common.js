const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')

module.exports = {
    entry: {
        helpers: path.resolve(__dirname, '../src/helpers.js'),
        app: path.resolve(__dirname, '../src/transitioner.js')
    },
    output:
    {
        filename: 'bundle.[contenthash].js',
        path: path.resolve(__dirname, '../dist')
    },
    devtool: 'source-map',
    plugins:
        [
            new CopyWebpackPlugin({
                patterns: [
                    { from: path.resolve(__dirname, '../static') }
                ]
            }),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, '../src/index.html'),
                minify: true
            }),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, '../src/settings.html'),
                filename: 'settings.html',
                minify: true
            }),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, '../src/modal.html'),
                filename: 'modal.html',
                minify: true
            }),
            new MiniCSSExtractPlugin()
        ],
    module:
    {
        rules:
            [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use:
                        [
                            'babel-loader'
                        ]
                },
                {
                    test: /\.s[ac]ss|css$/,
                    use:
                        [
                            'style-loader',
                            'css-loader',
                            'sass-loader'
                        ]
                },
                {
                    test: /\.(jpg|png|gif|svg)$/,
                    use:
                        [
                            {
                                loader: 'file-loader',
                                options:
                                {
                                    outputPath: 'assets/images/'
                                }
                            }
                        ]
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/i,
                    type: 'asset/resource',
                }
            ]
    }
}
