
function convertTopicJSONData(topic)
{
    // created
    var created = new Date(topic["createdOn"])
    topic["createdOn"] = created;
    
    // last reply
    if (topic["lastReplyOn"] != undefined)
    {
        topic["lastReplyOn"] = new Date(topic["lastReplyOn"])
    }
}

/**
 * Converts the data object from strings to the proper types
 * (currently this only handles strings
 */
function convertTopicsJSONData(data)
{
    for (var x=0; x < data.items.length; x++)
    {
        convertTopicJSONData(data.items[x]);
    }
}

function main()
{
   var site, container, theUrl, connector, result, data;
   
   // gather all required data
   site = args["site"];
   container = (args["container"] != undefined) ? args["container"] : "discussions";
   
   theUrl = '/api/forum/site/' + site + '/' + container + "/posts?contentLength=512";
   
   connector = remote.connect("alfresco-feed");
   result = connector.get(theUrl);
   if (result.status != status.STATUS_OK)
   {
      status.setCode(status.STATUS_INTERNAL_SERVER_ERROR, "Unable to do backend call. " +
                     "status: " + result.status + ", response: " + result.response);
      return null;
   }
   data = eval('(' + result.response + ')');
   convertTopicsJSONData(data);
   model.items = data.items;

   // set additional properties
   // PENDING: where to get this information?
   model.lang = "en-us";
   model.site = site;
   model.container = container;
}

main();