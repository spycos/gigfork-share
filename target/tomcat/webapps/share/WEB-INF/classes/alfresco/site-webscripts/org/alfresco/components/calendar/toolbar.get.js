<import resource="classpath:alfresco/site-webscripts/org/alfresco/callutils.js">
<import resource="classpath:alfresco/site-webscripts/org/alfresco/components/calendar/helper.js">

// Check whether the current user is a member of the site first and then if they are
// the role of the user - until there is a method of doing this check on the web tier 
// we have to make a call back to the repo to get this information.

var role = null;
var obj = null;
var json = remote.call("/api/sites/" + page.url.templateArgs.site + "/memberships/" + encodeURIComponent(user.name));
if (json.status == 200)
{
   obj = eval('(' + json + ')');
}
if (obj)
{
   role = obj.role;
}

// set role appropriately
if (role !== null)
{
   model.role = role;
}
else
{
   model.role = "Consumer"; // default to safe option
}
model.viewType = CalendarScriptHelper.getView(); // returns current view after checking for enabled views
model.viewToolbarViews = CalendarScriptHelper.listViews(); // returns a array of enabled views
model.viewToolbarViewCount = CalendarScriptHelper.countViews() > 1; // if only one view, hide view switching buttons
model.viewToolbarNav = (model.enabledViews.day || model.enabledViews.week || model.enabledViews.month) // see if the Today, Previous and Next navigation items are relevant