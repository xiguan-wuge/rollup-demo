// ES Module 入口文件
const img = require('./default.png');        // 大文件，会被复制到assets目录
const testIcon = require('./test.svg');      // 小文件，会被内联为base64
import { switchImg } from './switch/index';
export { img, testIcon, switchImg };