
function main()
{
   // retrieve the forum post
   var uri = "/api/forum/post/site/" + url.templateArgs.site +"/" + url.templateArgs.container +"/" + url.templateArgs.path;
   var connector = remote.connect("alfresco");
   var result = connector.get(encodeURI(uri));
   if (result.status.code == status.STATUS_OK)
   {
      // Strip out possible malicious code
      var post = eval("(" + result.response + ")");
      if (post && post.item && post.item.content) {
         post.item.content = stringUtils.stripUnsafeHTML(post.item.content);
      }
      return jsonUtils.toJSONString(post);
   }
   else
   {
      status.code = result.status.code;
      status.message = msg.get("message.failure");
      status.redirect = true;
   }
}

model.post = main();