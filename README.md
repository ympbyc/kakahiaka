Kakahiaka
=========

**Functional Approach to MVC**

2013 Minori Yamashita <ympbyc@gmail.com>

Dependencies
------------

Underscore, Underscore-fix


Usage
-----

```javascript
with (kakahiaka)
(function () {
  //...
}());
```

API
---

### app

Creates an instance of Kakahiaka application.

```javascript
var sample_app = app({friends: ["Tony", "Sam"]});
//=> an app
```

### deftransition

Defines a function F that receive an app and arbitrary number of arguments.
`Deftransition` takes a function G which gets invoked with current state and the argument passed to F, when the function defined by deftransition gets called. The function G must return a hashmap of changes to the state.

```javascript
/* adds a friend */
var new_friend = deftransition(function (state, name) {
    return { friends: _.conj(state.friends, name) };
});
//=> a function

/* removes a friend */
var bye_friend = deftransition(function (state, name) {
    return { friends: _.reject(state.friends, _.eq(name)) };
});
//=> a function
```

### watch_transition

Define a sideeffectful operation to happen whenever the field in the state changes,

```javascript
watch_transition(sample_app, function (new_state, old_state) {
    $(".friends").text(new_state.friends.join(","));
    $(".lost_friends").text(_.difference(old_s.friends, new_s.friends).join(","));
});
```



Conceptually Close Projects
---------------------------

+ [Pasta](http://github.com/ympbyc/Pasta) predecessor to Kakahiaka
+ [Worlds](http://www.vpri.org/pdf/tr2011001_final_worlds.pdf) by Viewpoint Research Institute
+ [WebFUI](https://github.com/drcode/webfui)


Misc
----

Kakahiaka is licensed under MIT licence
