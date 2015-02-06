Kakahiaka
=========

**Nothing else but FLUX**

2013 Minori Yamashita <ympbyc@gmail.com>


Installation
------------

```sh
bower install https://github.com/ympbyc/kakahiaka.git
```

(Dependencies) Underscore, Underscore-fix

API
---

### app

Creates an instance of Kakahiaka application.

```javascript
var K = kakahiaka;

var sample_app = K.app({friends: ["Tony", "Sam"]});
//=> an app
```

If you pass two functions as second and third arguments, those functions will be used to persist and recover the state of the app.

```javascript
var sample_app = K.app({}, save_state, recover_state);

function save_state (state) {
    localstorage.setItem("sample_app_state", JSON.stringify(state));
}
function recover_state () {
    return JSON.parse(localStorage.getItem("sample_app_state") || "{}");
}
```

### deftransition

Defines a function F that receive an app and arbitrary number of arguments.
`Deftransition` takes a function G which gets invoked with current state and the argument passed to F, when the function defined by deftransition gets called. The function G must return a hashmap of changes to the state.

```javascript
/* adds a friend */
var new_friend = K.deftransition(function (state, name) {
    return { friends: _.conj(state.friends, name) };
});
//=> a function

/* removes a friend */
var bye_friend = K.deftransition(function (state, name) {
    return { friends: _.reject(state.friends, _.eq(name)) };
});
//=> a function
```

### watch_transition

Define a sideeffectful operation to happen whenever the field in the state changes,

```javascript
K.watch_transition(sample_app, "friends", function (new_state, old_state, changed_keys) {
    $(".friends").text(new_state.friends.join(","));
    $(".lost_friends").text(_.difference(old_s.friends, new_s.friends).join(","));
});
```

### deref

`K.deref(sample_app)` gets the current state of the app. Rarely used.



Typical Structure
-----------------

```javascript
var K = kakahiaka;

//========( Initialization )========//

var app = K.app({todos: [], weather: "cloudy"}, persist, recover);


//========( Definition of the app)=======//
//Similar to the Model in MVC

var add_todo = K.deftransition(function (state, title) {
    return { todos: _.conj(state.todos, { title:      title
                                        , complete_p: false
                                        , id:         uuid() }) };
});

var toggle_todo_complete_p = K.deftransition(function (state, id) {
    return { todos: update(state.todos, id_eq(id), "complete_p", _.not) };
});

var change_weather = K.deftransition(function (state, weather) {
    return { weather: weather };
});


//========( API calls )========//

function fetch_weather () {
    $.getJSON("http://example.com/api/weather/tokyo", function (doc) {
        if (successful_responce_p(doc))
            change_weather(app, change_weather(doc.data));
    });
}



//========( DOM interaction )========//

var todo_template =  '<h1 class="todo" data-id="{{id}}">{{title}}</p>';

K.watch_transition(app, "todos", function (state) {
    var todos_html = _.map( state.todos
                          , _.partial(_.simplate, todo_template));
    $("#todos").html(todos_html.join(""));
});

K.watch_transition(app, "weather", function (state) {
    $(".weather").text(state.weather);
});

$(function () {
    $("#add-todo-btn").on("click", function () {
        add_todo(app, $("#todo-title").val());
    });

    $(document).on("click", "todo", function () {
        toggle_todo_complete_p(app, $(this).data(id));
    });

    setInterval(fetch_weather, 1000 * 60 * 10); //update weather every 10 minutes
});


//========( Helpers )========//

function persist (state) {
    localStorage.setItem("airpo_state", JSON.stringify(state));
}

function recover (state) {
    return JSON.parse(localStorage.getItem("airpo_state") || "{}");
}

function update (coll, filter, prop, updater) {
    return _.map(coll, function (x) {
        return filter(x) ? _.assoc(prop, updater(x)) : x;
    });
}

function id_eq (id) {
    return function (x) { return x.id === id; };
}

///...etc
```


Loadmap
-------

+ Rewrite it to use `Object.observe` when it arrives.

Conceptually Close Projects
---------------------------

+ [Pasta](http://github.com/ympbyc/Pasta) predecessor to Kakahiaka
+ [Worlds](http://www.vpri.org/pdf/tr2011001_final_worlds.pdf) by Viewpoint Research Institute
+ [WebFUI](https://github.com/drcode/webfui)
+ [Flux](http://facebook.github.io/flux/docs/overview.html)


Misc
----

Kakahiaka is licensed under MIT licence
