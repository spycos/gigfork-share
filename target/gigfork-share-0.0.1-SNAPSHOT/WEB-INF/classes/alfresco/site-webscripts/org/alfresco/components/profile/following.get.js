<import resource="classpath:/alfresco/templates/org/alfresco/import/alfresco-util.js">

/**
 * User Profile Component - Following list GET method
 */

function main()
{
   var userId = page.url.templateArgs["userid"];
   if (userId == null)
   {
      userId = user.name;
   }
   
   model.activeUserProfile = (userId == null || userId == user.name);
   
   var result = remote.call("/api/subscriptions/" + encodeURIComponent(userId) + "/following");
   model.numPeople = 0;
   if (result.status == 200)
   {
      var people = eval('(' + result + ')');
      model.data = people;
      model.numPeople = people.people.length;
   }
   
   var result = remote.call("/api/subscriptions/" + encodeURIComponent(userId) + "/private");
   model.privatelist = false;
   if (result.status == 200)
   {
      model.privatelist = eval('(' + result + ')')['private'];
   }
}
main();