var USER_LANGUAGE_CODE = 2052;
/*
查找类型字段赋值方法
参数：fieldname（查找字段名称），logicalName（实体逻辑名称），entityId（实体ID），displayName（名称）
返回值：无
示例：SetLookupValue("agl_businessunitid", users[0].BusinessUnitId.LogicalName, users[0].BusinessUnitId.Id, users[0].BusinessUnitId.Name);
*/
function SetLookupValue(fieldname, logicalName, entityId, displayName) {
    var aLookup = new Array();
    var obj = new Object();
    obj.id = entityId;
    obj.entityType = logicalName;
    obj.name = displayName;
    aLookup[0] = obj;
    if (entityId == null || entityId == "") {
        Xrm.Page.getAttribute(fieldname).setValue(null);
    } else {
        Xrm.Page.getAttribute(fieldname).setValue(aLookup);
    }
    Xrm.Page.getAttribute(fieldname).setSubmitMode("always");
}


/*
一般类型字段赋值方法
参数：scontrolName（字段名称），scontrolValue（值）
返回值：无
*/
function SetValue(scontrolName, scontrolValue) {
    Xrm.Page.getAttribute(scontrolName).setValue(null);
    if (scontrolValue != null) {
        Xrm.Page.getAttribute(scontrolName).setValue(scontrolValue);
    }
    Xrm.Page.getAttribute(scontrolName).setSubmitMode("always");
}

/**
 * 转化webapi使用的guid
 * @param {} guid 
 * @returns {} 
 */
function TrimGuid(guid) {
    return guid.replace('{', '').replace('}', '');
}

/*
选项集类型字段赋值
参数：elemName（字段名称），elemContent（文本）
返回值：无
*/
function SetOptionValue(elemName, elemContent) {
    var options = Xrm.Page.getAttribute(elemName).getOptions();
    for (i = 0; i < options.length; i++) {
        if (options[i].text == elemContent) {
            SetValue(elemName, options[i].value);
        }
    }
    Xrm.Page.getAttribute(elemName).setSubmitMode("always");
}

//判断当前用户的安全角色
function IsUserRole(roleName) {
    var roles = Xrm.Page.context.getUserRoles();
    if (roles.length > 0) {
        var roleurl = "roles?$select=name&$filter=roleid eq " + roles[0] + "";
        for (var i = 1; i < roles.length; i++) {
            roleurl += " or roleid eq " + roles[i] + " ";
        }

        var rest = new hdREST();
        var rolesquery = rest.get(roleurl);

        if (rolesquery.error != undefined) {
            Xrm.Utility.alertDialog("获取安全角色失败:" + rolesquery.error.message.value);
            return false;
        } else if (rolesquery[0].value.length > 0) {
            for (var i = 0; i < rolesquery[0].value.length; i++) {
                if (rolesquery[0].value[i].name != null && rolesquery[0].value[i].name == roleName) {
                    return true;
                }
            }
        }
    }
    return false;
}

//是否包含角色名称
function IsContainUserRole(roleName) {
    var roles = Xrm.Page.context.getUserRoles();
    if (roles.length > 0) {
        var roleurl = "roles?$select=name&$filter=roleid eq " + roles[0] + "";
        for (var i = 1; i < roles.length; i++) {
            roleurl += " or roleid eq " + roles[i] + " ";
        }

        var rest = new hdREST();
        var rolesquery = rest.get(roleurl);

        if (rolesquery.error != undefined) {
            Xrm.Utility.alertDialog("获取安全角色失败:" + rolesquery.error.message.value);
            return false;
        } else if (rolesquery[0].value.length > 0) {
            for (var i = 0; i < rolesquery[0].value.length; i++) {
                if (rolesquery[0].value[i].name != null && rolesquery[0].value[i].name.indexOf(roleName) != -1) {
                    return true;
                }
            }
        }
    }
    return false;
}

//判断两个用户是否上下级
function IsSuperiorPosition(userId, supUserId) {
    var r = new hdREST();
    var userResult = r.get("systemusers(" + userId.toLowerCase().replace("{", "").replace("}", "") + ")?$select=_positionid_value");
    var supUserResult = r.get("systemusers(" + supUserId.toLowerCase().replace("{", "").replace("}", "") + ")?$select=_positionid_value");
    if (userResult != null && userResult != undefined && supUserResult != null && supUserResult != undefined) {
        if (userResult[0]._positionid_value != null) {
            var posResult = r.get("positions(" + userResult[0]._positionid_value + ")?$select=_parentpositionid_value");
            if (posResult != undefined && posResult != null) {
                if (posResult[0]._parentpositionid_value == supUserResult[0]._positionid_value) {
                    return true;
                }
            }
        }
    }
    return false;
}

//判断两个用户是否上级经理
function IsManager(userId, managerId) {
    var r = new hdREST();
    var userResult = r.get("systemusers(" + userId.toLowerCase().replace("{", "").replace("}", "") + ")?$select=_parentsystemuserid_value");
    if (userResult != undefined && userResult != null) {
        if (userResult[0]._parentsystemuserid_value == managerId.toLowerCase().replace("{", "").replace("}", "")) {
            return true;
        }
    }
    return false;
}

