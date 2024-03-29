<#setting number_format="computer" />
<#macro exif properties property>
   <#if properties["exif:" + property]??>
               <tr><th><span title="${msg("label.exif_${property}.description")}">${msg("label.exif_${property}.title")}</span></th><td>${properties["exif:" + property]?string?html}</td></tr>
   </#if>
</#macro>
<#if documentDetailsJSON??>
   <#assign id = args.htmlid?html>
<script type="text/javascript">//<![CDATA[
   new Alfresco.component.GoogleMap("${id}").setOptions(
   {
      documentDetails: ${documentDetailsJSON},
   }).setMessages(${messages});
//]]></script>

<div class="google-map">
   <div id="${id}-map" class="map"></div>
</div>

<div class="hidden">
   <div id="${id}-info" class="google-map-popup">
      <div class="thumbnail"><a href="document-details?nodeRef=${document.nodeRef}"><img src="${url.context}/proxy/alfresco/api/node/${document.nodeRef?replace(":/", "")}/content/thumbnails/doclib?c=queue&amp;ph=true" /></a></div>
   <#if document.node.properties??>
      <#assign props = document.node.properties>
      <div id="${id}-exif" class="exif hidden">
         <table cellpadding="0" cellspacing="0" width="100%">
            <tbody>
            <#list ["pixelXDimension", "pixelYDimension", "exposureTime", "fNumber", "flash", "focalLength",
               "isoSpeedRatings", "manufacturer", "model", "software", "orientation", "xResolution", "yResolution", "resolutionUnit"] as name>
               <@exif props name />
            </#list>
            </tbody>
         </table>
      </div>
   </#if>
   </div>
</div>
</#if>