<import resource="classpath:/alfresco/site-webscripts/org/alfresco/components/documentlibrary/data/surf-doclist.lib.js">

var this_AlfrescoUtil = this;

var AlfrescoUtil =
{
   /**
    *
    * NOTE DEPRECATED! This method was previously used to dynamically change the region-id's in the template.
    * Use evaluators to change the components inisde the region instead.
    *
    * ----------------------------------------------------------------------------------------------------
    *
    * Returns the "referrer" which can be used to decide which components that shall be bound in to a page.
    *
    * Note! Requires documentlibrary.js to have been imported so it can look at the value of model.doclibType.
    * Note!! The referrer may only contain numbers or characters.
    *
    * In a lof of pages it is enough to use model.doclibType to decide which title and navigation components
    * to display but some pages can be displayed in so many "contexts" that instructions need to be passed
    * in through the url.
    */
   getReferrer: function getReferrer()
   {
      if (page.url.args.referrer)
      {
         // The referrer is decided by the page who linked (i.e "tasks" or "workflows")
         if (page.url.args.referrer.match(/^\w*$/))
         {
            // Make sure only referrer only contains characters and numbers since it will be used in the html
            return page.url.args.referrer + "-";
         }
         return null;
      }
      else if (model.doclibType && model.doclibType.length > 0)
      {
         // "repo" mode
         return model.doclibType;
      }
      else
      {
         // "site" mode
         return "";
      }
   },

   error: function error(code, message, redirect)
   {
      status.code = arguments.length > 0 ? 500 : code;
      status.message = message || 'An error occured';
      status.redirect = arguments.length > 2 ? redirect : true;
      throw new Error(message);
   },

   /**
    * Looks for a parameter in a "safe" way that works in all "environments".
    * Meaning it will look in "page" and "template" if they do exist and not fail /crash if they don't.
    *
    * Looks for an argument in the following order/locations:
    * 1. args[name]
    * 2. page.url.args[name]        
    * 3. page.url.templateArgs[name]
    * 4. template.properties[name]
    * 5. a) if defaultValue has been passed in that is used
    *    b) otherwise the parameter is treated as required and an error is thrown
    *
    * @param name
    * @param defaultValue
    * @return the value for the parameter
    */
   param: function param(name, defaultValue)
   {
      var value;
      if (args[name] && args[name].length != 0)
      {
         value = args[name];
      }
      else if (this_AlfrescoUtil.hasOwnProperty("page") && page.url.args[name] && page.url.args[name].length != 0)
      {
         value = page.url.args[name];
      }
      else if (this_AlfrescoUtil.hasOwnProperty("page") && page.url.templateArgs[name] && page.url.templateArgs[name].length != 0)
      {
         value = page.url.templateArgs[name];
      }
      else if (this_AlfrescoUtil.hasOwnProperty("template") && template.properties[name] && template.properties[name].length != 0)
      {
         value = template.properties[name];
      }
      else if (arguments.length > 1)
      {
         value = defaultValue;
      }
      else
      {
         AlfrescoUtil.error(400, 'Parameter "' + name+ '" is missing.', true);
      }
      model[name] = value;
      return value;
   },

   getRepositoryUrl: function getRepositoryUrl()
   {
      // Repository Url
      var repositoryUrl = null,
         repositoryConfig = config.scoped["DocumentLibrary"]["repository-url"];

      if (repositoryConfig !== null)
      {
         repositoryUrl = repositoryConfig.value;
      }
      return repositoryUrl;
   },

   getRootNode: function getRootNode()
   {
      var rootNode = "alfresco://company/home",
         repoConfig = config.scoped["RepositoryLibrary"]["root-node"];

      if (repoConfig !== null)
      {
         rootNode = repoConfig.value;
      }
      return rootNode;
   },

   getNodeDetails: function getNodeDetails(nodeRef, site, options)
   {
      if (nodeRef)
      {
         var url = '/slingshot/doclib2/node/' + nodeRef.replace('://', '/');
         if (!site)
         {
            // Repository mode
            url += "?libraryRoot=" + encodeURIComponent(AlfrescoUtil.getRootNode());
         }
         var result = remote.connect("alfresco").get(url);

         if (result.status == 200)
         {
            var details = eval('(' + result + ')');
            if (details && (details.item || details.items))
            {
               DocList.processResult(details, options);
               return details;
            }
         }
      }
      return null;
   },

   getLinkDetailsByPostId: function getLinkDetails(site, container, link, defaultValue)
   {
      var url = '/api/links/link/site/' + site + '/' + container + '/' + link;
      var result = remote.connect("alfresco").get(url);
      if (result.status != 200)
      {
         if (defaultValue !== undefined)
         {
            return defaultValue;
         }
         AlfrescoUtil.error(result.status, 'Could not link details for link ' + link + ' in container ' + container + ' in site ' + site);
      }
      return eval('(' + result + ')').item;
   },

   getBlogPostDetails: function getBlogPostDetails(nodeRef, defaultValue)
   {
      var url = '/api/blog/post/node/' + nodeRef.replace('://', '/');
      var result = remote.connect("alfresco").get(url);
      if (result.status != 200)
      {
         if (defaultValue !== undefined)
         {
            return defaultValue;
         }
         AlfrescoUtil.error(result.status, 'Could not blog details for post ' + nodeRef);
      }
      return eval('(' + result + ')').item;
   },

   getBlogPostDetailsByPostId: function getBlogPostDetailsByPostId(site, container, post, defaultValue)
   {
      var url = '/api/blog/post/site/' + site + '/' + container + '/' + post;
      var result = remote.connect("alfresco").get(url);
      if (result.status != 200)
      {
         if (defaultValue !== undefined)
         {
            return defaultValue;
         }
         AlfrescoUtil.error(result.status, 'Could not blog details for post ' + post + ' in container ' + container + ' in site ' + site);
      }
      return eval('(' + result + ')').item;
   },

   getMetaData: function getMetaData(nodeRef, defaultValue)
   {
      var result = remote.connect("alfresco").get('/api/metadata?nodeRef=' + nodeRef);
      if (result.status != 200)
      {
         if (defaultValue !== undefined)
         {
            return defaultValue;
         }
         AlfrescoUtil.error(result.status, 'Could not load meta data ' + nodeRef);
      }
      result = eval('(' + result + ')');
      return result;
   },

   getThumbnails: function getThumbnails(nodeRef, defaultValue)
   {
      var result = remote.connect("alfresco").get('/api/node/' + nodeRef.replace(':/', '') + '/content/thumbnaildefinitions');
      if (result.status != 200)
      {
         if (defaultValue !== undefined)
         {
            return defaultValue;
         }
         AlfrescoUtil.error(result.status, 'Could not load thumbnail definitions for ' + nodeRef);
      }
      return eval('(' + result + ')');
   },

   /**
    * Get user preferences
    *
    * @method getPreferences
    * @param p_filter {String} Optional preference filter
    */
   getPreferences: function getPreferences(p_filter)
   {
      var preferences = {};

      try
      {
         // Request the current user's preferences
         var result = remote.call("/api/people/" + encodeURIComponent(user.name) + "/preferences");
         if (result.status == 200 && result != "{}")
         {
            var prefs = eval('try{(' + result + ')}catch(e){}');
            // Populate the preferences object literal for easy look-up later
            if (typeof p_filter == "undefined" || p_filter.length == 0)
            {
               preferences = eval('try{(prefs)}catch(e){}');
            }
            else
            {
               preferences = eval('try{(prefs.' + p_filter + ')}catch(e){}');
            }
            if (typeof preferences != "object")
            {
               preferences = {};
            }
         }
      }
      catch (e)
      {
      }

      return preferences;
   },

   /**
    * Convert from ISO8601 date to JavaScript date
    *
    * @method fromISO8601
    * @param date {string} ISO8601 formatted date string
    * @return {Date|null} JavaScript native Date object
    */
   fromISO8601: function fromISO8601(formattedString)
   {
      var isoRegExp = /^(?:(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(.\d+)?)?((?:[+-](\d{2}):(\d{2}))|Z)?)?$/;

      var match = isoRegExp.exec(formattedString);
      var result = null;

      if (match)
      {
         match.shift();
         if (match[1]){match[1]--;} // Javascript Date months are 0-based
         if (match[6]){match[6] *= 1000;} // Javascript Date expects fractional seconds as milliseconds

         result = new Date(match[0]||1970, match[1]||0, match[2]||1, match[3]||0, match[4]||0, match[5]||0, match[6]||0);

         var offset = 0;
         var zoneSign = match[7] && match[7].charAt(0);
         if (zoneSign != 'Z')
         {
            offset = ((match[8] || 0) * 60) + (Number(match[9]) || 0);
            if (zoneSign != '-')
            {
               offset *= -1;
            }
         }
         if (zoneSign)
         {
            offset -= result.getTimezoneOffset();
         }
         if (offset)
         {
            result.setTime(result.getTime() + offset * 60000);
         }
      }

      return result; // Date or null
   },

   /**
    * Retrieve current user's site membership.
    *
    * @method getSiteMembership
    * @param siteId {string} Site to get details for
    * @return {object} Object literal of the form
    * <pre>
    *    isMember: true|false,
    *    isManager: true|false
    *    role: "SiteManager"|"SiteCollaborator"|"SiteContributor"|"SiteConsumer"
    * </pre>
    */
   getSiteMembership: function getSiteMembership(siteId)
   {
      var obj =
      {
         isMember: false,
         isManager: false,
         role: ""
      };

      var json = remote.call("/api/sites/" + encodeURIComponent(siteId) + "/memberships/" + encodeURIComponent(user.name));
      if (json.status == 200)
      {
         response = eval('(' + json + ')');
         if (response)
         {
            obj =
            {
               isMember: true,
               isManager: response.role == "SiteManager",
               role: response.role
            };
         }
      }
      return obj;
   },

   /**
    * @method getPages
    * @param includeUnusedPages IF true all pages will be returned, if false only the pages used by the current site
    * @return the pages used in the site and optionally unused as well, if so at the end of list.
    * [
    *    {
    *       pageId:        {String}  // The id of the page
    *       pageUrl:       {String}  // The page's url, either page id or overriden in the the share-config.xml SitePages/pages/page
    *       sitePageTitle: {String}  // Title, if given by the Site's administrator in the customise page ui, if null use ...
    *       title:         {String}  // ... title from page's xml descriptor or i18n msg key.
    *       description:   {String}  // Description from page's xml descriptor or i18n msg key
    *       used:          {boolean} // Set to true if page is used on this site
    *    }
    * ]
    */
   getPages: function getPages(includeUnusedPages)
   {
      var siteId = this_AlfrescoUtil.hasOwnProperty("page") ? page.url.templateArgs.site : null,
         pages = [];
      if (siteId)
      {
         var dashboardPageData = sitedata.getPage("site/" + siteId + "/dashboard");
         if (dashboardPageData !== null)
         {
            pages = [];

            // todo: Use a proper json parser since json may consist of user input,
            var sitePages = eval('(' + dashboardPageData.properties.sitePages + ')') || [],
               pageMetadata = eval('(' + dashboardPageData.properties.pageMetadata + ')') || {},
               configPages = config.scoped["SitePages"]["pages"].childrenMap["page"],
               urlMap = {},
               pageId;

            // Get the page urls from config
            for (var i = 0; i < configPages.size(); i++)
            {
               // Get page id from config file
               pageId = configPages.get(i).attributes["id"];
               if (pageId)
               {
                  urlMap[pageId] = configPages.get(i).value;
               }
            }

            // Add used pages in the order decided by user
            for (var i = 0; i < sitePages.length; i++)
            {
               pages.push(
               {
                  pageId: sitePages[i].pageId,
                  sitePageTitle: sitePages[i].sitePageTitle || null,
                  used: true
               });
            }

            // Add the unused pages if requested
            for (var i = 0, il = configPages.size(); includeUnusedPages && i < il; i++)
            {
               pageId = configPages.get(i).attributes["id"];
               for (var j = 0, jl = pages.length; j < jl; j++)
               {
                  if (pageId == pages[j].pageId)
                  {
                     break;
                  }
               }
               if (j == jl)
               {
                  pages.push(
                  {
                     pageId: pageId,
                     used: false
                  });
               }
            }

            var titleId, descriptionId, pageData, pageMeta, p;

            // Get page details
            for (var i = 0, il = pages.length; i < il; i++)
            {
               p = pages[i];
               pageId = p.pageId;
               pageData = sitedata.getPage(pageId);
               pageMeta = pageMetadata[pageId] || {};
               if (pageData != null)
               {
                  p.pageUrl = urlMap[pageId] || pageId;

                  // Title from page's xml descriptor or property bundle if key is given
                  p.title = pageMeta.title || pageData.title;
                  titleId = pageMeta.titleId || pageData.titleId;
                  p.title = titleId ? msg.get(titleId) : p.title;

                  // Description from page's xml descriptor or property bundle if key is given
                  p.description = pageMeta.description || pageData.description;
                  descriptionId = pageMeta.descriptionId || pageData.descriptionId;
                  p.description = descriptionId ? msg.get(descriptionId) : p.description;
               }
               else
               {
                  // page does not exist! output error to help the developer
                  p.title = "ERROR: page " + pageId + " not found!";
               }
            }
         }
      }
      // Prepare template model
      return pages;
   },

   /**
    * Returns info about the current page in the same same format as the page info array in getPages().
    * Note that the title and description are picked from all valid places:
    * User input set in pageMeta property, message bundles AND xml descriptors.
    *
    * @method getMetaPage
    * @return page info or null if the pageId wasn't found.
    */
   getMetaPage: function getMetaPage()
   {
      var pages = this.getPages(true);
      for (var i = 0, il = pages.length; i < il; i++)
      {
         if (pages[i].pageId == page.id)
         {
            return pages[i];
         }
      }
      return null;
   },

   /**
    * Append multiple parts of a path, ensuring duplicate path separators are removed.
    * Leaves "://" patterns intact so URIs and nodeRefs are safe to pass through.
    *
    * @method Alfresco.util.combinePaths
    * @param path1 {string} First path
    * @param path2 {string} Second path
    * @param ...
    * @param pathN {string} Nth path
    * @return {string} A string containing the combined paths
    * @static
    */
   combinePaths: function combinePaths()
   {
      var path = "", i, ii;
      for (i = 0, ii = arguments.length; i < ii; i++)
      {
         if (arguments[i] !== null)
         {
            path += arguments[i] + (arguments[i] !== "/" ? "/" : "");
         }
      }
      path = path.replace(/(^|[^:])\/{2,}/g, "$1/");

      // Remove trailing "/" if the last argument didn't end with one
      if (arguments.length > 0 && !(typeof arguments[arguments.length - 1] === "undefined") && arguments[arguments.length - 1].match(/(.)\/$/) === null)
      {
         path = path.replace(/(.)\/$/g, "$1");
      }
      return path;
   },
   
   /**
    * Generate folder path to node suitable for UI rendering
    *
    * @method getPaths
    * @param itemDetails {object} As returned from repository data webscript
    * @param targetPage {string} Target page name for the destination URL
    * @param targetPageLabel {string} Target page label
    * @return {array} Array of paths to be rendered
    */
   getPaths: function getPaths(itemDetails, targetPage, targetPageLabel)
   {
      var item = itemDetails.item,
         isContainer = item.node.isContainer,
         path = item.location.path,
         paths = [],
         folders,
         pathUrl = "",
         x, y;

      if (isContainer)
      {
         paths.push(
         {
            href: targetPage + (path == "/" && item.location.file.length > 0 ? "?file=" + encodeURIComponent(item.fileName) : ""),
            label: msg.get(targetPageLabel),
            cssClass: "folder-link"
         });

         path = AlfrescoUtil.combinePaths(path, item.location.file);
         if (path.length > 1)
         {
            folders = path.substring(1, path.length).split("/");

            for (x = 0, y = folders.length; x < y; x++)
            {
               pathUrl += "/" + folders[x];
               paths.push(
               {
                  href: targetPage + (y - x == 2 ? "?file=" + encodeURIComponent(item.fileName) + "&path=" : "?path=") + encodeURIComponent(pathUrl),
                  label: folders[x],
                  cssClass: "folder-link " + (y - x == 1 ? "folder-closed" : "folder-open")
               });
            }
         }
      }
      else
      {
         paths.push(
         {
            href: targetPage + (path.length < 2 ? "?file=" + encodeURIComponent(item.fileName) : ""),
            label: msg.get(targetPageLabel),
            cssClass: "folder-link"
         });

         if (path.length > 1)
         {
            folders = path.substring(1, path.length).split("/");

            for (x = 0, y = folders.length; x < y; x++)
            {
               pathUrl += "/" + folders[x];
               paths.push(
               {
                  href: targetPage + (y - x < 2 ? "?file=" + encodeURIComponent(item.fileName) + "&path=" : "?path=") + encodeURIComponent(pathUrl),
                  label: folders[x],
                  cssClass: "folder-link folder-open"
               });
            }
         }
      }
      return paths;
   }
};
