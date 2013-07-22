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
		this.$el 		= $(el);
		this.$slides 	= null;

		this.defaults = {
			slideDuration: 5,
			transitionDuration: .5,
			zIndex: 2
		};

		this.firstRun 	= true;
		this.curPic 		= 0;

		var meta 		= this.$el.data(name + '-opts');
		this.opts 		= $.extend(this.defaults, opts, meta);

		this.$el.data(name, this);

		this.init();
	}

	// Init
	Pictator.prototype.init = function() {
		var self = this;

		var slidesDiv 	= $('<div class="pictator-slides" style="position:relative;"></div>');
		self.$el.append(slidesDiv);
		self.$slides 	= self.$el.find('.pictator-slides');

		self.parsePics(this, self.opts.picURLs);
	};

	// Parse pic list, assemble slideshow, insert into DOM
	Pictator.prototype.parsePics = function(self, picURLs) {
		var self = this;

		$.each(picURLs, function(index, value) {
			var z 		= (index == 0 ? self.opts.zIndex : self.opts.zIndex - 1);
			var d 		= (index < 2 ? 'block' : 'none');
			var pic 	= $('<div class="pictator-photo photo-'+ index +'"></div>')
					//.hide()
					.css({'position':'absolute', 'opacity':'1', 'z-index':z, 'display':d})
					.append('<img src="' + value + '" style="position:relative">');
			self.$slides.append(pic);
		});
		
		self.startRotator(self);
	};

	// Start rotation
	Pictator.prototype.startRotator = function(self) {
		var self = this;

		// Fade in next slide
		self.$slides.children('div').eq(self.nextPic).fadeIn();

		// Fade down current slide
		self.$slides.children('div').eq(self.curPic)
		  .css({'z-index': self.opts.zIndex})
		  .delay(self.opts.slideDuration * 1000)
		  .fadeOut(self.opts.transitionDuration * 1000, function(){_fadeComplete(self, this)});

	};

	// Fires on crossfade completion
	function _fadeComplete(self, curSlide) {
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