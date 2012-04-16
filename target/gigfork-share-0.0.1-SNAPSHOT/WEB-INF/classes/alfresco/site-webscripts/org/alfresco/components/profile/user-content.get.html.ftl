<#include "../../include/alfresco-macros.lib.ftl" />
<#macro formatContent content date type index>
   <#if content.browseUrl??>
   <li<#if (index == 0)> class="first"</#if>>
      <span class="icon32"><a href="${url.context}/page/site/${content.site.shortName}/${content.browseUrl}" class="thmb"><img src="${url.context}/res/components/images/filetypes/${fileIcon(content.name)}" alt="${content.name?html}" title="${content.name?html}" /></a></span>
      <p>
         <a href="${url.context}/page/site/${content.site.shortName}/${content.browseUrl}" class="theme-color-1">${(content.displayName!"")?html}</a>
         ${(content.description!"")?html}
         <span>${msg("label." + type)} <span class="relativeTime">${date}</span></span></p>
   </li>
   </#if>
</#macro>

<#assign el=args.htmlid?html>
<div id="${el}-body" class="profile">
   <div class="viewcolumn">
      <div class="header-bar">${msg("label.recentlyAdded")}</div>
      <#if (numAddedContent > 0)>
      <ul class="content">
      <#list addedContent as content>
      <@formatContent content content.createdOn "createdOn" content_index />
      </#list>
      </ul>
      <#else>
      <p>${msg("label.noAddedContent")}</p>
      </#if>
      <div class="header-bar">${msg("label.recentlyModified")}</div>
      <#if (numModifiedContent > 0)>
      <ul class="content">
      <#list modifiedContent as content>
      <@formatContent content content.modifiedOn "modifiedOn" content_index />
      </#list>
      </ul>
      <#else>
      <p>${msg("label.noModifiedContent")}</p>
      </#if>                  
   </div>
</div>
<script type="text/javascript">
   YAHOO.util.Dom.getElementsByClassName("relativeTime", "span", document.getElementById("${el}-body"), function()
            {
               this.innerHTML = Alfresco.util.relativeTime(this.innerHTML);
            })
</script>