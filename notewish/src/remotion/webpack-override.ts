import { WebpackOverrideFn } from '@remotion/bundler';

export const webpackOverride: WebpackOverrideFn = (currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...(currentConfiguration.module?.rules ?? []),
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: false,
              },
            },
            'postcss-loader',
          ],
        },
      ],
    },
    resolve: {
      ...currentConfiguration.resolve,
      extensions: [
        ...(currentConfiguration.resolve?.extensions ?? []),
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
      ],
      alias: {
        ...currentConfiguration.resolve?.alias,
        '@': require('path').resolve(__dirname, '../'),
      },
    },
  };
};
