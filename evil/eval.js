let socket;
const run = {};

console.log("Eval | Boy it's dangerous!™");

console.log("Eval | Monkeypatch Function.toJSON so that functions are passed along in data.");
Function.prototype.toJSON = function() { return this.toString(); }

console.log("Eval | Creating runf...");
let runf = function(callback, ...args) {
    let index = run.create(callback);
    if (index === false) {
        run.f[run.f.length] = eval("(" + callback + ")");
    }

    args.forEach((v, i) => { args[i] = reval(v) });

    return run.f[run.f.length - 1](...args)
}

console.log("Eval | Creating reval...");
let reval = function(value) {
    if (typeof value == "object") {
        const iterator = function(key, val) {
            if (typeof val == "string") {
                if (new RegExp(`^function`).test(val)) { value[key] = eval("(" + val + ")"); }
            } else if (typeof val == "object") {
                value[key] = reval(val)
            }
        }
        
        if (Array.isArray(value)) { value.forEach((v, i) => { iterator(i, v); }); } else { Object.entries(value).forEach(v => { iterator(v[0], v[1]); }); }
    }
    return value;
}

Hooks.once("socketlib.ready", _ => {
	socket = socketlib.registerModule("eval");
    socket.register("run", runf);
    console.log("Eval | Globally registered run through socketlib.");
});

Hooks.once("ready", async _ => {
    //cache all functions here
    run.f = []

    //checks cache for function or adds function to each player's local cache
    run.create = function(callback) {
        let c = callback.toString()
        let cached = false;

        run.f.every((func, i) => {
            if (func == c) {
                cached = i;
                return false;
            }
        })

        return cached;
    }

    console.log("Eval | Creating run.* functions...")

    run.forEveryone = async function(callback, ...args) {
        socket.executeForEveryone("run", callback, ...args);
    }

    run.forOthers = async function(callback, ...args) {
        socket.executeForOthers("run", callback, ...args);
    }

    run.forGMs = async function(callback, ...args) {
        socket.executeForAllGMs("run", callback, ...args);
    }

    run.forOtherGMs = async function(callback, ...args) {
        socket.executeForOtherGMs("run", callback, ...args);
    }

    run.asGM = async function(callback, ...args) {
        return await socket.executeAsGM("run", callback, ...args);
    }

    run.asUser = async function(callback, userID, ...args) {
        return await socket.executeAsUser("run", callback, ...args, userID);
    }

    console.log("Eval | All done!")
});