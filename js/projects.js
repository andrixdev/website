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
	
		let jProjects = jQuery(data).find('projects');
		
		jProjects.find('project').each(function(index) {
			
			// Get XML content
			let projectHTML = "";
			let title = jQuery(this).find('title').text();
			let description = jQuery(this).find('description').text();
			let src = jQuery(this).find('image').text();
			let link = jQuery(this).find('link').text();
			
			// Create HTML
			projectHTML += "<div class='project'>";
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
			jQuery('#projects .page-content').append(projectHTML);
			
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
			let goToLink = jQuery(this).find('a').attr('href');
			window.open(goToLink, '_blank');
		}
	});
			
	// Projects show more button
	jQuery('#projects .show').on({
		mouseup: function() {
		
			let remain = jQuery('#projects .project.hidden').length;
			let unveil = 4;
			
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
	let logoMail = jQuery('#about a.mailme');
	let logoDeviant = jQuery('#about a.deviant');
	let logoGithub = jQuery('#about a.github');
	let logoCodepen = jQuery('#about a.codepen');
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
