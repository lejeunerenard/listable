jquery.listable.js
==================

An extension of jQuery UI's sortables to provide a highly customizable list of objects.

License: [GNU GPL v2.0](http://www.gnu.org/licenses/gpl-2.0.html)

[![Listable](http://listable.highgatecross.com/xm_client/images/Listable-Logo.png "Listable")](http://listable.highgatecross.com)

## Basic Usage
First you have to define what types of elements listable can use. You can do this by giving listable an array of objects when you instantiate it. Each object must include:

- `type` – the name of the element
- `formid` – the id for the form used to populate the element
- `variables` – an array of the name attributes of the form elements which listable should track
- `display` – a function for generating the element's markup

For example: take this `todo` listable element:

```javascript

var todo = {
    type: 'todo',
    formid: 'todo_item',
    variables: ['id','item'],
    display: function(vars) {
        return '<p>'+vars.item+'</p>';
    }
};
```

Next you add the markup where your listable will reside:

```html
<ul class="todo">
</ul>
<div class="mask"><!-- This '.mask' div should be set to 'display: none' to hide the forms until they are needed.-->
   <div id="listable-form-vault">
   </div>
</div>
```
Listables are usually placed in `<form>`s since they store their values using hidden `<input>`s in the parent `<form>`.

After the element object has been declared and you've added your markup, you can instantiate listable with your element:

```javascript
$(function(){
    $('.todo').listable({
        add_image: '../images/add.png',
        edit_image: '../images/edit.png',
        delete_image: '../images/delete.png',
        types: [todo]
    });
});
```

To save let listable know when an element's form has been saved add the `.listable('save'...` to the submit callback like so:

```javascript
$('#todo_item').submit(function(event) {
    $.fn.listable.current_listable.listable('save', todo); // Saves or Updates listable todo item based on its form
    $.fancybox.close();  // To close the form overlay
});
```

For more examples, check out the [examples folder](https://github.com/lejeunerenard/listable/tree/master/examples).

## Documentation
Find more detailed documentation under the "Documentation" section at [Listable's website](http://listable.highgatecross.com).

## Contribute

```sh
npm i
grunt watch
```
