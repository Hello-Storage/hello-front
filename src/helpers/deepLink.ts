const getLinker = (fallbackUrl: string) => {
    const DeepLinker = (options:
        {
            onIgnored: () => void;
            onFallback: () => void;
            onReturn: () => void;
        }
    ) => {

        if (!options) throw new Error("no options");

        let hasFocus = true;
        let didHide = false;

        // window is blurred when dialogs are shown
        const onBlur = () => hasFocus = false;
        //check visibility state

        // document is hidden when native app is shown or browser is backgrounded

        const onVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                didHide = true;
            }
        }

        /*
        function onVisibilityChange(e) {
            if (e.target.visibilityState === "hidden") {
                didHide = true;
            }
        }
        */

        const onFocus = () => {
            if (didHide) {
                if (options.onReturn) options.onReturn();

                didHide = false; // reset
            } else {
                // ignore duplicate focus event when returning from native app on
                // IOS Safari 13.3+
                if (!hasFocus && options.onFallback) {
                    // wait for app switch transition to fully complete - only then is
                    // 'visibilitychange' event fired
                    setTimeout(() => {
                        // if browser was not hidden, the deep link failed
                        if (!didHide) options.onFallback();
                    }, 1000)
                }
            }

            hasFocus = true;
        }

        // add/remove event listeners
        // `mode` can be "add" or "remove"
        function bindEvents(mode: "add" | "remove") {
            const conf: [Window | Document, string, (e: Event) => void][] = [
                [window, "blur", onBlur],
                [document, "visibilitychange", onVisibilityChange],
                [window, "focus", onFocus],
            ];

            conf.forEach((item) => {
                const [target, event, handler] = item;
                target[`${mode}EventListener`](event, handler)
            })
        }

        // add event listeners

        bindEvents("add");

        // expose public API
        return {
            destroy: () => {
                bindEvents.bind(null, "remove")
            },
            openURL: (url: Location | (string & Location)) => {
                const dialogTimeout = 500

                setTimeout(() => { if (hasFocus && options.onIgnored) options.onIgnored() }, dialogTimeout)

                window.location = url;
            }
        }
    }

    const linker = DeepLinker({
        onIgnored: () => {
            window.open(fallbackUrl, "_blank")
            console.log("browser failed to respond to the deep link")
        },
        onFallback: () => {
            console.log("dialog hidden or user returned to tab")
        },
        onReturn: () => {
            console.log("user returned from native app")
        },
    })

    return linker

}

export default getLinker;