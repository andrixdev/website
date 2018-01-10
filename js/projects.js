// Globals
let Projects = {};

/**
 * Fills the DOM with projects.xml
 * @param {Function} extraCallback Function called after the DOM is filled
 */
Projects.loadProjects = (extraCallback) => {
	jQuery
	.get("projects.xml", {})
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
			projectHTML += "<div class='project'>";
			projectHTML +=   "<div class='left'>";
			projectHTML +=     "<img src='" + src + "' title='" + title + "' alt='" + title + "' />";
			projectHTML +=   "</div>";
			projectHTML +=   "<div class='right'>";
			projectHTML +=     "<h4>" + title + "</h4>";
			projectHTML +=     "<p>" + description + "</p>";
			projectHTML +=     "<a href='" + link + "' target='_blank' alt ='" + title + "' />";
			projectHTML +=   "</div>";
			projectHTML += "</div>";
			
			// Spread in the DOM
			jQuery('#projects .show').before(projectHTML);
			
		});
		
		var firstglance = 6;
		jQuery('#projects .project').each(function(index) {
			if (index >= firstglance) {
				jQuery(this).addClass('hidden');
			}
		});
		
		extraCallback();
	});
};

/**
 * Listeners on each project
 */
Projects.DOMlisteners = () => {

	// Project links
	jQuery('.project').on({
		mouseenter: function() {
			
		}, mouseleave: function() {
			
		}, mouseup: function() {
			var goToLink = jQuery(this).find('a').attr('href');
			window.open(goToLink, '_blank');
		}
	});
			
	// Projects show more button
	jQuery('#projects .show').on({
		mouseup: function() {
		
			var remain = jQuery('#projects .project.hidden').length;
			var unveil = 4;
			
			jQuery('#projects .project.hidden').each(function(index) {
				// Unveil the next projects
				if (index < unveil) {
					jQuery(this).removeClass('hidden');
				}
			});
			
			// Hide button if not necessary anymore
			if (remain <= unveil) {
				jQuery('#projects .show').css('display', 'none');
			}
		}
	});
	
	// About link hover effects
	var logoMail = jQuery('#about a.mailme');
	var logoDeviant = jQuery('#about a.deviant');
	var logoGithub = jQuery('#about a.github');
	var logoCodepen = jQuery('#about a.codepen');
	jQuery('#about span.aboutmail').on({
		mouseenter: function() {
			logoMail.css('box-shadow', 'rgba(255,255,255,0.7) 0 0 15px');
		},
		mouseleave: function() {
			logoMail.css('box-shadow', '');// Empty string --> back to static style from .css file!
		}
	});
	jQuery('#about span.aboutdeviant').on({
		mouseenter: function() {
			logoDeviant.css('box-shadow', 'rgba(255,255,255,0.7) 0 0 15px');
		},
		mouseleave: function() {
			logoDeviant.css('box-shadow', '');
		}
	});
	jQuery('#about span.aboutgithub').on({
		mouseenter: function() {
			logoGithub.css('box-shadow', 'rgba(255,255,255,0.7) 0 0 15px');
		},
		mouseleave: function() {
			logoGithub.css('box-shadow', '');
		}
	});
	jQuery('#about span.aboutcodepen').on({
		mouseenter: function() {
			logoCodepen.css('box-shadow', 'rgba(255,255,255,0.7) 0 0 15px');
		},
		mouseleave: function() {
			logoCodepen.css('box-shadow', '');
		}
	});
};


/**
 * Initializer
 */
Projects.go = () => {
    Projects.loadProjects(() => {
        Projects.DOMlisteners();
	});
};
