
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
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
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
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
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
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
            flush_render_callbacks($$.after_update);
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
            ctx: [],
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
            if (!is_function(callback)) {
                return noop;
            }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.1' }, detail), { bubbles: true }));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
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
        if (text.data === data)
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

    const handleRejectedResponse = async (error) => {
        console.error(error);
        let message = error.message || `${error.status}: ${error.statusText}`;

        const processJson = (json) => {
            console.debug("JSON error from API", json);
            if (json.hasOwnProperty('errors')) {
                let message = json.title;
                for (let index in json.errors) {
                    message += `\n- ${json.errors[index]}`;
                }
                return message;
            }
            return json.message;
        };

        const processText = (text) => {
            console.debug("Text error from API", text);
            return text;
        };

        if (typeof error.json === "function") {
            let isJSON = error.headers.get('content-type').includes('application/json');
            message = await (isJSON ? error.json().then(processJson) : error.text().then(processText)).catch(async genericError => {
                console.debug("Generic error from API", genericError);
                return `${error.status}: ${error.statusText}`;
            });
        }
        return Promise.reject(message);
    };

    const getOptions = (method, data = null) => {
        const headers = { "Access-Control-Expose-Headers": "Content-Length", "Content-Type": "application/json" };
        const options = ({ method: method, headers: headers, mode: 'cors' });
        return data == null ? options : { ...options, body: JSON.stringify(data) }
    };

    const HttpRequest = (function () {
        const httpRequest = async (method, url, data = null) => {
            console.debug(method, url);
            return fetch(url, getOptions(method, data))
                .then(response => {
                    console.debug(response);
                    if (!response.ok) {
                        return Promise.reject(response);
                    }
                    return response.json();
                })
                .then ((json) => json.data)
                .catch (handleRejectedResponse);
        };
        return {
            get: async (url) => httpRequest('GET', url),
            put: async (url, data) => httpRequest('PUT', url, data),
            post: async (url, data) => httpRequest('POST', url, data),
            delete: async (url, data) => httpRequest('DELETE', url, data),
        };
    })();

    const MaterialLoadingApi = (function (apiUrl) {
        //apiUrl = 'http://localhost:5183';
        return {
            getLine: (lineCode) =>
                HttpRequest.get(`${apiUrl}/api/lines/${lineCode}`)
        };
    })("http://mxsrvapps.gt.local/gtt/services/materialloading");

    const Bl100EngineRework = (function (apiUrl){
      //apiUrl = 'http://localhost:5149';
      return {
        InsertMotorData:(scannerInput,bearing_Position,arrow_Position,hipot_IR,cw_Speed,amperage_CW,ccw_Speed,amperage_CCW,ptc_Resistance) =>
            HttpRequest.post(`${apiUrl}/api/lines/bl100enginerework`,{ScannerInput: scannerInput,Bearing_Position: bearing_Position,Arrow_Position: arrow_Position,Hipot_IR: hipot_IR,Cw_Speed: cw_Speed,Amperage_CW: amperage_CW,Ccw_Speed: ccw_Speed,Amperage_CCW: amperage_CCW,Ptc_Resistance: ptc_Resistance})
      };  
    })("http://mxsrvapps.gt.local/gtt/services/bl100enginerework");

    /* src\AppHeader.svelte generated by Svelte v3.59.1 */

    const file$5 = "src\\AppHeader.svelte";

    function create_fragment$5(ctx) {
    	let header;
    	let img;
    	let img_src_value;
    	let t0;
    	let b;

    	const block = {
    		c: function create() {
    			header = element("header");
    			img = element("img");
    			t0 = space();
    			b = element("b");
    			b.textContent = "GT BL100 Engine Rework";
    			if (!src_url_equal(img.src, img_src_value = "gt-logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "General Transmissions");
    			attr_dev(img, "class", "svelte-14eyab0");
    			add_location(img, file$5, 11, 4, 258);
    			attr_dev(b, "class", "svelte-14eyab0");
    			add_location(b, file$5, 12, 4, 317);
    			attr_dev(header, "class", "app-child svelte-14eyab0");
    			add_location(header, file$5, 10, 2, 226);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, img);
    			append_dev(header, t0);
    			append_dev(header, b);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AppHeader', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AppHeader> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class AppHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AppHeader",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    async function playAudio(audio) {
        return new Promise(res => {
            audio.play();
            audio.onended = res;
        })
    }
    const Sfx = new class {

        constructor() {
            this.counter = 0;
        }

        playSuccessSoundAsync = async function () {
            this.counter = this.counter || 0;
            let sounds = ['mario-ya', 'mario-woohoo', 'mario-yahoo'];
            await playAudio(new Audio(`./sfx/${sounds[this.counter]}.wav`));
            this.counter = ++this.counter % 3;
        };

        playFailureSoundAsync = async function () {
            let sounds = ['invalid', 'mario-doh', 'mario-mamamia'];
            await playAudio(new Audio(`./sfx/${sounds[Math.floor(Math.random() * 3)]}.wav`));
        };

        playPickingSoundAsync = async function () {
            await playAudio(new Audio(`./sfx/boing.wav`));
        };
    };

    /* src\Input.svelte generated by Svelte v3.59.1 */
    const file$4 = "src\\Input.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let form;
    	let input_1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			form = element("form");
    			input_1 = element("input");
    			attr_dev(input_1, "type", "text");
    			attr_dev(input_1, "placeholder", "Favor de escanear la etiqueta individual.");
    			attr_dev(input_1, "class", "svelte-wbjrgg");
    			add_location(input_1, file$4, 46, 4, 1168);
    			add_location(form, file$4, 45, 2, 1131);
    			attr_dev(div, "class", "app-child svelte-wbjrgg");
    			add_location(div, file$4, 44, 0, 1104);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, form);
    			append_dev(form, input_1);
    			/*input_1_binding*/ ctx[3](input_1);

    			if (!mounted) {
    				dispose = listen_dev(form, "submit", /*handleSubmit*/ ctx[1], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*input_1_binding*/ ctx[3](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Input', slots, []);
    	let { addMessage = null } = $$props;
    	let input = null;
    	let qrMotor = null;

    	const handleSubmit = event => {
    		event.preventDefault();

    		if (input.value != "") {
    			$$invalidate(0, input.disabled = true, input);
    			qrMotor = prompt("Escanea el QR del motor:");

    			if (qrMotor != "") {
    				Sfx.playSuccessSoundAsync();
    				addMessage(`Transmision ${input.value} enlazada con el motor ${qrMotor}`);
    				$$invalidate(0, input.disabled = false, input);
    				input.focus();
    				$$invalidate(0, input.value = "", input);
    			} else {
    				addMessage('No se acepta el campo del motor vacio');
    				Sfx.playFailureSoundAsync();
    				$$invalidate(0, input.disabled = false, input);
    				input.focus();
    				$$invalidate(0, input.value = "", input);
    			}
    		} else {
    			addMessage('No se acepta el campo de la transmision vacio');
    			Sfx.playFailureSoundAsync();
    			$$invalidate(0, input.disabled = false, input);
    			input.focus();
    			$$invalidate(0, input.value = "", input);
    		}
    	};

    	onMount(() => input.focus());
    	const writable_props = ['addMessage'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			input = $$value;
    			$$invalidate(0, input);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('addMessage' in $$props) $$invalidate(2, addMessage = $$props.addMessage);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Sfx,
    		addMessage,
    		input,
    		qrMotor,
    		handleSubmit
    	});

    	$$self.$inject_state = $$props => {
    		if ('addMessage' in $$props) $$invalidate(2, addMessage = $$props.addMessage);
    		if ('input' in $$props) $$invalidate(0, input = $$props.input);
    		if ('qrMotor' in $$props) qrMotor = $$props.qrMotor;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [input, handleSubmit, addMessage, input_1_binding];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { addMessage: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get addMessage() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addMessage(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\MessageLog.svelte generated by Svelte v3.59.1 */
    const file$3 = "src\\MessageLog.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (21:2) {#each messages as message, i}
    function create_each_block(ctx) {
    	let span;
    	let t0_value = /*message*/ ctx[2].time + "";
    	let t0;
    	let t1;
    	let t2_value = /*message*/ ctx[2].message + "";
    	let t2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(".- ");
    			t2 = text(t2_value);
    			attr_dev(span, "class", "svelte-utu460");
    			add_location(span, file$3, 21, 4, 515);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*messages*/ 1 && t0_value !== (t0_value = /*message*/ ctx[2].time + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*messages*/ 1 && t2_value !== (t2_value = /*message*/ ctx[2].message + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(21:2) {#each messages as message, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let each_value = /*messages*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", "message-log");
    			attr_dev(div, "class", "svelte-utu460");
    			add_location(div, file$3, 19, 0, 453);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*messages*/ 1) {
    				each_value = /*messages*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MessageLog', slots, []);

    	let { addMessage = () => {
    		
    	} } = $$props;

    	let messages = [];

    	onMount(() => {
    		$$invalidate(0, messages = [...JSON.parse(localStorage["messages"] || "[]")]);

    		$$invalidate(1, addMessage = message => {
    			$$invalidate(0, messages = [
    				{
    					time: new Date().toLocaleTimeString(),
    					message
    				},
    				...messages.slice(0, 30)
    			]);

    			localStorage["messages"] = JSON.stringify(messages);
    		});
    	});

    	const writable_props = ['addMessage'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MessageLog> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('addMessage' in $$props) $$invalidate(1, addMessage = $$props.addMessage);
    	};

    	$$self.$capture_state = () => ({ onMount, addMessage, messages });

    	$$self.$inject_state = $$props => {
    		if ('addMessage' in $$props) $$invalidate(1, addMessage = $$props.addMessage);
    		if ('messages' in $$props) $$invalidate(0, messages = $$props.messages);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [messages, addMessage];
    }

    class MessageLog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { addMessage: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MessageLog",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get addMessage() {
    		throw new Error("<MessageLog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addMessage(value) {
    		throw new Error("<MessageLog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\AppFooter.svelte generated by Svelte v3.59.1 */
    const file$2 = "src\\AppFooter.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let span;
    	let t_value = /*curTime*/ ctx[0].toLocaleString() + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "cur-time svelte-iz77fw");
    			add_location(span, file$2, 9, 4, 239);
    			attr_dev(div, "id", "app-footer");
    			attr_dev(div, "class", "app-child svelte-iz77fw");
    			add_location(div, file$2, 8, 2, 194);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*curTime*/ 1 && t_value !== (t_value = /*curTime*/ ctx[0].toLocaleString() + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AppFooter', slots, []);
    	let { curTime = new Date() } = $$props;
    	onMount(async () => setInterval(async () => $$invalidate(0, curTime = new Date()), 500));
    	const writable_props = ['curTime'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AppFooter> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('curTime' in $$props) $$invalidate(0, curTime = $$props.curTime);
    	};

    	$$self.$capture_state = () => ({ onMount, curTime });

    	$$self.$inject_state = $$props => {
    		if ('curTime' in $$props) $$invalidate(0, curTime = $$props.curTime);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [curTime];
    }

    class AppFooter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { curTime: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AppFooter",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get curTime() {
    		throw new Error("<AppFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set curTime(value) {
    		throw new Error("<AppFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\InsertData.svelte generated by Svelte v3.59.1 */

    const { console: console_1 } = globals;
    const file$1 = "src\\InsertData.svelte";

    function create_fragment$1(ctx) {
    	let h1;
    	let t1;
    	let main;
    	let form;
    	let label0;
    	let t2;
    	let input0;
    	let t3;
    	let label1;
    	let t4;
    	let input1;
    	let t5;
    	let label2;
    	let t6;
    	let input2;
    	let t7;
    	let label3;
    	let t8;
    	let input3;
    	let t9;
    	let label4;
    	let t10;
    	let input4;
    	let t11;
    	let label5;
    	let t12;
    	let input5;
    	let t13;
    	let label6;
    	let t14;
    	let input6;
    	let t15;
    	let label7;
    	let t16;
    	let input7;
    	let t17;
    	let label8;
    	let t18;
    	let input8;
    	let t19;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Captura de Datos De Retrabajo De Motor BL100";
    			t1 = space();
    			main = element("main");
    			form = element("form");
    			label0 = element("label");
    			t2 = text("QR del Motor:\r\n        \r\n        ");
    			input0 = element("input");
    			t3 = space();
    			label1 = element("label");
    			t4 = text("Posición del Balero:\r\n        ");
    			input1 = element("input");
    			t5 = space();
    			label2 = element("label");
    			t6 = text("Posición de la flecha:\r\n        ");
    			input2 = element("input");
    			t7 = space();
    			label3 = element("label");
    			t8 = text("Velocidad CW:\r\n        ");
    			input3 = element("input");
    			t9 = space();
    			label4 = element("label");
    			t10 = text("Amperaje CW:\r\n        ");
    			input4 = element("input");
    			t11 = space();
    			label5 = element("label");
    			t12 = text("Velocidad CCW:\r\n        ");
    			input5 = element("input");
    			t13 = space();
    			label6 = element("label");
    			t14 = text("Amperaje CCW:\r\n        ");
    			input6 = element("input");
    			t15 = space();
    			label7 = element("label");
    			t16 = text("Hipot IR:\r\n        ");
    			input7 = element("input");
    			t17 = space();
    			label8 = element("label");
    			t18 = text("Resistencia de PTC:\r\n        ");
    			input8 = element("input");
    			t19 = space();
    			button = element("button");
    			button.textContent = "Enviar";
    			attr_dev(h1, "class", "svelte-1xhsmgw");
    			add_location(h1, file$1, 128, 2, 3290);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "svelte-1xhsmgw");
    			add_location(input0, file$1, 134, 8, 3622);
    			attr_dev(label0, "class", "full-width svelte-1xhsmgw");
    			add_location(label0, file$1, 131, 6, 3421);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "step", "0.1");
    			attr_dev(input1, "class", "svelte-1xhsmgw");
    			add_location(input1, file$1, 138, 8, 3811);
    			attr_dev(label1, "class", "svelte-1xhsmgw");
    			add_location(label1, file$1, 136, 6, 3764);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "step", "0.1");
    			attr_dev(input2, "class", "svelte-1xhsmgw");
    			add_location(input2, file$1, 142, 8, 4019);
    			attr_dev(label2, "class", "svelte-1xhsmgw");
    			add_location(label2, file$1, 140, 6, 3970);
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "step", "1");
    			attr_dev(input3, "class", "svelte-1xhsmgw");
    			add_location(input3, file$1, 146, 8, 4216);
    			attr_dev(label3, "class", "svelte-1xhsmgw");
    			add_location(label3, file$1, 144, 6, 4176);
    			attr_dev(input4, "type", "number");
    			attr_dev(input4, "step", "0.1");
    			attr_dev(input4, "class", "svelte-1xhsmgw");
    			add_location(input4, file$1, 150, 8, 4404);
    			attr_dev(label4, "class", "svelte-1xhsmgw");
    			add_location(label4, file$1, 148, 6, 4365);
    			attr_dev(input5, "type", "number");
    			attr_dev(input5, "step", "1");
    			attr_dev(input5, "class", "svelte-1xhsmgw");
    			add_location(input5, file$1, 154, 8, 4599);
    			attr_dev(label5, "class", "svelte-1xhsmgw");
    			add_location(label5, file$1, 152, 6, 4558);
    			attr_dev(input6, "type", "number");
    			attr_dev(input6, "step", "0.1");
    			attr_dev(input6, "class", "svelte-1xhsmgw");
    			add_location(input6, file$1, 158, 8, 4788);
    			attr_dev(label6, "class", "svelte-1xhsmgw");
    			add_location(label6, file$1, 156, 6, 4748);
    			attr_dev(input7, "type", "number");
    			attr_dev(input7, "step", "0.01");
    			attr_dev(input7, "class", "svelte-1xhsmgw");
    			add_location(input7, file$1, 162, 8, 4979);
    			attr_dev(label7, "class", "svelte-1xhsmgw");
    			add_location(label7, file$1, 160, 6, 4943);
    			attr_dev(input8, "type", "number");
    			attr_dev(input8, "step", "1");
    			attr_dev(input8, "class", "svelte-1xhsmgw");
    			add_location(input8, file$1, 166, 8, 5177);
    			attr_dev(label8, "class", "svelte-1xhsmgw");
    			add_location(label8, file$1, 164, 6, 5131);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "svelte-1xhsmgw");
    			add_location(button, file$1, 169, 6, 5386);
    			attr_dev(form, "class", "svelte-1xhsmgw");
    			add_location(form, file$1, 130, 4, 3359);
    			attr_dev(main, "class", "svelte-1xhsmgw");
    			add_location(main, file$1, 129, 2, 3347);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, form);
    			append_dev(form, label0);
    			append_dev(label0, t2);
    			append_dev(label0, input0);
    			set_input_value(input0, /*ScannerInput*/ ctx[0]);
    			append_dev(form, t3);
    			append_dev(form, label1);
    			append_dev(label1, t4);
    			append_dev(label1, input1);
    			set_input_value(input1, /*Bearing_Position*/ ctx[1]);
    			append_dev(form, t5);
    			append_dev(form, label2);
    			append_dev(label2, t6);
    			append_dev(label2, input2);
    			set_input_value(input2, /*Arrow_Position*/ ctx[2]);
    			append_dev(form, t7);
    			append_dev(form, label3);
    			append_dev(label3, t8);
    			append_dev(label3, input3);
    			set_input_value(input3, /*Cw_Speed*/ ctx[4]);
    			append_dev(form, t9);
    			append_dev(form, label4);
    			append_dev(label4, t10);
    			append_dev(label4, input4);
    			set_input_value(input4, /*Amperage_CW*/ ctx[5]);
    			append_dev(form, t11);
    			append_dev(form, label5);
    			append_dev(label5, t12);
    			append_dev(label5, input5);
    			set_input_value(input5, /*Ccw_Speed*/ ctx[6]);
    			append_dev(form, t13);
    			append_dev(form, label6);
    			append_dev(label6, t14);
    			append_dev(label6, input6);
    			set_input_value(input6, /*Amperage_CCW*/ ctx[7]);
    			append_dev(form, t15);
    			append_dev(form, label7);
    			append_dev(label7, t16);
    			append_dev(label7, input7);
    			set_input_value(input7, /*Hipot_IR*/ ctx[3]);
    			append_dev(form, t17);
    			append_dev(form, label8);
    			append_dev(label8, t18);
    			append_dev(label8, input8);
    			set_input_value(input8, /*Ptc_Resistance*/ ctx[8]);
    			append_dev(form, t19);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[11]),
    					listen_dev(input0, "keydown", keydown_handler, false, false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[12]),
    					listen_dev(input1, "keydown", keydown_handler_1, false, false, false, false),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[13]),
    					listen_dev(input2, "keydown", keydown_handler_2, false, false, false, false),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[14]),
    					listen_dev(input3, "keydown", keydown_handler_3, false, false, false, false),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[15]),
    					listen_dev(input4, "keydown", keydown_handler_4, false, false, false, false),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[16]),
    					listen_dev(input5, "keydown", keydown_handler_5, false, false, false, false),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[17]),
    					listen_dev(input6, "keydown", keydown_handler_6, false, false, false, false),
    					listen_dev(input7, "input", /*input7_input_handler*/ ctx[18]),
    					listen_dev(input7, "keydown", keydown_handler_7, false, false, false, false),
    					listen_dev(input8, "input", /*input8_input_handler*/ ctx[19]),
    					listen_dev(input8, "keydown", keydown_handler_8, false, false, false, false),
    					listen_dev(button, "click", prevent_default(/*click_handler*/ ctx[20]), false, true, false, false),
    					listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[21]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*ScannerInput*/ 1 && input0.value !== /*ScannerInput*/ ctx[0]) {
    				set_input_value(input0, /*ScannerInput*/ ctx[0]);
    			}

    			if (dirty & /*Bearing_Position*/ 2 && to_number(input1.value) !== /*Bearing_Position*/ ctx[1]) {
    				set_input_value(input1, /*Bearing_Position*/ ctx[1]);
    			}

    			if (dirty & /*Arrow_Position*/ 4 && to_number(input2.value) !== /*Arrow_Position*/ ctx[2]) {
    				set_input_value(input2, /*Arrow_Position*/ ctx[2]);
    			}

    			if (dirty & /*Cw_Speed*/ 16 && to_number(input3.value) !== /*Cw_Speed*/ ctx[4]) {
    				set_input_value(input3, /*Cw_Speed*/ ctx[4]);
    			}

    			if (dirty & /*Amperage_CW*/ 32 && to_number(input4.value) !== /*Amperage_CW*/ ctx[5]) {
    				set_input_value(input4, /*Amperage_CW*/ ctx[5]);
    			}

    			if (dirty & /*Ccw_Speed*/ 64 && to_number(input5.value) !== /*Ccw_Speed*/ ctx[6]) {
    				set_input_value(input5, /*Ccw_Speed*/ ctx[6]);
    			}

    			if (dirty & /*Amperage_CCW*/ 128 && to_number(input6.value) !== /*Amperage_CCW*/ ctx[7]) {
    				set_input_value(input6, /*Amperage_CCW*/ ctx[7]);
    			}

    			if (dirty & /*Hipot_IR*/ 8 && to_number(input7.value) !== /*Hipot_IR*/ ctx[3]) {
    				set_input_value(input7, /*Hipot_IR*/ ctx[3]);
    			}

    			if (dirty & /*Ptc_Resistance*/ 256 && to_number(input8.value) !== /*Ptc_Resistance*/ ctx[8]) {
    				set_input_value(input8, /*Ptc_Resistance*/ ctx[8]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const keydown_handler = event => event.key === 'Enter' && event.preventDefault();
    const keydown_handler_1 = event => event.key === 'Enter' && event.preventDefault();
    const keydown_handler_2 = event => event.key === 'Enter' && event.preventDefault();
    const keydown_handler_3 = event => event.key === 'Enter' && event.preventDefault();
    const keydown_handler_4 = event => event.key === 'Enter' && event.preventDefault();
    const keydown_handler_5 = event => event.key === 'Enter' && event.preventDefault();
    const keydown_handler_6 = event => event.key === 'Enter' && event.preventDefault();
    const keydown_handler_7 = event => event.key === 'Enter' && event.preventDefault();
    const keydown_handler_8 = event => event.key === 'Enter' && event.preventDefault();

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('InsertData', slots, []);
    	let ScannerInput = "";
    	let Bearing_Position;
    	let Arrow_Position;
    	let Hipot_IR;
    	let Cw_Speed;
    	let Amperage_CW;
    	let Ccw_Speed;
    	let Amperage_CCW;
    	let Ptc_Resistance;
    	let ScannerInputDisabled = false;
    	let Bearing_PositionDisabled = false;
    	let Arrow_PositionDisabled = false;
    	let Hipot_IRDisabled = false;
    	let Cw_SpeedDisabled = false;
    	let Amperage_CWDisabled = false;
    	let Ccw_SpeedDisabled = false;
    	let Amperage_CCWDisabled = false;
    	let Ptc_ResistanceDisabled = false;

    	function handleSubmit() {
    		console.log("Datos enviados:", {
    			ScannerInput,
    			Bearing_Position,
    			Arrow_Position,
    			Hipot_IR,
    			Cw_Speed,
    			Amperage_CW,
    			Ccw_Speed,
    			Amperage_CCW,
    			Ptc_Resistance
    		});

    		Bl100EngineRework.InsertMotorData(ScannerInput, Bearing_Position, Arrow_Position, Hipot_IR, Cw_Speed, Amperage_CW, Ccw_Speed, Amperage_CCW, Ptc_Resistance).then(response => {
    			if (response.isSuccess = true) {
    				// Éxito: hacer algo con la respuesta
    				//console.log("Éxito:", response.message);
    				Sfx.playSuccessSoundAsync();

    				// Mostrar una alerta al usuario
    				alert("Motor registrado exitosamente.");
    			} else if (response.isSuccess = false) {
    				// Error: hacer algo con la respuesta
    				//console.error("Error:", response.message);
    				// Mostrar una alerta al usuario
    				Sfx.playFailureSoundAsync(); // ...

    				alert(`Error al registrar el motor ${response.message}. Vuelve a intentar.`);
    			} // ...
    		}).catch(error => {
    			Sfx.playFailureSoundAsync();
    			console.error("Error en la solicitud:", error);

    			// Manejar el error de la solicitud
    			//alert("Error en la solicitud. Vuelve a intentar.");
    			alert(`Error al registrar el motor [${error}]. Vuelve a intentar.`);
    		}).finally(() => {
    			// Restablecer los valores de las variables
    			$$invalidate(0, ScannerInput = "");

    			$$invalidate(1, Bearing_Position = null);
    			$$invalidate(2, Arrow_Position = null);
    			$$invalidate(3, Hipot_IR = null);
    			$$invalidate(4, Cw_Speed = null);
    			$$invalidate(5, Amperage_CW = null);
    			$$invalidate(6, Ccw_Speed = null);
    			$$invalidate(7, Amperage_CCW = null);
    			$$invalidate(8, Ptc_Resistance = null);

    			// Desbloquear todos los campos
    			ScannerInputDisabled = false;

    			Bearing_PositionDisabled = false;
    			Arrow_PositionDisabled = false;
    			Hipot_IRDisabled = false;
    			Cw_SpeedDisabled = false;
    			Amperage_CWDisabled = false;
    			Ccw_SpeedDisabled = false;
    			Amperage_CCWDisabled = false;
    			Ptc_ResistanceDisabled = false;
    		});
    	}

    	function validateForm() {
    		const requiredFields = [
    			ScannerInput,
    			Bearing_Position,
    			Arrow_Position,
    			Hipot_IR,
    			Cw_Speed,
    			Amperage_CW,
    			Ccw_Speed,
    			Amperage_CCW,
    			Ptc_Resistance
    		];

    		for (const field of requiredFields) {
    			if (!field) {
    				alert('Por favor, completa todos los campos antes de enviar.');
    				return false;
    			}
    		}

    		return true;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<InsertData> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		ScannerInput = this.value;
    		$$invalidate(0, ScannerInput);
    	}

    	function input1_input_handler() {
    		Bearing_Position = to_number(this.value);
    		$$invalidate(1, Bearing_Position);
    	}

    	function input2_input_handler() {
    		Arrow_Position = to_number(this.value);
    		$$invalidate(2, Arrow_Position);
    	}

    	function input3_input_handler() {
    		Cw_Speed = to_number(this.value);
    		$$invalidate(4, Cw_Speed);
    	}

    	function input4_input_handler() {
    		Amperage_CW = to_number(this.value);
    		$$invalidate(5, Amperage_CW);
    	}

    	function input5_input_handler() {
    		Ccw_Speed = to_number(this.value);
    		$$invalidate(6, Ccw_Speed);
    	}

    	function input6_input_handler() {
    		Amperage_CCW = to_number(this.value);
    		$$invalidate(7, Amperage_CCW);
    	}

    	function input7_input_handler() {
    		Hipot_IR = to_number(this.value);
    		$$invalidate(3, Hipot_IR);
    	}

    	function input8_input_handler() {
    		Ptc_Resistance = to_number(this.value);
    		$$invalidate(8, Ptc_Resistance);
    	}

    	const click_handler = () => handleSubmit();
    	const submit_handler = () => validateForm();

    	$$self.$capture_state = () => ({
    		onMount,
    		Sfx,
    		Bl100EngineRework,
    		ScannerInput,
    		Bearing_Position,
    		Arrow_Position,
    		Hipot_IR,
    		Cw_Speed,
    		Amperage_CW,
    		Ccw_Speed,
    		Amperage_CCW,
    		Ptc_Resistance,
    		ScannerInputDisabled,
    		Bearing_PositionDisabled,
    		Arrow_PositionDisabled,
    		Hipot_IRDisabled,
    		Cw_SpeedDisabled,
    		Amperage_CWDisabled,
    		Ccw_SpeedDisabled,
    		Amperage_CCWDisabled,
    		Ptc_ResistanceDisabled,
    		handleSubmit,
    		validateForm
    	});

    	$$self.$inject_state = $$props => {
    		if ('ScannerInput' in $$props) $$invalidate(0, ScannerInput = $$props.ScannerInput);
    		if ('Bearing_Position' in $$props) $$invalidate(1, Bearing_Position = $$props.Bearing_Position);
    		if ('Arrow_Position' in $$props) $$invalidate(2, Arrow_Position = $$props.Arrow_Position);
    		if ('Hipot_IR' in $$props) $$invalidate(3, Hipot_IR = $$props.Hipot_IR);
    		if ('Cw_Speed' in $$props) $$invalidate(4, Cw_Speed = $$props.Cw_Speed);
    		if ('Amperage_CW' in $$props) $$invalidate(5, Amperage_CW = $$props.Amperage_CW);
    		if ('Ccw_Speed' in $$props) $$invalidate(6, Ccw_Speed = $$props.Ccw_Speed);
    		if ('Amperage_CCW' in $$props) $$invalidate(7, Amperage_CCW = $$props.Amperage_CCW);
    		if ('Ptc_Resistance' in $$props) $$invalidate(8, Ptc_Resistance = $$props.Ptc_Resistance);
    		if ('ScannerInputDisabled' in $$props) ScannerInputDisabled = $$props.ScannerInputDisabled;
    		if ('Bearing_PositionDisabled' in $$props) Bearing_PositionDisabled = $$props.Bearing_PositionDisabled;
    		if ('Arrow_PositionDisabled' in $$props) Arrow_PositionDisabled = $$props.Arrow_PositionDisabled;
    		if ('Hipot_IRDisabled' in $$props) Hipot_IRDisabled = $$props.Hipot_IRDisabled;
    		if ('Cw_SpeedDisabled' in $$props) Cw_SpeedDisabled = $$props.Cw_SpeedDisabled;
    		if ('Amperage_CWDisabled' in $$props) Amperage_CWDisabled = $$props.Amperage_CWDisabled;
    		if ('Ccw_SpeedDisabled' in $$props) Ccw_SpeedDisabled = $$props.Ccw_SpeedDisabled;
    		if ('Amperage_CCWDisabled' in $$props) Amperage_CCWDisabled = $$props.Amperage_CCWDisabled;
    		if ('Ptc_ResistanceDisabled' in $$props) Ptc_ResistanceDisabled = $$props.Ptc_ResistanceDisabled;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		ScannerInput,
    		Bearing_Position,
    		Arrow_Position,
    		Hipot_IR,
    		Cw_Speed,
    		Amperage_CW,
    		Ccw_Speed,
    		Amperage_CCW,
    		Ptc_Resistance,
    		handleSubmit,
    		validateForm,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler,
    		input7_input_handler,
    		input8_input_handler,
    		click_handler,
    		submit_handler
    	];
    }

    class InsertData extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InsertData",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.59.1 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let div;
    	let appheader;
    	let t0;
    	let insertdata;
    	let t1;
    	let appfooter;
    	let current;
    	appheader = new AppHeader({ $$inline: true });
    	insertdata = new InsertData({ $$inline: true });
    	appfooter = new AppFooter({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(appheader.$$.fragment);
    			t0 = space();
    			create_component(insertdata.$$.fragment);
    			t1 = space();
    			create_component(appfooter.$$.fragment);
    			attr_dev(div, "id", "app");
    			add_location(div, file, 45, 0, 1217);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(appheader, div, null);
    			append_dev(div, t0);
    			mount_component(insertdata, div, null);
    			append_dev(div, t1);
    			mount_component(appfooter, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(appheader.$$.fragment, local);
    			transition_in(insertdata.$$.fragment, local);
    			transition_in(appfooter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(appheader.$$.fragment, local);
    			transition_out(insertdata.$$.fragment, local);
    			transition_out(appfooter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(appheader);
    			destroy_component(insertdata);
    			destroy_component(appfooter);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { lineCode = "" } = $$props;
    	let addMessage;

    	let state = {
    		name: null,
    		activePart: { number: null, revision: null },
    		activeWorkOrderCode: null,
    		pointsOfUse: [],
    		workOrder: { size: null, quantity: null }
    	};

    	// Handle for the timeout used to update the screen info.
    	let timeoutHandle = null;

    	// Handle API errors.               //<----Aqui se reciben los errores!!!!!!
    	let handleError = message => {
    		alert(message);
    	};

    	/**
     * Update the local line data on page load.
     */
    	onMount(async () => updateLineData(lineCode));

    	/**
     * Fetch line data.
     * @param lineCode Two-char line code.
     */
    	const updateLineData = async lineCode => {
    		if (lineCode) {
    			MaterialLoadingApi.getLine(lineCode).then(data => state = data).catch(handleError);
    		}
    	};

    	const writable_props = ['lineCode'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('lineCode' in $$props) $$invalidate(0, lineCode = $$props.lineCode);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		MaterialLoadingApi,
    		AppHeader,
    		Input,
    		MessageLog,
    		AppFooter,
    		InsertData,
    		lineCode,
    		addMessage,
    		state,
    		timeoutHandle,
    		handleError,
    		updateLineData
    	});

    	$$self.$inject_state = $$props => {
    		if ('lineCode' in $$props) $$invalidate(0, lineCode = $$props.lineCode);
    		if ('addMessage' in $$props) addMessage = $$props.addMessage;
    		if ('state' in $$props) state = $$props.state;
    		if ('timeoutHandle' in $$props) timeoutHandle = $$props.timeoutHandle;
    		if ('handleError' in $$props) handleError = $$props.handleError;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [lineCode];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { lineCode: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get lineCode() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lineCode(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // import App from './App.svelte';


    const app = new App({
      target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
