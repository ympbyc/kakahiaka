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

    function get_watcher (app, key) {
        return app._watchers[key];
    }

    function add_watch (app, key, f) {
        app._watchers[key] = f;
        return app;
    }


    /*** public ***/

    /**
     * app :: state * (state -> IO ()) * (() -> state) -> App
     */
    function app (x, persist, recover) {
        return { _state: recover ? _.conj(x, recover()) : x
               , _watchers: {}
               , _persist: persist };
    }

    function deref (app) {
        return app._state;
    }


    /**
     * deftransition :: ({state} * ... -> {patch}) -> (App * ... -> undefined)
     */
    function deftransition (f) {
        return _.optarg(function (app, args) {
            var old_s = deref(app);
            var diff  = _.apply(_.partial(f, old_s), args);
            if ( ! diff) return undefined;
            var new_s = _.merge(old_s, diff);
            _.each(diff, function (__, key_changed) {
                var watcher = get_watcher(app, key_changed);
                if (watcher)
                    setTimeout(function () {
                        watcher(new_s, old_s);
                    }, 0);
            });
            reset_BANG_(app, new_s);
            app._persist(new_s);
            return undefined;
        });
    }


    /**
     * watch_transition :: App * String * ({new state} * {old state} -> undefined) -> undefined
     */
    var watch_transition = add_watch;


    return {
        app:              app,
        deref:            deref,
        deftransition:    deftransition,
        watch_transition: watch_transition
    };
}());
