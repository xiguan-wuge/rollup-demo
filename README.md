# 🚀 Rollup 静态资源处理增强版

这是一个支持 `require` 语法引入静态资源的 Rollup 配置，能够智能处理图片等静态资源，支持 base64 内联和文件复制两种模式。

## ✨ 主要特性

- ✅ **支持 `require` 语法**：可以直接使用 `require('./image.png')` 引入静态资源
- ✅ **智能处理策略**：小文件内联为 base64，大文件复制到 assets 目录
- ✅ **自动哈希命名**：生成带哈希的文件名，避免缓存问题
- ✅ **多种图片格式**：支持 PNG、JPG、GIF、SVG、WebP 等格式
- ✅ **可配置选项**：灵活配置内联大小限制和输出目录

## 📦 安装依赖

```bash
npm install --save-dev rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-terser
```

## 🎯 使用方法

### 1. 引入静态资源

```javascript
// src/index.js
const img = require('./default.png');        // 大文件，会被复制到assets目录
const testIcon = require('./test.svg');      // 小文件，会被内联为base64
const logo = require('./logo.jpg');          // 根据大小自动处理

export { img, testIcon, logo };
```

### 2. 打包命令

```bash
npm run build
```

### 3. 使用打包结果

```javascript
// 在浏览器中使用
import { img, testIcon, logo } from './dist/index.esm-browser.js';

// img: "./assets/default.a25b3312e2688a1a.png" (大文件路径)
// testIcon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAw..." (小文件base64)
```

## ⚙️ 配置选项

在 `rollup.config.js` 中可以配置插件选项：

```javascript
requireAssetsPlugin({
  inline: true,           // 是否启用内联（默认: true）
  limit: 50 * 1024,      // 内联大小限制，字节（默认: 10KB）
  outputDir: 'dist/assets', // 输出目录（默认: 'dist/assets'）
  publicPath: './assets/'   // 公共路径（默认: './assets/'）
})
```

### 配置说明

- **inline**: 是否启用内联功能
- **limit**: 文件大小限制，小于此值的文件会被内联为 base64
- **outputDir**: 大文件的输出目录
- **publicPath**: 生成的文件路径前缀

## 📁 项目结构

```
rollup-demo/
├── src/
│   ├── index.js          # 入口文件
│   ├── default.png       # 大图片文件
│   ├── test.svg          # 小图标文件
│   └── switch/
│       └── index.js      # 切换图片功能
├── dist/
│   ├── index.esm-browser.js  # 打包后的ES模块
│   └── assets/               # 静态资源目录
│       ├── default.a25b3312e2688a1a.png
│       └── switch-default.289425ffb88e141d.png
├── rollup.config.js      # Rollup配置
├── demo.html            # 演示页面
└── package.json
```

## 🎨 处理策略

### 小文件（≤ limit）
- **处理方式**：内联为 base64 数据URI
- **优势**：减少 HTTP 请求，直接可用
- **示例**：`"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAw..."`

### 大文件（> limit）
- **处理方式**：复制到 assets 目录，返回文件路径
- **优势**：避免大文件影响打包体积
- **示例**：`"./assets/default.a25b3312e2688a1a.png"`

## 🧪 演示

打开 `demo.html` 文件在浏览器中查看完整演示，包括：

- 不同大小文件的处理结果
- 实时图片显示
- 配置选项说明
- 控制台日志输出

## 🔧 技术实现

### 自定义 Rollup 插件

使用自定义的 `requireAssetsPlugin` 插件：

1. **transform 阶段**：检测 `require()` 语法
2. **文件处理**：根据文件大小选择处理策略
3. **资源复制**：大文件复制到输出目录
4. **代码替换**：将 `require()` 替换为相应的值

### 支持的 MIME 类型

```javascript
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
```

## 🚀 高级用法

### 动态切换图片

```javascript
// src/switch/index.js
export const switchImg = () => {
  console.log("switch");
  return require('./switch-default.png');
};
```

### 批量处理

```javascript
// 可以同时引入多个资源
const images = {
  logo: require('./logo.png'),
  icon: require('./icon.svg'),
  background: require('./bg.jpg')
};

export default images;
```

## 📝 注意事项

1. **文件大小**：合理设置 `limit` 值，平衡内联和复制的利弊
2. **浏览器兼容性**：base64 数据URI 在所有现代浏览器中都支持
3. **缓存策略**：哈希文件名确保文件更新时浏览器能获取最新版本
4. **打包体积**：大文件内联会增加打包体积，建议使用文件复制

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个配置！

## 📄 许可证

MIT License
