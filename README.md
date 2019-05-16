# weibospider
基于Node的微博爬虫，抓取微博内容、转发内容、及所有的评论。

#### 1.安装基本依赖

​    `*`Node环境  puppeteer要求node在v6.4.0以上，本项目代码使用async/await要求v7.6以上！

        项目还需设置cookies,来保持微博处于登录状态.在本地登录一次微博后,将cookie复制出来,放到weibo-api中的cookie-param.js中。
        
        可以使用谷歌插件EditThisCookie来获取cookie.

​    `*`可选择完整安装，由于项目使用Puppeteer，安装包较大及默认安装Chromium，可能安装比较慢。


```
npm i
```

​    `*`手动安装

```
//只安装Puppeteer模块
npm i --save puppeteer --ignore-scripts
//安装其他模块
npm i -s readline

npm i -s cheerio

npm i -s exceljs
```

#### 2.Puppeteer

   *如果选择的是完整安装，则可以跳过。

​    打开spider.js，在browser处修改。

```javascript
const browser = await pup.launch({
   headless: true,     //是否使用无头模式
   //executablePath: ''  //chrome地址
})
```

​    headless表示是否启用无头模式，默认不打开浏览器。

​    executablePath 如果选择没有安装Chromium，则将此项设置成自己电脑上的谷歌浏览器，建议使用较新版本的谷歌浏览器。如 ：'C:/Users/.../Chrome/Application/chrome’。

#### 3.使用

   在项目目录下，执行：

```
node ./bin/spider.js
```

​    bin目录下会将抓取到的数据按微博分页生成单独excel文件。
