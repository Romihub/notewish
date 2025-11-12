import { Config } from '@remotion/cli/config';
import { webpackOverride } from './src/remotion/webpack-override';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setConcurrency(1);
Config.setCodec('h264');

Config.overrideWebpackConfig(webpackOverride);

export default Config;
