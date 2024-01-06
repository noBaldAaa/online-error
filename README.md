---
highlight: zenburn
theme: devui-blue
---

## 👏 背景

> 本文是 [从零到亿系统性的建立前端构建知识体系✨](https://juejin.cn/post/7145855619096903717)
> 中的第七篇。

某日周五下午五点，鄙人正逛着沸点，盘算着今天基金大涨晚上必须得整点好的。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eeec3f1fdfb14a8fb16ecb82c8e58b9c~tplv-k3u1fbpfcp-watermark.image#?w=1498\&h=416\&s=87262\&e=png\&b=ffffff)

正浏览着下班后去哪家店撸串，结果隔壁组同事囧着脸过来问我：大哥，赶紧过去帮忙看个问题！客户反馈很多次了，一直找不出问题出在哪里！！！

我：能不能有点周五的样子！你小子耽误我下班啊！！

![582a3535-38fb-42d2-8178-2b16bb26e7a5.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2088be9aaed64cac874aabba830cc945~tplv-k3u1fbpfcp-watermark.image#?w=244\&h=160\&s=12085\&e=jpg\&b=454440)

过去简单的了解一下，据说是个历史遗留问题，极难复现！

*   后端同学：数据绝对没问题，都仔细校对过了！😳😳
*   前端同学：线上报错信息啥也看不出来，我本地是好的！要不你们再试试？🤔🤔
*   测试同学：复现纯靠缘分！😰😰

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0c83a6e4bf664e5da062b6bcab4005d3~tplv-k3u1fbpfcp-watermark.image#?w=195\&h=200\&s=10232\&e=jpg\&b=f6f6f6)

我：这么说看来是有鬼了，要不你们在座位上摆个香炉烧根香？

![136edee9-e196-4e09-9e71-41792ff993f4.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a663444cd8e44c9d8a782c5715bb3eb3~tplv-k3u1fbpfcp-watermark.image#?w=300\&h=250\&s=712512\&e=gif\&f=28\&b=4f552a)

坐下后我一顿操作猛如虎，五分钟后就定位出了问题，老板在知晓这件事后：

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f2d53b66b76449cfa6c6ca05c6c87d0c~tplv-k3u1fbpfcp-watermark.image#?w=1746\&h=944\&s=155578\&e=png\&b=f3f3f3)

## 😥 背后原因分析

思考这背后的原因，根本在于是大家不知道怎么调试线上问题，都是靠猜。猜对了皆大欢喜，猜错了换个方向继续猜，直到陷入怀疑自我的情绪中......

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/25eabe3d1a5740ea8d1db84965001a2a~tplv-k3u1fbpfcp-watermark.image#?w=200\&h=200\&s=13027\&e=jpg\&b=fafafa)

今天借此机会，我决定祭出独门绝技，教大家一招 **bug 定位消失术**！彻底摆脱线上问题恐惧症！

> 说回正题

线上问题大致可以分两类：`一类是接口数据导致的`，`另一类是数据正常，前端哪里疏忽了导致的`。

*   **数据不同**：本地更多的是用的测试环境的数据，而线上用的真实环境的数据。不同数据，页面的渲染以及交互可能不同；
*   **代码疏忽**：可能是某些场景的边界情况没有处理好，再或者是未做容错降级处理等；

## 💁 模拟线上环境

文中所涉及到的代码均放到个人 github 仓库中：<https://github.com/noBaldAaa/online-error>

通过 [create-react-app](https://create-react-app.dev/docs/getting-started) 初始化一个项目（你也可以用 [vue-cli](https://www.npmjs.com/package/@vue/cli)，都一样）：

```js
npx create-react-app my-app --template typescript
```

接着在控制台运行 `yarn eject`，把 Webpack 的配置暴露出来（用其他构建工具也一样，这里以 Webpack 为例），此时项目目录结构：

    ├── build # 打包后的文件夹
    ├── config # webpack配置信息
    |    └── webpack.config.js
    ├── node_modules
    ├── public
    ├── package-lock.json
    ├── package.json
    └── src # 源码目录
         └── index.tsx

在 **index.tsx** 中写一段错误的代码模拟报错：

```js
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";

function App() {
  const obj: any = {
    author: "不要秃头啊",
  };
  useEffect(() => {
    //报错代码在这里！！！！！！！！！！！
    obj.abc.map((item: any) => item === "1111");
  });
  return (
    <div className="App">
      <h1>hello world</h1>
    </div>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

模拟生产环境打包，修改 **config/webpack.config.js** 中的配置：

```js
   mode: "production",
   devtool: false,
```

*   `mode: "production"` 表示采用生产模式打包，会启用代码压缩等插件
*   `devtool: false` 表示不生成 `source-map`文件

接着在控制台运行 `yarn build` 命令，生成打包后的文件：**/build**。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2eff2695e7454da485ed93abb1078922~tplv-k3u1fbpfcp-watermark.image#?w=200\&h=200\&s=13888\&e=jpg\&b=fbfbfb)

为了模拟线上，这里用一个第三方库：[http-server](https://www.npmjs.com/package/http-server)，根据官方介绍：**它是是一个简单的、零配置的命令行静态 HTTP 服务器**。下面是官方介绍图，确实挺形象......

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/234371b5e98a4a9db057c5406e0c70f7~tplv-k3u1fbpfcp-watermark.image#?w=1782\&h=1446\&s=838225\&e=png\&b=fcfbfb)

该说不说，确实很简单，这点没吹牛比👍，一行代码就可以起一个静态的 HTTP 服务器：

```js
npx http-server ./build
```

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f55442d0c42d4c22bdc4e0ccd879214e~tplv-k3u1fbpfcp-watermark.image#?w=1846\&h=736\&s=142011\&e=png\&b=1e1e1e)

点击静态服务器地址，打开页面发现确实报错了：

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3597632f4590430aa7df3981d0cba06b~tplv-k3u1fbpfcp-watermark.image#?w=2136\&h=812\&s=204839\&e=png\&b=fdf7f7)

所有代码都被压缩成了一行，确实啥都看不出来。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/76bfeaab1a344868aa4b6dfe6294325f~tplv-k3u1fbpfcp-watermark.image#?w=198\&h=200\&s=10215\&e=jpg\&b=8d8675)

## 💣 小型必杀技

上面我们提到，本地没问题，线上有问题，一部分原因就是因为后端数据有问题，这里先祭出一个小型必杀技：[Ajax Interceptor](https://chrome.google.com/webstore/detail/ajax-interceptor/nhpjggchkhnlbgdfcbgpdpkifemomkpg)。

它是一个谷歌插件，可以拦截页面上的 Ajax 请求，并把返回结果替换成任意文本。这对 **mock 数据、排查线上问题** 来说简直就是神器！！！

[Charles](https://www.charlesproxy.com/) 等抓包软在它面前就是个弟弟（我没有侮辱 [Charles](https://www.charlesproxy.com/) 的意思，大家各有长处）。当我知道了这个插件之后，才发现以前的操作都花里胡哨的！！！

![f74cd6c8-40af-491f-981d-573d7c892b0a.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6493cea1fb4846d1ac627dbcf898317d~tplv-k3u1fbpfcp-watermark.image#?w=174\&h=118\&s=4282\&e=jpg\&b=efecf0)

示范一下，把我的掘金等级改成 8 级，掘力值和关注者加几个 999，这不过分吧！

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eed78cdc21004f18b9223ce5bdbce9bb~tplv-k3u1fbpfcp-watermark.image#?w=2180\&h=790\&s=274535\&e=png\&b=fefefe)

此处 `@掘金运营` `@优弧`，叫你们开发来改 bug 啦，这小子数据已经爆表了。

> 使用方式：

（1）点击插件图标

![按钮.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9e1639db9cad406388c0b2c9ecbfd2c4~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp#?w=78\&h=70\&s=5762\&e=png\&b=35363a)

（2）把你想要修改的接口 URL 地址复制到输入框中，然后把返回的内容放到下面的文本框

![操作界面.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0bc3661e4cdd42fb95dff74f2371327d~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp#?w=644\&h=1084\&s=122473\&e=png\&b=fefefe)

拍了个视频教程：

![vgfmk-jxiy4.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/760bc2d00ae9493bb9f362bba922a191~tplv-k3u1fbpfcp-watermark.image#?w=3080\&h=1096\&s=14408537\&e=gif\&f=540\&b=fefefe)

友情提示：不需要用的时候别忘记关掉！！！要不然有可能分析半天，最后发现忘关插件了......

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b405be1ed2f04f8d9eaa657828516acf~tplv-k3u1fbpfcp-watermark.image#?w=196\&h=200\&s=14122\&e=jpg\&b=f8f3ef)

## 🚀 终极必杀技

上面那个小工具可以解决大部分场景的问题，但万一不是后端数据的问题，是我们自己的问题呢？
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6a187bf35bac41398ed6810e9bdf3cd4~tplv-k3u1fbpfcp-watermark.image#?w=204\&h=199\&s=11744\&e=jpg\&b=fafafa)

这个时候再说：我本地是好的，你再试试？

此时老板要拿刀过来了......

回归本质，线上不能定位到问题的原因是什么？不就是因为生产环境没有生成和上传 `source-map` 文件吗！！

那我们直接给线上环境添加上 `source-map` 文件不就可以了吗？

![a2a20c88-c702-45d2-8fea-972dda3872eb.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/966498162c7c4fd28f6d8c78a624e8af~tplv-k3u1fbpfcp-watermark.image#?w=219\&h=287\&s=41876\&e=png\&b=f8f8f8)

部分心急的同学请你把刀放下，我并不是说在生产环境上传 `source-map` 文件。

我的意思是：**生产环境 + 本地的 source-map 文件**。

这里偷偷告诉大家一个小秘密（99%的人都不知道，勿外传）：谷歌浏览器的 Sources 面板支持右键添加 `source-map`：

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8bccb14bf6a44a5c951bb3f85d713cdf~tplv-k3u1fbpfcp-watermark.image#?w=2016\&h=632\&s=197318\&e=png\&b=fdfdfd)

有了方案后，现在只需把生产环境的代码按照如下配置在本地重新打包：

```js
 output:{  path: path.resolve(__dirname, "build2") } //原build文件夹在模拟线上环境，这里改成build2防止影响之前的服务
 devtool:"source-map"
```

然后用 [http-server](https://www.npmjs.com/package/http-server) 起一个静态服务：

```js
npx http-server ./build2
```

拿到 `source-map` 的文件链接添加到浏览器中：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cef7493b186c4483b53fc1bf31525f63~tplv-k3u1fbpfcp-watermark.image#?w=1498\&h=374\&s=123638\&e=png\&b=ffffff)

操作视频：

![elwna-z6ibd.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/21c5341ea7ff46adaa46a5d5ad3c9707~tplv-k3u1fbpfcp-watermark.image#?w=2854\&h=946\&s=5228218\&e=gif\&f=647\&b=fef7f6)

这是添加前的效果：

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3597632f4590430aa7df3981d0cba06b~tplv-k3u1fbpfcp-watermark.image#?w=2136\&h=812\&s=204839\&e=png\&b=fdf7f7)

这是添加后的效果：

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b35e71b63cfc4255b3e725b338157c19~tplv-k3u1fbpfcp-watermark.image#?w=3564\&h=594\&s=274466\&e=png\&b=fcf1f0)

堆栈信息一目了然，一下就能看到是哪个文件下的哪行代码出了问题！

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2771f7d449eb40cba66037347117275f~tplv-k3u1fbpfcp-watermark.image#?w=220\&h=200\&s=10655\&e=jpg\&b=fbfbfb)

## 👋 总结

本文从一个团队小故事出发，详细讲述了当前端开发者遇到线上问题时的囧境。从以下两个场景剖析，给出了对应的解决方案：

*   **数据不同导致出错**：在本地环境下使用 [Ajax Interceptor](https://chrome.google.com/webstore/detail/ajax-interceptor/nhpjggchkhnlbgdfcbgpdpkifemomkpg) 来模拟线上数据；
*   **代码疏忽导致出错**：直接在线上环境添加 `source-map` 链接来定位问题；

什么？这两个方案还不够？这已经是我知道的最简单的方式啦！！我已经把我知道的全说了😭😭😭

什么？你们项目里集成了 [sentry](https://sentry.io/welcome/) 等监控系统？那就当我没说！我闭嘴了!

什么？......

> 引用：

*   <https://juejin.cn/post/7049211255181017102>

## 推荐阅读

1.  [从零到亿系统性的建立前端构建知识体系✨](https://juejin.cn/post/7145855619096903717)
2.  [我是如何带领团队从零到一建立前端规范的？🎉🎉🎉](https://juejin.cn/post/7085257325165936648)
3.  [二十张图片彻底讲明白Webpack设计理念，以看懂为目的](https://juejin.cn/post/7170852747749621791)
4.  [【中级/高级前端】为什么我建议你一定要读一读 Tapable 源码？](https://juejin.cn/post/7164175171358556173)
5.  [前端工程化基石 -- AST（抽象语法树）以及AST的广泛应用](https://juejin.cn/post/7155151377013047304)
6.  [【Webpack Plugin】写了个插件跟喜欢的女生表白，结果.....](https://juejin.cn/post/7160467329334607908)
7.  [从构建产物洞悉模块化原理](https://juejin.cn/post/7147365025047379981)
8.  [Webpack深度进阶：两张图彻底讲明白热更新原理！](https://juejin.cn/post/7176963906844246074)
9.  [【万字长文｜趣味图解】彻底弄懂Webpack中的Loader机制](https://juejin.cn/post/7157739406835580965)
10. [Esbuild深度调研：吹了三年，能上生产了吗？](https://juejin.cn/post/7310168607342624808)
