import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// 简化的插件处理 require 引入的静态资源
function requireAssetsPlugin() {
  return {
    name: 'require-assets',
    
    transform(code, id) {
      // 处理包含 require 的代码
      if (code.includes('require(')) {
        let transformedCode = code;
        
        // 匹配 require('./file.png') 这样的模式
        const requireRegex = /require\(['"`]([^'"`]+\.(png|jpg|jpeg|gif|svg|webp))['"`]\)/g;
        
        transformedCode = transformedCode.replace(requireRegex, (match, filePath) => {
          const resolvedPath = path.resolve(path.dirname(id), filePath);
          
          if (fs.existsSync(resolvedPath)) {
            // 读取文件并生成哈希
            const buffer = fs.readFileSync(resolvedPath);
            const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 16);
            const ext = path.extname(filePath);
            const name = path.basename(filePath, ext);
            const fileName = `${name}.${hash}${ext}`;
            
            // 复制文件到 assets 目录
            const assetsDir = 'dist/assets';
            if (!fs.existsSync(assetsDir)) {
              fs.mkdirSync(assetsDir, { recursive: true });
            }
            fs.writeFileSync(path.join(assetsDir, fileName), buffer);
            
            return `"./assets/${fileName}"`;
          }
          
          return match;
        });
        
        return transformedCode;
      }
      
      return null;
    }
  };
}

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.esm-browser.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    requireAssetsPlugin(),
    commonjs(),
    terser({
      compress: true,
      mangle: true
    })
  ]
};