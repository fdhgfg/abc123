var BarcodeCtr = {
    Init: function () {
        this.InitEvent();
        this.InitData();
    },
    InitEvent: function () {
        $('#dropContainer').click(function () {
            var $this = $(this);
            var tables = $this.find('table');
            tables.each(function () {
                $(this).removeClass('bg_curr').find('td').removeClass('bg_curr');
            })
            tables.filter(':first').addClass('bg_curr');
            $('#pgContainer').children(':first').show().siblings().hide();
        })
        $(document).on('click', '#dropContainer td', function () {
            var $this = $(this);
            $('#dropContainer').find('table').removeClass('bg_curr');
            $this.addClass('bg_curr').siblings().removeClass('bg_curr');
            if ($('#cbIsMergeCell').is(':checked')) {
                $this.addClass('curr-merge')
            }
            $('#pgContainer').children().eq(1).show().siblings().hide();
            BarcodeCtr.SetTd($this, null, true, false);
        })
    },
    InitData: function () {
        this.InitForm();
        BarcodeCtr.LoadDg(1, 10);
        var pager = $("#dgPrintTemplate").datagrid('getPager');
        pager.pagination({
            onSelectPage: function (pageNumber, pageSize) {
                BarcodeCtr.LoadDg(pageNumber, pageSize);
            }
        });
    },
    InitForm: function () {
        if (!BarcodeCtr.SelectRow) {
            var sHtml = '<div class="sw-barcode"><table class="border" style="width:295px;height:300px;"><tr><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td></tr></table></div><span id="lbJContent" style="display:none;"></span>';
            $(sHtml).appendTo($('#dropContainer'));

            $('#pgTable').propertygrid({
                data: BarcodeCtr.GetPGTableData()
            });
        }
    },
    LoadDg: function (pageIndex, pageSize) {
        var postData = '{"model":{"PageIndex":' + pageIndex + ',"PageSize":' + pageSize + ',"TypeName":"PrintTemplate"}}';
        var url = Common.AppName + '/Services/Service.svc/GetBarcodeTemplateList';
        Common.Ajax(url, postData, 'POST', '', true, true, function (result) {
            //console.log('GetBarcodeTemplateList--result--' + JSON.stringify(result));
            $("#dgPrintTemplate").datagrid('loadData', JSON.parse(result.Data));
        });
    },
    SelectRow: null,
    OnSelect: function (index, row) {
        //console.log('OnSelect--row--' + JSON.stringify(row));
        BarcodeCtr.SelectRow = row;

        $('#lbtnPrint').linkbutton('enable');
        $('#lbtnSaveAs').linkbutton('enable');
        if (row.IsDefault) $('#lbtnSdpt').linkbutton('disable');
        else $('#lbtnSdpt').linkbutton('enable');
    },
    OnSetDefault: function () {
        var dg = $("#dgPrintTemplate");
        var rows = dg.datagrid('getSelections');
        if (!rows || rows.length < 1) {
            $.messager.alert('错误提示', "请选择一行且仅一行数据进行操作", 'error');
            return false;
        }
        var row = rows[0];
        row.IsDefault = true;
        var postData = '{"model":{ "Id": "' + row.Id + '", "IsDefault": true, "TypeName": "PrintTemplate","Width":0,"Height":0,"Margin":0}}';
        var url = Common.AppName + '/Services/Service.svc/SaveSetDefault';
        Common.Ajax(url, postData, 'POST', '', true, true, function (result) {
            var dgData = dg.datagrid('getData');
            for (var i = 0; i < dgData.rows.length; i++) {
                var item = dgData.rows[i];
                if (item.Id != row.Id) item.IsDefault = false;
            }
            dg.datagrid('loadData', dgData);
            jeasyuiFun.show("温馨提示", "保存成功！");
        });
    },
    OnEdit: function () {
        var rows = $("#dgPrintTemplate").datagrid('getSelections');
        if (!rows || rows.length != 1) {
            $.messager.alert('错误提示', "请选择一行且仅一行数据进行操作", 'error');
            return false;
        }
        BarcodeCtr.SetFm(rows[0]);
    },
    OnDel: function () {
        var dg = $("#dgPrintTemplate");
        var rows = dg.datagrid('getSelections');
        if (!rows || rows.length < 1) {
            $.messager.alert('错误提示', "请至少选择一行数据进行操作", 'error');
            return false;
        }
        var itemAppend = "";
        for (var i = 0; i < rows.length; i++) {
            if (i > 0) itemAppend += ",";
            itemAppend += rows[i].Id;
        }
        var postData = '{"itemAppend":"' + itemAppend + '"}';
        var url = Common.AppName + '/Services/Service.svc/DeleteBarcodeTemplate';
        $.messager.confirm('提示', '确定要删除吗？', function (r) {
            if (r) {
                Common.Ajax(url, postData, 'POST', '', true, true, function (result) {
                    jeasyuiFun.show("提示", "操作成功！");
                    setTimeout(function () {
                        var pagerOptions = jeasyuiFun.getDgPagerOptions($("#dgPrintTemplate"));
                        BarcodeCtr.LoadDg(pagerOptions.PageIndex, pagerOptions.PageSize);
                    }, 700);
                });
            }
        });
    },
    OnPrint: function () {
        if (!BarcodeCtr.SelectRow) return false;
        window.open(Common.AppName + '/u/print.html?key=PrintTemplate-PrintTest&barcodeTemplateId=' + BarcodeCtr.SelectRow.Id + '');
    },
    CtrCreating: function (dropContainer, text) {
        var sHtml = '';
        var len = 0;
        switch (text) {
            case '表格':
                len = dropContainer.find('table').length + 1;
                break;
            case '文本':
                len = dropContainer.find('span').length + 1;
                sHtml = '<span id="lb' + len + '">文本' + len + '</span>';
                break;
            default:
                break;
        }
        var curr = $(sHtml);
        curr.appendTo(dropContainer);
    },
    GetPGTableData: function () {
        if (BarcodeCtr.SelectRow) {
            return JSON.parse($('#lbJContent').text()).TData;
        }
        else {
            var jData = {
                "total": 13, "rows":
                    [{ "name": "宽", "value": 295, "group": "表格属性", "editor": "numberbox" },
                    { "name": "高", "value": 300, "group": "表格属性", "editor": "numberbox" },
                    { "name": "行数", "value": 5, "group": "表格属性", "editor": "numberbox" },
                    { "name": "列数", "value": 4, "group": "表格属性", "editor": "numberbox" },
                    { "name": "边框宽", "value": 1, "group": "表格属性", "editor": "numberbox" },
                    { "name": "边框样式", "value": "none", "group": "表格属性", "editor": "text" },
                    { "name": "边框颜色", "value": '#ddd', "group": "表格属性", "editor": "text" },
                    { "name": "行边框宽", "value": 0, "group": "行属性", "editor": "numberbox" },
                    { "name": "行边框样式", "value": "none", "group": "行属性", "editor": "text" },
                    { "name": "行边框颜色", "value": 'none', "group": "行属性", "editor": "text" },
                    { "name": "列边框宽", "value": 1, "group": "列属性", "editor": "numberbox" },
                    { "name": "列边框样式", "value": "solid", "group": "列属性", "editor": "text" },
                    { "name": "列边框颜色", "value": '#000', "group": "列属性", "editor": "text" }
                    ]
            };
            return jData;
        }
    },
    GetPGTdData: function () {
        var jData = {
            "total": 12, "rows": [
                { "name": "文本", "value": "", "group": "列属性", "editor": "text" },
                { "name": "数据映射", "value": '', "group": "列属性", "editor": "text" },
                { "name": "宽", "value": -1, "group": "列属性", "editor": "numberbox" },
                { "name": "高", "value": -1, "group": "列属性", "editor": "numberbox" },
                { "name": "列边框宽", "value": 1, "group": "列属性", "editor": "numberbox" },
                { "name": "列边框样式", "value": "solid", "group": "列属性", "editor": "text" },
                { "name": "列边框颜色", "value": '#ddd', "group": "列属性", "editor": "text" },
                { "name": "条码模板", "value": '', "group": "条码属性", "editor": "text" },
                { "name": "条码数据映射", "value": '', "group": "条码属性", "editor": "text" },
                { "name": "字体", "value": "默认", "group": "字体属性", "editor": "text" },
                { "name": "字体大小", "value": "默认", "group": "字体属性", "editor": "text" },
                { "name": "字体样式", "value": "默认", "group": "字体属性", "editor": "text" }
            ]
        };

        return jData;
    },
    OnOk: function () {
        //console.log('OnOk--');
        var curr = $('#dropContainer .bg_curr');
        if (curr.length == 0 || curr.is('table')) {
            var changeRows = $('#pgTable').propertygrid('getChanges');
            if (!changeRows || changeRows.length == 0) return false;

            var pgData = $('#pgTable').propertygrid('getData');
            //console.log('pgData--' + JSON.stringify(pgData));
            var $t = $('.sw-barcode>table');
            var trs = $t.find('tr');
            var trLen = trs.length;
            for (var i = 0; i < changeRows.length; i++) {
                var row = changeRows[i];
                //console.log('row.name--' + row.name);
                switch (row.name) {
                    case '行数':
                        var colLen = 0;
                        for (var k = 0; k < pgData.rows.length; k++) {
                            var item = pgData.rows[k];
                            if (item.name == '列数') colLen = parseInt(item.value);
                        }
                        BarcodeCtr.CreateTd(colLen);
                        BarcodeCtr.CreateTr(parseInt(row.value));
                        break;
                    case '列数':
                        BarcodeCtr.CreateTd(parseInt(row.value));
                        break;
                    default:
                        break;
                }
            }
        }
        else if (curr.is('td')) {
            console.log('td--');
        }
    },
    OnTdBeforeEdit: function (index, row) {
        //console.log('row.name--' + row.name);
        if (row.name == '条码模板') {
            BarcodeTemplate.OnDlg(BarcodeCtr.OnSelectBarcodeTemplate);
            return false;
        }
    },
    OnSelectBarcodeTemplate: function (data) {
        //console.log('data--' + JSON.stringify(data));
        var jContent = JSON.parse(data.Attr);
        var pgSelectRow = $('#pgTd').propertygrid('getSelected');
        var pgSelectRowIndex = $('#pgTd').propertygrid('getRowIndex', pgSelectRow);

        var $td = BarcodeCtr.GetSelectedCell();
        var img = $td.find('[dataType="barcode"]');
        if (img.length > 0) {
            img.attr("src", jContent.ImageUrl).attr("btId", data.Id);
            pgSelectRow.value = img[0].outerHTML;
        }
        else {
            img = $('<img src="' + Common.AppName + jContent.ImageUrl + '" dataType="barcode" btId="' + data.Id + '" field="" />');
            pgSelectRow.value = img[0].outerHTML;
            $td.append(img);
        }
        $('#pgTd').propertygrid('refreshRow', pgSelectRowIndex);
        BarcodeCtr.SetTd($td, null, false, true);
    },
    OnPgTableAcceptChanges: function (index, row, changes) {
        var $this = $('.sw-barcode>table:first');
        switch (row.name) {
            case '宽':
                $this.css('width', '' + changes.value + 'px');
                break;
            case '高':
                $this.css('height', '' + changes.value + 'px');
                break;
            case '行数':
                BarcodeCtr.CreateTr(parseInt(changes.value));
                break;
            case '列数':
                BarcodeCtr.CreateTd(parseInt(changes.value));
                break;
            default:
                break;
        }
    },
    OnPgTdAcceptChanges: function (index, row, changes) {
        var $td = BarcodeCtr.GetSelectedCell();
        BarcodeCtr.SetTd(BarcodeCtr.GetSelectedCell(), null, false, true);
        switch (row.name) {
            case '文本':
                var lb = $td.find('[dataType="text"]');
                if (lb.length > 0) {
                    if (!changes.value) lb.remove();
                    else lb.text(changes.value);
                }
                else $td.append('<span dataType="text">' + changes.value + '</span>');
                break;
            case '数据映射':
                var lbField = $td.find('[dataType="field"]');
                if (lbField.length > 0) {
                    if (!changes.value) lbField.remove();
                    else lbField.text('{{' + changes.value + '}}');
                }
                else {
                    if (changes.value) $td.append('<span dataType="field">{{' + changes.value + '}}</span>');
                }
                break;
            case '宽':
                if (changes.value == -1) $td.css('width', null);
                else $td.css('width', '' + changes.value + 'px');
                break;
            case '高':
                if (changes.value == -1) $td.css('height', null);
                else $td.css('height', '' + changes.value + 'px');
                break;
            case '条码数据映射':
                var img = $td.find('[dataType="barcode"]');
                if (img.length > 0) {
                    img.attr("field", changes.value);
                }
                else {
                    if (changes.value) $td.append('<img dataType="barcode" btId="" field="' + changes.value + '" />');
                }
                break;
            default:
                break;
        }
    },
    CreateTd: function (colLen) {
        var $t = $('.sw-barcode>table');
        var trs = $t.find('tr');
        var trLen = trs.length;
        var oldColLen = trs.filter(':first').find('td').length;
        if (colLen < oldColLen) {
            trs.each(function () {
                $(this).find('td').filter(':gt(' + (colLen - 1) + ')').remove();
            });
        }
        else if (colLen > oldColLen) {
            trs.each(function () {
                for (var j = 0; j < (colLen - oldColLen); j++) {
                    $('<td></td>').appendTo($(this));
                }
            })
        }
    },
    CreateTr: function (rowLen) {
        var $t = $('.sw-barcode>table');
        var trs = $t.find('tr');
        var trLen = trs.length;
        if (rowLen < trLen) trs.filter(':gt(' + (rowLen - 1) + ')').remove();
        else if (rowLen > trLen) {
            for (var j = 0; j < (rowLen - trLen); j++) {
                trs.filter(':first').clone().appendTo($t);
            }
        }
    },
    SetTd: function (td, jData, isFromCode, isFromPg) {
        if (!jData) jData = BarcodeCtr.GetPGTdData();
        if (isFromCode) {
            if ($.trim(td.attr('code')) != '') {
                var jCode = JSON.parse(td.attr('code'));
                for (var i = 0; i < jCode.rows.length; i++) {
                    var row = jCode.rows[i];
                    for (var j = 0; j < jData.rows.length; j++) {
                        var oldRow = jData.rows[j];
                        if (oldRow.name == row.name) oldRow.value = row.value;
                    }
                }
            }
        }
        if (isFromPg) {
            var jPgData = $('#pgTd').propertygrid('getData');
            for (var i = 0; i < jPgData.rows.length; i++) {
                var row = jPgData.rows[i];
                for (var j = 0; j < jData.rows.length; j++) {
                    var oldRow = jData.rows[j];
                    if (oldRow.name == row.name) oldRow.value = row.value;
                }
            }
        }
        td.attr('code', JSON.stringify(jData));
        if (!isFromPg) {
            $('#pgTd').propertygrid('loadData', jData);
        }
    },
    OnIsMergeCell: function () {
        if ($('#cbIsMergeCell').is(':checked')) $('#lbtnMergeCell').linkbutton('enable');
        else {
            $('.sw-barcode td').removeClass('curr-merge');
            $('#lbtnMergeCell').linkbutton('disable');
        }
    },
    OnMergeCell: function () {
        $('.sw-barcode tr').each(function () {
            var $tr = $(this);
            var $tds = $tr.find('.curr-merge');
            var mergeCellLen = $tds.length;
            if (mergeCellLen > 0) {
                $tds.filter(':first').attr('colspan', mergeCellLen).end().not(':first').remove();
            }
        })
    },
    GetSelectedCell: function () {
        var $t = $('.sw-barcode>table');
        var $td = $t.find('td').filter(function () {
            return $(this).hasClass('bg_curr');
        });

        return $td;
    },
    OnCellClear: function () {
        BarcodeCtr.GetSelectedCell().html('');
    },
    GetFm: function () {
        var postData = {};
        var table = $('.sw-barcode>table:first').clone();
        var tData = $('#pgTable').propertygrid('getData');
        var tdData = [];
        table.find('td').each(function () {
            var td = $(this);
            var sCode = td.attr('code');
            if (!sCode || sCode == '') sCode = '{}';
            tdData.push(JSON.parse(sCode));
            td.removeAttr("code");
            td.removeAttr("class");
            //d.removeClass('bg_curr');
            //td.removeClass('curr-merge');
        });

        table.removeClass('bg_curr');
        postData.Html = '<div class="sw-barcode">'+table.prop("outerHTML")+'</div>';
        var jContent = {};
        jContent.TData = tData;
        jContent.TdData = tdData;
        postData.Attr = JSON.stringify(jContent);
        postData.IsDefault = true;
        //$('#lbJContent').text(JSON.stringify(jContent));
        //        if (BarcodeCtr.SelectRow) BarcodeCtr.SelectRow.Html = postData.Html;
        //console.log('postData--' + JSON.stringify(postData));


        //        jContent["TData"] = JSON.stringify(tData);
        //        jContent["CellData"] = JSON.stringify(tdData);
        //        $('#lbJContent').text(JSON.stringify(jContent));
        //        var sAppend = $t.parent().parent().html();
        //        if (BarcodeCtr.SelectRow) BarcodeCtr.SelectRow.JContent = sAppend;
        //return { JContent: encodeURIComponent(sAppend), IsDefault: false };

        return postData;
    },
    SetFm: function (jData) {
        //console.log('jData.JContent--' + jData.JContent);
        var $Html = $(jData.Html);
        var jContent = JSON.parse(jData.Attr);
        //console.log('jContent.TData--' + JSON.stringify(jContent.TData));
        var $tds = $Html.find('table:first').find('td');
        //console.log('jContent.TdData--' + JSON.stringify(jContent.TdData));
        //return false;
        var jTdData = jContent.TdData;
        for (var i = 0; i < jTdData.length; i++) {
            //console.log('JSON.stringify(jCellData[i])--' + JSON.stringify(jCellData[i]));
            if (jTdData[i].rows) {
                //console.log('JSON.stringify(jCellData[i])--2--' + JSON.stringify(jCellData[i]));
                $tds.eq(i).attr('code', JSON.stringify(jTdData[i]));
            }
        }
        $('#dropContainer').html($Html);
        $('#pgTable').propertygrid({
            data: jContent.TData
        });
        $('#tabsPrintTemplate').tabs('select', 1);
    },
    OnSave: function () {
        if (!BarcodeCtr.SelectRow) {
            BarcodeCtr.DlgTitle();
        }
        else {
            var jData = BarcodeCtr.GetFm();
            if (!jData) return false;
            jData.Id = BarcodeCtr.SelectRow.Id;
            jData.Title = BarcodeCtr.SelectRow.Title;
            jData.IsDefault = BarcodeCtr.SelectRow.IsDefault;
            BarcodeCtr.Save(null, jData);
        }
    },
    DlgTitle: function () {
        if ($("body").find("#dlgPrintTemplateTitle").length == 0) {
            $("body").append('<div id="dlgPrintTemplateTitle" style="padding:10px;"></div>');
        }
        var dlg = $("#dlgPrintTemplateTitle");
        dlg.dialog({
            title: '保存模板',
            width: 400,
            height: 150,
            closed: false,
            modal: true,
            iconCls: 'icon-add',
            content: '<form id="dlgTitleFm">标题：<input id="txtTitle" class="easyui-textbox" data-options="required:true" style="width:88%"></form>',
            buttons: [{
                id: 'btnSaveByDlgSave', text: '确定', iconCls: 'icon-save', handler: function () {
                    var isValid = $('#dlgTitleFm').form('validate');
                    if (!isValid) return false;

                    var jData = BarcodeCtr.GetFm();
                    if (!jData) return false;
                    jData.Title = $.trim($('#txtTitle').val());
                    //return false;
                    BarcodeCtr.Save(dlg, jData);
                }
            }, {
                id: 'btnCancelByDlgSave', text: '取消', iconCls: 'icon-cancel', handler: function () {
                    dlg.dialog('close');
                }
            }]
        })
    },
    Save: function (dlg, jData) {
        jData.TypeName = 'PrintTemplate';
        var postData = '{"model":' + JSON.stringify(jData) + '}';
        var url = Common.AppName + '/Services/Service.svc/SaveBarcodeTemplate';
        Common.Ajax(url, postData, 'POST', '', true, true, function (result) {
            var pagerOptions = jeasyuiFun.getDgPagerOptions($("#dgPrintTemplate"));
            BarcodeCtr.LoadDg(pagerOptions.PageIndex, pagerOptions.PageSize);
            if (dlg) dlg.dialog('close');
            jeasyuiFun.show("提示", "操作成功！");
        });
        return false;
    }
}