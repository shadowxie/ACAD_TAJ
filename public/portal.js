/* Simple Package Definition System */

/*
var _package = null;

var package = function(name) {
    _package = name;
};
*/

var __ajax_url_prefix = '/service/';

//啟用 Ext 動態載入器
Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'Module': 'modules'
    }
});

//Ext.require([...]);

//實作瀏覽器資料快取
Ext.define('ClientSession', { 
    singleton: true,
    sid: null,
    user: {}
});

//資料讀取提示訊息
if (Ext.view.AbstractView) {
    Ext.apply(Ext.view.AbstractView.prototype, {
        loadingText: '資料讀取中...',
    });
}

Ext.onReady(function(){

    //讀取套件定義
    var pack = Ext.create('Module.SchoolCourse.Package');
    pack.packageInit();


    // 取得 SESSION 變數
    var getParams = document.URL.split("?");
    var params = Ext.urlDecode(getParams[1]);
    Ext.Msg.wait('正在快取資料...');

    ClientSession.sid = params.sid;

    Ext.Ajax.request({
        url: '/service/readdata.json/'+ClientSession.sid,
        method: 'GET',
        success: function(response) {
            //Ext.Msg.updateProgress(1);
            Ext.Msg.hide();

            var obj = Ext.JSON.decode(response.responseText);
            ClientSession.user = obj.user;
        }
    });

    var content = new Ext.TabPanel({
        id: 'portal-content',
        region: 'center',
        xtype: 'tabpanel',
        items: [{
            title: '首頁',
            bodyStyle: 'padding: 10px',
            closable: false,
            autoLoad: {
                url: 'main.html',
                scripts: false
            }
        }]
    });
    
    var detailsPanel = {
        id: 'details-panel',
        title: '通知',
        region: 'south',
        height: 100,
        margins: '3 3 3 3',
        bodyStyle: 'padding:15px;background:#eee;',
        autoScroll: true,
        html: '<p class="details-info">沒有通知。</p>',
        border: true
    };
    var tree1 = Ext.create('Ext.TreePanel', {
        header: false,
        headerAsText: false,
        border: false,
        rootVisible : false,
        listeners: {
            itemclick: {
                fn: function(view, record, item, index, event) {
                    var moduleName = record.get('id');
                    //console.log('click: ' + moduleName);

                    if (moduleName) {
                        console.log('Load module: '+moduleName);
                        var module = Ext.create(moduleName);
                        module.moduleInit();
                        module.moduleLoad();
                    }
                }
            }
        },
        root: {
            nodeType: 'async',
            text : '',
            expanded: true,
            children : [{
                text : '系所選課',
                expanded: true,
                children : []
            }, {
                text : '全校選課',
                expanded: true,
                children : [{
                    text : '加選 - 全校',
                    id: 'Module.SchoolCourse.RegisterCourse',
                    leaf : true
                }, {
                    text : '退選 - 全校',
                    id: 'Module.SchoolCourse.UnregisterCourse',
                    leaf : true
                }, {
                    text : '我的課程清單',
                    //id: 'Module-SchoolCourse-StudentCourse',
                    leaf : true
                }]
            }]
        }
    });
    var item1 = Ext.create('Ext.Panel', {
        title: '學生加退選',
        layout: 'fit',
        items: [tree1]
    });
    var item2 = Ext.create('Ext.Panel', {
        title: '系統管理',
        html: '選單二'
    });
    var accordion = Ext.create('Ext.Panel', {
        layout: 'accordion',
        region: 'center',
        border: true,
        margins: '3 3 3 3',
        items: [item1, item2]
    });
    Ext.create('Ext.Viewport', {
        layout: 'border',
        title: '網路辦公室',
        items: [
            {
                region: 'north',
                bbar: [
                    {
                        xtype: 'tbfill'
                    },
                    {
                        xtype: 'label',
                        text: '王小明 1234567 四技 機械工程系',
                        width: 400
                    },
                    {
                        text: '首頁',
                        icon: 'images/icons/house.png'
                    },
                    {
                        text: '個人設定',
                        icon: 'images/icons/user_edit.png'
                    },
                    {
                        text: '離開',
                        icon: 'images/icons/link_break.png'
                    }
                ],
                items: [
                    {
                        xtype: 'box',
                        id: 'header',
                        cls: 'portal-header',
                        html: '<h1 class="portal-title">ALLTOP 網路選課系統</h1>'
                    }
                ]
            },{
                id: 'menu',
                title: '功能表',
                region: 'west',
                layout: 'border',
                border: true,
                split: true,
                collapsible: true,
                margins: '2 0 5 5',
                width: 250,
                minSize: 100,
                maxSize: 500,
                items: [accordion, detailsPanel]
            },
            content
        ],
        renderTo: Ext.getBody()
    });

    //re-open tab from url hash
    Ext.defer(function() {
        if (window.location.hash) {
            var module = Ext.create(window.location.hash.replace('#', ''));
            module.init();
            module.load();
        }        
    }, 100);
});