import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// 增强的插件处理 require 引入的静态资源
function requireAssetsPlugin(options = {}) {
  const { 
    inline = true,           // 是否内联为base64
    limit = 10 * 1024,      // 内联大小限制（字节）
    outputDir = 'dist/assets', // 输出目录
    publicPath = './dist/assets/'   // 公共路径
  } = options;
  
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
            const buffer = fs.readFileSync(resolvedPath);
            const fileSize = buffer.length;
            const ext = path.extname(filePath).slice(1); // 去掉点号
            const mimeType = getMimeType(ext);
            
            // 根据文件大小和配置决定处理方式
            if (inline && fileSize <= limit) {
              // 内联为 base64
              const base64 = buffer.toString('base64');
              return `"data:${mimeType};base64,${base64}"`;
            } else {
              // 复制文件并返回路径
              const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 16);
              const name = path.basename(filePath, path.extname(filePath));
              const fileName = `${name}.${hash}.${ext}`;
              
              // 确保输出目录存在
              if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
              }
              
              // 复制文件
              fs.writeFileSync(path.join(outputDir, fileName), buffer);
              
              return `"${publicPath}${fileName}"`;
            }
          }
          
          return match;
        });
        
        return transformedCode;
      }
      
      return null;
    }
  };
}

// 获取 MIME 类型
function getMimeType(ext) {
  const mimeTypes = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'ico': 'image/x-icon',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff'
  };
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
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
    requireAssetsPlugin({
      inline: true,           // 启用内联
      limit: 10 * 1024,      // 10KB 以下内联为 base64
      outputDir: 'dist/assets',
      publicPath: './dist/assets/'
    }),
    commonjs(),
    terser({
      compress: true,
      mangle: true
    })
  ]
};