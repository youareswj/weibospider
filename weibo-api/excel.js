var excel = require('exceljs');

var excels = function (tagName,data,exlName) {
    try {
        var workbook = new excel.Workbook();  // 标签创建
        var date = new Date();
        var year = date.getFullYear();
        var mon = date.getMonth();
        var day = date.getDay();
        workbook.creator = "spider";               // 基本的创建信息
        workbook.lastModifiedBy = "spider";
        workbook.created = new Date(year, mon, day);
        workbook.modified = new Date();
        workbook.lastPrinted = new Date(year, mon, day);

        var worksheet = workbook.addWorksheet(tagName);    //创建sheet
        // 视图大小， 打开Excel时，整个框的位置，大小
        workbook.views = [
            {
                x: 0,
                y: 0,
                width: 1000,
                height: 2000,
                firstSheet: 0,
                activeTab: 1,
                visibility: "visible"
            }
        ];
        // 设置列
        worksheet.columns = [{
            header: '用户名',
            key: 'id',
            width: 26
        },
            {
                header: '微博ID',
                key: 'mid',
                width: 26
            },{
                header: '转发内容',
                key: 'forward',
                width: 50
            },{
                header: '微博内容',
                key: 'cont',
                width: 50
            },{
                header: '评论者',
                key: 'comEr',
                width: 50
            },{
                header: '评论内容',
                key: 'comM',
                width: 50
            },{
                header: '评论时间',
                key: 'comT',
                width: 50
            }
        ];
        //添加值
        for (var i in data) {
            var item = data[i];
            worksheet.addRow(item);
        }

        // save workbook to disk
        workbook.xlsx.writeFile(exlName).then(function () {
            console.log("---saved---");
        });
    }catch (e) {
        console.log(e)
    }

}

module.exports = excels;
