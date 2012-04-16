<#include "../../include/alfresco-macros.lib.ftl" />
<#assign el=args.htmlid?html>
<script type="text/javascript">//<![CDATA[
   new Alfresco.component.Path("${el}").setOptions(
   {
      rootPage: "repository",
      rootLabelId: "path.repository"
   }).setMessages(
      ${messages}
   );
//]]></script>

<div class="path-nav">
   <span class="heading">${msg("path.location")}:</span>
   <span id="${el}-defaultPath" class="path-link"><a href="${siteURL("repository")}">${msg("path.repository")}</a></span>
   <span id="${el}-path"></span>
</div>
<div id="${el}-status" class="status-banner hidden"></div>