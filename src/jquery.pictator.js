/**
	**** Options ****
	@picURLs
	@slideDuration	
	@transitionDuration
*/

;(function($, doc, win) {
	"use strict";

	var name = 'pictator';

	function Pictator(el, opts) {
		// DOM Elements
		this.$el 		= $(el);
		this.$slides 	= null;

		// Properties
		this.defaults = {
			slideDuration: 5,
			transitionDuration: .5,
			zIndex: 2
		};

		var meta 		= this.$el.data(name + '-opts');
		this.opts 		= $.extend(this.defaults, opts, meta);

		// Variables
		this.firstRun 			= true;
		this.paused 			= false;
		this.curPic 			= 0;
		this.slideDuration 		= this.opts.slideDuration * 1000;
		this.transitionDuration = this.opts.transitionDuration * 1000;
		this.slideInterval 		= null;

		this.$el.data(name, this);
		this.init();
	}

	// Init
	Pictator.prototype.init = function() {
		var self = this;

		var slidesDiv 	= $('<div class="pictator-slides" style="position:relative;"></div>');
		self.$el.append(slidesDiv);
		self.$slides 	= self.$el.find('.pictator-slides');

		// Set up mouseenter pause/play
		self.$el.hover(
			function(){
				self.paused = true;
				clearTimeout(self.slideInterval);
			},
			function(){
				self.paused = false;
				self.startRotator(self);
			}
		);

		// Start rotation
		self.parsePics(this, self.opts.picURLs);
	};

	// Parse pic list, assemble slideshow, insert into DOM
	Pictator.prototype.parsePics = function(self, picURLs) {
		var self = this;

		$.each(picURLs, function(index, value) {
			var z 		= (index == 0 ? self.opts.zIndex : self.opts.zIndex - 1);
			var d 		= (index < 2 ? 'block' : 'none');
			var pic 	= $('<div class="pictator-photo photo-'+ index +'"></div>')
					.css({'position':'absolute', 'opacity':'1', 'z-index':z, 'display':d})
					.append('<img src="' + value + '" style="position:relative">');
			self.$slides.append(pic);
		});
		
		// Check if player is paused, if not, loop
		if (!self.paused) {
			self.startRotator(self);
		}
	};

	// Start rotation
	Pictator.prototype.startRotator = function(self) {
		self.slideInterval = setTimeout(function(){_fadeStart(self);}, self.slideDuration);
	};

	function _fadeStart(self) {
		if (!self.paused) {
			// Stop timer
			clearTimeout(self.slideInterval);

			// Make next slide visible
			self.$slides.children('div').eq(self.nextPic).show();

			// Fade down current slide
			self.$slides.children('div').eq(self.curPic)
			  .css({'z-index': self.opts.zIndex})
			  //.delay(self.slideDuration)
			  .fadeOut(self.transitionDuration, function(){_fadeComplete(self, this)});
		}
	}

	// Fires on crossfade completion
	function _fadeComplete(self, curSlide) {
		if (!self.paused) {
		  	// Set z-index
			$(curSlide).css({'z-index':self.opts.zIndex - 1})

			// Update curPic and nextPic
			if (self.curPic < self.opts.picURLs.length - 1) {
				self.curPic++
				if (self.curPic == self.opts.picURLs.length - 1) {
					self.nextPic = 0;
				} else {
					self.nextPic = self.curPic + 1
				}
			} else {
				self.curPic = 0;
				self.nextPic = self.curPic + 1
			}

			// Trigger next transition
			self.startRotator(self);
		}
	}
	

	// Destroy
	Pictator.prototype.destroy = function() {
		this.$el.off('.' + name);
		this.$el.find('*').off('.' + name);

		this.$el.removeData(name);
		this.$el = null;
	};

	// Start
	$.fn.pictator = function(opts) {
		return this.each(function() {
			new Pictator(this, opts);
		});
	};

})(jQuery, document, window);