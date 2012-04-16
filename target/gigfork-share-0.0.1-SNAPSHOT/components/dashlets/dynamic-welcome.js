/**
 * Copyright (C) 2005-2010 Alfresco Software Limited.
 *
 * This file is part of Alfresco
 *
 * Alfresco is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alfresco is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * Alfresco.dashlet.UserWelcome
 * Registers a event handler on the 'Remove Me' button to have the component remove itself.
 *
 * @namespace Alfresco.dashlet
 * @class Alfresco.dashlet.UserWelcome
 */
(function()
{
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event;

   /**
    * DynamicWelcome constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {DynamicWelcome} The new component instance
    * @constructor
    */
   Alfresco.dashlet.DynamicWelcome = function DynamicWelcome_constructor(htmlId, dashboardUrl, dashboardType, site)
   {
      Alfresco.dashlet.DynamicWelcome.superclass.constructor.call(this, "Alfresco.dashlet.DynamicWelcome", htmlId);

      this.name = "Alfresco.dashlet.DynamicWelcome";
      this.dashboardUrl = dashboardUrl;
      this.createSite = null;
      this.dashboardType = dashboardType;
      this.site = site;

      this.services.preferences = new Alfresco.service.Preferences();
      return this;
   }

   YAHOO.extend(Alfresco.dashlet.DynamicWelcome, Alfresco.component.Base,
   {
      site: "",
      dashboardType: "",      
      dashboardUrl: "",
      closeDialog: null,

      /**
       * CreateSite module instance.
       *
       * @property createSite
       * @type Alfresco.module.CreateSite
       */
      createSite: null,

      /**
       * Fired by YUI when parent element is available for scripting.
       * Initialises components, including YUI widgets.
       *
       * @method onReady
       */
      onReady: function DynamicWelcome_onReady()
      {
         // Listen on clicks for the create site link
         Event.addListener(this.id + "-close-button", "click", this.onCloseClick, this, true);
         Event.addListener(this.id + "-createSite-button", "click", this.onCreateSiteLinkClick, this, true);
         Event.addListener(this.id + "-requestJoin-button", "click", this.onRequestJoinLinkClick, this, true);
      },

      /**
       * Fired by YUI Link when the "Create site" label is clicked
       * @method onCreateSiteLinkClick
       * @param p_event {domEvent} DOM event
       */
      onCreateSiteLinkClick: function DynamicWelcome_onCreateSiteLinkClick(p_event)
      {
         // Create the CreateSite module if it doesn't exist
         if (this.createSite === null)
         {
            this.createSite = Alfresco.module.getCreateSiteInstance();
         }
         // and show it
         this.createSite.show();
         Event.stopEvent(p_event);
      },

      /**
       * Fired by YUI Link when the "Request join" label is clicked
       * @method onRequestJoinLinkClick
       * @param p_event {domEvent} DOM event
       */
      onRequestJoinLinkClick: function DynamicWelcome_onRequestJoinLinkClick(p_event)
      {
         // Find the CollaborationTitle instance and get it to process the request
         var collabTitle = Alfresco.util.ComponentManager.findFirst("Alfresco.CollaborationTitle");
         if (collabTitle)
         {
            collabTitle.requestJoinSite();
         }
         Event.stopEvent(p_event);
      },

      /**
       * Fired by YUI Link when the "Close" label is clicked
       * @method onCloseLinkClick
       * @param event {domEvent} DOM event
       */
      onCloseConfirm: function DynamicWelcome_onCloseConfirm(event)
      {
         // Depending upon the dashboard type we need to handle the close request differently...
         // Each user has their own unique configuration for a dashboard so when a close request
         // is received we can simply update the configuration. However, there is only one configuration
         // per site so we cannot use this approach. Instead we'll set a user preference for the
         // current site that indicates that the user no longer wishes to see the welcome dashlet...
         if (this.dashboardType == "user")
         {
            // Do the request and send the user to the dashboard after wards
            Alfresco.util.Ajax.jsonPost(
            {
               url: Alfresco.constants.URL_SERVICECONTEXT + "/components/dashlets/dynamic-welcome",
               dataObj:
               {
                  dashboardUrl: this.dashboardUrl
               },
               successCallback:
               {
                  fn: function()
                  {
                     // Send the user to the newly configured dashboard
                     document.location.href = Alfresco.constants.URL_PAGECONTEXT + "" + this.dashboardUrl;
                  },
                  scope: this
               },
               failureMessage: this.msg("message.saveFailure"),
               failureCallback:
               {
                  fn: function()
                  {
                     // Hide spinner
                     this.widgets.feedbackMessage.destroy();
                  },
                  scope: this
               }
            });
         }
         else
         {
            // Use the preferences services to update the users preferences for this site...
            this.services.preferences.set("org.alfresco.share.siteWelcome." + this.site, false,
            {
               successCallback:
               {
                  fn: function DynamicWelcome_onCloseConfirm_successCallback()
                  {
                     document.location.reload(true);
                  }
               }
            });
         }
      },

      /**
       * Close welcome dashlet click event handler
       *
       * @method onCloseClick
       * @param e {object} DomEvent
       * @param args {array} Event parameters (depends on event type)
       */
      onCloseClick: function DynamicWelcome_onCloseClick(e, args)
      {
         var _this = this;
         Alfresco.util.PopupManager.displayPrompt(
         {
            title: this.msg("panel.delete.header"),
            text: this.msg("panel.delete.msg"),
            buttons: [
            {
               text: this.msg("button.yes"),
               handler: function()
               {
                  this.destroy();
                  _this.onCloseConfirm();
               }
            },
            {
               text: this.msg("button.no"),
               handler: function()
               {
                  this.destroy();
               },
               isDefault: true
            }]
         });

         Event.stopEvent(e);
      }
   });
})();