//只读元素
function ControlReadonly() {
    Xrm.Page.ui.controls.forEach(function (control, index) {
        try {
            control.setDisabled(true);
        } catch (Exception) {
        }
    });
}

//打开查找窗口
//savedValue：已保存的json格式的返回值
//logicalName：实体的logicalName
//lookupStype：multi、single
//filterXml：用于筛选的fetchXml条件
//例如：
//var savedValue = $("#txtApproveRole_text").val();
//var filterXml = encodeURIComponent('<filter type="and"><condition attribute="hd_type" operator="eq" value="899180000"/></filter>');
//var result = OpenLookupInfo(savedValue, "10013", "multi", filterXml);
//if (result != "") {
//    $("#txtApproveRole_text").val(result);
//}

//&DefaultType=ObjectTypeCode
//&DefaultViewId= ViewId
//&DisableQuickFind=0(Do you want quick find enable or not disable) Enable=1 Disable=0
//&DisableViewPicker=0(Do you want quick view picker enable or not disable)
//&IsInlineMultiLookup=0
//&LookupStyle=Lookup Style(single)
//&ShowNewButton=1 (Do you want new button enable or not disable)
//&ShowPropButton=1 (Do you want prop button enable or not disable)
//&dType=1
//&mrsh=false
//&objecttypes=ObjectTypeCode
//&search=Searchstring 


function OpenLookupInfo(savedValue, logicalName, lookupStype, filterXml, callback) {
    var obj = new Object();
    obj.additionalFetchFilter = filterXml;
    obj.additionalFetchFilterTypes = "";
    obj.customViews = null;
    obj.availableViews = null;
    obj.items = new Array();
    if (savedValue != null && savedValue != "") {
        var mObj = JSON.parse(savedValue);
        if (mObj != null && mObj.items != undefined && mObj.items != null) {
            for (var i = 0; i < mObj.items.length; i++) {
                mObj.items[i].getAttribute = function (attrName) {
                    if (attrName == "oid") {
                        return this.id;
                    }
                    if (attrName == "category") {
                        return this.category;
                    }
                    if (attrName == "otype") {
                        return this.type;
                    }
                    if (attrName == "otypeName") {
                        return this.typename;
                    }
                };
                mObj.items[i].textContent = mObj.items[i].name;
                mObj.items[i].innerText = mObj.items[i].name;
            }
            obj.items = mObj.items;
        }
    }
    var typeCode = Xrm.Internal.getEntityCode(logicalName);
    var strURL = Xrm.Page.context.prependOrgName("/_controls/lookup/lookupinfo.aspx?AllowFilterOff=0&DefaultType=" + typeCode + "&DisableQuickFind=0&DisableViewPicker=0&IsInlineMultiLookup=0&LookupStyle=" + lookupStype + "&ShowNewButton=0&ShowPropButton=0&browse=false&dType=1&mrsh=false&objecttypes=" + typeCode);
    var oUrl = Mscrm.CrmUri.create(strURL);
    var dialogwindow = new window.parent.Mscrm.CrmDialog(oUrl, obj, 552, 552, false, false, "status:no;", null);
    dialogwindow.setCallbackReference(callback);
    dialogwindow.show()


    //var result = openStdDlg(Xrm.Page.context.prependOrgName("/_controls/lookup/lookupinfo.aspx?AllowFilterOff=0&DefaultType=" + typeCode + "&DisableQuickFind=0&DisableViewPicker=1&IsInlineMultiLookup=0&LookupStyle=" + lookupStype + "&ShowNewButton=0&ShowPropButton=0&browse=false&dType=1&mrsh=false&objecttypes=" + typeCode), obj, 552, 552, false, false, "status:no;", null);
    //if (result != undefined && result != null) {
    //    if (result.items != undefined && result.items != null) {
    //        if (result.items.length > 0) {
    //            return JSON.stringify(result);
    //        }
    //    }
    //}
    return "";
}

//设置CRM 字段

//displayField：显示的字段名字
//displayEntityField:显示字段的文本 对应的字段
//hideField：隐藏的字段
//logicalName：实体的logicalName
//lookupStype：multi、single
//filterXml：用于筛选的fetchXml条件
//例如：
//var savedValue = $("#txtApproveRole_text").val();
//var filterXml = encodeURIComponent('<filter type="and"><condition attribute="hd_type" operator="eq" value="899180000"/></filter>');
//var result = OpenLookupInfo(savedValue, "10013", "multi", filterXml);
//if (result != "") {
//    $("#txtApproveRole_text").val(result);
//}
function SetCrmLookupInfo(displayField, hideField, logicalName, lookupStype, filterXml) {

    window.parent.$("#" + displayField)
        .keydown(function (event) {
            return false;
        });
    window.parent.$("#" + displayField)
        .mousedown(function (event) {
            return false;
        }); 

    if (!Xrm.Page.ui.controls.get(displayField).getDisabled() && window.parent.$("#" + displayField) != null)
        window.parent.$("#" + displayField).unbind("click").click(function () { OpenCrmLookupInfo(displayField, hideField, logicalName, lookupStype, filterXml) });

}


