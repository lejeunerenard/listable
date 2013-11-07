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
            'add'                      : true,  // Broken but should enable adding list items
            'add_after'                : true,  // Maybe Broken. Might need to be changed to default false and to set adding new items at the top of the list 
            'add_image'                : '/javascripts/listable/images/add.png',
            'auto_build'               : true,
            'connectWith'              : '',
            'controls'                 : true,
            'delete'                   : true,
            'delete_confirmation'      : false,
            'delete_image'             : '/javascripts/listable/images/delete.png',
            'depth'                    : false,
            'deeper_image'             : '/javascripts/listable/images/right_arrow.png',
            'edit'                     : true,
            'edit_image'               : '/javascripts/listable/images/edit.png',
            'fancybox_padding'         : null,
            'field_dividers_enabled'   : true,
            'form_vault'               : '#listable-form-vault',
            'gear_image'               : '',
            'gear_transition'          : 'fade',
            'image_dragging'           : false,
            'initial_add'              : true,
            'max_depth'                : false,
            'shallower_image'          : '/javascripts/listable/images/left_arrow.png',
            'types'                    : [],
         // Callbacks
            'after_delete'             : null,
            'after_save'               : null,
            'before_delete'            : null,
            'beforeDisplay'            : null,  // beforeDisplay( itemType, vars )
            'beforeSave'               : null,  // beforeSave( itemType, vars )
            'editOnComplete'           : null,
            'field_divider_click'      : null,
            'over'                     : null,
            'onTransfer'               : null,
            'update'                   : null
        },

        _create: function() {
            if ($.fn.listable.counter === undefined) {
                $.fn.listable.counter = 0;
            }
            if ( ! $.fn.listable.current_listable ) {
               $.fn.listable.current_listable = this.element;
            }

            // Universally used variables
            var settings = this.options;
            var that = this;

            // Add listable class to element if not already added
            if (!this.element.hasClass('listable')) { this.element.addClass('listable'); }

            // Set variable vault
            if ( !settings.variable_vault ) {
                settings.variable_vault = this.element.parents('form');
            }

            // ===== Lets build things =====
         
            // ----- Build listable from existing elements -----
            $.fn.listable.counter += settings.variable_vault.find('input[name="label\[\]"]').length + 1;
            if (settings.auto_build) {
               this.refresh();
            }

            // Listable controls
            if ( settings.controls ) {
               var listable_controls = '<div class="listable-controls">';
               $.each(settings.types, function(index, value) {    // Iterate through the types and find the type of the item who's edit button was clicked

                  var name_unreadable;
                  if (value.button_name) {
                     name_unreadable = value.button_name.toLowerCase().replace(/ /, '_');
                  } else {
                     name_unreadable = value.type.toLowerCase().replace(/ /, '_');
                  }
                  listable_controls += '\
                  <a class="button listable-el-'+name_unreadable+'" href="#'+value.formid+'">Add ';
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
                  var fancybox_options = $.extend({}, {
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
                  if (settings.fancybox_padding) {
                     fancybox_options = $.extend(fancybox_options, {
                        padding: settings.fancybox_padding
                     });
                  }
                  $.fancybox(fancybox_options); 
                  e.preventDefault();
               });
            }

         // Msg Div
         if ($(settings.form_vault).find('#msg-listable').length == 0) {
            $(settings.form_vault).prepend('<div id="msg-listable"></div>');
         }

            if ( settings.image_dragging ) {
                this.element.find('img').live('dragstart', function(event) { event.preventDefault(); });
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
                $('.field_divider').live('mouseover mouseout', function(event) {    // Fade effect for hovering over current divider
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
               $.fn.listable.current_listable = $(this).parent();
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
            if (settings.depth) {    // If the delete setting is set to true then enable the delete button
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
            if (settings.gear_image) {    // If the delete setting is set to true then enable the delete button
            this.element.find('.listable_item_buttons').hide(0);
                this.element.find('.listable_gear').live('click', function(event){
                    event.preventDefault();
               if (settings.gear_transition == 'slide') {
                  $(this).siblings('.listable_item_buttons').fadeToggle('fast');
               } else {
                  $(this).siblings('.listable_item_buttons').fadeToggle('fast');
               }
                });
            }
            if (settings.delete) {    // If the delete setting is set to true then enable the delete button
                this.element.find('.delete_field').live('click', function(event){
               if (settings.delete_confirmation && !confirm("Are you sure you want to delete this? (click 'Cancel' for 'no')") ) {
                  return false;
               }
                    if (typeof settings.before_delete == 'function') {
                        settings.before_delete(this);
                    }
                    var element_number = $(this).attr('class').replace(/delete_field field_/,'')
               // Remove li and divider
                    that.element.find('.field_'+element_number).remove();
               // Remove inputs in variable vault
                    settings.variable_vault.find('.field_'+element_number).remove();

                    event.preventDefault();

                    if (typeof settings.after_delete == 'function') {
                        settings.after_delete(this);
                    }
                });
            }
            if (settings.edit) {    // If the edit setting is set to true then enable the edit button

                this.element.find('.edit_field').live('click', function(event){
               $.fn.listable.current_listable = that.element;
                    edit_link = $(this);
                    update = $(this).attr('class').replace(/edit_field /,'');

               $(settings.form_vault+' form').hide();
                    var itemType = {};
                    $.each(settings.types, function(index, value) {    // Iterate through the types and find the type of the item who's edit button was clicked
                        if (value.type == settings.variable_vault.find('input.'+edit_link.attr('class').replace(/edit_field /,'')+'[name="type\[\]"]').val()) {
                            itemType = value;
                            return false;
                        }
                    });
                    var vars = {};
                    $.each(itemType.variables, function(index, value) {    // Iterate through the variables of itemType updating the form
                  var input_element;   // The input element for this variable
                  var prefix; // Prefixes can be used to distinguish inputs of the same "name"

                  // Determine Prefix
                  if (itemType.prefix) {
                     prefix = itemType.prefix+'_';
                  } else {
                     prefix = '';
                  }

                  // Find element
                  input_element = that._findInput({
                     formId: itemType.formid,
                     prefix: prefix,
                     value: value
                  });

                  // Set values in form
                        if (input_element.attr('type') == 'checkbox') {
                            if (settings.variable_vault.find('input.'+update+'[name="'+value+'\[\]"]').val() == '1') {
                                input_element.attr('checked','checked');
                            } else {
                                input_element.attr('checked','');
                            }

                        } else if ( input_element.is('select') ) {
                           ids = settings.variable_vault.find('input.'+update+'[name="'+value+'\[\]"]').val().split(',');
                           for ( var i = 0; i < ids.length; i ++ ) {
                              input_element.find('option[value="' + ids[i] + '"]').attr('selected','selected');
                           }
                           $('.chzn-container').each(function(index) {
                              $('#' + $(this).attr('id').replace(/_chzn/g,'')).trigger("liszt:updated");
                           });
                        } else {
                            input_element.val(settings.variable_vault.find('input.'+update+'[name="'+value+'\[\]"]').val());
                        }
                    });
                  var prefix;
                  if (itemType.prefix) {
                     prefix = itemType.prefix+'_';
                  } else {
                     prefix = '';
                  }
                  var first_input = that._findInput({
                     formId: itemType.formid,
                     prefix: prefix,
                     value: itemType.variables[0]
                  });
                      $('#'+itemType.formid).show();
                  var fancybox_options = $.extend({},{
                     'href' : settings.form_vault,
                     'onComplete'   :  function(){
                        first_input.focus();
                  if ($.isFunction(settings.editOnComplete)) {
                     settings.editOnComplete(itemType.formid);
                  }
                     },
                           'onClosed': function(){
                            $('#'+itemType.formid)[0].reset();    // Clear the form when it is closed so data from editing doesnt show when adding a new field
                     $.each(itemType.variables, function(index, value) {    // Iterate through the variables of itemType updating the form
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
                  if (settings.fancybox_padding) {
                     fancybox_options = $.extend(fancybox_options, {
                        padding: settings.fancybox_padding
                     });
                  }
                      $.fancybox(fancybox_options);
                    event.preventDefault();
                });
            }

         // Apply sortable plugin
         if (!settings.disabled) {
            this.element.sortable({    // Enable the items to be sortable
               items: '.form_field',
               cancel: '.field_divider',
               connectWith: settings.connectWith,
               placeholder: 'place_holder',
               delay: '200',
               cursor: 'crosshair',
               change: function(event, ui) {    // This reorientates the field dividers so there are one on either side of the field divider
                  if (settings.field_dividers_enabled) {
                     that.element.find('.field_divider').remove();
                     that.element.find('.form_field, .place_holder').not('.ui-sortable-helper').each(function(index) {
                        var field_class = $(this).attr('class').replace(/form_field /,'').replace(/ depth_\d/, '');
                        if ($(this).hasClass('place_holder') && that.element.find('.form_field.ui-sortable-helper').length > 0) {
                           field_class = that.element.find('.form_field.ui-sortable-helper').attr('class').replace(/form_field /,'').replace(/ depth_\d/, '').replace(/ ui-sortable-helper/, '');
                        }
                        $(this).after('<li class="field_divider '+field_class+'">\
                                 <img src="'+settings.add_image+'" alt="add field"/>\
                              </li>');
                     });
                     that.element.find('.form_field, .place_holder').first().before('<li class="field_divider field_0">\
                                 <img src="'+settings.add_image+'" alt="add field"/>\
                              </li>');
                  }
               },
               over: function( event, ui ) {
                  if (typeof settings.over == 'function') {
                     settings.over( event, ui );
                  }
               },
               update: function( event, ui ) {
                  that.update_order();
                  if (ui.sender) {
                     that.transfer(event, ui);
                     if (typeof settings.onTransfer == 'function') {
                        settings.onTransfer( event, ui );
                     }
                  }
                  if (typeof settings.update == 'function') {
                     settings.update( event, ui );
                  }
               }
            });
         }
            
            
            return this;
        },

      // Function for easy access to input. There are many cases which a user might use for an input such as identifying it by id or name.
      _findInput: function(options) {
         var formId = options.formId;
         var prefix = options.prefix;
         var value = options.value;

         // Set the form Selector if a form context is given
         var formSelector;
         if (formId) {
            formSelector = '#'+formId+' ';
         }

         if ($(formSelector+'#'+prefix+value).filter(':input').length > 0) {
            input_element = $(formSelector+'#'+prefix+value).filter(':input');
         } else {
            input_element = $(formSelector+'[name="'+prefix+value+'"]').filter(':input');
         }
         return input_element;
      },

        destroy: function() {
            $.Widget.prototype.destroy.call(this);
        },

        _setOption: function( key, value ) {
            switch( key ) {
            case 'current_divider':
               this.current_divider = value;
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
                $.each(itemType.variables, function(index, value) {    // Iterate through field variables and colect values. These values are stored in vars under the name of the variable
               var input_element;   // The input element for this variable
               var prefix; // Prefixes can be used to distinguish inputs of the same "name"

               // Determine Prefix
               if (itemType.prefix) {
                  prefix = itemType.prefix+'_';
               } else {
                  prefix = '';
               }

               // Find element
               input_element = that._findInput({
                  formId: itemType.formid,
                  prefix: prefix,
                  value: value
               });

                    if (input_element.attr('type') == 'checkbox') {
                        if (input_element.attr('checked')) {
                            vars[value] = 1;
                        } else {
                            vars[value] = 0;
                        }

                    } else {
                        vars[value] = input_element.val();
                    }
                    settings.variable_vault.find('input.'+update+'[name="'+value+'\[\]"]').val(vars[value]);    // Update all the hidden input fields with values collected
                });
            this.refresh();
            } else {
                var vars = {};
            if ($.isFunction(settings.beforeSave)) {
               settings.beforeSave(itemType, vars);
            }
                $.each(itemType.variables, function(index, value) {    // Iterate through field variables and colect values. These values are stored in vars under the name of the variable
               var input_element;   // The input element for this variable
               var prefix; // Prefixes can be used to distinguish inputs of the same "name"

               // Determine Prefix
               if (itemType.prefix) {
                  prefix = itemType.prefix+'_';
               } else {
                  prefix = '';
               }

               // Find element
               input_element = that._findInput({
                  formId: itemType.formid,
                  prefix: prefix,
                  value: value
               });

                    if (input_element.attr('type') == 'checkbox') {
                        if (input_element.attr('checked')) {
                            vars[value] = 1;
                        } else {
                            vars[value] = 0;
                        }

                    } else {
                        vars[value] = input_element.val();
                    }
               $(settings.variable_vault).append('<input type="hidden" name="'+value+'[]" value="'+vars[value]+'" class="field_'+$.fn.listable.counter+'" >');    // Add the hidden input element to the variable vault
                });
                    //    Now add standard variables like order and type
               if (settings.add_after) {
                  // Add order with 1 plus the current dividers order
                  $(settings.variable_vault).append('<input type="hidden" name="order[]" value="'+ ( parseInt( $('.' + that.current_divider.attr('class').replace(/field_divider /,'') + '[name="order\[\]"]').val() ) + 1 ) +'" class="field_'+$.fn.listable.counter+'" >\
                    <input type="hidden" name="type[]" value="'+itemType.type+'" class="field_'+$.fn.listable.counter+'" >');
               } else {
                  // Add order with the current dividers order minus 1
                  $(settings.variable_vault).append('<input type="hidden" name="order[]" value="'+ ( parseInt( $('.' + that.current_divider.attr('class').replace(/field_divider /,'') + '[name="order\[\]"]').val() ) - 1 ) +'" class="field_'+$.fn.listable.counter+'" >\
                    <input type="hidden" name="type[]" value="'+itemType.type+'" class="field_'+$.fn.listable.counter+'" >');
               }

               // Now update the rest of the order fields
               that.current_divider.nextAll('.form_field').each(function(index) {
                  $(settings.variable_vault).find('input.'+$(this).attr('class').replace(/form_field /,'').replace(/ depth_\d/, '')+'[name=order\\[\\]]').val($(settings.variable_vault).find('input.'+$(this).attr('class').replace(/form_field /,'').replace(/ depth_\d/, '')+'[name=order\\[\\]]').val() + 1);
               });

               if (settings.depth) {
                           $(settings.variable_vault).append('<input type="hidden" name="depth[]" value="0" class="field_'+$.fn.listable.counter+'" >');
               }
            $.fn.listable.counter ++;
            this.refresh();
            }
         this.element.find('.form_field').each(function(index) {
            settings.variable_vault.find('input.'+$(this).attr('class').replace(/form_field /,'').replace(/ depth_\d/, '')+'[name=order\\[\\]]').val(index);   
         });
            if ($.isFunction(settings.after_save)) {
                settings.after_save(itemType);
            }

         // Make sure all elements are in order
         this.update_order();
            
            return this;
        },

      refresh: function() {
            var settings = this.options;
         var that = this;

         // Load up types and their corresponding "type"
         var type_to_type = new Object();
         $.each(settings.types, function(index, value) {
            type_to_type[this.type] = this;
         });

         // Reset and clear applicable variables
         that.element.empty();
         var temp_current_divider;
         if (that.current_divider) {
            temp_current_divder = that.current_divider;
         }
         that.current_divider = null;

         if (settings.field_dividers_enabled) {
            that.element.append('\
          <li class="field_divider field_'+$.fn.listable.counter+'">\
        <img src="'+settings.add_image+'" alt="add field" />\
          </li>');
         }

         // If there is no current divider, then set it to be the first field_divider
         if ( ! ( that.current_divider && that.current_divider.length ) ) {
            that.current_divider = this.element.find('.field_divider').filter(':first');
         }

         // If there is still no current_divider, empty the listable elment
         if ( ! ( that.current_divider.length ) ) {
            that.element.empty();
            // If the setting to insert an initial add button is true, do so.
            if (settings.initial_add && settings.add_after) {
               that.element.append('\
             <li class="field_divider divide_0">\
              <img src="'+settings.add_image+'" alt="add field" />\
             </li>');
               that.current_divider = that.element.find('.field_divider').filter(':first');
            }
         }
         
         // Find all label[] hidden inputs and then sort by order[] from high to low
         settings.variable_vault.find('input[name="type\[\]"]').sort(function(a, b) {
            return settings.variable_vault.find('input.'+$(b).attr('class')+'[name="order\[\]"]').val() - settings.variable_vault.find('input.'+$(a).attr('class')+'[name="order\[\]"]').val();
         }).each(function(index) {
            var build_item = $(this).attr('class');
            var itemType = type_to_type[settings.variable_vault.find('input.'+build_item+'[name="type\[\]"]').val()];

            // Populate all the variables
            var vars = {};
            $.each(itemType.variables, function(index, value) {    // Iterate through field variables and colect values. These values are stored in vars under the name of the variable
               vars[value] = settings.variable_vault.find('input.'+build_item+'[name="'+value+'\[\]"]').val();    // Load from the hidden input fields
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

            if (settings.gear_image) {
               html_text += '\
               <a class="listable_gear '+build_item+'" href="#"><img src="'+settings.gear_image+'" alt="show icons" /></a>';
            }
            html_text += '\
               <ul class="listable_item_buttons">';
                if (settings.depth) {
                    html_text += '\
                  <li>\
                      <a class="field_depth shallower '+build_item+'" href="#"><img src="'+settings.shallower_image+'" alt="make field shallower" /></a>\
                  </li>\
                  <li>\
                      <a class="field_depth deeper '+build_item+'" href="#"><img src="'+settings.deeper_image+'" alt="make field deeper" /></a>\
                  </li>';
                }
                if (settings.edit) {
                    html_text += '\
                  <li>\
                   <a class="edit_field '+build_item+'" href="#"><img src="'+settings.edit_image+'" alt="edit field" /></a>\
                  </li>';
                }
                if (settings.delete) {
                    html_text += '\
                  <li>\
                      <a class="delete_field '+build_item+'" href="#"><img src="'+settings.delete_image+'" alt="delete field" /></a>\
                  </li>';
                }
            html_text += '\
               </ul>\
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
         if (settings.initial_add && !settings.add_after) {
            that.element.append('\
          <li class="field_divider divide_0">\
           <img src="'+settings.add_image+'" alt="add field" />\
          </li>');
            that.current_divider = that.element.find('.field_divider').filter(':first');
         }
         if (temp_current_divider) {
            that.current_divider = temp_current_divder
         }
         $.fn.listable.counter ++;  // So that the counter is one more than the total number of elements
      },
      transfer: function(event, ui) {
         var settings = this.options;
         var that = this;

         field_class = ui.item.attr('class').replace(/form_field /,'').replace(/ depth_\d/, '').replace(/ ui-sortable-helper/, '');
         $('.field_divider.place_holder').removeClass('place_holder').addClass(field_class);
         $(ui.sender).listable('option','variable_vault').find('input[type="hidden"].'+field_class).appendTo(settings.variable_vault);

         return this;
      },
      update_order: function() {
         var settings = this.options;
         var that = this;

         that.element.find('.form_field').each(function(index) {
            $(settings.variable_vault).find('input.'+$(this).attr('class').replace(/form_field /,'').replace(/ depth_\d/, '')+'[name="order\[\]"]').val(index);
         });
         return this;
      }
    });


})( jQuery, window, document );    // End of encapsulation
