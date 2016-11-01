# Agave ToGo Microsite - Compute

Agave ToGo Microsite are small, single-purpose web applications designed to service a small to medium sized group of users. Their primary goal is to provide a focused user experience around a single action or process. Whereas the Agave ToGo project provides a full-feature web interface to the Agave Platform, Agave ToGo microsites streamline the user's focus to a single, specific task. The first microsite focuses on running and managing a computational task. Additional microsites focused on data management, data collections, and task automation are currently under development.   
 
 
### Installing

The microsites use several popular website packaging and dependency management tools support better software engineering and help establish best practices for new developers.  
    
* [node](https://nodejs.org/) - Node.js® is a JavaScript runtime built on Chrome's V8 JavaScript engine.  
* [node package manager](https://www.npmjs.com/) (npm) - Installs, publishes and manages node programs.  
* [bower](https://bower.io/) - Package management for javascript.  
* [sass](http://sass-lang.com/) - Sass is the most mature, stable, and powerful professional grade CSS extension language in the world.  
* [gulp](http://gulpjs.com/) - The streaming build system.

To install all the project prerequisites, run the following:  

```
cd web  
npm install  
bower install
```  

### Building

To build the source, minify all relevant files, and prepare for release, run the following gulp command:

```
gulp sass:watch
```

If you are developing and would like the css to be rebuilt on each change, run the alternate command:

```
gulp sass:watch  
```  

### Deploying  
 
Each microsite is sufficiently self-contained that it can be deployed as a static web application which can be served from any publicly accessible web host such as a GitHub pages, Dropbox, Google Drive, or even a folder you make publicly accessible through the Agave Platform. You simply need to copy the contents of the `web` folder to your hosting location.
 
We have also bundled a web server into the gulp config, so you can bring the site up at [http://localhost:8080/app] by running the following command:  
 
```
gulp localhost

``` 

### Configuring  

The microsites were designed to provide flexible styling and customization options. You can change the look and feel of the UI by using the theme settings dialog built into the website. To customize the site behavior, you can edit the `config.js` file in the ` 
