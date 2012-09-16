/*!
 * jQuery Listable Plugin
 * Author: @lejeunerenard
 * Licensed under the LGPL license
 */


;(function ( $, window, document, undefined ) {
			
	var update = false; // Whether the current form is an update or not
	var place = 0;
	var tooltip_enabled = false; // Whether the tooltips are turned on or not
	var no_focus = true;

	$.widget( "ui.listable", $.ui.mouse, {
		// Options to be used as defaults
		options: {
			'edit'			: true,
			'delete'		: true,
			'add'			: true,
			'keyboard_shortcuts'	: false,
			'add_image'		: '/images/add_field.png',
			'edit_image'		: '/images/edit_button.png',
			'delete_image'		: '/images/delete_field.png',
			'field_dividers_enabled': true,
			'add_after'		: true,
			'after_save'		: null,
			'before_delete'		: null,
			'after_delete'		: null,
			'image_dragging'	: false,
			'types'			: []
		},

		_create: function() {
			if ($.fn.listable.counter === undefined) {
				$.fn.listable.counter = 0;
			}
			$.fn.listable.counter += $('li.form_field').length + 1;

			var settings = this.options;

			// Set variable vault
			if ( !settings.variable_vault ) {
				settings.variable_vault = this.element.parent('form');
			}

			if ( settings.image_dragging ) {
				this.element.find('img').live('dragstart', function(event) { event.preventDefault(); });
			}

			if (settings.keyboard_shortcuts) {	// If the setting for keyboard_shortcuts is true then add the event listners for keyboard shortcuts. These event listeners are not full abstracted and the default for keyboard_shortcuts should be false.
				$(window).keypress(function(event){
				if (event.which == 106 && no_focus) { // j is pressed
				 if (this.current_divider && this.current_divider.parent().length) {
				    previous_divider = this.current_divider;
				    if (this.current_divider.next().next('.field_divider').length) {
				       this.current_divider = this.current_divider.next().next('.field_divider');
				       this.current_divider.attr('hil','highlighted');
				       previous_divider.attr('hil','');
				    }
				 } else {
				    $('.field_divider:first').attr('hil','highlighted');
				    this.current_divider = $('.field_divider:first');
				 }
				} else if (event.which == 107 && no_focus) { // k is pressed
				 if (this.current_divider && this.current_divider.parent().length) {
				    previous_divider = this.current_divider;
				    if (this.current_divider.prev().prev('.field_divider').length) {
				       this.current_divider = this.current_divider.prev().prev('.field_divider');
				       this.current_divider.attr('hil','highlighted');
				       previous_divider.attr('hil','');
				    }
				 } else {
				    $('.field_divider:last').attr('hil','highlighted');
				    this.current_divider = $('.field_divider:last');
				 }
				} else if (event.which == 97 && no_focus) { // a is pressed
				 if (this.current_divider && this.current_divider.parent().length) {
				    $('#fancy_inline form').hide();
				    $('#textfield_form').show();
				    $.fancybox({
				       'href' : '#fancy_inline',
				       'onComplete'   :  function(){
					  document.getElementById('tx_label_name').focus();
				       },
				       'onClosed': function(){
						update = false;
					}
				    });
				 } 
				} else if (event.which == 115 && no_focus) { // s is pressed
				 if (this.current_divider && this.current_divider.parent().length) {
				    $('#fancy_inline form').hide();
				    $('#textarea_form').show();
				    $.fancybox({
				      'href' : '#fancy_inline',
				      'onComplete'	:  function(){
					 document.getElementById('ta_label_name').focus();
				      },
				       'onClosed': function(){
						update = false;
					}
				    });
				 } 
				} else if (event.which == 100 && no_focus) { // d is pressed
				 if (this.current_divider && this.current_divider.parent().length) {
				    $('#fancy_inline form').hide();
				    $('#checkbox_form').show();
				    $.fancybox({
				      'href' : '#fancy_inline',
				      'onComplete'	:  function(){
					 document.getElementById('cb_label_name').focus();
				      },
				       'onClosed': function(){
						update = false;
					}

				    });
				 } 
				} else if (event.which == 102 && no_focus) { // f is pressed
				 if (this.current_divider && this.current_divider.parent().length) {
				    $('#fancy_inline form').hide();
				    $('#radio_form').show();
				    $.fancybox({
				      'href' : '#fancy_inline',
				      'onComplete'	:  function(){
					 document.getElementById('ra_label_name').focus();
				      },
				       'onClosed': function(){
						update = false;
					}

				    });
				 } 
				} else if (event.which == 103 && no_focus) { // g is pressed
				 if (this.current_divider && this.current_divider.parent().length) {
				    $('#fancy_inline form').hide();
				    $('#select_form').show();
				    $.fancybox({
				      'href' : '#fancy_inline',
				      'onComplete'	:  function(){
					 document.getElementById('sl_label_name').focus();
				      },
				       'onClosed': function(){
						update = false;
					}

				    });
				 } 
				} else if (event.which == 122 && no_focus) { // g is pressed
				 if (this.current_divider && this.current_divider.parent().length) {
				    $('#fancy_inline form').hide();
				    $('#email_form').show();
				    $.fancybox({
				      'href' : '#fancy_inline',
				      'onComplete'	:  function(){
					 document.getElementById('em_label_name').focus();
				      },
				       'onClosed': function(){
						update = false;
					}

				    });
				 } 
				} else if (event.which == 101 && no_focus && settings.delete) { // e is pressed
				 if (this.current_divider && this.current_divider.prev().prev('.field_divider').length) {
				    new_divider = this.current_divider.prev().prev('.field_divider');
				    $('.field_'+this.current_divider.prev().children('.delete_field').attr('class').replace(/delete_field field_/,'')).remove();
				    this.current_divider.prev().remove();
				    this.current_divider.remove();
				    this.current_divider = new_divider;
				    this.current_divider.attr('hil','highlighted');
				 } 
				} else if (event.which == 120 && no_focus) { // x is pressed
				 if (this.current_divider && this.current_divider.parent().length) {
				    $('#fancy_inline form').hide();
				    $('#tinymce_form').show();
				    $.fancybox({
				      'href' : '#fancy_inline',
				      'onComplete'	:  function(){
					 document.getElementById('tm_label_name').focus();
				      },
				       'onClosed': function(){
						update = false;
					}

				    });
				 } 
				} else if (event.which == 99 && no_focus) { // x is pressed
				 if (this.current_divider && this.current_divider.parent().length) {
				var checked = 1;
				this.current_divider.after('\
				<li class="form_field field_'+$.fn.listable.counter+'">\
				<label class="field_'+$.fn.listable.counter+'">Opinion (Captcha)</label>\
				<a class="delete_field field_'+$.fn.listable.counter+'" href="#"><img src="'+settings.delete_image+'" alt="delete field" /></a>\
				</li>\
				<li class="field_divider field_'+$.fn.listable.counter+'">\
				  <img src="'+settings.add_image+'" alt="add field" />\
				</li>');
				$(settings.variable_vault).append('<input type="hidden" name="field_label[]" value="opinion" class="field_'+$.fn.listable.counter+'" >\
				<input type="hidden" name="field_type[]" value="captcha" class="field_'+$.fn.listable.counter+'" >\
				<input type="hidden" name="field_order[]" value="0" class="field_'+$.fn.listable.counter+'" >\
				<input type="hidden" name="field_length[]" value="16" class="field_'+$.fn.listable.counter+'" >\
				<input type="hidden" name="field_mandatory[]" value="0" class="field_'+$.fn.listable.counter+'" >\
				<input type="hidden" name="field_static_label[]" value="" class="field_'+$.fn.listable.counter+'" >\
				<input type="hidden" name="field_inline[]" value="" class="field_'+$.fn.listable.counter+'" >\
				<input type="hidden" name="field_validation[]" value="captcha" class="field_'+$.fn.listable.counter+'" >\
				<input type="hidden" name="field_options[]" value="" class="field_'+$.fn.listable.counter+'" >\
				');
				$.fn.listable.counter++;
				$('.controls').hide('fast');
				no_focus = true;
				 } 
				} else if (event.which == 118 && no_focus) { // x is pressed
				 if (this.current_divider && this.current_divider.parent().length) {
				    $('#fancy_inline form').hide();
				    $('#file_form').show();
				    $.fancybox({
				      'href' : '#fancy_inline',
				      'onComplete'	:  function(){
					 document.getElementById('fl_label_name').focus();
				      },
				       'onClosed': function(){
						update = false;
					}

				    });
				 } 
				} else if (event.which == 98 && no_focus) { // b is pressed
				 if (this.current_divider && this.current_divider.parent().length) {
				    $('#fancy_inline form').hide();
				    $('#datepicker_form').show();
				    $.fancybox({
				      'href' : '#fancy_inline',
				      'onComplete'	:  function(){
					 document.getElementById('dp_label_name').focus();
				      },
				       'onClosed': function(){
						update = false;
					}

				    });
				 } 
				} else if (event.which == 119 && no_focus) { // w is pressed
				 if (this.current_divider && this.current_divider.parent().length) {
				    $('#fancy_inline form').hide();
				    $('#session_variable_form').show();
				    $.fancybox({
				      'href' : '#fancy_inline',
				      'onComplete'	:  function(){
					 document.getElementById('sv_label_name').focus();
				      },
				       'onClosed': function(){
						update = false;
					}

				    });
				 } 
				}

				});
			}
			// The following couple lines deal with a variable that mitigates whether keyboard shortcuts work or not
			$(window).focus(function(){
			no_focus = true;
			});
			$('input, select').focus(function(){
				no_focus = false;
			});
			$('input, select').blur(function(){
				no_focus = true;
			});
			$('#app_folder_chzn').live('focus',function(){
				no_focus = false;
			});
			$('#app_folder_chzn').live('blur',function(){
				no_focus = true;
			});
			if (settings.field_dividers_enabled) {
				$('.field_divider').live('mouseover mouseout', function(event) {	// Fade effect for hovering over current divider
					if (event.type == 'mouseover') {
						this.element.stop();
						this.element.fadeTo('slow', 0.5);
					} else {
						this.element.stop();
						this.element.fadeTo('slow', 1);
					}
				});

				// Click event for all field dividers
				$('.field_divider').live('click', function(){
					$('.controls').show('fast');
					$('.controls').css('left',$(this).offset().left+parseInt($(this).css('width'))+25);
					$('.controls').css('top',$(this).offset().top+parseInt($(this).css('height'))/2-25);
					if (this.current_divider) {
					 this.current_divider.attr('hil','');
					}
					this.current_divider = $(this);
					this.current_divider.attr('hil','highlighted');
				});
			}
			$('#controls_close').click(function(event){
				event.preventDefault();
				$('.controls').hide('fast');
			});
			if (settings.delete) {	// If the delete setting is set to true then enable the delete button
				this.element.find('.delete_field').live('click', function(event){
					if (typeof settings.before_delete == 'function') {
						settings.before_delete(this);
					}
					$('.field_'+$(this).attr('class').replace(/delete_field field_/,'')).remove();
					$(this).parent().next().remove();
					$(this).parent().remove();
					event.preventDefault();
					if (typeof settings.after_delete == 'function') {
						settings.after_delete(this);
					}
				});
			}
			if (settings.edit) {	// If the edit setting is set to true then enable the edit button

				this.element.find('.edit_field').live('click', function(event){
					edit_link = $(this);
					update = $(this).attr('class').replace(/edit_field /,'');

				      $('#fancy_inline form').hide();
					var itemType = {};
					$.each(settings.types, function(index, value) {	// Iterate through the types and find the type of the item who's edit button was clicked
						if (value.type == $('input.'+edit_link.attr('class').replace(/edit_field /,'')+'[name="type\[\]"]').val()) {
							itemType = value;
							return false;
						}
					});
					var vars = {};
					$.each(itemType.variables, function(index, value) {	// Iterate through the variables of itemType updating the form
						if ($('#'+itemType.prefix+'_'+value).attr('type') == 'checkbox') {
							if ($('input.'+update+'[name="'+value+'\[\]"]').val() == '1') {
								$('#'+itemType.prefix+'_'+value).attr('checked','checked');
							} else {
								$('#'+itemType.prefix+'_'+value).attr('checked','');
							}

						} else {
							$('#'+itemType.prefix+'_'+value).val($('input.'+update+'[name="'+value+'\[\]"]').val());
						}
					});
				      $('#'+itemType.formid).show();
				      $.fancybox({
					 'href' : '#fancy_inline',
					 'onComplete'   :  function(){
						document.getElementById(itemType.prefix+'_'+itemType.variables[0]).focus();
					 },
					       'onClosed': function(){
							$('#'+itemType.formid).resetForm();	// Clear the form when it is closed so data from editing doesnt show when adding a new field
							update = false;
						}

				      });
					event.preventDefault();
				});
			}
			this.element.sortable({	// Enable the items to be sortable
				items: '.form_field',
				cancel: '.field_divider',
				placeholder: 'place_holder',
				delay: '200',
				cursor: 'crosshair',
				change: function(event, ui) {	// This reorientates the field dividers so there are one on either side of the field divider
					if (settings.field_dividers_enabled) {
						$('.field_divider').remove();
						$('.form_field, .place_holder').not('.ui-sortable-helper').before('<li class="field_divider">\
										<img src="'+settings.add_image+'" alt="add field"/>\
									</li>');
						$('#fancy_inline').before('<li class="field_divider">\
										<img src="'+settings.add_image+'" alt="add field"/>\
									</li>');
					}
				}
			});
			
			
			return this;
		},

		destroy: function() {
			$.Widget.prototype.destroy.call(this);
		},

		_setOption: function( key, value ) {
			switch( key ) {
				default:
					this.options[ key ] = value;
					break;
			}

			$.Widget.prototype._setOption.apply( this, arguments );
		},


		save: function( itemType ) {
			var settings = this.options;
			if (update) { // Check to see if the user is updating an item or creating a new one
				var vars = {};
				$.each(itemType.variables, function(index, value) {	// Iterate through field variables and colect values. These values are stored in vars under the name of the variable
					if ($('#'+itemType.prefix+'_'+value).attr('type') == 'checkbox') {
						if ($('#'+itemType.prefix+'_'+value).attr('checked')) {
							vars[value] = 1;
						} else {
							vars[value] = 0;
						}

					} else {
						vars[value] = $('#'+itemType.prefix+'_'+value).val();
					}
					$('input.'+update+'[name="'+value+'\[\]"]').val(vars[value]);	// Update all the hidden input fields with values collected
				});
				$('li.form_field.'+update).empty();	// Clear out items internal html and insert new html in the next line
				var html_text = '\
				'+itemType.display(vars);
				if (settings.edit) {
					html_text += '\
			       <a class="edit_field '+update+'" href="#"><img src="'+settings.edit_image+'" alt="edit field" /></a>';
				}
				if (settings.delete) {
					html_text += '\
			       <a class="delete_field '+update+'" href="#"><img src="'+settings.delete_image+'" alt="delete field" /></a>';
				}
				$('li.form_field.'+update).html(html_text);
			} else {
				var vars = {};
				var tmp_counter = $.fn.listable.counter;
				$.each(itemType.variables, function(index, value) {	// Iterate through field variables and colect values. These values are stored in vars under the name of the variable

					if ($('#'+itemType.prefix+'_'+value).attr('type') == 'checkbox') {	// Check to see if its a checkbox type input since checkboxes need to be checked differently than normal inputs
						if ($('#'+itemType.prefix+'_'+value).attr('checked')) {
							vars[value] = 1;
						} else {
							vars[value] = 0;
						}

					} else {
						vars[value] = $('#'+itemType.prefix+'_'+value).val();
					}
		       			$(settings.variable_vault).append('<input type="hidden" name="'+value+'[]" value="'+vars[value]+'" class="field_'+tmp_counter+'" >');	// Add the hidden input element to the variable vault
				});
					//	Now add standard variables like order and type
		       			$(settings.variable_vault).append('<input type="hidden" name="order[]" value="0" class="field_'+$.fn.listable.counter+'" >\
					<input type="hidden" name="type[]" value="'+itemType.type+'" class="field_'+$.fn.listable.counter+'" >');
				// Calculate then add appropriate html for the new item
				var append_text = '\
		       <li class="form_field field_'+$.fn.listable.counter+'">\
				'+itemType.display(vars);
				if (settings.edit) {
					append_text += '\
			       <a class="edit_field field_'+$.fn.listable.counter+'" href="#"><img src="'+settings.edit_image+'" alt="edit field" /></a>';
				}
				if (settings.delete) {
					append_text += '\
			       <a class="delete_field field_'+$.fn.listable.counter+'" href="#"><img src="'+settings.delete_image+'" alt="delete field" /></a>';
				}
				append_text += '\
		       </li>';
				if (settings.field_dividers_enabled) {
					append_text += '\
		       <li class="field_divider field_'+$.fn.listable.counter+'">\
			  <img src="'+settings.add_image+'" alt="add field" />\
		       </li>';
				}
				if (settings.add_after) {
					this.current_divider.after(append_text);
				} else {
					this.current_divider.before(append_text);
				}
		       $.fn.listable.counter++;
			}
			if (typeof settings.after_save == 'function') {
				settings.after_save(itemType);
			}
			
			return this;
		}
	});


})( jQuery, window, document );	// End of encapsulation
