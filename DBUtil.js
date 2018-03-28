if (typeof (DBUtil) == "undefined")
{ DBUtil = { __namespace: true }; }
var DBUtil = {
    _userId: "",
    version: "1.0.1.2",
    description: "web api common method;",
    getServerUrl: function () {
        var _context = Xrm.Page.context;
        if (typeof (_context.getClientUrl) == "function")
            return _context.getClientUrl();
        else throw Error("ServerUrl Error!");
    },
    retrieve: function (parameter) {
        var req = new XMLHttpRequest();
        req.open("GET", encodeURI(this.getServerUrl() + "/api/data/v8.0/" + parameter), false);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.send();

        return JSON.parse(req.responseText);
    },
    create: function (entityName, entityObj) {
        var req = new XMLHttpRequest();
        req.open("POST", this.getServerUrl() + "/api/data/v8.0/" + entityName, false);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.send(entityObj);

        if (req.status == 204 && req.responseText == "") {
            return JSON.parse("{ \"id\":\"" + req.getResponseHeader("OData-EntityId").match(/([^\(\)]+)(?=\))/g)[0] + "\" }");
        }
        return JSON.parse(req.responseText);
    },
    updateByImpersonationUser: function (entityName, entityGuid, entityObj, entityField, MSCRMCallerID) {
        if (entityField == null || typeof (entityField) == "undefined") entityField = "";
        else entityField = "/" + entityField.replace(/^\//, "");

        var req = new XMLHttpRequest();
        req.open("PATCH", this.getServerUrl() + "/api/data/v8.0/" + entityName + "(" + entityGuid + ")" + entityField, false);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        if (MSCRMCallerID && MSCRMCallerID.length == 36) req.setRequestHeader("MSCRMCallerID", MSCRMCallerID);
        req.send(entityObj);

        if (req.status == 204 && req.responseText == "") {
            return true;
        }
        else return JSON.parse(req.responseText);
    },
    update: function (entityName, entityGuid, entityObj, entityField) {
        return this.updateByImpersonationUser(entityName, entityGuid, entityObj, entityField, null);
    },
    delete: function (entityName, entityGuid, entityField) {
        if (typeof (entityField) == "undefined") entityField = "";
        else entityField = "/" + entityField.replace(/^\//, "");

        var req = new XMLHttpRequest();
        req.open("DELETE", this.getServerUrl() + "/api/data/v8.0/" + entityName + "(" + entityGuid + ")" + entityField, false);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.send();

        if (req.status == 204 && req.responseText == "") {
            return true;
        }
        else return false;
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
  execAction: function (actionName, asyncFlag, entityObj) {
        ///<summary>
        /// exec an action;object is stringify
        ///</summary>
        var req = new XMLHttpRequest();
        req.open("POST", Xrm.Page.context.getClientUrl() + "/api/data/v8.0/" + actionName, asyncFlag);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.send(entityObj);

        if (req.status == 204 && req.responseText == "") {
            return JSON.parse(req.responseText);
        }
        return JSON.parse(req.responseText);
    }
}
