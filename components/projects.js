// Globals
var Projects = {};

/**
 * Fills the DOM with projects.xml
 * @param {Function} extraCallback Function called after the DOM is filled
 */
Projects.loadProjects = function(extraCallback) {
	jQuery
	.get("data/projects.xml", {})
	.done(function(data) {
	
		var jProjects = jQuery(data).find('projects');
		
		jProjects.find('project').each(function(index) {
			
			// Get XML content
			var projectHTML = "";
			var title = jQuery(this).find('title').text();
			var description = jQuery(this).find('description').text();
			var src = jQuery(this).find('image').text();
			var link = jQuery(this).find('link').text();
			
			// Create HTML
			projectHTML += "<div class='project" + (!!link ? "" : " no-link") + "'>";
			projectHTML +=   "<div class='left-side'>";
			projectHTML +=     "<img src='" + src + "' title='" + title + "' alt='" + title + "' />";
			projectHTML +=   "</div>";
			projectHTML +=   "<div class='right-side'>";
			projectHTML +=     "<h4>" + title + "</h4>";
			projectHTML +=     "<p>" + description + "</p>";
			projectHTML +=     "<a href='" + link + "' target='_blank' alt ='" + title + "' />";
			projectHTML +=   "</div>";
			projectHTML += "</div>";
			
			// Spread in the DOM
			jQuery('#projects .page-content .all-projects').append(projectHTML);
			
		});
		
		extraCallback();
	});
};

/**
 * Listeners on each project
 */
Projects.DOMlisteners = function() {

	// Project links
	jQuery('.project').on({
		mouseenter: function() {
			
		}, mouseleave: function() {
			
		}, mouseup: function() {
			var goToLink = jQuery(this).find('a').attr('href');
			if (!!goToLink) window.open(goToLink, '_blank');
		}
	});
			
	// Header radios
	jQuery('.radio').on('click', function() {
		var $me = jQuery(this);
		// Don't do a thing if I'm already selected
		if ($me.hasClass('active')) return false;
		// Otherwise remove class in all neighbours and activate me
		$me.siblings().removeClass('active');
        $me.addClass('active');

	});
};


/**
 * Initializer
 */
Projects.go = function() {
    Projects.loadProjects(function() {
        Projects.DOMlisteners();
	});
};
