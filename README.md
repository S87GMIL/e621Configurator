<div>
    <image src="./icons/e621Configurator.png" style="float: left; width: 64px; height: 64px">
    <h1 style="position: relative; left: 15px; top: 16px; margin-bottom: 30px">e621 Configurator</h1>
</div>

# Installation

## Userscript
To install the script, you will need a user script manager like <a href="https://www.tampermonkey.net/" target="_blank">Tanpermonkey</a>.<br>
Once installed, simply follow this [link](https://github.com/S87GMIL/e621Configurator/raw/main/e621Configurator.user.js) to install. 

## Chromium Extension
To install a chromium extension from a local file, you will first have to download and unpack the [e621Configurator-BrowserExtension.zip](https://github.com/S87GMIL/e621Configurator/blob/main/e621Configurator-BrowserExtension.zip) somewhere on your PC.<br>
After unpacking, you will have to visit the extensions page by entering "chrome://extensions/" in the search bar (Chromium browsers will redirect you to their own extensions page) and activate the "Developmer mode", this switch is usually located in the top right corner of the extension page.<br>
After enabling the developer mode, you should see a button called "Load unpacked", once pressed you can select the unpacked "e621Configurator-BrowserExtension" folder and press "select folder".<br>
This should automatically add the local extension to your browser.<br>

# Overview

This user script enables you to modify the UI of e621 to your liking, with the use of profiles and view configurations.<br>
The main configuration dialog can be accessed using the "Configure View" button on the right side of the main navigation bar.<br>
<image src="./images/configureViewButton.png" style="box-shadow: 0px 0px 10px black;"><br> 
    
# Tutorial
Visit the [Wiki](https://github.com/S87GMIL/e621Configurator/wiki) for an in depth tutorial.

# Profiles
A profile is used as a container for view configurations and a way to manage your different layouts, they can also be imported and exported in order to share them between devices.<br>
By pressing "Use", the selected profile will be loaded and set as default, so every time you open the site that profile will be loaded.<br><br>
<image src="./images/profileSelection.png" style="box-shadow: 0px 0px 10px black;">

# Set Suggestion
Since version 2 of the script, users can enable the set suggestion feature in the profile configuration dialog.<br>
<image src="./images/viewConfigurationSetSuggestion.png" style="box-shadow: 0px 0px 10px black;">

# View Configurations
The view configuration page can be accessed by pressing "Edit" on a profile, the view configuration table is located below the "Edit Profile" section.<br>
In order to create a view configuration you will first have to define a relative URL path, for which the configuration should be used. If you want to configure the current path, you can simply press "User Current Path" and then "Create".<br>
It is also possible to edit or delete view configurations on this page.<br><br> 

<image src="./images/viewConfigurationOverview.png" style="box-shadow: 0px 0px 10px black;">

## View Configuration
### Basic Settings 
<p>
After creating a view configuration or pressing "Edit" on an existing one, you will be led to the view configuration page.<br>
At the top of the page you can again define the path and an option to include all sub paths.
</p>
<p>
As an example for this option we use the following path: "/posts/1802444" 
<br>If "Include subpaths" is checked, this view configuration will be used for the path above, because only the beginning, in our case "/posts", has to match. 
<br>If the subpaths are not included, the view configuration will not be used, because the URL path has to exactly match the view configuration path.
</p>

<p>
It is also possible to define specific URL parameters, that have to be matched, in order for the view configuration to become active.
These parameters can either be entered manually, or by using the "Use Current Parameters" button.
This is useful if you are creating a view configuration for your post sets, where the parameters have to match your ID e.g "?search[creator_id]=YourID";
<br>It is also possible to use wildcards, in the form of "*", to only match certain parts of the URL parameters e.g. "*[creator_id]=YourID*"<br>
</p>

<image src="./images/viewConfigurationPage.png" style="box-shadow: 0px 0px 10px black;"><br>

### Element Modification

<p>
Below the basic settings you will find the following expandable panels, which are used to configure elements on the view.
</p>
- Hidden Elements: In here you define which elements should be hidden.<br>
- Modified Elements: Here you can select elements be their ID, XPath or class and add CSS Style parameters and classes (Examples in the S87 Tweaks Profile)<br>
- Moved Elements: In here you can move elements to another position, e.g. move the "Add To Set" button next to the favorite button (Example in the S87 Tweaks Profile)<br>
- Changed Links: This is used to change the destination of a link, e.g. change the link of the "My Sets" button, so it opens your sets sorted by name.<br>
- Created Links: As the name suggests you can create your own links and buttons in this section

### View Specific Settings
<p>
At the moment there are the following view specific settings, which are only available for certain views like "Posts" and "Post Sets":
</p>

### Post View Specific Settings
<p>
In here you can define custom groups that will be displayed in the selection dialog when pressing "Add to set". <br>
This can be especially helpful if you have a lot of sets and want to order and group them in some way, to make the dropdown more organized.<br>
Sets that should be included in a group can be defined either by using wildcards in the form of "*", or by using their display name.<br>
</p>

<image src="./images/customSetGroupTable.png" style="box-shadow: 0px 0px 10px black;">

**Final Result**

<image src="./images/addToSetSelectionGroups.png" style="box-shadow: 0px 0px 10px black;">

### Set View Specific Settings
<p>
In here you can define custom set tables, similar to the groups above, the only difference being, that they are rendered as tables in the sets view.<br>
</p>

<image src="./images/customSetTables.png" style="box-shadow: 0px 0px 10px black;"><br>
<br>

# Examples
These are just a few simple changes performed using this tool<br><br>

### Cleaner image controls with a custom add to set button
<image src="./images/customizedImageControls.png" style="box-shadow: 0px 0px 10px black;"><br> 

### Custom add to set dialog that allows the creation of new sets
<image src="./images/CustomAddToSetPopup.png" style="box-shadow: 0px 0px 10px black;"><br>

### Larger artist tag with custom margins so it's easier to press on tablets
<image src="./images/largerArtistTag.png" style="box-shadow: 0px 0px 10px black;"><br>

### Changed "Mine" link, so it opens my sets sorted by name
<image src="./images/CustomMySetsLink.png" style="box-shadow: 0px 0px 10px black;"><br>
