const readline = require('readline');
const pup = require('puppeteer');
const cookie = require('../weibo-api/cookie-param');
const cheerio = require('cheerio');
const excel = require('../weibo-api/excel');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let keyword,sDate,eDate,exlName = "";
rl.question('Please enter the keyword : ', (answer1) => {
    rl.question('Please enter the start-date : ', (answer2) => {
        rl.question('Please enter the end-date : ',answer3 =>{
            keyword = answer1;
            sDate = answer2+'-00';
            eDate = answer3+'-23';
            exlName = `${keyword} ${sDate.slice(5,7)}${sDate.slice(8,10)}-${eDate.slice(5,7)}${eDate.slice(8,10)}.xlsx`;
            console.log(`params is finished`);
            rl.close();
        })
    });
});
rl.on('close',async () => {
    let weibo_url = `https://s.weibo.com/weibo/${keyword}?q=${keyword}&typeall=1&suball=1&timescope=custom:${sDate}:${eDate}&Refer=g&display=0`;
    var tgName = '微博';     //excel sheet name
    const browser = await pup.launch({
        headless: true,     //是否使用无头模式
        //executablePath: 'C:/Users/46949/AppData/Local/Google/Chrome/Application/chrome'  //chrome地址
    })
    //空白页
    const page = await browser.newPage();
    await page.setCookie(...cookie).then(() => {
        console.log('---设置cookie---')
    });
    await page.goto(weibo_url);
    console.log('---打开页面---');
    await page.waitFor(2000);
    //获取评论总页数
    let pages = await page.evaluate(()=>{
        return document.querySelector('ul[class="s-scroll"]').children.length
    })
    console.log(`---共${pages}页，内容---`);
    await browser.close();
    console.log('---开始抓取数据---');
    for(let pageIndex = 32;pageIndex<=pages;pageIndex++){
        let pageUrl = `https://s.weibo.com/weibo/${keyword}?q=${keyword}&typeall=1&suball=1&timescope=custom:${sDate}:${eDate}&Refer=g&display=0&page=${pageIndex}`;
        exlName = exlName.replace(/^page\d*\s+/,'');
        exlName = `page${pageIndex} ${exlName}`;
        const browser = await pup.launch({
            headless: true,     //是否使用无头模式
            //executablePath: 'C:/Users/46949/AppData/Local/Google/Chrome/Application/chrome'  //chrome地址
        })
        //空白页
        const page = await browser.newPage();
        await page.setCookie(...cookie);
        await page.waitFor(1000);
        await page.goto(pageUrl);

        await page.waitFor(1000);
        //判断是否还有结果
        let msg = await page.evaluate(()=>{
            let cur_result =  document.querySelector('.card-no-result');
            if(cur_result){
                let weibomsg =  document.querySelector('.card-no-result').children[0].innerText;
                return weibomsg;
            }else{
                return '';
            }
        });
        if(msg){
            console.log(msg);
            console.log(`本次抓取结束,退出.`);
            return false;
        }
        console.log(`---抓取第${pageIndex}页内容---`);

        //获取有评论微博的index
        let arr = await page.evaluate(() => {
            let list = [];
            const btnList = document.querySelectorAll('div.card-act>ul li:nth-child(3)');
            btnList.forEach((el, idx) => {
                let text = el.innerText;
                if(text.match(/\d/g) != null){
                    list.push(idx);
                }
            })
            return list;
        })
        console.log('---加载微博评论---');
        //点击评论按钮
        const btn = await page.$$('div.card-act>ul li:nth-child(3)');
        for(let i = 0; i < arr.length; i++){
            let ind = arr[i];
            const [response] = await Promise.all([   //多个点击事件不冲突
                page.waitFor(2000),
                btn[ind].click()
            ]);
        }
        console.log('---评论加载完毕！---');

        //获取html
        const htmlHandle = await page.$('html');
        // 执行计算
        const html = await page.evaluate(body => body.outerHTML, htmlHandle);
        // 销毁句柄
        await htmlHandle.dispose();
        const _$ = cheerio.load(html);
        var content = [];      //抓取到的微博data

        //抓取微博内容
        var cardList = _$('#pl_feedlist_index').children().eq(1).children();
        _$(cardList).each((idx, el) => {
            var avtor = _$(el).find('.info').children().eq(1).text().trim();  //用户名
            var mid = _$(el).attr('mid').trim();                              //微博ID
            var text = _$(el).find('.txt').text().trim().replace(/[\s\n]/g, '');                     //微博内容
            var forward = _$(el).find('.card-comment') ? _$(el).find('.card-comment').find('.txt').text().trim().replace(/[\s\n]/g, '') : ''; //转发微博微博
            var it = {
                id: avtor,
                mid: mid,
                forward: forward,
                cont: text
            };
            content.push(it);
        });
        //抓取评论
        const comList = _$('div[class=list]');
        _$(comList).each((id, el) => {
            let com_id = arr[id];
            let comLen = _$(el).children().length;
            if(comLen==1){
                // let comId = _$(el).attr('comment_id');
                let comEr = _$(el).find('.content').find('.txt').find('a[class="name"]').text().replace(/[\s\n]/g, '');
                let comM = _$(el).find('.content').find('.txt').text().replace(/[\s\n]/g, '');
                let reg = '/'+comEr+'/g';
                comM = comM.replace(eval(reg),'');
                comM = comM.replace(/[^:]/,'');
                let comT = _$(el).find('.content').find('.fun').text().replace(/[\s\n]/g, '').replace(/投诉回复/g,'');
                content[com_id].comEr = comEr;
                content[com_id].comM = comM;
                content[com_id].comT = comT;
            }else{
                let cList = _$(el).children();
                _$(cList).each((ix,it)=>{
                    let comEr = _$(it).find('.content').find('.txt').find('a[class="name"]').text().replace(/[\s\n]/g, '');
                    let comM = _$(it).find('.content').find('.txt').text().replace(/[\s\n]/g, '');
                    let reg = '/'+comEr+'/g';
                    comM = comM.replace(eval(reg),'');
                    comM = comM.replace(/[^:]/,'');
                    let comT = _$(it).find('.content').find('.fun').text().replace(/[\s\n]/g, '').replace(/投诉回复/g,'');
                    let newObj = {
                        id: content[com_id].id,
                        mid: content[com_id].mid,
                        forward: content[com_id].forward,
                        cont: content[com_id].cont,
                        comEr:comEr,
                        comM:comM,
                        comT:comT
                    }
                    content.splice(com_id,0,newObj);
                })
            }
        })
        excel(tgName, content,exlName);
        await browser.close();
    }
})


