const path = require('path'); 

module.exports = (paths) => ({
  entry: {
    main: path.resolve(__dirname, paths.scripts.src), 
  },
  output: {
    path: path.resolve(__dirname, paths.dest), 
    filename: "bundle.js",
  },
  mode: "development", 
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/, 
        exclude: /node_modules/, 
        use: {
          loader: "ts-loader",
        },
      },
    ],
  },
  plugins: [], 
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'], 
  },
});
