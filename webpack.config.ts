import * as path from "path";
import * as webpack from "webpack";

const extConfig: webpack.Configuration = {
  target: "node",
  entry: "./src/extension.ts",
  output: {
    filename: "extension.js",
    libraryTarget: "commonjs2",
    path: path.resolve(__dirname, "out"),
  },
  resolve: { extensions: [".ts", ".js"] },
  module: { rules: [{ test: /\.ts$/, loader: "ts-loader" }] },
  externals: { vscode: "vscode" },
};

const webviewConfig: webpack.Configuration = {
  target: "web",
  mode:"development",
  entry: "./src/webview/index.tsx",
  output: {
    filename: "[name].wv.js",
    path: path.resolve(__dirname, "out"),
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    alias: {
            '@mui/material': '@mui/joy',
         },
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: ["babel-loader", "ts-loader"] },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: "[name].[ext]",
        },
      },
    ],
  },
};

export default [webviewConfig, extConfig];
