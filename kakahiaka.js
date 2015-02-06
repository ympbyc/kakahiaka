/*
 * kakahiaka.js
 *
 * 2013 Minori Yamashita <ympbyc@gmail.com>
 */

var kakahiaka = (function () {
    /*** private ***/

    function reset_BANG_ (app, state) {
        app._state = state;
        return app;
    }

    function get_watchers (app, key) {
        return app._watchers[key] || [];
    }

    function add_watch (app, key, f, immidiate) {
        if (_.has(app._watchers, key))
            app._watchers[key].push(f);
        else
            app._watchers[key] = [f];

        if (immidiate && _.has(app._state, key))
            setTimeout(function () { f(deref(app), {}); }, 0);

        return app;
    }


    function commit (app, diff, old_s, new_s) {
        var changed_keys = _.keys(diff);
        _.each(diff, function (__, key_changed) {
            _.each(get_watchers(app, key_changed), function (watcher) {
                setTimeout(function () {
                    watcher(new_s, old_s, changed_keys);
                }, 0);
            });
        });
    }


    /*** public ***/

    /**
     * app :: state * (state -> IO ()) * (() -> state) -> App
     */
    function app (x, persist, recover) {
        var st = recover ? _.conj(x, recover()) : x;
        var a =  { _state: st
                   , _watchers: {}
                   , _persist: persist || function (st) {} };
        setTimeout(function () {
            commit(a, st, {}, st);
        }, 0);
        return a;
    }

    function deref (app) {
        return _.clone(app._state);
    }


    /**
     * deftransition :: ({state} * ... -> {patch}) -> (App * ... -> undefined)
     */
    function deftransition (f) {
        return _.optarg(function (app, args) {
            var old_s = _.clone(deref(app));
            var diff  = _.apply(_.partial(f, old_s), args);
            if ( ! diff) return undefined;
            var new_s = _.merge(old_s, diff);
            commit(app, diff, old_s, new_s);
            app._persist(new_s);
            reset_BANG_(app, _.omit(new_s, new_s.__meta_keys || []));
            return undefined;
        });
    }


    function meta (diff, info) {
        return _.assoc(_.merge(diff, info), "__meta_keys", _.conj(_.keys(info), "__meta_keys"));
    }

    /**
     * watch_transition :: App * String * ({new state} * {old state} -> undefined) -> undefined
     */
    var watch_transition = add_watch;


    /**
     * simple_update :: App * String * Any -> undefined
     */
    var simple_update = deftransition(function (state, field, value) {
        return _.assoc({}, field, value);
    });


    return {
        app:              app,
        deref:            deref,
        deftransition:    deftransition,
        watch_transition: watch_transition,
        watch:            watch_transition,
        simple_update:    simple_update,
        meta:             meta
    };
}());
