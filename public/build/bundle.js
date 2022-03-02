
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const bubbles = [
        {"x":5,   "y":-100, "size":2.5, "riseSpeed":55, "swaySpeed":3.6, "animationOffset":64.1},
        {"x":80,  "y":-100, "size":1.6, "riseSpeed":57, "swaySpeed":3.7, "animationOffset":46.0},
        {"x":10,  "y":-100, "size":2.4, "riseSpeed":40, "swaySpeed":3.4, "animationOffset":55.8},
        {"x":43,  "y":-100, "size":1.7, "riseSpeed":51, "swaySpeed":3.1, "animationOffset":19.1},
        {"x":17,  "y":-100, "size":2.2, "riseSpeed":41, "swaySpeed":2.6, "animationOffset":73.0},
        {"x":4,   "y":-100, "size":1.8, "riseSpeed":56, "swaySpeed":2.6, "animationOffset":29.6},
        {"x":88,  "y":-100, "size":0.8, "riseSpeed":55, "swaySpeed":2.4, "animationOffset":8.1},
        {"x":1,   "y":-100, "size":0.9, "riseSpeed":54, "swaySpeed":2.1, "animationOffset":14.3},
        {"x":100, "y":-100, "size":1.3, "riseSpeed":55, "swaySpeed":3.1, "animationOffset":5.1},
        {"x":8,   "y":-100, "size":2.6, "riseSpeed":45, "swaySpeed":3.3, "animationOffset":79.8},
        {"x":45,  "y":-100, "size":2.0, "riseSpeed":51, "swaySpeed":3.6, "animationOffset":39.2},
        {"x":71,  "y":-100, "size":0.5, "riseSpeed":48, "swaySpeed":3.2, "animationOffset":85.3},
        {"x":87,  "y":-100, "size":1.7, "riseSpeed":43, "swaySpeed":4.0, "animationOffset":50.9},
        {"x":68,  "y":-100, "size":2.5, "riseSpeed":60, "swaySpeed":2.3, "animationOffset":15.4},
        {"x":94,  "y":-100, "size":2.4, "riseSpeed":56, "swaySpeed":3.1, "animationOffset":58.0},
        {"x":39,  "y":-100, "size":2.9, "riseSpeed":57, "swaySpeed":3.8, "animationOffset":58.5},
        {"x":5,   "y":-100, "size":2.8, "riseSpeed":41, "swaySpeed":2.2, "animationOffset":54.0},
        {"x":44,  "y":-100, "size":0.8, "riseSpeed":56, "swaySpeed":2.8, "animationOffset":38.0},
        {"x":57,  "y":-100, "size":1.6, "riseSpeed":45, "swaySpeed":3.1, "animationOffset":33.6},
        {"x":60,  "y":-100, "size":1.7, "riseSpeed":55, "swaySpeed":2.4, "animationOffset":86.6},
        {"x":60,  "y":-100, "size":1.9, "riseSpeed":58, "swaySpeed":2.2, "animationOffset":23.1},
        {"x":76,  "y":-100, "size":2.9, "riseSpeed":47, "swaySpeed":2.2, "animationOffset":11.9},
        {"x":89,  "y":-100, "size":0.8, "riseSpeed":55, "swaySpeed":3.8, "animationOffset":23.9},
        {"x":84,  "y":-100, "size":2.2, "riseSpeed":41, "swaySpeed":2.9, "animationOffset":54.6},
        {"x":19,  "y":-100, "size":2.1, "riseSpeed":51, "swaySpeed":3.6, "animationOffset":43.2},
        {"x":83,  "y":-100, "size":2.1, "riseSpeed":52, "swaySpeed":3.4, "animationOffset":52.4},
        {"x":74,  "y":-100, "size":2.6, "riseSpeed":60, "swaySpeed":3.1, "animationOffset":96.6},
        {"x":94,  "y":-100, "size":1.9, "riseSpeed":41, "swaySpeed":2.9, "animationOffset":36.1},
        {"x":29,  "y":-100, "size":2.9, "riseSpeed":51, "swaySpeed":3.6, "animationOffset":72.4},
        {"x":5,   "y":-100, "size":2.8, "riseSpeed":52, "swaySpeed":2.7, "animationOffset":9.8},
        {"x":48,  "y":-100, "size":2.3, "riseSpeed":48, "swaySpeed":3.9, "animationOffset":69.6},
        {"x":56,  "y":-100, "size":1.0, "riseSpeed":44, "swaySpeed":3.6, "animationOffset":71.6},
        {"x":75,  "y":-100, "size":0.9, "riseSpeed":48, "swaySpeed":3.0, "animationOffset":38.4},
        {"x":14,  "y":-100, "size":1.7, "riseSpeed":55, "swaySpeed":2.6, "animationOffset":14.1},
        {"x":83,  "y":-100, "size":2.3, "riseSpeed":60, "swaySpeed":3.4, "animationOffset":47.1},
        {"x":46,  "y":-100, "size":1.1, "riseSpeed":41, "swaySpeed":3.9, "animationOffset":83.3},
        {"x":89,  "y":-100, "size":1.5, "riseSpeed":59, "swaySpeed":3.6, "animationOffset":6.0},
        {"x":59,  "y":-100, "size":0.8, "riseSpeed":53, "swaySpeed":2.6, "animationOffset":44.8},
        {"x":95,  "y":-100, "size":1.6, "riseSpeed":42, "swaySpeed":2.4, "animationOffset":5.0},
        {"x":81,  "y":-100, "size":1.3, "riseSpeed":60, "swaySpeed":3.6, "animationOffset":93.0},
        {"x":39,  "y":-100, "size":1.5, "riseSpeed":52, "swaySpeed":3.7, "animationOffset":64.3},
        {"x":49,  "y":-100, "size":2.8, "riseSpeed":56, "swaySpeed":2.5, "animationOffset":78.2},
        {"x":55,  "y":-100, "size":2.4, "riseSpeed":50, "swaySpeed":2.6, "animationOffset":56.8},
        {"x":70,  "y":-100, "size":1.9, "riseSpeed":52, "swaySpeed":3.5, "animationOffset":78.9},
        {"x":19,  "y":-100, "size":1.8, "riseSpeed":40, "swaySpeed":2.9, "animationOffset":34.1},
        {"x":69,  "y":-100, "size":2.9, "riseSpeed":52, "swaySpeed":3.8, "animationOffset":0.6},
        {"x":48,  "y":-100, "size":1.4, "riseSpeed":55, "swaySpeed":3.1, "animationOffset":21.8},
        {"x":92,  "y":-100, "size":2.5, "riseSpeed":51, "swaySpeed":2.0, "animationOffset":39.6},
        {"x":39,  "y":-100, "size":2.4, "riseSpeed":57, "swaySpeed":2.5, "animationOffset":40.8},
        {"x":25,  "y":-100, "size":2.8, "riseSpeed":59, "swaySpeed":2.5, "animationOffset":36.7},
        {"x":85,  "y":-100, "size":0.9, "riseSpeed":47, "swaySpeed":3.1, "animationOffset":25.1},
        {"x":96,  "y":-100, "size":1.2, "riseSpeed":49, "swaySpeed":2.9, "animationOffset":37.6},
        {"x":41,  "y":-100, "size":1.6, "riseSpeed":46, "swaySpeed":2.4, "animationOffset":10.4},
        {"x":21,  "y":-100, "size":1.0, "riseSpeed":42, "swaySpeed":3.0, "animationOffset":14.1},
        {"x":11,  "y":-100, "size":1.9, "riseSpeed":46, "swaySpeed":2.0, "animationOffset":1.9},
        {"x":92,  "y":-100, "size":0.8, "riseSpeed":42, "swaySpeed":2.9, "animationOffset":84.2},
        {"x":28,  "y":-100, "size":1.8, "riseSpeed":55, "swaySpeed":2.9, "animationOffset":39.6},
        {"x":66,  "y":-100, "size":1.9, "riseSpeed":44, "swaySpeed":2.1, "animationOffset":63.9},
        {"x":38,  "y":-100, "size":1.6, "riseSpeed":57, "swaySpeed":2.1, "animationOffset":89.8},
        {"x":3,   "y":-100, "size":2.4, "riseSpeed":40, "swaySpeed":3.3, "animationOffset":14.6},
        {"x":7,   "y":-100, "size":0.5, "riseSpeed":50, "swaySpeed":2.3, "animationOffset":27.9},
        {"x":67,  "y":-100, "size":2.0, "riseSpeed":44, "swaySpeed":3.8, "animationOffset":12.4},
        {"x":29,  "y":-100, "size":2.1, "riseSpeed":55, "swaySpeed":2.2, "animationOffset":56.6},
        {"x":14,  "y":-100, "size":1.0, "riseSpeed":54, "swaySpeed":2.0, "animationOffset":31.8},
        {"x":17,  "y":-100, "size":1.9, "riseSpeed":48, "swaySpeed":3.4, "animationOffset":4.6},
        {"x":34,  "y":-100, "size":1.4, "riseSpeed":47, "swaySpeed":2.6, "animationOffset":22.3},
        {"x":25,  "y":-100, "size":1.2, "riseSpeed":43, "swaySpeed":2.6, "animationOffset":73.8},
        {"x":85,  "y":-100, "size":2.5, "riseSpeed":53, "swaySpeed":3.0, "animationOffset":50.8},
        {"x":88,  "y":-100, "size":1.7, "riseSpeed":54, "swaySpeed":3.0, "animationOffset":62.2},
        {"x":24,  "y":-100, "size":0.9, "riseSpeed":51, "swaySpeed":3.2, "animationOffset":13.8},
        {"x":38,  "y":-100, "size":0.8, "riseSpeed":59, "swaySpeed":3.9, "animationOffset":37.8},
        {"x":31,  "y":-100, "size":1.8, "riseSpeed":49, "swaySpeed":3.5, "animationOffset":24.9},
        {"x":58,  "y":-100, "size":0.8, "riseSpeed":57, "swaySpeed":3.3, "animationOffset":41.1},
        {"x":1,   "y":-100, "size":1.7, "riseSpeed":45, "swaySpeed":2.9, "animationOffset":85.0},
        {"x":88,  "y":-100, "size":2.7, "riseSpeed":48, "swaySpeed":2.7, "animationOffset":96.2},
        {"x":51,  "y":-100, "size":2.6, "riseSpeed":58, "swaySpeed":2.8, "animationOffset":15.9},
        {"x":68,  "y":-100, "size":0.5, "riseSpeed":47, "swaySpeed":2.4, "animationOffset":35.1},
        {"x":84,  "y":-100, "size":3.0, "riseSpeed":56, "swaySpeed":3.0, "animationOffset":21.1},
        {"x":88,  "y":-100, "size":0.9, "riseSpeed":60, "swaySpeed":2.8, "animationOffset":33.3},
        {"x":75,  "y":-100, "size":0.8, "riseSpeed":52, "swaySpeed":3.7, "animationOffset":14.6},
        {"x":50,  "y":-100, "size":1.0, "riseSpeed":57, "swaySpeed":3.8, "animationOffset":0.4},
        {"x":76,  "y":-100, "size":2.4, "riseSpeed":54, "swaySpeed":4.0, "animationOffset":10.8},
        {"x":45,  "y":-100, "size":1.1, "riseSpeed":58, "swaySpeed":3.3, "animationOffset":35.1},
        {"x":64,  "y":-100, "size":2.5, "riseSpeed":40, "swaySpeed":2.1, "animationOffset":33.7},
        {"x":36,  "y":-100, "size":2.3, "riseSpeed":60, "swaySpeed":3.6, "animationOffset":51.5},
        {"x":56,  "y":-100, "size":0.8, "riseSpeed":49, "swaySpeed":3.4, "animationOffset":21.1},
        {"x":78,  "y":-100, "size":2.9, "riseSpeed":52, "swaySpeed":2.5, "animationOffset":60.6},
        {"x":77,  "y":-100, "size":2.3, "riseSpeed":57, "swaySpeed":2.2, "animationOffset":32.3},
        {"x":88,  "y":-100, "size":2.9, "riseSpeed":46, "swaySpeed":3.6, "animationOffset":0.9},
        {"x":56,  "y":-100, "size":1.2, "riseSpeed":56, "swaySpeed":3.6, "animationOffset":11.6},
        {"x":70,  "y":-100, "size":2.3, "riseSpeed":51, "swaySpeed":3.7, "animationOffset":82.4},
        {"x":84,  "y":-100, "size":0.8, "riseSpeed":41, "swaySpeed":3.0, "animationOffset":64.5},
        {"x":75,  "y":-100, "size":1.3, "riseSpeed":54, "swaySpeed":3.4, "animationOffset":33.2},
        {"x":61,  "y":-100, "size":1.8, "riseSpeed":54, "swaySpeed":2.8, "animationOffset":61.6},
        {"x":67,  "y":-100, "size":1.4, "riseSpeed":43, "swaySpeed":3.9, "animationOffset":9.2},
        {"x":15,  "y":-100, "size":0.8, "riseSpeed":52, "swaySpeed":2.5, "animationOffset":19.2},
        {"x":70,  "y":-100, "size":2.3, "riseSpeed":59, "swaySpeed":2.6, "animationOffset":42.9},
        {"x":93,  "y":-100, "size":0.8, "riseSpeed":52, "swaySpeed":3.9, "animationOffset":76.7},
        {"x":17,  "y":-100, "size":1.7, "riseSpeed":46, "swaySpeed":3.0, "animationOffset":48.2},
        {"x":32,  "y":-100, "size":1.1, "riseSpeed":58, "swaySpeed":2.2, "animationOffset":46.5}
    ];

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function tick_spring(ctx, last_value, current_value, target_value) {
        if (typeof current_value === 'number' || is_date(current_value)) {
            // @ts-ignore
            const delta = target_value - current_value;
            // @ts-ignore
            const velocity = (current_value - last_value) / (ctx.dt || 1 / 60); // guard div by 0
            const spring = ctx.opts.stiffness * delta;
            const damper = ctx.opts.damping * velocity;
            const acceleration = (spring - damper) * ctx.inv_mass;
            const d = (velocity + acceleration) * ctx.dt;
            if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
                return target_value; // settled
            }
            else {
                ctx.settled = false; // signal loop to keep ticking
                // @ts-ignore
                return is_date(current_value) ?
                    new Date(current_value.getTime() + d) : current_value + d;
            }
        }
        else if (Array.isArray(current_value)) {
            // @ts-ignore
            return current_value.map((_, i) => tick_spring(ctx, last_value[i], current_value[i], target_value[i]));
        }
        else if (typeof current_value === 'object') {
            const next_value = {};
            for (const k in current_value) {
                // @ts-ignore
                next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
            }
            // @ts-ignore
            return next_value;
        }
        else {
            throw new Error(`Cannot spring ${typeof current_value} values`);
        }
    }
    function spring(value, opts = {}) {
        const store = writable(value);
        const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
        let last_time;
        let task;
        let current_token;
        let last_value = value;
        let target_value = value;
        let inv_mass = 1;
        let inv_mass_recovery_rate = 0;
        let cancel_task = false;
        function set(new_value, opts = {}) {
            target_value = new_value;
            const token = current_token = {};
            if (value == null || opts.hard || (spring.stiffness >= 1 && spring.damping >= 1)) {
                cancel_task = true; // cancel any running animation
                last_time = now();
                last_value = new_value;
                store.set(value = target_value);
                return Promise.resolve();
            }
            else if (opts.soft) {
                const rate = opts.soft === true ? .5 : +opts.soft;
                inv_mass_recovery_rate = 1 / (rate * 60);
                inv_mass = 0; // infinite mass, unaffected by spring forces
            }
            if (!task) {
                last_time = now();
                cancel_task = false;
                task = loop(now => {
                    if (cancel_task) {
                        cancel_task = false;
                        task = null;
                        return false;
                    }
                    inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
                    const ctx = {
                        inv_mass,
                        opts: spring,
                        settled: true,
                        dt: (now - last_time) * 60 / 1000
                    };
                    const next_value = tick_spring(ctx, last_value, value, target_value);
                    last_time = now;
                    last_value = value;
                    store.set(value = next_value);
                    if (ctx.settled) {
                        task = null;
                    }
                    return !ctx.settled;
                });
            }
            return new Promise(fulfil => {
                task.promise.then(() => {
                    if (token === current_token)
                        fulfil();
                });
            });
        }
        const spring = {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe,
            stiffness,
            damping,
            precision
        };
        return spring;
    }

    // Taken from <https://svelte.dev/repl/c8651b1ef39140da85cc824cbe16c28d?version=3.9.1>
    // NOTE: These implementations would have to be polyfilled for IE support!
    function* iter_range(begin,end,step) {
    	// Normalize our inputs
    	step = step ? step : 1;
    	
    	if (typeof(end) === 'undefined') {
    		end   = begin > 0 ? begin : 0;
    		begin = begin < 0 ? begin : 0;
    	}
    	
    	if (begin == end) {
    		return;
    	}
    	
    	if (begin > end) {
    		step = step * -1;	
    	}
    	
    	for (let x = begin; x < end; x += step) {
    		yield x;
    	}
    }

    function range(begin, end, step) {
    	return Array.from(iter_range(begin,end,step));
    }

    // TODO: Refactor and add getter for alarm
    class Clock {
        constructor() {
            this._time = {
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0
            };
            this._alarm = {
                hour: null,
                minute: null,
                second: null,
                active: false,
                triggered: false,
                text: ""
            };
            let tempDate = new Date();
            this.timezone = tempDate.getTimezoneOffset() / -60;
        }

        get alarmText() {
            return this._alarm.text;
        }

        set alarmText(text) {
            this._alarm.text = text;
        }

        get timeAsString() {
            return this._time.hour.toString().padStart(2, '0') + ':' + this._time.minute.toString().padStart(2, '0') + ':' + this._time.second.toString().padStart(2, '0');
        }

        get alarmTimeAsString() {
            if (!this._alarm.hour || !this._alarm.minute) {
                return null;
            }
            return this._alarm.hour.toString().padStart(2, '0') + ':' + this._alarm.minute.toString().padStart(2, '0') + ':' + this._alarm.second.toString().padStart(2, '0');
        }

        // Takes in a string in the format '{hour}:{minute}'
        set alarmTimeAsString(string) {
            let parts = string.split(':');
            this._alarm = {
                hour: parseInt(parts[0]), // Takes the leftmost element to 
                minute: parseInt(parts[1]),
                second: parts.length > 2 ? parseInt(parts[2]) : 0,
                active: this._alarm.active,
                triggered: false,
                text: this._alarm.text
            };
        }

        get alarmIsTriggered() {
            if (!this._alarm.active)
                return false;
            
            return this._alarm.triggered;
        }

        set alarmIsTriggered(bool) {
            this._alarm.triggered = bool;
        }

        get alarmIsActive() {
            return this._alarm.active;
        }

        set alarmIsActive(bool) {
            this._alarm.triggered = false;
            this._alarm.active = bool;
        }
        
        // Getters for the time elements
        get second() { return this._time.second; }
        get minute() { return this._time.minute; }
        get hour()   { return this._time.hour;   }

        // Getter for the alarm time elements
        get alarmSecond() { return this._alarm.second; }
        get alarmMinute() { return this._alarm.minute; }
        get alarmHour()   { return this._alarm.hour;   }

        syncTime() {
            // Set time to the current local time
            var today = new Date();

            this._time.millisecond = today.getUTCMilliseconds();
            this._time.second      = today.getUTCSeconds();
            this._time.minute      = today.getUTCMinutes();
            this._time.hour        = today.getUTCHours();

            if (this.timezone != null) {
                this._time.hour   += Math.floor(this.timezone);
                this._time.minute += this.timezone % 1 * 60;
                if (this._time.minute < 0) {
                    this._time.minute += 60;
                }
            }
        }

        tick(useMilli=false) {
            // Increment second, minute and hour. Increment millisecond if option is passed
            this._time.millisecond += useMilli ? 1 : 0;
            this._time.second      += useMilli ? (this._time.millisecond >= 1000 ? 1 : 0) : 1;
            this._time.minute      += this._time.second >= 60 ? 1 : 0;
            this._time.hour        += this._time.minute >= 60 ? 1 : 0;

            // Prevent overflow of the time values
            this._time.millisecond %= 1000;
            this._time.second      %= 60;
            this._time.minute      %= 60;
            this._time.hour        %= 24;
        }

        updateAlarm() {
            // Test if alarm is triggered
            if (this._time.hour   == this._alarm.hour   &&
                this._time.minute == this._alarm.minute &&
                this._time.second == this._alarm.second) {
                
                this._alarm.triggered = true;
            }
        }

        setAlarm(hour, minute, second) {
            this._alarm = {
                hour,
                minute,
                second,
                active: true,
                triggered: false
            };
        }

        toggleAlarm() {
            if (!this._alarm.hour || !this._alarm.minute) {
                return null;
            }
            this.alarmIsActive = !this.alarmIsActive;
        }

        getDigit(index) {
            switch(index) {
                case 0:
                    return Math.floor(this.hour / 10);
                case 1:
                    return this.hour % 10;
                case 2:
                    return Math.floor(this.minute / 10);
                case 3:
                    return this.minute % 10;
                case 4:
                    return Math.floor(this.second / 10);
                case 5:
                    return this.second % 10;
            }
        }

        reset() {
            if (!this._alarm.triggered || !this._alarm.active) { return; }

            this._alarm.triggered = false;
            this._alarm.active    = true;
        }

        snooze(minutes=5) {
            if (!this._alarm.triggered || !this._alarm.active) { return; }

            this._alarm.triggered = false;
            this._alarm.active    = true;
            
            this._alarm.minute += minutes;
            this._alarm.hour   += this._alarm.minute >= 60 ? 1 : 0;

            this._alarm.minute %= 60;
            this._alarm.hour   %= 24;
        }

        stop() {
            if (!this._alarm.triggered || !this._alarm.active) { return; }

            this._alarm = {
                hour: null,
                minute: null,
                second: null,
                active: false,
                triggered: false,
                text: this._alarm.text
            };
        }
    }

    // Can't be bothered to mess with json
    var timezones = [
        {
            "label": "(GMT-12:00) International Date Line West",
            "value": -12
        },
        {
            "label": "(GMT-11:00) Midway Island, Samoa",
            "value": -11
        },
        {
            "label": "(GMT-10:00) Hawaii",
            "value": -10
        },
        {
            "label": "(GMT-09:00) Alaska",
            "value": -9
        },
        {
            "label": "(GMT-08:00) Pacific Time (US & Canada)",
            "value": -8
        },
        {
            "label": "(GMT-08:00) Tijuana, Baja California",
            "value": -8
        },
        {
            "label": "(GMT-07:00) Arizona",
            "value": -7
        },
        {
            "label": "(GMT-07:00) Chihuahua, La Paz, Mazatlan",
            "value": -7
        },
        {
            "label": "(GMT-07:00) Mountain Time (US & Canada)",
            "value": -7
        },
        {
            "label": "(GMT-06:00) Central America",
            "value": -6
        },
        {
            "label": "(GMT-06:00) Central Time (US & Canada)",
            "value": -6
        },
        {
            "label": "(GMT-05:00) Bogota, Lima, Quito, Rio Branco",
            "value": -5
        },
        {
            "label": "(GMT-05:00) Eastern Time (US & Canada)",
            "value": -5
        },
        {
            "label": "(GMT-05:00) Indiana (East)",
            "value": -5
        },
        {
            "label": "(GMT-04:00) Atlantic Time (Canada)",
            "value": -4
        },
        {
            "label": "(GMT-04:00) Caracas, La Paz",
            "value": -4
        },
        {
            "label": "(GMT-04:00) Manaus",
            "value": -4
        },
        {
            "label": "(GMT-04:00) Santiago",
            "value": -4
        },
        {
            "label": "(GMT-03:30) Newfoundland",
            "value": -3.5
        },
        {
            "label": "(GMT-03:00) Brasilia",
            "value": -3
        },
        {
            "label": "(GMT-03:00) Buenos Aires, Georgetown",
            "value": -3
        },
        {
            "label": "(GMT-03:00) Greenland",
            "value": -3
        },
        {
            "label": "(GMT-03:00) Montevideo",
            "value": -3
        },
        {
            "label": "(GMT-02:00) Mid-Atlantic",
            "value": -2
        },
        {
            "label": "(GMT-01:00) Cape Verde Is.",
            "value": -1
        },
        {
            "label": "(GMT-01:00) Azores",
            "value": -1
        },
        {
            "label": "(GMT+00:00) Casablanca, Monrovia, Reykjavik",
            "value": 0
        },
        {
            "label": "(GMT+00:00) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London",
            "value": 0
        },
        {
            "label": "(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",
            "value": 1
        },
        {
            "label": "(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague",
            "value": 1
        },
        {
            "label": "(GMT+01:00) Brussels, Copenhagen, Madrid, Paris",
            "value": 1
        },
        {
            "label": "(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb",
            "value": 1
        },
        {
            "label": "(GMT+01:00) West Central Africa",
            "value": 1
        },
        {
            "label": "(GMT+02:00) Amman",
            "value": 2
        },
        {
            "label": "(GMT+02:00) Athens, Bucharest, Istanbul",
            "value": 2
        },
        {
            "label": "(GMT+02:00) Beirut",
            "value": 2
        },
        {
            "label": "(GMT+02:00) Cairo",
            "value": 2
        },
        {
            "label": "(GMT+02:00) Harare, Pretoria",
            "value": 2
        },
        {
            "label": "(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius",
            "value": 2
        },
        {
            "label": "(GMT+02:00) Jerusalem",
            "value": 2
        },
        {
            "label": "(GMT+02:00) Minsk",
            "value": 2
        },
        {
            "label": "(GMT+02:00) Windhoek",
            "value": 2
        },
        {
            "label": "(GMT+03:00) Kuwait, Riyadh, Baghdad",
            "value": 3
        },
        {
            "label": "(GMT+03:00) Moscow, St. Petersburg, Volgograd",
            "value": 3
        },
        {
            "label": "(GMT+03:00) Nairobi",
            "value": 3
        },
        {
            "label": "(GMT+03:00) Tbilisi",
            "value": 3
        },
        {
            "label": "(GMT+03:30) Tehran",
            "value": 3.5
        },
        {
            "label": "(GMT+04:00) Abu Dhabi, Muscat",
            "value": 4
        },
        {
            "label": "(GMT+04:00) Baku",
            "value": 4
        },
        {
            "label": "(GMT+04:00) Yerevan",
            "value": 4
        },
        {
            "label": "(GMT+04:30) Kabul",
            "value": 4.5
        },
        {
            "label": "(GMT+05:00) Yekaterinburg",
            "value": 5
        },
        {
            "label": "(GMT+05:00) Islamabad, Karachi, Tashkent",
            "value": 5
        },
        {
            "label": "(GMT+05:30) Sri Jayawardenapura",
            "value": 5.5
        },
        {
            "label": "(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi",
            "value": 5.5
        },
        {
            "label": "(GMT+05:45) Kathmandu",
            "value": 5.75
        },
        {
            "label": "(GMT+06:00) Almaty, Novosibirsk",
            "value": 6
        },
        {
            "label": "(GMT+06:00) Astana, Dhaka",
            "value": 6
        },
        {
            "label": "(GMT+06:30) Yangon (Rangoon)",
            "value": 6.5
        },
        {
            "label": "(GMT+07:00) Bangkok, Hanoi, Jakarta",
            "value": 7
        },
        {
            "label": "(GMT+07:00) Krasnoyarsk",
            "value": 7
        },
        {
            "label": "(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi",
            "value": 8
        },
        {
            "label": "(GMT+08:00) Kuala Lumpur, Singapore",
            "value": 8
        },
        {
            "label": "(GMT+08:00) Irkutsk, Ulaan Bataar",
            "value": 8
        },
        {
            "label": "(GMT+08:00) Perth",
            "value": 8
        },
        {
            "label": "(GMT+08:00) Taipei",
            "value": 8
        },
        {
            "label": "(GMT+09:00) Osaka, Sapporo, Tokyo",
            "value": 9
        },
        {
            "label": "(GMT+09:00) Seoul",
            "value": 9
        },
        {
            "label": "(GMT+09:00) Yakutsk",
            "value": 9
        },
        {
            "label": "(GMT+09:30) Adelaide",
            "value": 9.5
        },
        {
            "label": "(GMT+09:30) Darwin",
            "value": 9.5
        },
        {
            "label": "(GMT+10:00) Brisbane",
            "value": 10
        },
        {
            "label": "(GMT+10:00) Canberra, Melbourne, Sydney",
            "value": 10
        },
        {
            "label": "(GMT+10:00) Hobart",
            "value": 10
        },
        {
            "label": "(GMT+10:00) Guam, Port Moresby",
            "value": 10
        },
        {
            "label": "(GMT+10:00) Vladivostok",
            "value": 10
        },
        {
            "label": "(GMT+11:00) Magadan, Solomon Is., New Caledonia",
            "value": 11
        },
        {
            "label": "(GMT+12:00) Auckland, Wellington",
            "value": 12
        },
        {
            "label": "(GMT+12:00) Fiji, Kamchatka, Marshall Is.",
            "value": 12
        },
        {
            "label": "(GMT+13:00) Nuku'alofa",
            "value": 13
        }
    ];

    /* src\App.svelte generated by Svelte v3.44.1 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[42] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[45] = list[i];
    	return child_ctx;
    }

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	child_ctx[48] = list;
    	child_ctx[49] = i;
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[50] = list[i];
    	return child_ctx;
    }

    function get_each_context_8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[55] = list[i];
    	return child_ctx;
    }

    // (103:2) {#each bubbles as bubble}
    function create_each_block_8(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "bubble");
    			set_style(span, "--x", /*bubble*/ ctx[55].x + "%");
    			set_style(span, "--y", /*bubble*/ ctx[55].y + "px");
    			set_style(span, "--size", /*bubble*/ ctx[55].size);
    			set_style(span, "--rise-speed", /*bubble*/ ctx[55].riseSpeed + "s");
    			set_style(span, "--sway-speed", /*bubble*/ ctx[55].swaySpeed + "s");
    			set_style(span, "--animation-offset", /*bubble*/ ctx[55].animationOffset + "s");
    			add_location(span, file, 103, 3, 3103);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_8.name,
    		type: "each",
    		source: "(103:2) {#each bubbles as bubble}",
    		ctx
    	});

    	return block;
    }

    // (108:1) {#if !clockConfigOverlayHidden || !alarmTriggerOverlayHidden }
    function create_if_block(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (!/*clockConfigOverlayHidden*/ ctx[3]) return create_if_block_1;
    		if (!/*alarmTriggerOverlayHidden*/ ctx[4]) return create_if_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "id", "overlay");
    			add_location(div, file, 108, 2, 3401);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(108:1) {#if !clockConfigOverlayHidden || !alarmTriggerOverlayHidden }",
    		ctx
    	});

    	return block;
    }

    // (137:40) 
    function create_if_block_2(ctx) {
    	let div;
    	let each_value_7 = range(0, 3, 1);
    	validate_each_argument(each_value_7);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		each_blocks[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", "alarm-trigger-overlay-content");
    			add_location(div, file, 137, 4, 4605);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*clocks*/ 1) {
    				each_value_7 = range(0, 3, 1);
    				validate_each_argument(each_value_7);
    				let i;

    				for (i = 0; i < each_value_7.length; i += 1) {
    					const child_ctx = get_each_context_7(ctx, each_value_7, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_7.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(137:40) ",
    		ctx
    	});

    	return block;
    }

    // (110:3) {#if !clockConfigOverlayHidden}
    function create_if_block_1(ctx) {
    	let div;
    	let button;
    	let t1;
    	let mounted;
    	let dispose;
    	let each_value_5 = range(0, 3, 1);
    	validate_each_argument(each_value_5);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Close";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(button, "id", "clock-config-overlay-close-button");
    			add_location(button, file, 111, 5, 3507);
    			attr_dev(div, "id", "clock-config-overlay-content");
    			add_location(div, file, 110, 4, 3461);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[19], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*clocks, selectedTimezone, innerWidth*/ 69) {
    				each_value_5 = range(0, 3, 1);
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_5.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(110:3) {#if !clockConfigOverlayHidden}",
    		ctx
    	});

    	return block;
    }

    // (140:6) {#if clocks[i].alarmIsTriggered }
    function create_if_block_3(ctx) {
    	let h1;
    	let t0_value = /*clocks*/ ctx[0][/*i*/ ctx[34]].alarmText + "";
    	let t0;
    	let t1;
    	let div;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let button2;
    	let t7;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[24](/*i*/ ctx[34]);
    	}

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[25](/*i*/ ctx[34]);
    	}

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[26](/*i*/ ctx[34]);
    	}

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Reset Alarm";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "Snooze (5 min)";
    			t5 = space();
    			button2 = element("button");
    			button2.textContent = "Stop Alarm";
    			t7 = space();
    			attr_dev(h1, "class", "alarm-text");
    			add_location(h1, file, 140, 7, 4729);
    			add_location(button0, file, 142, 8, 4825);
    			add_location(button1, file, 143, 8, 4901);
    			add_location(button2, file, 144, 8, 4980);
    			attr_dev(div, "class", "alarm-controls");
    			add_location(div, file, 141, 7, 4787);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t3);
    			append_dev(div, button1);
    			append_dev(div, t5);
    			append_dev(div, button2);
    			append_dev(div, t7);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler_1, false, false, false),
    					listen_dev(button1, "click", click_handler_2, false, false, false),
    					listen_dev(button2, "click", click_handler_3, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*clocks*/ 1 && t0_value !== (t0_value = /*clocks*/ ctx[0][/*i*/ ctx[34]].alarmText + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(140:6) {#if clocks[i].alarmIsTriggered }",
    		ctx
    	});

    	return block;
    }

    // (139:5) {#each range(0, 3, 1) as i}
    function create_each_block_7(ctx) {
    	let if_block_anchor;
    	let if_block = /*clocks*/ ctx[0][/*i*/ ctx[34]].alarmIsTriggered && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*clocks*/ ctx[0][/*i*/ ctx[34]].alarmIsTriggered) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_7.name,
    		type: "each",
    		source: "(139:5) {#each range(0, 3, 1) as i}",
    		ctx
    	});

    	return block;
    }

    // (125:9) {#each timezones as timezone}
    function create_each_block_6(ctx) {
    	let option;
    	let t_value = /*timezone*/ ctx[50].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*timezone*/ ctx[50].value;
    			option.value = option.__value;
    			add_location(option, file, 125, 10, 4127);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(125:9) {#each timezones as timezone}",
    		ctx
    	});

    	return block;
    }

    // (113:5) {#each range(0, 3, 1) as i}
    function create_each_block_5(ctx) {
    	let div1;
    	let h2;

    	let t0_value = [
    		/*innerWidth*/ ctx[6] > 800 ? "Left Clock" : "Top Clock",
    		"Center Clock",
    		/*innerWidth*/ ctx[6] > 800
    		? "Right Clock"
    		: "Bottom Clock"
    	][/*i*/ ctx[34]] + "";

    	let t0;
    	let t1;
    	let div0;
    	let span0;
    	let t3;
    	let select;
    	let t4;
    	let label;
    	let t5;
    	let input0;
    	let t6;
    	let input1;
    	let t7;
    	let span1;
    	let t9;
    	let input2;
    	let t10;
    	let mounted;
    	let dispose;
    	let each_value_6 = timezones;
    	validate_each_argument(each_value_6);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	function select_change_handler() {
    		/*select_change_handler*/ ctx[20].call(select, /*i*/ ctx[34]);
    	}

    	function input0_change_handler() {
    		/*input0_change_handler*/ ctx[21].call(input0, /*i*/ ctx[34]);
    	}

    	function input1_input_handler() {
    		/*input1_input_handler*/ ctx[22].call(input1, /*i*/ ctx[34]);
    	}

    	function input2_input_handler() {
    		/*input2_input_handler*/ ctx[23].call(input2, /*i*/ ctx[34]);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "Timezone:";
    			t3 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			label = element("label");
    			t5 = text("Alarm: ");
    			input0 = element("input");
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			span1 = element("span");
    			span1.textContent = "Alarm Name:";
    			t9 = space();
    			input2 = element("input");
    			t10 = space();
    			add_location(h2, file, 114, 7, 3697);
    			add_location(span0, file, 122, 8, 3935);
    			attr_dev(select, "class", "timezone-selector");
    			attr_dev(select, "name", "timezone");
    			attr_dev(select, "id", "clock-" + /*i*/ ctx[34] + "-timezone");
    			if (/*selectedTimezone*/ ctx[2][/*i*/ ctx[34]] === void 0) add_render_callback(select_change_handler);
    			add_location(select, file, 123, 8, 3968);
    			attr_dev(input0, "type", "checkbox");
    			add_location(input0, file, 128, 22, 4246);
    			add_location(label, file, 128, 8, 4232);
    			attr_dev(input1, "class", "alarm-time");
    			attr_dev(input1, "type", "time");
    			add_location(input1, file, 129, 8, 4326);
    			add_location(span1, file, 130, 8, 4415);
    			attr_dev(input2, "type", "text");
    			add_location(input2, file, 131, 8, 4450);
    			attr_dev(div0, "class", "clock-controls");
    			add_location(div0, file, 121, 7, 3897);
    			attr_dev(div1, "id", "clock-" + (/*i*/ ctx[34] + 1));
    			add_location(div1, file, 113, 6, 3666);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, span0);
    			append_dev(div0, t3);
    			append_dev(div0, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selectedTimezone*/ ctx[2][/*i*/ ctx[34]]);
    			append_dev(div0, t4);
    			append_dev(div0, label);
    			append_dev(label, t5);
    			append_dev(label, input0);
    			input0.checked = /*clocks*/ ctx[0][/*i*/ ctx[34]].alarmIsActive;
    			append_dev(div0, t6);
    			append_dev(div0, input1);
    			set_input_value(input1, /*clocks*/ ctx[0][/*i*/ ctx[34]].alarmTimeAsString);
    			append_dev(div0, t7);
    			append_dev(div0, span1);
    			append_dev(div0, t9);
    			append_dev(div0, input2);
    			set_input_value(input2, /*clocks*/ ctx[0][/*i*/ ctx[34]].alarmText);
    			append_dev(div1, t10);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", select_change_handler),
    					listen_dev(input0, "change", input0_change_handler),
    					listen_dev(input1, "input", input1_input_handler),
    					listen_dev(input2, "input", input2_input_handler)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*innerWidth*/ 64 && t0_value !== (t0_value = [
    				/*innerWidth*/ ctx[6] > 800 ? "Left Clock" : "Top Clock",
    				"Center Clock",
    				/*innerWidth*/ ctx[6] > 800
    				? "Right Clock"
    				: "Bottom Clock"
    			][/*i*/ ctx[34]] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*timezones*/ 0) {
    				each_value_6 = timezones;
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_6.length;
    			}

    			if (dirty[0] & /*selectedTimezone*/ 4) {
    				select_option(select, /*selectedTimezone*/ ctx[2][/*i*/ ctx[34]]);
    			}

    			if (dirty[0] & /*clocks*/ 1) {
    				input0.checked = /*clocks*/ ctx[0][/*i*/ ctx[34]].alarmIsActive;
    			}

    			if (dirty[0] & /*clocks*/ 1) {
    				set_input_value(input1, /*clocks*/ ctx[0][/*i*/ ctx[34]].alarmTimeAsString);
    			}

    			if (dirty[0] & /*clocks*/ 1 && input2.value !== /*clocks*/ ctx[0][/*i*/ ctx[34]].alarmText) {
    				set_input_value(input2, /*clocks*/ ctx[0][/*i*/ ctx[34]].alarmText);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(113:5) {#each range(0, 3, 1) as i}",
    		ctx
    	});

    	return block;
    }

    // (164:4) {#each range(0, 60, 1) as marker}
    function create_each_block_4(ctx) {
    	let line;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "class", "marker-" + (/*marker*/ ctx[45] % 5 == 0 ? "large" : "small"));
    			attr_dev(line, "y1", 45 - (/*marker*/ ctx[45] % 5 == 0 ? 10 : 5));
    			attr_dev(line, "y2", "45");
    			attr_dev(line, "transform", "rotate(" + 6 * /*marker*/ ctx[45] + ")");
    			add_location(line, file, 164, 5, 5538);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(164:4) {#each range(0, 60, 1) as marker}",
    		ctx
    	});

    	return block;
    }

    // (171:4) {#each range(1, 13, 1) as clockNumber}
    function create_each_block_3(ctx) {
    	let g;
    	let text_1;
    	let t_value = /*clockNumber*/ ctx[42] + "";
    	let t;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(text_1, "transform", "rotate(" + (180 - 30 * /*clockNumber*/ ctx[42]) + ",0,29)");
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "y", "32");
    			add_location(text_1, file, 172, 6, 5923);
    			attr_dev(g, "transform", "rotate(" + (-180 + 30 * /*clockNumber*/ ctx[42]) + ")");
    			add_location(g, file, 171, 5, 5870);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, text_1);
    			append_dev(text_1, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(171:4) {#each range(1, 13, 1) as clockNumber}",
    		ctx
    	});

    	return block;
    }

    // (201:4) {#key clocks[0].second}
    function create_key_block_6(ctx) {
    	let circle;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "class", "clock-outside fill-flash");
    			attr_dev(circle, "cx", "0");
    			attr_dev(circle, "cy", "0");
    			attr_dev(circle, "r", "45");
    			add_location(circle, file, 201, 4, 6604);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block_6.name,
    		type: "key",
    		source: "(201:4) {#key clocks[0].second}",
    		ctx
    	});

    	return block;
    }

    // (210:3) {#key timeString[0]}
    function create_key_block_5(ctx) {
    	let span;
    	let t_value = /*timeString*/ ctx[1][0] + "";
    	let t;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file, 209, 23, 6780);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*timeString*/ 2 && t_value !== (t_value = /*timeString*/ ctx[1][0] + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fly, { y: -20 });
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block_5.name,
    		type: "key",
    		source: "(210:3) {#key timeString[0]}",
    		ctx
    	});

    	return block;
    }

    // (211:3) {#key timeString[1]}
    function create_key_block_4(ctx) {
    	let span;
    	let t_value = /*timeString*/ ctx[1][1] + "";
    	let t;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file, 210, 23, 6859);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*timeString*/ 2 && t_value !== (t_value = /*timeString*/ ctx[1][1] + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fly, { y: -20 });
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block_4.name,
    		type: "key",
    		source: "(211:3) {#key timeString[1]}",
    		ctx
    	});

    	return block;
    }

    // (213:3) {#key timeString[3]}
    function create_key_block_3(ctx) {
    	let span;
    	let t_value = /*timeString*/ ctx[1][3] + "";
    	let t;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file, 212, 23, 6944);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*timeString*/ 2 && t_value !== (t_value = /*timeString*/ ctx[1][3] + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fly, { y: -20 });
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block_3.name,
    		type: "key",
    		source: "(213:3) {#key timeString[3]}",
    		ctx
    	});

    	return block;
    }

    // (214:3) {#key timeString[4]}
    function create_key_block_2(ctx) {
    	let span;
    	let t_value = /*timeString*/ ctx[1][4] + "";
    	let t;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file, 213, 23, 7023);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*timeString*/ 2 && t_value !== (t_value = /*timeString*/ ctx[1][4] + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fly, { y: -20 });
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block_2.name,
    		type: "key",
    		source: "(214:3) {#key timeString[4]}",
    		ctx
    	});

    	return block;
    }

    // (216:3) {#key timeString[6]}
    function create_key_block_1(ctx) {
    	let span;
    	let t_value = /*timeString*/ ctx[1][6] + "";
    	let t;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file, 215, 23, 7108);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*timeString*/ 2 && t_value !== (t_value = /*timeString*/ ctx[1][6] + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fly, { y: -20 });
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block_1.name,
    		type: "key",
    		source: "(216:3) {#key timeString[6]}",
    		ctx
    	});

    	return block;
    }

    // (217:3) {#key timeString[7]}
    function create_key_block(ctx) {
    	let span;
    	let t_value = /*timeString*/ ctx[1][7] + "";
    	let t;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file, 216, 23, 7187);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*timeString*/ 2 && t_value !== (t_value = /*timeString*/ ctx[1][7] + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fly, { y: -20 });
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(217:3) {#key timeString[7]}",
    		ctx
    	});

    	return block;
    }

    // (228:6) {#each range(0, stripSizes[i], 1) as j}
    function create_each_block_2(ctx) {
    	let rect;
    	let text_1;
    	let t_value = /*j*/ ctx[39] + "";
    	let t;

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(rect, "width", stripHoleSize - 0.2);
    			attr_dev(rect, "height", stripHoleSize - 0.2);
    			attr_dev(rect, "rx", stripHoleSize - 0.2);
    			attr_dev(rect, "ry", stripHoleSize - 0.2);
    			attr_dev(rect, "y", stripHoleSize * /*j*/ ctx[39] + stripHeightPadding * 2 + 0.1);
    			attr_dev(rect, "x", "0.1");
    			attr_dev(rect, "fill", "white");
    			add_location(rect, file, 228, 7, 7958);
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "x", stripHoleSize / 2);
    			attr_dev(text_1, "y", stripHoleSize * /*j*/ ctx[39] + stripHeightPadding + stripHoleSize);
    			add_location(text_1, file, 236, 7, 8217);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(228:6) {#each range(0, stripSizes[i], 1) as j}",
    		ctx
    	});

    	return block;
    }

    // (221:4) {#each range(0, 6, 1) as i}
    function create_each_block_1(ctx) {
    	let g;
    	let rect;
    	let g_transform_value;
    	let each_value_2 = range(0, /*stripSizes*/ ctx[10][/*i*/ ctx[34]], 1);
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			rect = svg_element("rect");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(rect, "width", stripHoleSize);
    			attr_dev(rect, "height", stripHoleSize * /*stripSizes*/ ctx[10][/*i*/ ctx[34]] + stripHeightPadding * 2 + 2);
    			attr_dev(rect, "rx", "1");
    			attr_dev(rect, "ry", "1");
    			attr_dev(rect, "fill", "gray");
    			add_location(rect, file, 222, 6, 7746);
    			attr_dev(g, "transform", g_transform_value = "translate(" + (1 + stripSidePadding + stripHoleSize * /*i*/ ctx[34] + Math.floor((/*i*/ ctx[34] + 1) / 2) * stripHolePadding + Math.floor(/*i*/ ctx[34] / 2) * stripHoleGap) + "," + (-stripHoleSize * /*stripYOffset*/ ctx[5][/*i*/ ctx[34]] - stripHoleSize / 2 - stripHeightPadding - 1) + ")");
    			add_location(g, file, 221, 5, 7527);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, rect);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*stripSizes*/ 1024) {
    				each_value_2 = range(0, /*stripSizes*/ ctx[10][/*i*/ ctx[34]], 1);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (dirty[0] & /*stripYOffset*/ 32 && g_transform_value !== (g_transform_value = "translate(" + (1 + stripSidePadding + stripHoleSize * /*i*/ ctx[34] + Math.floor((/*i*/ ctx[34] + 1) / 2) * stripHolePadding + Math.floor(/*i*/ ctx[34] / 2) * stripHoleGap) + "," + (-stripHoleSize * /*stripYOffset*/ ctx[5][/*i*/ ctx[34]] - stripHoleSize / 2 - stripHeightPadding - 1) + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(221:4) {#each range(0, 6, 1) as i}",
    		ctx
    	});

    	return block;
    }

    // (250:5) {#each range(0, 6, 1) as i}
    function create_each_block(ctx) {
    	let rect;

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			attr_dev(rect, "x", 1 + stripSidePadding + stripHoleSize * /*i*/ ctx[34] + Math.floor((/*i*/ ctx[34] + 1) / 2) * stripHolePadding + Math.floor(/*i*/ ctx[34] / 2) * stripHoleGap);
    			attr_dev(rect, "y", -stripHoleSize / 2);
    			attr_dev(rect, "width", stripHoleSize);
    			attr_dev(rect, "height", stripHoleSize);
    			attr_dev(rect, "rx", "1");
    			attr_dev(rect, "ry", "1");
    			attr_dev(rect, "fill", "black");
    			add_location(rect, file, 250, 6, 8593);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(250:5) {#each range(0, 6, 1) as i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let ul;
    	let li;
    	let button;
    	let t3;
    	let div5;
    	let div2;
    	let svg0;
    	let each1_anchor;
    	let line0;
    	let line0_transform_value;
    	let line1;
    	let line1_transform_value;
    	let line2;
    	let line2_transform_value;
    	let previous_key = /*clocks*/ ctx[0][0].second;
    	let t4;
    	let div3;
    	let previous_key_1 = /*timeString*/ ctx[1][0];
    	let t5;
    	let previous_key_2 = /*timeString*/ ctx[1][1];
    	let t6;
    	let previous_key_3 = /*timeString*/ ctx[1][3];
    	let t7;
    	let previous_key_4 = /*timeString*/ ctx[1][4];
    	let t8;
    	let previous_key_5 = /*timeString*/ ctx[1][6];
    	let t9;
    	let previous_key_6 = /*timeString*/ ctx[1][7];
    	let t10;
    	let div4;
    	let svg1;
    	let mask;
    	let rect0;
    	let rect0_y_value;
    	let rect1;
    	let svg1_viewBox_value;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[18]);
    	let each_value_8 = bubbles;
    	validate_each_argument(each_value_8);
    	let each_blocks_4 = [];

    	for (let i = 0; i < each_value_8.length; i += 1) {
    		each_blocks_4[i] = create_each_block_8(get_each_context_8(ctx, each_value_8, i));
    	}

    	let if_block = (!/*clockConfigOverlayHidden*/ ctx[3] || !/*alarmTriggerOverlayHidden*/ ctx[4]) && create_if_block(ctx);
    	let each_value_4 = range(0, 60, 1);
    	validate_each_argument(each_value_4);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_3[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	let each_value_3 = range(1, 13, 1);
    	validate_each_argument(each_value_3);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_2[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let key_block0 = create_key_block_6(ctx);
    	let key_block1 = create_key_block_5(ctx);
    	let key_block2 = create_key_block_4(ctx);
    	let key_block3 = create_key_block_3(ctx);
    	let key_block4 = create_key_block_2(ctx);
    	let key_block5 = create_key_block_1(ctx);
    	let key_block6 = create_key_block(ctx);
    	let each_value_1 = range(0, 6, 1);
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = range(0, 6, 1);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].c();
    			}

    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			div1 = element("div");
    			ul = element("ul");
    			li = element("li");
    			button = element("button");
    			button.textContent = "Config Clocks";
    			t3 = space();
    			div5 = element("div");
    			div2 = element("div");
    			svg0 = svg_element("svg");

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			each1_anchor = empty();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			line2 = svg_element("line");
    			key_block0.c();
    			t4 = space();
    			div3 = element("div");
    			key_block1.c();
    			t5 = space();
    			key_block2.c();
    			t6 = text("\r\n\t\t\t:\r\n\t\t\t");
    			key_block3.c();
    			t7 = space();
    			key_block4.c();
    			t8 = text("\r\n\t\t\t:\r\n\t\t\t");
    			key_block5.c();
    			t9 = space();
    			key_block6.c();
    			t10 = space();
    			div4 = element("div");
    			svg1 = svg_element("svg");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			mask = svg_element("mask");
    			rect0 = svg_element("rect");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			rect1 = svg_element("rect");
    			attr_dev(div0, "id", "background-animation");
    			add_location(div0, file, 101, 1, 3038);
    			add_location(button, file, 155, 7, 5165);
    			add_location(li, file, 155, 3, 5161);
    			add_location(ul, file, 154, 2, 5152);
    			attr_dev(div1, "id", "panel");
    			add_location(div1, file, 153, 1, 5132);
    			attr_dev(line0, "class", "hand");
    			attr_dev(line0, "id", "hour");
    			attr_dev(line0, "y1", "-5");
    			attr_dev(line0, "y2", "35");
    			attr_dev(line0, "transform", line0_transform_value = "rotate(" + (180 + 30 * /*clocks*/ ctx[0][0].hour) + ")");
    			add_location(line0, file, 182, 4, 6121);
    			attr_dev(line1, "class", "hand");
    			attr_dev(line1, "id", "minute");
    			attr_dev(line1, "y1", "-7");
    			attr_dev(line1, "y2", "45");
    			attr_dev(line1, "transform", line1_transform_value = "rotate(" + (180 + 6 * /*clocks*/ ctx[0][0].minute) + ")");
    			add_location(line1, file, 188, 4, 6269);
    			attr_dev(line2, "class", "hand");
    			attr_dev(line2, "id", "second");
    			attr_dev(line2, "y1", "-10");
    			attr_dev(line2, "y2", "45");
    			attr_dev(line2, "transform", line2_transform_value = "rotate(" + (180 + 6 * /*clocks*/ ctx[0][0].second) + ")");
    			add_location(line2, file, 194, 4, 6420);
    			attr_dev(svg0, "viewBox", "-50 -50 100 100");
    			add_location(svg0, file, 161, 3, 5384);
    			attr_dev(div2, "class", "clock");
    			attr_dev(div2, "id", "analog");
    			add_location(div2, file, 160, 2, 5348);
    			attr_dev(div3, "class", "clock");
    			attr_dev(div3, "id", "digital");
    			add_location(div3, file, 208, 2, 6723);
    			attr_dev(rect0, "x", "0");
    			attr_dev(rect0, "y", rect0_y_value = /*innerWidth*/ ctx[6] > 800 ? -50 : -10);
    			attr_dev(rect0, "width", "100%");
    			attr_dev(rect0, "height", "100%");
    			attr_dev(rect0, "fill", "white");
    			add_location(rect0, file, 244, 5, 8439);
    			attr_dev(mask, "id", "numberHoles");
    			add_location(mask, file, 243, 4, 8409);
    			attr_dev(rect1, "x", "1");
    			attr_dev(rect1, "y", -stripHoleSize / 2 - 1);
    			attr_dev(rect1, "width", /*stripWidth*/ ctx[11]);
    			attr_dev(rect1, "height", stripHoleSize + stripHeightPadding * 2);
    			attr_dev(rect1, "rx", "2");
    			attr_dev(rect1, "ry", "2");
    			attr_dev(rect1, "mask", "url(#numberHoles)");
    			add_location(rect1, file, 258, 4, 8889);

    			attr_dev(svg1, "viewBox", svg1_viewBox_value = "0 " + (/*innerWidth*/ ctx[6] > 800
    			? (20 * stripHoleSize + stripHeightPadding * 2) / -2
    			: -10) + " " + (/*stripWidth*/ ctx[11] + 2) + " " + (/*innerWidth*/ ctx[6] > 800
    			? 20 * stripHoleSize + stripHeightPadding * 2
    			: 20));

    			attr_dev(svg1, "width", "100%");
    			attr_dev(svg1, "height", "100%");
    			add_location(svg1, file, 219, 3, 7290);
    			attr_dev(div4, "class", "clock");
    			attr_dev(div4, "id", "strip");
    			add_location(div4, file, 218, 2, 7255);
    			attr_dev(div5, "id", "clock-container");
    			add_location(div5, file, 158, 1, 5278);
    			add_location(main, file, 100, 0, 3029);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].m(div0, null);
    			}

    			append_dev(main, t0);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t1);
    			append_dev(main, div1);
    			append_dev(div1, ul);
    			append_dev(ul, li);
    			append_dev(li, button);
    			append_dev(main, t3);
    			append_dev(main, div5);
    			append_dev(div5, div2);
    			append_dev(div2, svg0);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(svg0, null);
    			}

    			append_dev(svg0, each1_anchor);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(svg0, null);
    			}

    			append_dev(svg0, line0);
    			append_dev(svg0, line1);
    			append_dev(svg0, line2);
    			key_block0.m(svg0, null);
    			append_dev(div5, t4);
    			append_dev(div5, div3);
    			key_block1.m(div3, null);
    			append_dev(div3, t5);
    			key_block2.m(div3, null);
    			append_dev(div3, t6);
    			key_block3.m(div3, null);
    			append_dev(div3, t7);
    			key_block4.m(div3, null);
    			append_dev(div3, t8);
    			key_block5.m(div3, null);
    			append_dev(div3, t9);
    			key_block6.m(div3, null);
    			append_dev(div5, t10);
    			append_dev(div5, div4);
    			append_dev(div4, svg1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(svg1, null);
    			}

    			append_dev(svg1, mask);
    			append_dev(mask, rect0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(mask, null);
    			}

    			append_dev(svg1, rect1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "resize", /*onwindowresize*/ ctx[18]),
    					listen_dev(button, "click", /*click_handler_4*/ ctx[27], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*bubbles*/ 0) {
    				each_value_8 = bubbles;
    				validate_each_argument(each_value_8);
    				let i;

    				for (i = 0; i < each_value_8.length; i += 1) {
    					const child_ctx = get_each_context_8(ctx, each_value_8, i);

    					if (each_blocks_4[i]) {
    						each_blocks_4[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_4[i] = create_each_block_8(child_ctx);
    						each_blocks_4[i].c();
    						each_blocks_4[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_4.length; i += 1) {
    					each_blocks_4[i].d(1);
    				}

    				each_blocks_4.length = each_value_8.length;
    			}

    			if (!/*clockConfigOverlayHidden*/ ctx[3] || !/*alarmTriggerOverlayHidden*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(main, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*range*/ 0) {
    				each_value_4 = range(0, 60, 1);
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_3[i] = create_each_block_4(child_ctx);
    						each_blocks_3[i].c();
    						each_blocks_3[i].m(svg0, each1_anchor);
    					}
    				}

    				for (; i < each_blocks_3.length; i += 1) {
    					each_blocks_3[i].d(1);
    				}

    				each_blocks_3.length = each_value_4.length;
    			}

    			if (dirty & /*range*/ 0) {
    				each_value_3 = range(1, 13, 1);
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_3(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(svg0, line0);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_3.length;
    			}

    			if (dirty[0] & /*clocks*/ 1 && line0_transform_value !== (line0_transform_value = "rotate(" + (180 + 30 * /*clocks*/ ctx[0][0].hour) + ")")) {
    				attr_dev(line0, "transform", line0_transform_value);
    			}

    			if (dirty[0] & /*clocks*/ 1 && line1_transform_value !== (line1_transform_value = "rotate(" + (180 + 6 * /*clocks*/ ctx[0][0].minute) + ")")) {
    				attr_dev(line1, "transform", line1_transform_value);
    			}

    			if (dirty[0] & /*clocks*/ 1 && line2_transform_value !== (line2_transform_value = "rotate(" + (180 + 6 * /*clocks*/ ctx[0][0].second) + ")")) {
    				attr_dev(line2, "transform", line2_transform_value);
    			}

    			if (dirty[0] & /*clocks*/ 1 && safe_not_equal(previous_key, previous_key = /*clocks*/ ctx[0][0].second)) {
    				key_block0.d(1);
    				key_block0 = create_key_block_6(ctx);
    				key_block0.c();
    				key_block0.m(svg0, null);
    			}

    			if (dirty[0] & /*timeString*/ 2 && safe_not_equal(previous_key_1, previous_key_1 = /*timeString*/ ctx[1][0])) {
    				group_outros();
    				transition_out(key_block1, 1, 1, noop);
    				check_outros();
    				key_block1 = create_key_block_5(ctx);
    				key_block1.c();
    				transition_in(key_block1);
    				key_block1.m(div3, t5);
    			} else {
    				key_block1.p(ctx, dirty);
    			}

    			if (dirty[0] & /*timeString*/ 2 && safe_not_equal(previous_key_2, previous_key_2 = /*timeString*/ ctx[1][1])) {
    				group_outros();
    				transition_out(key_block2, 1, 1, noop);
    				check_outros();
    				key_block2 = create_key_block_4(ctx);
    				key_block2.c();
    				transition_in(key_block2);
    				key_block2.m(div3, t6);
    			} else {
    				key_block2.p(ctx, dirty);
    			}

    			if (dirty[0] & /*timeString*/ 2 && safe_not_equal(previous_key_3, previous_key_3 = /*timeString*/ ctx[1][3])) {
    				group_outros();
    				transition_out(key_block3, 1, 1, noop);
    				check_outros();
    				key_block3 = create_key_block_3(ctx);
    				key_block3.c();
    				transition_in(key_block3);
    				key_block3.m(div3, t7);
    			} else {
    				key_block3.p(ctx, dirty);
    			}

    			if (dirty[0] & /*timeString*/ 2 && safe_not_equal(previous_key_4, previous_key_4 = /*timeString*/ ctx[1][4])) {
    				group_outros();
    				transition_out(key_block4, 1, 1, noop);
    				check_outros();
    				key_block4 = create_key_block_2(ctx);
    				key_block4.c();
    				transition_in(key_block4);
    				key_block4.m(div3, t8);
    			} else {
    				key_block4.p(ctx, dirty);
    			}

    			if (dirty[0] & /*timeString*/ 2 && safe_not_equal(previous_key_5, previous_key_5 = /*timeString*/ ctx[1][6])) {
    				group_outros();
    				transition_out(key_block5, 1, 1, noop);
    				check_outros();
    				key_block5 = create_key_block_1(ctx);
    				key_block5.c();
    				transition_in(key_block5);
    				key_block5.m(div3, t9);
    			} else {
    				key_block5.p(ctx, dirty);
    			}

    			if (dirty[0] & /*timeString*/ 2 && safe_not_equal(previous_key_6, previous_key_6 = /*timeString*/ ctx[1][7])) {
    				group_outros();
    				transition_out(key_block6, 1, 1, noop);
    				check_outros();
    				key_block6 = create_key_block(ctx);
    				key_block6.c();
    				transition_in(key_block6);
    				key_block6.m(div3, null);
    			} else {
    				key_block6.p(ctx, dirty);
    			}

    			if (dirty[0] & /*stripYOffset, stripSizes*/ 1056) {
    				each_value_1 = range(0, 6, 1);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(svg1, mask);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*innerWidth*/ 64 && rect0_y_value !== (rect0_y_value = /*innerWidth*/ ctx[6] > 800 ? -50 : -10)) {
    				attr_dev(rect0, "y", rect0_y_value);
    			}

    			if (dirty & /*stripSidePadding, stripHoleSize, range, Math, stripHolePadding, stripHoleGap*/ 0) {
    				each_value = range(0, 6, 1);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(mask, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*innerWidth*/ 64 && svg1_viewBox_value !== (svg1_viewBox_value = "0 " + (/*innerWidth*/ ctx[6] > 800
    			? (20 * stripHoleSize + stripHeightPadding * 2) / -2
    			: -10) + " " + (/*stripWidth*/ ctx[11] + 2) + " " + (/*innerWidth*/ ctx[6] > 800
    			? 20 * stripHoleSize + stripHeightPadding * 2
    			: 20))) {
    				attr_dev(svg1, "viewBox", svg1_viewBox_value);
    			}
    		},
    		i: function intro(local) {
    			transition_in(key_block1);
    			transition_in(key_block2);
    			transition_in(key_block3);
    			transition_in(key_block4);
    			transition_in(key_block5);
    			transition_in(key_block6);
    		},
    		o: function outro(local) {
    			transition_out(key_block1);
    			transition_out(key_block2);
    			transition_out(key_block3);
    			transition_out(key_block4);
    			transition_out(key_block5);
    			transition_out(key_block6);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks_4, detaching);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks_3, detaching);
    			destroy_each(each_blocks_2, detaching);
    			key_block0.d(detaching);
    			key_block1.d(detaching);
    			key_block2.d(detaching);
    			key_block3.d(detaching);
    			key_block4.d(detaching);
    			key_block5.d(detaching);
    			key_block6.d(detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const stripHoleSize = 4;
    const stripHolePadding = 0.5;
    const stripHoleGap = 2;
    const stripSidePadding = 1;
    const stripHeightPadding = 1;

    function instance($$self, $$props, $$invalidate) {
    	let outerWidth;
    	let innerWidth;
    	let outerHeight;
    	let innerHeight;
    	let $stripYSpring5;
    	let $stripYSpring4;
    	let $stripYSpring3;
    	let $stripYSpring2;
    	let $stripYSpring1;
    	let $stripYSpring0;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let clocks = [new Clock(), new Clock(), new Clock()];
    	let timeString = ["0", "0", ":", "0", "0", ":", "0", "0"];
    	let selectedTimezone = [null, null, null];
    	let clockConfigOverlayHidden = true;
    	let alarmTriggerOverlayHidden = true;

    	// NOTE: Consider moving to another file
    	const stripSizes = [3, 10, 6, 10, 6, 10];

    	const stripWidth = stripHoleSize * 6 + stripHolePadding * 3 + stripHoleGap * 2 + stripSidePadding * 2;

    	// NOTE: It's really difficult to use a list of springs for some reason, and I can't be bothered to mess with it anymore
    	let stripYOffset = [0, 0, 0, 0, 0, 0];

    	let stripYSpring0 = spring(0, { damping: 0.4, stiffness: 0.2 });
    	validate_store(stripYSpring0, 'stripYSpring0');
    	component_subscribe($$self, stripYSpring0, value => $$invalidate(33, $stripYSpring0 = value));
    	let stripYSpring1 = spring(0, { damping: 0.4, stiffness: 0.2 });
    	validate_store(stripYSpring1, 'stripYSpring1');
    	component_subscribe($$self, stripYSpring1, value => $$invalidate(32, $stripYSpring1 = value));
    	let stripYSpring2 = spring(0, { damping: 0.4, stiffness: 0.2 });
    	validate_store(stripYSpring2, 'stripYSpring2');
    	component_subscribe($$self, stripYSpring2, value => $$invalidate(31, $stripYSpring2 = value));
    	let stripYSpring3 = spring(0, { damping: 0.4, stiffness: 0.2 });
    	validate_store(stripYSpring3, 'stripYSpring3');
    	component_subscribe($$self, stripYSpring3, value => $$invalidate(30, $stripYSpring3 = value));
    	let stripYSpring4 = spring(0, { damping: 0.4, stiffness: 0.2 });
    	validate_store(stripYSpring4, 'stripYSpring4');
    	component_subscribe($$self, stripYSpring4, value => $$invalidate(29, $stripYSpring4 = value));
    	let stripYSpring5 = spring(0, { damping: 0.4, stiffness: 0.2 });
    	validate_store(stripYSpring5, 'stripYSpring5');
    	component_subscribe($$self, stripYSpring5, value => $$invalidate(28, $stripYSpring5 = value));

    	setInterval(
    		() => {
    			for (let i = 0; i < 3; i++) {
    				if (selectedTimezone[i] != null) {
    					$$invalidate(0, clocks[i].timezone = selectedTimezone[i], clocks);
    				}

    				clocks[i].syncTime();
    				clocks[i].updateAlarm();
    				$$invalidate(0, clocks);
    			}

    			for (let i = 0; i < 8; i++) {
    				$$invalidate(1, timeString[i] = clocks[1].timeAsString[i], timeString);
    			}

    			stripYSpring0.set(clocks[2].getDigit(0));
    			stripYSpring1.set(clocks[2].getDigit(1));
    			stripYSpring2.set(clocks[2].getDigit(2));
    			stripYSpring3.set(clocks[2].getDigit(3));
    			stripYSpring4.set(clocks[2].getDigit(4));
    			stripYSpring5.set(clocks[2].getDigit(5));
    			$$invalidate(5, stripYOffset[0] = $stripYSpring0, stripYOffset);
    			$$invalidate(5, stripYOffset[1] = $stripYSpring1, stripYOffset);
    			$$invalidate(5, stripYOffset[2] = $stripYSpring2, stripYOffset);
    			$$invalidate(5, stripYOffset[3] = $stripYSpring3, stripYOffset);
    			$$invalidate(5, stripYOffset[4] = $stripYSpring4, stripYOffset);
    			$$invalidate(5, stripYOffset[5] = $stripYSpring5, stripYOffset);
    		},
    		1
    	);

    	clocks[0].alarmText = innerWidth > 800 ? "Left Alarm" : "Top Alarm";
    	clocks[1].alarmText = "Center Alarm";
    	clocks[2].alarmText = innerWidth > 800 ? "Right Alarm" : "Bottom Alarm";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(6, innerWidth = window.innerWidth);
    		$$invalidate(9, outerWidth = window.outerWidth);
    		$$invalidate(7, innerHeight = window.innerHeight);
    		$$invalidate(8, outerHeight = window.outerHeight);
    	}

    	const click_handler = () => {
    		$$invalidate(3, clockConfigOverlayHidden = true);
    	};

    	function select_change_handler(i) {
    		selectedTimezone[i] = select_value(this);
    		$$invalidate(2, selectedTimezone);
    	}

    	function input0_change_handler(i) {
    		clocks[i].alarmIsActive = this.checked;
    		$$invalidate(0, clocks);
    	}

    	function input1_input_handler(i) {
    		clocks[i].alarmTimeAsString = this.value;
    		$$invalidate(0, clocks);
    	}

    	function input2_input_handler(i) {
    		clocks[i].alarmText = this.value;
    		$$invalidate(0, clocks);
    	}

    	const click_handler_1 = i => {
    		clocks[i].reset();
    	};

    	const click_handler_2 = i => {
    		clocks[i].snooze();
    	};

    	const click_handler_3 = i => {
    		clocks[i].stop();
    	};

    	const click_handler_4 = () => {
    		$$invalidate(3, clockConfigOverlayHidden = false);
    	};

    	$$self.$capture_state = () => ({
    		bubbles,
    		fly,
    		spring,
    		range,
    		Clock,
    		timezones,
    		clocks,
    		timeString,
    		selectedTimezone,
    		clockConfigOverlayHidden,
    		alarmTriggerOverlayHidden,
    		stripSizes,
    		stripHoleSize,
    		stripHolePadding,
    		stripHoleGap,
    		stripSidePadding,
    		stripHeightPadding,
    		stripWidth,
    		stripYOffset,
    		stripYSpring0,
    		stripYSpring1,
    		stripYSpring2,
    		stripYSpring3,
    		stripYSpring4,
    		stripYSpring5,
    		innerWidth,
    		innerHeight,
    		outerHeight,
    		outerWidth,
    		$stripYSpring5,
    		$stripYSpring4,
    		$stripYSpring3,
    		$stripYSpring2,
    		$stripYSpring1,
    		$stripYSpring0
    	});

    	$$self.$inject_state = $$props => {
    		if ('clocks' in $$props) $$invalidate(0, clocks = $$props.clocks);
    		if ('timeString' in $$props) $$invalidate(1, timeString = $$props.timeString);
    		if ('selectedTimezone' in $$props) $$invalidate(2, selectedTimezone = $$props.selectedTimezone);
    		if ('clockConfigOverlayHidden' in $$props) $$invalidate(3, clockConfigOverlayHidden = $$props.clockConfigOverlayHidden);
    		if ('alarmTriggerOverlayHidden' in $$props) $$invalidate(4, alarmTriggerOverlayHidden = $$props.alarmTriggerOverlayHidden);
    		if ('stripYOffset' in $$props) $$invalidate(5, stripYOffset = $$props.stripYOffset);
    		if ('stripYSpring0' in $$props) $$invalidate(12, stripYSpring0 = $$props.stripYSpring0);
    		if ('stripYSpring1' in $$props) $$invalidate(13, stripYSpring1 = $$props.stripYSpring1);
    		if ('stripYSpring2' in $$props) $$invalidate(14, stripYSpring2 = $$props.stripYSpring2);
    		if ('stripYSpring3' in $$props) $$invalidate(15, stripYSpring3 = $$props.stripYSpring3);
    		if ('stripYSpring4' in $$props) $$invalidate(16, stripYSpring4 = $$props.stripYSpring4);
    		if ('stripYSpring5' in $$props) $$invalidate(17, stripYSpring5 = $$props.stripYSpring5);
    		if ('innerWidth' in $$props) $$invalidate(6, innerWidth = $$props.innerWidth);
    		if ('innerHeight' in $$props) $$invalidate(7, innerHeight = $$props.innerHeight);
    		if ('outerHeight' in $$props) $$invalidate(8, outerHeight = $$props.outerHeight);
    		if ('outerWidth' in $$props) $$invalidate(9, outerWidth = $$props.outerWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*clocks*/ 1) {
    			{
    				let temp = true;

    				for (let i = 0; i < 3; i++) {
    					if (clocks[i].alarmIsTriggered) {
    						temp = false;
    					}
    				}

    				$$invalidate(4, alarmTriggerOverlayHidden = temp);
    			}
    		}
    	};

    	$$invalidate(9, outerWidth = 0);
    	$$invalidate(6, innerWidth = 0);
    	$$invalidate(8, outerHeight = 0);
    	$$invalidate(7, innerHeight = 0);

    	return [
    		clocks,
    		timeString,
    		selectedTimezone,
    		clockConfigOverlayHidden,
    		alarmTriggerOverlayHidden,
    		stripYOffset,
    		innerWidth,
    		innerHeight,
    		outerHeight,
    		outerWidth,
    		stripSizes,
    		stripWidth,
    		stripYSpring0,
    		stripYSpring1,
    		stripYSpring2,
    		stripYSpring3,
    		stripYSpring4,
    		stripYSpring5,
    		onwindowresize,
    		click_handler,
    		select_change_handler,
    		input0_change_handler,
    		input1_input_handler,
    		input2_input_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
