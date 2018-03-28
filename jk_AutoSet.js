//==================================================================================================
// ruanzhao 1542666278@qq.com
// 通过lookup字段自动为表单其他字段赋值 
// 兼容 类型 string datetime optionset
// 参数 orgField：查找字段的名称
//         param：对象数组，对象指定column属性和targetField属性
//  （column 表示查找的实体对应的字段； targetField表示要自动赋值的字段，
// 如果column类型与targetField属性不一样，比如 带查找字段主字段给文本字段赋值，则请指定extColumn属性
// extColumn 为 "lookup"表示赋值查找主字段属性，为"optionset"表示赋值选项集文本）
// param 举例
/*
orgField = "cicc_shares_codeid";
param = [
        { column: "cicc_company_chname", targetField: "cicc_name" },
        { column: "ownerid", targetField: "ownerid" },
        { column: "ownerid", targetField: "cicc_notes", extColumn: "lookup" },
        { column: "cicc_stock_type", targetField: "cicc_street", extColumn: "optionset" },
        { column: "modifiedon", targetField: "modifiedon" }
];
*/
//==================================================================================================
function autoSetValueByFields(orgField, param) {
    if (Xrm.Page.getAttribute(orgField) == null || Xrm.Page.getAttribute(orgField).getValue() == null) {
        return;
    }
    try {
        var orgFieldObj = Xrm.Page.getAttribute(orgField).getValue()[0];
        var entityType = orgFieldObj.entityType;// 原表类型
        var entitySetName = Xrm.Internal.getEntitySetName(entityType);// 复数名
        var entityId = orgFieldObj.id;// id
        var queryExp = entitySetName + "(" + entityId.substr(1, entityId.length - 2) + ")" + "?$select=statecode";//查询表达式
        // 遍历 建立查询语句
        for (var i = 0; i < param.length; i++) {
            var targetFieldObj = Xrm.Page.getAttribute(param[i].targetField);
            if (targetFieldObj == null) {
                return;
            }
            var column = param[i].column;
            var targetType = targetFieldObj.getAttributeType();// 目标字段类型
            // 查找时 lookup特殊处理
            var lookupExp;
            if (targetType == "lookup") {// 赋值给lookup
                lookupExp = "_" + param[i].column + "_value";
                queryExp += ",_" + param[i].column + "_value";
            } else {
                if (param[i].extColumn == "lookup") {// 查找字段拓展属性
                    lookupExp = "_" + param[i].column + "_value";
                    queryExp += ",_" + param[i].column + "_value";
                } else {
                    queryExp += "," + param[i].column;
                }
            }
        }
        debugger;
        var data = retrieve(queryExp);
        // 遍历 根据查询结果赋值
        for (var i = 0; i < param.length; i++) {
            var targetFieldObj = Xrm.Page.getAttribute(param[i].targetField);
            if (targetFieldObj == null) {
                return;
            }
            targetFieldObj.setSubmitMode("always");
            var column = param[i].column;
            var targetType = targetFieldObj.getAttributeType();// 目标字段类型
            // 查找时 lookup特殊处理
            var lookupExp;
            if (targetType == "lookup") {// 赋值给lookup
                lookupExp = "_" + param[i].column + "_value";
            } else {
                if (param[i].extColumn == "lookup") {// 查找字段拓展属性
                    lookupExp = "_" + param[i].column + "_value";
                    column = lookupExp + "@OData.Community.Display.V1.FormattedValue";
                } else if (param[i].extColumn == "optionset") {// 选项集字段拓展属性
                    column = param[i].column + "@OData.Community.Display.V1.FormattedValue";
                }
            }
            switch (targetType) {
                case "lookup": SetLookupValue(param[i].targetField, data[lookupExp + "@Microsoft.Dynamics.CRM.lookuplogicalname"], data[lookupExp], data[lookupExp + "@OData.Community.Display.V1.FormattedValue"]); break;
                case "datetime": targetFieldObj.setValue(new Date(data[column])); break;
                default: targetFieldObj.setValue(data[column]); break;
            }
        }
    } catch (e) {
        console.log(e);
        alert("Catch an unexpected error :" + e.message);
    }
}
// lookUp设置
function SetLookupValue(fieldname, logicalName, entityId, displayName) {
    var aLookup = new Array();
    var obj = new Object();
    obj.id = entityId;
    obj.entityType = logicalName;
    obj.name = displayName;
    aLookup[0] = obj;
    if (entityId == null || entityId == "") {
        parent.Xrm.Page.getAttribute(fieldname).setValue(null);
    } else {
        parent.Xrm.Page.getAttribute(fieldname).setValue(aLookup);
    }
    parent.Xrm.Page.getAttribute(fieldname).setSubmitMode("always");
}
// 取数据和关联数据
function retrieve(parameter) {
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
    var req = xmlHTTPRequest;
    req.open("GET", encodeURI(Xrm.Page.context.getClientUrl() + "/api/data/v8.0/" + parameter), false);
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
    req.send();
    return JSON.parse(req.responseText);
}
