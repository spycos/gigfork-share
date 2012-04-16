<!--[if IE]>
<iframe id="yui-history-iframe" src="${url.context}/res/yui/history/assets/blank.html"></iframe> 
<![endif]-->
<input id="yui-history-field" type="hidden" />

<#assign el=args.htmlid?html>
<script type="text/javascript">//<![CDATA[
   new Alfresco.ConsoleChannels("${el}").setOptions(
   {
      acceptMessagesFrom: "${config.script.config.remoteAuthDomain}"
   }).setMessages(${messages});
//]]></script>

<div id="${el}-body" class="channels">
   
   <!-- List panel -->
   <div id="${el}-list" class="">
      
      <div class="yui-g">
         <div class="yui-u first">
            <div class="title">${msg("channelAdmin.title")}</div>
         </div>
         <div class="yui-u align-right permissions-hide">
            <!-- New Channel Button -->
            <div class="new-button">
               <span class="yui-button yui-menu-button" id="${el}-new-button">
                  <span class="first-child"><button>${msg("channelAdmin.button.new")}</button></span>
               </span>
            </div>
            <div id="${el}-newChannel-menu" class="yuimenu menu-with-icons" style="visibility: hidden;">
               <div class="bd">
                  <ul id="${el}-channelTypes" class="channelTypes">
                     <#list channelTypes as channelType>
                     <li>
                        <span>
                           <a href="#" class="newChannelAction" rel="${channelType.id}" style="background-image:url('${url.context}/proxy/alfresco/${channelType.icon}/16');" >
                              ${channelType.title}
                           </a>
                        </span>
                     </li>
                     </#list>
                  </ul>
               </div>
            </div>
            
         </div>
      </div>
   </div>
   
   <div id="${el}-datatable" class="permissions-hide channellist"></div>
   <div id="${el}-managepermissions" class="permissions-show"></div>
   <iframe id="${el}-iframe" src="${config.script.config.remoteAuthDomain}${config.script.config.remoteAuthSendPath}"></iframe>
</div>