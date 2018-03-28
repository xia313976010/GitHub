//说明:通用JS函数库

CrmUtil = window.CrmUtil || { __namespace: true };

CrmUtil = {
    getXrmContext: function () { ///summary>获取CRM当前上下文</summary>
        var objContext = "";
        if (typeof GetGlobalContext == "function") objContext = GetGlobalContext();
        else {
            if (typeof Xrm.Page.context == "object") objContext = Xrm.Page.context;
            else throw new Error("Unable to access the Xrm Context");
        }
        return objContext;
    },
    getCrmBaseUrl: function () { ///summary>获取CRM登录地址</summary>
        var strClientUrl = "";
        var objContext = this.getXrmContext();
        if (objContext) strClientUrl = objContext.getClientUrl();
        else throw new Error("Unable to access the server URL");
        return strClientUrl;
    },
    retrieve: function (parameter) {
        var req = new XMLHttpRequest();
        req.open("GET", encodeURI(this.getCrmBaseUrl() + "/api/data/v8.0/" + parameter), false);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.send();

        return JSON.parse(req.responseText);
    },
    TabOrderLefttoRight: function () { ///<summary>tab键从左到右。windows onload时调用</summary>
        for (var i = 0; i < crmForm.all.length; i++) {
            var element = crmForm.all[i];
            if (element.tabIndex && element.tabIndex != "0") {
                if (element.className == 'ms-crm-Hidden-NoBehavior')
                    continue;
                if (element.tagName == 'A') {
                    if (element.className != 'ms-crm-InlineTabHeaderText')
                        continue;
                }

                element.tabIndex = 10000 + (i * 10);
            }
        }
    },
    disabledHistoryBack: function () {  ///<summary>当页面只读时,禁用按下退格键(Backspace),网页退回到历史页面</summary>
        document.onkeydown = function () {
            if (event.keyCode == 8) { //如果按下的是退格键
                if (event.srcElement.tagName.toLowerCase() != "input" && event.srcElement.tagName.toLowerCase() != "textarea" && event.srcElement.tagName.toLowerCase() != "password") {
                    event.returnValue = false;
                }
                if (event.srcElement.readOnly == true || event.srcElement.disabled == true || event.srcElement.contentEditable == "false") {
                    event.returnValue = false;
                }
            }
        }
    },
    shieldSaveFunctions: function (event) {  ///<summary>屏蔽表单上的各种类型的保存功能的快捷键</summary>
        if (event.ctrlKey && event.shiftKey && event.keyCode == 83) { event.keyCode = 0; event.returnValue = false; } //屏蔽"保存并新建(Ctrl+Shift+S)"快捷键
        else if (event.ctrlKey && event.keyCode == 83) { event.keyCode = 0; event.returnValue = false; } //屏蔽"保存(Ctrl+S)"快捷键
        else if (event.shiftKey && event.keyCode == 123) { event.keyCode = 0; event.returnValue = false; } //屏蔽"保存(Shift+F12)"快捷键
        else if (event.altKey && event.keyCode == 83) { event.keyCode = 0; event.returnValue = false; } //屏蔽"保存并关闭(Alt+S)"快捷键
    },
    shieldShortcutKeys: function () {   ///<summary>屏蔽页面的快捷键功能</summary>
        document.onkeydown = function () {
            var event = document.all ? window.event : arguments[0];
            shieldSaveFunctions(event); //屏蔽表单上的各种类型的保存功能
        }
    },
    dateAdd: function (strInterval, addNum, baseDate) {   ///<summary>日期增加函数,如:增加一天dateAdd("d",1,new Date())、减少一天dateAdd("d",-1,new Date())</summary>
        var dtTmp = new Date(baseDate);
        if (isNaN(dtTmp)) dtTmp = new Date();
        switch (strInterval) {
            case "s": return new Date(Date.parse(dtTmp) + (1000 * addNum));
            case "n": return new Date(Date.parse(dtTmp) + (60000 * addNum));
            case "h": return new Date(Date.parse(dtTmp) + (3600000 * addNum));
            case "d": return new Date(Date.parse(dtTmp) + (86400000 * addNum));
            case "w": return new Date(Date.parse(dtTmp) + ((86400000 * 7) * addNum));
            case "m":
                var intNewMonth = dtTmp.getMonth() + addNum;
                var dateResult = new Date(dtTmp.getFullYear(), intNewMonth, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
                if (intNewMonth >= 0 && intNewMonth != dateResult.getMonth()) dateResult = CrmUtil.getLastDayOfMonth(dateResult.getFullYear(), dateResult.getMonth());
                return dateResult;
            case "y":
                var dateResult = new Date((dtTmp.getFullYear() + addNum), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
                if (dtTmp.getMonth() != dateResult.getMonth()) dateResult = CrmUtil.getLastDayOfMonth(dateResult.getFullYear(), dateResult.getMonth());
                return dateResult;
        }
    },
    getLastDayOfMonth: function (year, month) {  ///<summary>获取指定年月的最后一天,year:实际年份 month:实际月份</summary>
        var dateResult;
        var dateNextMonth = new Date(parseInt(year), parseInt(month), 1);
        for (var i = 0; i >= 0; i++) {
            var datePre = CrmUtil.dateAdd("d", -1, dateNextMonth);
            if (datePre.getFullYear() < dateNextMonth.getFullYear() || datePre.getMonth() < dateNextMonth.getMonth()) {
                dateResult = datePre;
                break;
            }
        }
        return dateResult;
    },
    getServerDate: function () {   ///<summary>获取服务器时间</summary>
        var xmlHTTPRequest;
        if (window.ActiveXObject) {
            xmlHTTPRequest = new ActiveXObject("Microsoft.XMLHTTP");
        }
        else if (window.XMLHttpRequest) {
            xmlHTTPRequest = new XMLHttpRequest();
        }
        else {
            xmlHTTPRequest = new ActiveXObject("Msxml2.XMLHTTP");
        }
        xmlHTTPRequest.open('HEAD', '/?_=' + (-new Date), false);
        xmlHTTPRequest.send(null);

        var serverDate = new Date(xmlHTTPRequest.getResponseHeader('Date'));

        return serverDate;
    },
    getEntityReferenceObject: function (id, entityType, name) {   ///<summary>获取查找类型字段值的对象(适用于表单),如:var entityReferent=getEntityReferenceObject(accountid,"account","CRM客户");</summary>
        var lookupReference = [];
        lookupReference[0] = {};
        lookupReference[0].id = id;
        lookupReference[0].entityType = entityType;
        lookupReference[0].name = name;

        return lookupReference;
    },
    disabledControls: function () {   ///<summary>禁用表单字段</summary>
        var controls = Xrm.Page.ui.controls.get();
        for (var i in controls) {
            var control = controls[i];
            if (control.getDisabled() == false) {
                control.setDisabled(true);
            }
        }
    },
    checkTelNoValidation: function (telephoneNo) {   ///<summary>验证电话号码的合法性</summary>
        var reg_number = /^[0-9]\d*$/;   //数字
        if (telephoneNo != null && !reg_number.exec(telephoneNo)) {
            return false;
        }
        return true;
    },
    checkZhCn: function (text) {   ///<summary>验证文本是否为中文</summary>
        var reg_zhcn = /[\u4E00-\u9FA5]/;
        if (text && text != "" && !reg_zhcn.test(text)) {
            return false;
        }
        return true;
    },
    checkNumber: function (text) {  ///<summary>验证文本是否为数字</summary>
        var reg_number = /^[0-9]\d*$/;   //数字
        if (text != null && !reg_number.exec(text)) {
            return false;
        }
        return true;
    },
    checkIsDate: function (value) { ///<summary>验证给定的参数是否为合法日期</summary>
        var result = value.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);

        if (this.isNullOrEmpty(value)) return false;
        var date = new Date(result[1], result[3] - 1, result[4]);
        return (date.getFullYear() == result[1] && (date.getMonth() + 1) == result[3] && date.getDate() == result[4]);
    },
    compareDate: function (strStartDate, strEndDate) { ///<summary>比较开始日期与结束日期,0:相等 <0:startDate早于endDate >0:startDate晚于endDate</summary>
        if (strStartDate) strStartDate = strStartDate.replace(/-/g, "/");
        if (strEndDate) strEndDate = strEndDate.replace(/-/g, "/");

        var startDate = new Date(strStartDate), endDate = new Date(strEndDate);
        var intResult = Date.parse(startDate) - Date.parse(endDate);//0:相等 <0:endDate早于startDate >0:endDate晚于startDate
        return intResult;
    },
    isNullOrEmpty: function (strValue) { ///<summary>判断是否为空</summary>
        if (strValue == null || typeof strValue == "undefined") return true;
        if (strValue.toString() && strValue.toString().length > 0) return false;
        else return true;
    },
    resetCascadeField: function (strParentFieldName, strChildFieldName, blnSetChildFieldDisabled) {
        var parentField = Xrm.Page.getAttribute(strParentFieldName); //字段:父实体对应的字段
        var childField = Xrm.Page.getAttribute(strChildFieldName); //字段:子实体对应的字段
        var childFieldControl = Xrm.Page.getControl(strChildFieldName); //控件:子实体对应的字段

        if (blnSetChildFieldDisabled) {
            if (parentField.getValue()) childFieldControl.setDisabled(false);
            else childFieldControl.setDisabled(true);
        }

        childField.setValue(null);
        childField.setSubmitMode("always");
        childField.fireOnChange();
    },

    _isRegisterMultipLang: false,
    getMultipleLanguageText: function (strMultipLangCode) {  ///<summary>获取原始多语言文本</summary>
        if (!this._isRegisterMultipLang) { this.initMultipleLanguage(); }
        var strValue = "";
        if (typeof (localizedStrings) != "undefined" && localizedStrings.hasOwnProperty(strMultipLangCode)) {
            return eval("localizedStrings." + strMultipLangCode + ".content");
        } else { return strValue; }
    },
    getMultipleLanguageFormatText: function (strMultipLangCode) {  ///<summary>获取格式化后的多语言文本</summary>
        var strValue = CrmUtil.getMultipleLanguageText(strMultipLangCode);
        if (!CrmUtil.isNullOrEmpty(strValue)) strValue = strValue.replace(/&#39;/g, "'").replace(/<br\/>/g, "\n");
        return strValue;
    },
    initMultipleLanguage: function () {
        var lcid = Xrm.Page.context.getUserLcid();
        this.loadScript(this.getCrmBaseUrl() + "/WebResources/MultiLanguageJsonMetadata_" + lcid);
        this._isRegisterMultipLang = true;
    },
    loadScript: function (url) {
        var xmlHTTPRequest;
        if (window.ActiveXObject) {
            xmlHTTPRequest = new ActiveXObject("Microsoft.XMLHTTP");
        }
        else if (window.XMLHttpRequest) {
            xmlHTTPRequest = new XMLHttpRequest();
        }
        else {
            xmlHTTPRequest = new ActiveXObject("Msxml2.XMLHTTP");
        }
        xmlHTTPRequest.open('GET', url, false);
        xmlHTTPRequest.send('');
        eval(xmlHTTPRequest.responseText);
        var s = xmlHTTPRequest.responseText.split(/\n/);
        var r = /^(?:function|var)\s*([a-zA-Z_]+)/i;
        for (var i = 0; i < s.length; i++) {
            var m = r.exec(s[i]);
            if (m != null) {
                window[m[1]] = eval(m[1]);
            }
        }
    },
    checkUserHasRole: function (roleName) {
        var Path = "roles?$select=name&$count=true&$filter=name eq '" + roleName + "' and (";
        var currentUserRoles = Xrm.Page.context.getUserRoles();
        for (var i = 0; i < currentUserRoles.length; i++) {
            Path += "roleid eq " + currentUserRoles[i] + " or ";
        }
        Path = Path.substring(0, Path.length - 3) + ")";
        var retrieved = this.retrieve(Path);
        if (retrieved != null && retrieved.error == null && retrieved["@odata.count"] > 0) {
            return true;
        }
        return false;
    },
    objWaitMsg: null,//等待进度动画对象
    WaitMsg: function (objContainer, preId, sTop, sLeft) { ///<summary>等待进度动画</summary>
        if (!objContainer) objContainer = window.top;
        if (!preId) preId = "";
        var maskObj;
        if (objContainer.document.getElementById(preId + "BigDiv")) {
            maskObj = objContainer.document.getElementById(preId + "BigDiv");
            objContainer.document.body.removeChild(maskObj);
        }
        var sWidth = 0, sHeight = 0, intDivContentWidth = 180, intDivContentHeight = 100;
        sWidth = objContainer.document.body.scrollWidth;
        if (objContainer.frameElement) { sHeight = objContainer.frameElement.parentElement.scrollHeight; }
        if (objContainer.document.body && objContainer.document.body.scrollHeight > sHeight) { sHeight = objContainer.document.body.scrollHeight; }
        if (objContainer.document.documentElement && objContainer.document.documentElement.scrollHeight > sHeight) { sHeight = objContainer.document.documentElement.scrollHeight; }
        sLeft = (sWidth - intDivContentWidth) / 2;
        sTop = (sHeight - intDivContentHeight) / 2;

        maskObj = objContainer.document.createElement("div");

        maskObj.setAttribute('id', preId + 'BigDiv');
        maskObj.style.position = "absolute";
        maskObj.style.top = "0";
        maskObj.style.left = "0";
        maskObj.style.background = "#777";
        maskObj.style.filter = "Alpha(opacity=80);";
        maskObj.style.opacity = "0.8";
        maskObj.style.width = sWidth + "px";
        maskObj.style.height = sHeight + "px";
        maskObj.style.backgroundColor = "#F0F0FF";
        maskObj.style.zIndex = 1000;
        maskObj.style.display = "none";
        maskObj.innerHTML = "<div style='width:" + intDivContentWidth.toString() + "px; height:" + intDivContentHeight + "px; left:" + sLeft + "px; top:" + sTop
            + "px;position:absolute;text-align:center'><img src='/_imgs/AdvFind/progress.gif'><br /><span style='font-size:12px;'>" + CrmUtil.getMultipleLanguageText("common_WaitMsgText") + "</span></div>";
        objContainer.document.body.appendChild(maskObj);

        this.begin = function () {
            maskObj.style.display = 'block';
        }
        this.end = function () {
            maskObj.style.display = 'none';
        }
        this.display = function () {
            return maskObj.style.display;
        }

        window.addEventListener("resize", function () {
            if (CrmUtil.objWaitMsg.display() != 'none') { CrmUtil.objWaitMsg = new CrmUtil.WaitMsg(objContainer, preId, sTop, sLeft); CrmUtil.objWaitMsg.begin(); }
        });
    },

    __namespace: true
};

///<summary>格式化时间字符串 format:返回的字符串格式,如yyyy-MM-dd(年-月-日)[1990-01-01] yyyy-MM-dd HH:mm:ss(年-月-日 时:分:秒)[1990-01-01 20:45:30]</summary>
Date.prototype.toFormatString = function (format) {
    if (!format) format = "yyyy-MM-dd";
    var year = this.getFullYear();
    var month = this.getMonth() + 1;
    var day = this.getDate();
    var hours = this.getHours();
    var minutes = this.getMinutes();
    var seconds = this.getSeconds();
    return format.replace("yyyy", year).replace("MM", month).replace("dd", day).replace("HH", hours).replace("mm", minutes).replace("ss", seconds);
}