//打开查找窗口

//displayField：显示的字段名字
//displayEntityField:显示字段的文本 对应的字段
//hideField：隐藏的字段
//logicalName：实体的logicalName
//lookupStype：multi、single
//filterXml：用于筛选的fetchXml条件
//例如：
//var savedValue = $("#txtApproveRole_text").val();
//var filterXml = encodeURIComponent('<filter type="and"><condition attribute="hd_type" operator="eq" value="899180000"/></filter>');
//var result = OpenLookupInfo(savedValue, "10013", "multi", filterXml);
//if (result != "") {
//    $("#txtApproveRole_text").val(result);
//}
function OpenCrmLookupInfo(displayField, hideField, logicalName, lookupStype, filterXml) {
    var savedValue = Xrm.Page.data.entity.attributes.get(hideField).getValue();

    var result = OpenLookupInfo(savedValue, logicalName, lookupStype, filterXml, function (result) {

        if (result != undefined && result != null) {
            if (result.items != undefined && result.items != null) {
                if (result.items.length > 0) {
                    if (result != "") {
                        var fieldtxt = new Object();
                        var itemstxt = new Array();

                        var items = result.items;
                        var returntxt = "";
                        for (var i = 0; i < items.length; i++) {
                            var item = new Object();
                            item.id = items[i].id;
                            item.category = items[i].category;
                            item.type = items[i].type;
                            item.typename = items[i].typename;
                            item.name = items[i].name;
                            itemstxt.push(item);
                            //returntxt += JSON.parse(items[i].keyValues)[displayEntityField].value + " ;";
                            returntxt += items[i].name + " ;";
                        }
                        fieldtxt.items = itemstxt;
                        Xrm.Page.data.entity.attributes.get(displayField).setValue(returntxt);
                        Xrm.Page.getAttribute(displayField).setSubmitMode("always");
                        Xrm.Page.data.entity.attributes.get(hideField).setValue(JSON.stringify(fieldtxt));
                        Xrm.Page.getAttribute(hideField).setSubmitMode("always");
                        //$("#gw_approveuser_text").val(result);
                    }
                } else {
                    Xrm.Page.data.entity.attributes.get(displayField).setValue("");
                    Xrm.Page.getAttribute(displayField).setSubmitMode("always");
                    Xrm.Page.data.entity.attributes.get(hideField).setValue("");
                    Xrm.Page.getAttribute(hideField).setSubmitMode("always");
                }

                if (savedValue != Xrm.Page.data.entity.attributes.get(hideField).getValue()) {
                    Xrm.Page.getAttribute(hideField).fireOnChange();
                    Xrm.Page.getAttribute(displayField).fireOnChange();
                }
            }
        }
    });

}




/*
说明：表单提醒信息。
*/
function NotificationAlert(AlertType, AlertId, AlertString) {
    var notificationsArea = window.parent.document.getElementById('crmNotifications');
    if (notificationsArea == null) {
        if (USER_LANGUAGE_CODE == 2052) {
            alert('未能找到提醒信息显示控件，请联系系统管理员咨询！');
        } else {
            alert('Unable to find remind information display control, please contact the system administrator for consultation!!');
        }
        return;
    }
    switch (AlertType) {
        case "Critical":
            notificationsArea.control.AddNotification(AlertId, 1, 'source_' + AlertId, AlertString);
            break;
        case "Warning":
            notificationsArea.control.AddNotification(AlertId, 2, 'source_' + AlertId, AlertString);
            break;
        case "Info":
            notificationsArea.control.AddNotification(AlertId, 3, 'source_' + AlertId, AlertString);
            break;
        default:
            notificationsArea.control.SetNotifications(null, 'source_' + AlertId);
            break;
    }
    AlertType = "None";
}

/*
说明：删除表单提醒信息
*/
function RemoveNotificationAlert(AlertId) {
    var notificationsArea = window.parent.document.getElementById('crmNotifications');
    notificationsArea.control.SetNotifications(null, 'source_' + AlertId);
}

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

// 判断登录的用户是否具有指定名称的角色
//isLoginUserHasRoles(["EQ-02CRM officer", "a"]) 返回true
//isLoginUserHasRoles(["bbba","a"])返回false
function isLoginUserHasRoles(rolesName) {
    if (typeof (Xrm) != "undefined") {
        var strUserId = Xrm.Page.context.getUserId().replace("{", "").replace("}", "");
        if (strUserId != null && strUserId != "") {
            loginUserId = strUserId;
        } else {
            console.log("login user is null");
        }
        var roles = Xrm.Page.context.getUserRoles();
        for (var i = 0; i < roles.length; i++) {
            var roleName = CrmUtil.retrieve("roles(" + roles[i] + ")?$select=name").name;
            for (var j = 0; j < rolesName.length; j++) {
                if (roleName == rolesName[j]) {
                    return true;// 具有角色直接返回true
                }
            }
        }
    }
    return false;
}