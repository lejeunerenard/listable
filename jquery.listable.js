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
			'add'                      : true,
			'add_after'                : true,
			'add_image'                : '/images/add_field.png',
         'auto_build'               : true,
         'controls'                 : true,
			'delete'                   : true,
			'delete_image'             : '/images/delete_field.png',
         'depth'                    : false,
			'deeper_image'             : '/images/left_arrow.png',
			'edit'                     : true,
			'edit_image'               : '/images/edit_button.png',
			'field_dividers_enabled'   : true,
         'form_vault'               : '#listable-form-vault',
			'image_dragging'           : false,
			'keyboard_shortcuts'       : false,
         'max_depth'                : false,
			'shallower_image'          : '/images/right_arrow.png',
			'types'                    : [],
         // Callbacks
			'after_delete'             : null,
			'after_save'               : null,
			'before_delete'            : null,
			'beforeDisplay'            : null,  // beforeDisplay( itemType, vars )
			'beforeSave'               : null,  // beforeSave( itemType, vars )
         'editOnComplete'           : null,
         'field_divider_click'      : null,
			'update'                   : null
		},

		_create: function() {
			if ($.fn.listable.counter === undefined) {
				$.fn.listable.counter = 0;
			}

         // Universally used variables
			var settings = this.options;
         var that = this;

			// Set variable vault
			if ( !settings.variable_vault ) {
				settings.variable_vault = this.element.parents('form');
			}

         // ===== Lets build things =====
         
         // ----- Build listable from existing elements -----
         if (settings.auto_build) {
            this.refresh();
         } else {
			   $.fn.listable.counter += this.element.find('li.form_field').length + 1;
         }

         // Listable controls
         if ( settings.controls ) {
            var listable_controls = '<div class="listable-controls">';
            $.each(settings.types, function(index, value) {	// Iterate through the types and find the type of the item who's edit button was clicked
               listable_controls += '\
         <a class="button" href="#'+value.formid+'">Add ';
               if (value.button_name) {
                  listable_controls += value.button_name;
               } else {
                  listable_controls += value.type.charAt(0).toUpperCase() + value.type.slice(1);
               }
               listable_controls += '</a>';
            });
            listable_controls += '\
         <a class="close" href="#"></a>\
      </div>';
            $('body').append(listable_controls);


            // Listable controls click event
            $('.listable-controls .button').live('click', function(e) {
               $(settings.form_vault + ' form').hide();
               $($(this).attr('href')).show();
               $.fancybox({
                  'href' : settings.form_vault,
                  'onComplete'   :  function(){
                     $($(this).attr('href')).find('input[type!="hidden"]').eq(0).focus();
                  },
                  'onClosed'  : function() {
                     $('.chzn-container').each(function(index) {
                        $('#' + $(this).attr('id').replace(/_chzn/g,'')).trigger("liszt:updated");
                     });
                  }
               }); 
            });
         }

         // Msg Div
         if ($(settings.form_vault).find('#msg-listable').length == 0) {
            $(settings.form_vault).prepend('<div id="msg-listable"></div>');
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
            if (settings.controls) {
               $('.controls').hide('fast');
            }
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
						$(this).stop();
						$(this).fadeTo('slow', 0.5);
					} else {
						$(this).stop();
						$(this).fadeTo('slow', 1);
					}
				});

            var field_divider_click = function( event ) {
               if ( settings.controls ) {
                  $('.listable-controls').show('fast');
                  $('.listable-controls').css('left',$(this).offset().left+parseInt($(this).css('width'))+25);
                  $('.listable-controls').css('top',$(this).offset().top+parseInt($(this).css('height'))/2-25);
               }
					if (that.current_divider) {
					 that.current_divider.attr('hil','');
					}
					that.current_divider = $(this);
					that.current_divider.attr('hil','highlighted');
            };
            if ( typeof settings.field_divider_click == 'function' ) {
               field_divider_click = settings.field_divider_click;
            }
				// Click event for all field dividers
				$('.field_divider').live('click', field_divider_click);
			}
         if ( settings.controls ) {
            $('.listable-controls .close').click(function(event){
               event.preventDefault();
               $('.listable-controls').hide('fast');
            });
         }
			if (settings.depth) {	// If the delete setting is set to true then enable the delete button
				this.element.find('.field_depth').live('click', function(event){
               if ($(this).hasClass('shallower')) {
                  update_class = $(this).attr('class').replace(/field_depth shallower /,'');
                  depth = parseInt(settings.variable_vault.find('input.'+update_class+'[name="depth\[\]"]').val());
                  depth -= 1;
                  if (depth < 0) {
                     depth = 0;
                  } else {
                     that.element.find('.form_field.'+update_class).removeClass('depth_'+(depth + 1)).addClass('depth_'+depth);
                  }
                  $(settings.variable_vault).find('input.'+update_class+'[name="depth\[\]"]').val(depth)
               } else {
                  update_class = $(this).attr('class').replace(/field_depth deeper /,'');
                  depth = parseInt(settings.variable_vault.find('input.'+update_class+'[name="depth\[\]"]').val());
                  depth += 1;
                  if (settings.max_depth) {
                     if (depth > settings.max_depth) {
                        depth = settings.max_depth;
                     } else {
                        that.element.find('.form_field.'+update_class).removeClass('depth_'+(depth - 1)).addClass('depth_'+depth);
                     }
                  } else {
                     that.element.find('.form_field.'+update_class).removeClass('depth_'+(depth - 1)).addClass('depth_'+depth);
                  }
                  $(settings.variable_vault).find('input.'+update_class+'[name="depth\[\]"]').val(depth)
               }
					event.preventDefault();
				});
			}
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

				      $(settings.form_vault+' form').hide();
					var itemType = {};
					$.each(settings.types, function(index, value) {	// Iterate through the types and find the type of the item who's edit button was clicked
						if (value.type == settings.variable_vault.find('input.'+edit_link.attr('class').replace(/edit_field /,'')+'[name="type\[\]"]').val()) {
							itemType = value;
							return false;
						}
					});
					var vars = {};
					$.each(itemType.variables, function(index, value) {	// Iterate through the variables of itemType updating the form
						if ($('#'+itemType.prefix+'_'+value).attr('type') == 'checkbox') {
							if (settings.variable_vault.find('input.'+update+'[name="'+value+'\[\]"]').val() == '1') {
								$('#'+itemType.prefix+'_'+value).attr('checked','checked');
							} else {
								$('#'+itemType.prefix+'_'+value).attr('checked','');
							}

						} else if ( $('select#'+itemType.prefix+'_'+value).length > 0 ) {
                     ids = settings.variable_vault.find('input.'+update+'[name="'+value+'\[\]"]').val().split(',');
                     for ( var i = 0; i < ids.length; i ++ ) {
                        $('select#'+itemType.prefix+'_'+value).find('option[value="' + ids[i] + '"]').attr('selected','selected');
                     }
                     $('.chzn-container').each(function(index) {
                        $('#' + $(this).attr('id').replace(/_chzn/g,'')).trigger("liszt:updated");
                     });
                  } else {
							$('#'+itemType.prefix+'_'+value).val(settings.variable_vault.find('input.'+update+'[name="'+value+'\[\]"]').val());
						}
					});
				      $('#'+itemType.formid).show();
				      $.fancybox({
					 'href' : settings.form_vault,
					 'onComplete'   :  function(){
						document.getElementById(itemType.prefix+'_'+itemType.variables[0]).focus();
                  if ($.isFunction(settings.editOnComplete)) {
                     settings.editOnComplete();
                  }
					 },
					       'onClosed': function(){
							$('#'+itemType.formid).resetForm();	// Clear the form when it is closed so data from editing doesnt show when adding a new field
                     $.each(itemType.variables, function(index, value) {	// Iterate through the variables of itemType updating the form
                        if ( $('select#'+itemType.prefix+'_'+value).length > 0 ) {
                           $('select#'+itemType.prefix+'_'+value).find('option').removeAttr('selected');
                           $('.chzn-container').each(function(index) {
                              $('#' + $(this).attr('id').replace(/_chzn/g,'')).trigger("liszt:updated");
                           });
                        }
                     });
							update = false;
						}

				      });
					event.preventDefault();
				});
			}

         // Apply sortable plugin
         if (!settings.disabled) {
            this.element.sortable({	// Enable the items to be sortable
               items: '.form_field',
               cancel: '.field_divider',
               placeholder: 'place_holder',
               delay: '200',
               cursor: 'crosshair',
               change: function(event, ui) {	// This reorientates the field dividers so there are one on either side of the field divider
                  if (settings.field_dividers_enabled) {
                     that.element.find('.field_divider').remove();
                     that.element.find('.form_field, .place_holder').not('.ui-sortable-helper').before('<li class="field_divider">\
                                 <img src="'+settings.add_image+'" alt="add field"/>\
                              </li>');
                     that.element.find('.form_field, .place_holder').filter(':last').after('<li class="field_divider">\
                                 <img src="'+settings.add_image+'" alt="add field"/>\
                              </li>');
                  }
               },
               update: function( event, ui ) {
                  that.element.find('.form_field').each(function(index) {
                     $(settings.variable_vault).find('input.'+$(this).attr('class').replace(/form_field /,'').replace(/ depth_\d/, '')+'[name=order\\[\\]]').val(index);
                  });
                  if (typeof settings.update == 'function') {
                     settings.update( event, ui );
                  }
               }
            });
         }
			
			
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


		save: function( itemType, options1, options2 ) {
			var settings = this.options;
         if ( $.isFunction(options1) ) {
            settings.beforeSave = options1;
         } else if ( typeof options1 != "undefined") {
            if ( $.isFunction(options1.beforeSave) ) {
               settings.beforeSave = options1.beforeSave;
            }
            if ( $.isFunction(options1.after_save) ) {
               settings.after_save = options1.after_save;
            }
            if ( $.isFunction(options1.beforeDisplay) ) {
               settings.beforeDisplay = options1.beforeDisplay;
            }
         }
         if ( $.isFunction(options2) ) {
            settings.after_save = options2;
         }
         var that = this;
			if (update) { // Check to see if the user is updating an item or creating a new one
				var vars = {};
            if ($.isFunction(settings.beforeSave)) {
               settings.beforeSave(itemType, vars);
            }
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
					settings.variable_vault.find('input.'+update+'[name="'+value+'\[\]"]').val(vars[value]);	// Update all the hidden input fields with values collected
				});
            if ($.isFunction(settings.beforeDisplay)) {
               settings.beforeDisplay(itemType, vars);
            }
				$('li.form_field.'+update).empty();	// Clear out items internal html and insert new html in the next line
				var html_text = '\
				'+itemType.display(vars);
				if (settings.depth) {
					html_text += '\
			       <a class="field_depth shallower '+update+'" href="#"><img src="'+settings.shallower_image+'" alt="make field shallower" /></a>\
			       <a class="field_depth deeper '+update+'" href="#"><img src="'+settings.deeper_image+'" alt="make field deeper" /></a>';
				}
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
            if ($.isFunction(settings.beforeSave)) {
               settings.beforeSave(itemType, vars);
            }
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
               if (settings.depth) {
		       			$(settings.variable_vault).append('<input type="hidden" name="depth[]" value="0" class="field_'+$.fn.listable.counter+'" >');
               }
            if ($.isFunction(settings.beforeDisplay)) {
               settings.beforeDisplay(itemType, vars);
            }
				// Calculate then add appropriate html for the new item
				var append_text = '\
		       <li class="form_field field_'+$.fn.listable.counter+'">\
				'+itemType.display(vars);
				if (settings.depth) {
					append_text += '\
			       <a class="field_depth shallower field_'+$.fn.listable.counter+'" href="#"><img src="'+settings.shallower_image+'" alt="make field shallower" /></a>\
			       <a class="field_depth deeper field_'+$.fn.listable.counter+'" href="#"><img src="'+settings.deeper_image+'" alt="make field deeper" /></a>';
				}
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
         this.element.find('.form_field').each(function(index) {
            settings.variable_vault.find('input.'+$(this).attr('class').replace(/form_field /,'').replace(/ depth_\d/, '')+'[name=order\\[\\]]').val(index);   
         });
			if ($.isFunction(settings.after_save)) {
				settings.after_save(itemType);
			}
			
			return this;
		},

      refresh: function() {
			var settings = this.options;
         var that = this;

         // Load up types and their corresponding "type"
         var type_to_type = new Array();
         $.each(settings.types, function(index, value) {
            type_to_type[this.type] = this;
         });

         if ( ! ( that.current_divider && that.current_divider.length ) ) {
            that.current_divider = this.element.find('.field_divider').filter(':first');
         }

         if ( ! ( that.current_divider.length ) ) {
            that.element.empty();
         }
         
         // Find all label[] hidden inputs and then sort by order[] from high to low
         settings.variable_vault.find('input[name="label\[\]"]').sort(function(a, b) {
            return settings.variable_vault.find('input.'+$(b).attr('class')+'[name="order\[\]"]').val() - settings.variable_vault.find('input.'+$(a).attr('class')+'[name="order\[\]"]').val();
         }).each(function(index) {
            $.fn.listable.counter += 1;
            var build_item = $(this).attr('class');
            var itemType = type_to_type[settings.variable_vault.find('input.'+build_item+'[name="type\[\]"]').val()];

            // Populate all the variables
            var vars = {};
            $.each(itemType.variables, function(index, value) {	// Iterate through field variables and colect values. These values are stored in vars under the name of the variable
               vars[value] = settings.variable_vault.find('input.'+build_item+'[name="'+value+'\[\]"]').val();	// Load from the hidden input fields
            });
            if ($.isFunction(settings.beforeDisplay)) {
               settings.beforeDisplay(itemType, vars);
            }
            var depth_class = '';
            if (settings.depth) {
               depth_class = ' depth_'+settings.variable_vault.find('input.'+build_item+'[name="depth\[\]"]').val();
            }
            var html_text = '\
             <li class="form_field '+build_item+depth_class+'">\
            '+itemType.display(vars);
            if (settings.depth) {
               html_text += '\
                <a class="field_depth shallower '+build_item+'" href="#"><img src="'+settings.shallower_image+'" alt="make field shallower" /></a>\
                <a class="field_depth deeper '+build_item+'" href="#"><img src="'+settings.deeper_image+'" alt="make field deeper" /></a>';
            }
            if (settings.edit) {
               html_text += '\
                <a class="edit_field '+build_item+'" href="#"><img src="'+settings.edit_image+'" alt="edit field" /></a>';
            }
            if (settings.delete) {
               html_text += '\
                <a class="delete_field '+build_item+'" href="#"><img src="'+settings.delete_image+'" alt="delete field" /></a>';
            }
            html_text += '\
             </li>';
            if (settings.field_dividers_enabled) {
               html_text += '\
             <li class="field_divider '+build_item+'">\
           <img src="'+settings.add_image+'" alt="add field" />\
             </li>';
            }
            if (that.current_divider.length) {
               that.current_divider.after(html_text);
            } else {
               that.element.prepend(html_text);
            }
         });
      }
	});


})( jQuery, window, document );	// End of encapsulation
