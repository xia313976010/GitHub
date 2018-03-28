/*==================================================================
ruanzhao 1542666278@qq.com
--------------------------------------------------------------------

fwREST v0.6.2

var  r = new fwREST();
或
var r = new fwREST(url);

如果返回结果对象的.responseJSON.error != undefined 刚表明有错误，
请使用 .responseJSON.error.message获取错误内容。

===================================================================*/


function fwREST(url) {
    var self = this;

    self.$ = null;

    if (window.$ && window.$.ajax) {
        self.$ = window.$;
    } else if (parent.$ && parent.$.ajax) {
        self.$ = parent.$;
    }

    // 获取额外属性
    self.enableAnotPrefer = function (bool) {
        if (bool) {
            self.Heads.Prefer = 'odata.include-annotations="*"';
        } else {
            self.Heads.Prefer = '';
        }
    }
    self.FormatStr = "@OData.Community.Display.V1.FormattedValue";
    self.LogicalNameStr = "@Microsoft.Dynamics.CRM.lookuplogicalname";
    self.NavigationStr = "@Microsoft.Dynamics.CRM.associatednavigationproperty";
    self.Heads = {
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8'
    };

    //服务器组织地址
    self.ServerUrl = null;
    if (url) {
        self.ServerUrl = url;
    } else {
        if (window.Xrm) {
            self.ServerUrl = Xrm.Page.context.prependOrgName('');
        }
    }

    //同步:false,异步为true
    self.Async = false;

    self.Send = function (url, type, data, context) {
        return self.$.ajax( this.ServerUrl + '/api/data/v8.0/'+url,
        {
            async: this.Async,
            headers: this.Heads,
            dataType: 'json',
            type: type,
            data: data,
            context: context
        });
    }

    self.getEntityId = function (createResponse) {
        var odataEntityIdUrl = createResponse.getResponseHeader('OData-EntityId');
        var id = odataEntityIdUrl.match(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/);
        if (id.length > 0) {
            return id[0];
        } else {
            return null;
        }
    }

    self.getEntitySetName = function (entityname) {
        return Xrm.Internal.getEntitySetName(entityname);
    }
}



fwREST.prototype.create = function (entityname, jsondata, context) {
    var requestURL = this.getEntitySetName(entityname);
    return this.Send(requestURL, 'POST', JSON.stringify(jsondata), context);
}


fwREST.prototype.del = function (entityname, id, context) {
    var requestURL = this.getEntitySetName(entityname) + '(' + id.replace(/{/, '').replace(/}/, '') + ')';
    return this.Send(requestURL, 'DELETE');
}


fwREST.prototype.update = function (entityname, id, obj, context) {
    var requestURL = this.getEntitySetName(entityname) + '(' + id.replace(/{/, '').replace(/}/, '') + ')';
    return this.Send(requestURL, 'PATCH', JSON.stringify(obj), context);
}


fwREST.prototype.get = function (parameter, context) {
    var requestURL = parameter;
    return this.Send(requestURL, 'GET', null, context);
}

//执行自定义未绑定操作，返回操作的输出参数
fwREST.prototype.execCustomNoBindingAction=function(actionName, asyncFlag, objJsonStr) {
    ///<summary>
    /// exec an action;object is stringify
    ///</summary>
    var req = new XMLHttpRequest();
    req.open("POST", Xrm.Page.context.getClientUrl() + "/api/data/v8.0/" + actionName, asyncFlag);
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.send(objJsonStr);

    if (req.status == 204 && req.responseText == "") {
        return JSON.parse(req.responseText);
    }
    return JSON.parse(req.responseText);
}

// 执行内置绑定操作，返回操作输出参数
//AddMembersTeam
fwREST.prototype.execInnerBindingAction = function (actionName,asyncFlag,bindingEntName,bindingEntId, objJsonStr) {
    actionName = "Microsoft.Dynamics.CRM." + actionName;
    var req = new XMLHttpRequest();
    req.open("POST", Xrm.Page.context.getClientUrl() + "/api/data/v8.0/"+Xrm.Internal.getEntitySetName(bindingEntName)+"("+bindingEntId+")/" + actionName, false);
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.send(JSON.stringify(objJsonStr));
}