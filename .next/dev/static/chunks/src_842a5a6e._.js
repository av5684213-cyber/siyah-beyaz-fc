(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/components/ErrorBoundary.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ErrorBoundary",
    ()=>ErrorBoundary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
'use client';
;
;
class ErrorBoundary extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Component {
    constructor(props){
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }
    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary] Client error:', error);
        console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
        this.setState({
            errorInfo
        });
    }
    render() {
        if (this.state.hasError) {
            const errorMsg = this.state.error?.message || 'Bilinmeyen hata';
            const errorStack = this.state.error?.stack || '';
            const componentStack = this.state.errorInfo?.componentStack || '';
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-screen bg-black flex items-center justify-center p-10 text-center overflow-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4 max-w-2xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-4xl font-black italic",
                            children: "BİR HATA OLUŞTU"
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/ErrorBoundary.tsx",
                            lineNumber: 36,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-white/40",
                            children: "Sayfayı yenilemeyi deneyin veya yöneticiye başvurun."
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/ErrorBoundary.tsx",
                            lineNumber: 37,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-red-900/30 border border-red-500/30 rounded-lg p-4 text-left text-xs font-mono text-red-300 overflow-auto max-h-60",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-bold text-red-400 mb-2",
                                    children: [
                                        "Hata: ",
                                        errorMsg
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/components/ErrorBoundary.tsx",
                                    lineNumber: 39,
                                    columnNumber: 15
                                }, this),
                                errorStack && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                    className: "whitespace-pre-wrap mb-2",
                                    children: errorStack.split('\n').slice(0, 5).join('\n')
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/ErrorBoundary.tsx",
                                    lineNumber: 40,
                                    columnNumber: 30
                                }, this),
                                componentStack && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                    className: "whitespace-pre-wrap text-yellow-300",
                                    children: componentStack
                                }, void 0, false, {
                                    fileName: "[project]/src/app/components/ErrorBoundary.tsx",
                                    lineNumber: 41,
                                    columnNumber: 34
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/components/ErrorBoundary.tsx",
                            lineNumber: 38,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>window.location.reload(),
                            className: "px-6 py-2 bg-white text-black font-bold uppercase rounded-lg hover:bg-white/90 transition-colors",
                            children: "YENİLE"
                        }, void 0, false, {
                            fileName: "[project]/src/app/components/ErrorBoundary.tsx",
                            lineNumber: 43,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/components/ErrorBoundary.tsx",
                    lineNumber: 35,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/components/ErrorBoundary.tsx",
                lineNumber: 34,
                columnNumber: 9
            }, this);
        }
        return this.props.children;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/use-toast.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "reducer",
    ()=>reducer,
    "toast",
    ()=>toast,
    "useToast",
    ()=>useToast
]);
// Inspired by react-hot-toast library
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;
const actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST"
};
let count = 0;
function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER;
    return count.toString();
}
const toastTimeouts = new Map();
const addToRemoveQueue = (toastId)=>{
    if (toastTimeouts.has(toastId)) {
        return;
    }
    const timeout = setTimeout(()=>{
        toastTimeouts.delete(toastId);
        dispatch({
            type: "REMOVE_TOAST",
            toastId: toastId
        });
    }, TOAST_REMOVE_DELAY);
    toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action)=>{
    switch(action.type){
        case "ADD_TOAST":
            return {
                ...state,
                toasts: [
                    action.toast,
                    ...state.toasts
                ].slice(0, TOAST_LIMIT)
            };
        case "UPDATE_TOAST":
            return {
                ...state,
                toasts: state.toasts.map((t)=>t.id === action.toast.id ? {
                        ...t,
                        ...action.toast
                    } : t)
            };
        case "DISMISS_TOAST":
            {
                const { toastId } = action;
                // ! Side effects ! - This could be extracted into a dismissToast() action,
                // but I'll keep it here for simplicity
                if (toastId) {
                    addToRemoveQueue(toastId);
                } else {
                    state.toasts.forEach((toast)=>{
                        addToRemoveQueue(toast.id);
                    });
                }
                return {
                    ...state,
                    toasts: state.toasts.map((t)=>t.id === toastId || toastId === undefined ? {
                            ...t,
                            open: false
                        } : t)
                };
            }
        case "REMOVE_TOAST":
            if (action.toastId === undefined) {
                return {
                    ...state,
                    toasts: []
                };
            }
            return {
                ...state,
                toasts: state.toasts.filter((t)=>t.id !== action.toastId)
            };
    }
};
const listeners = [];
let memoryState = {
    toasts: []
};
function dispatch(action) {
    memoryState = reducer(memoryState, action);
    listeners.forEach((listener)=>{
        listener(memoryState);
    });
}
function toast({ ...props }) {
    // ── Sayfa arka plandayken toast gösterme ──
    // Bu kontrol hem doğrudan toast() çağrılarında hem de
    // showToast() wrapper'ı üzerinden yapılan çağrılarda çalışır.
    if (typeof document !== 'undefined' && document.hidden) {
        return {
            id: 'hidden-skip',
            dismiss: ()=>{},
            update: ()=>{}
        };
    }
    const id = genId();
    const update = (props)=>dispatch({
            type: "UPDATE_TOAST",
            toast: {
                ...props,
                id
            }
        });
    const dismiss = ()=>dispatch({
            type: "DISMISS_TOAST",
            toastId: id
        });
    dispatch({
        type: "ADD_TOAST",
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open)=>{
                if (!open) dismiss();
            }
        }
    });
    return {
        id: id,
        dismiss,
        update
    };
}
function useToast() {
    _s();
    const [state, setState] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](memoryState);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "useToast.useEffect": ()=>{
            listeners.push(setState);
            return ({
                "useToast.useEffect": ()=>{
                    const index = listeners.indexOf(setState);
                    if (index > -1) {
                        listeners.splice(index, 1);
                    }
                }
            })["useToast.useEffect"];
        }
    }["useToast.useEffect"], [
        state
    ]);
    return {
        ...state,
        toast,
        dismiss: (toastId)=>dispatch({
                type: "DISMISS_TOAST",
                toastId
            })
    };
}
_s(useToast, "SPWE98mLGnlsnNfIwu/IAKTSZtk=");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/usePageVisibility.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePageVisibility",
    ()=>usePageVisibility
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
function usePageVisibility() {
    _s();
    const [isPageVisible, setIsPageVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const handleVisibilityChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "usePageVisibility.useCallback[handleVisibilityChange]": ()=>{
            setIsPageVisible(!document.hidden);
        }
    }["usePageVisibility.useCallback[handleVisibilityChange]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "usePageVisibility.useEffect": ()=>{
            // İlk yüklemede mevcut durumu ayarla
            setIsPageVisible(!document.hidden);
            document.addEventListener('visibilitychange', handleVisibilityChange);
            return ({
                "usePageVisibility.useEffect": ()=>{
                    document.removeEventListener('visibilitychange', handleVisibilityChange);
                }
            })["usePageVisibility.useEffect"];
        }
    }["usePageVisibility.useEffect"], [
        handleVisibilityChange
    ]);
    return isPageVisible;
}
_s(usePageVisibility, "DITpsWGxFpiPImvttySeM7Koc0w=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/toast.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Toast",
    ()=>Toast,
    "ToastAction",
    ()=>ToastAction,
    "ToastClose",
    ()=>ToastClose,
    "ToastDescription",
    ()=>ToastDescription,
    "ToastProvider",
    ()=>ToastProvider,
    "ToastTitle",
    ()=>ToastTitle,
    "ToastViewport",
    ()=>ToastViewport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-toast/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
;
;
const ToastProvider = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Provider"];
const ToastViewport = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Viewport"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 16,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = ToastViewport;
ToastViewport.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Viewport"].displayName;
const toastVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full", {
    variants: {
        variant: {
            default: "border bg-background text-foreground",
            destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
        }
    },
    defaultVariants: {
        variant: "default"
    }
});
const Toast = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c2 = ({ className, variant, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(toastVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
});
_c3 = Toast;
Toast.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"].displayName;
const ToastAction = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c4 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Action"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 62,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c5 = ToastAction;
ToastAction.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Action"].displayName;
const ToastClose = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c6 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Close"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600", className),
        "toast-close": "",
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
            className: "h-4 w-4"
        }, void 0, false, {
            fileName: "[project]/src/components/ui/toast.tsx",
            lineNumber: 86,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 77,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c7 = ToastClose;
ToastClose.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Close"].displayName;
const ToastTitle = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c8 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Title"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-sm font-semibold [&+div]:text-xs", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 95,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c9 = ToastTitle;
ToastTitle.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Title"].displayName;
const ToastDescription = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c10 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Description"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-sm opacity-90", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 107,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c11 = ToastDescription;
ToastDescription.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Description"].displayName;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11;
__turbopack_context__.k.register(_c, "ToastViewport$React.forwardRef");
__turbopack_context__.k.register(_c1, "ToastViewport");
__turbopack_context__.k.register(_c2, "Toast$React.forwardRef");
__turbopack_context__.k.register(_c3, "Toast");
__turbopack_context__.k.register(_c4, "ToastAction$React.forwardRef");
__turbopack_context__.k.register(_c5, "ToastAction");
__turbopack_context__.k.register(_c6, "ToastClose$React.forwardRef");
__turbopack_context__.k.register(_c7, "ToastClose");
__turbopack_context__.k.register(_c8, "ToastTitle$React.forwardRef");
__turbopack_context__.k.register(_c9, "ToastTitle");
__turbopack_context__.k.register(_c10, "ToastDescription$React.forwardRef");
__turbopack_context__.k.register(_c11, "ToastDescription");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/toaster.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Toaster",
    ()=>Toaster
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-toast.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$usePageVisibility$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/usePageVisibility.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/toast.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function Toaster() {
    _s();
    const { toasts } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const isPageVisible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$usePageVisibility$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePageVisibility"])();
    // Sayfa arka plandayken toast'ları render etme
    if (!isPageVisible) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToastProvider"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToastViewport"], {}, void 0, false, {
                fileName: "[project]/src/components/ui/toaster.tsx",
                lineNumber: 22,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/ui/toaster.tsx",
            lineNumber: 21,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToastProvider"], {
        children: [
            toasts.map(function({ id, title, description, action, ...props }) {
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Toast"], {
                    ...props,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-1",
                            children: [
                                title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToastTitle"], {
                                    children: title
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ui/toaster.tsx",
                                    lineNumber: 33,
                                    columnNumber: 25
                                }, this),
                                description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToastDescription"], {
                                    children: description
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ui/toaster.tsx",
                                    lineNumber: 35,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ui/toaster.tsx",
                            lineNumber: 32,
                            columnNumber: 13
                        }, this),
                        action,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToastClose"], {}, void 0, false, {
                            fileName: "[project]/src/components/ui/toaster.tsx",
                            lineNumber: 39,
                            columnNumber: 13
                        }, this)
                    ]
                }, id, true, {
                    fileName: "[project]/src/components/ui/toaster.tsx",
                    lineNumber: 31,
                    columnNumber: 11
                }, this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToastViewport"], {}, void 0, false, {
                fileName: "[project]/src/components/ui/toaster.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/toaster.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
_s(Toaster, "Y/xcOZUwakvOki6yWU+9j5IkFpk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$usePageVisibility$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePageVisibility"]
    ];
});
_c = Toaster;
var _c;
__turbopack_context__.k.register(_c, "Toaster");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "REALTIME_TABLES",
    ()=>REALTIME_TABLES,
    "createBrowserClient",
    ()=>createBrowserClient,
    "createServerClient",
    ()=>createServerClient,
    "enableRealtime",
    ()=>enableRealtime,
    "getSupabase",
    ()=>getSupabase,
    "isSupabaseConfigured",
    ()=>isSupabaseConfigured
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-client] (ecmascript)");
;
;
function isSupabaseConfigured() {
    const url = ("TURBOPACK compile-time value", "https://jmxbyaamwbpnvgbnjbmo.supabase.co");
    const key = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteGJ5YWFtd2JwbnZnYm5qYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzA1OTcsImV4cCI6MjA5MzE0NjU5N30.08BRMYj5CrsOdv66E-c38u4BJvo7b3PQ3ltCAKtmBbI");
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // Placeholder/örnek değerleri tespit et — gerçek Supabase URL'leri .supabase.co ile biter ve key JWT formatındadır
    if (url === 'placeholder' || url.includes('placeholder')) return false;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (!url.includes('.supabase.co')) return false;
    // Basit JWT formatı kontrolü (3 parça, base64)
    if (key.split('.').length < 3) return false;
    return true;
}
async function createServerClient() {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
    // Dynamic import: `next/headers` sadece server-side çalışır,
    // client component'lerden import edildiğinde build hatası vermemesi için
    // lazy loading kullanıyoruz.
    const { cookies } = await __turbopack_context__.A("[project]/node_modules/next/headers.js [app-client] (ecmascript, async loader)");
    const cookieStore = await cookies();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://jmxbyaamwbpnvgbnjbmo.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteGJ5YWFtd2JwbnZnYm5qYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzA1OTcsImV4cCI6MjA5MzE0NjU5N30.08BRMYj5CrsOdv66E-c38u4BJvo7b3PQ3ltCAKtmBbI"), {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {
                // The `setAll` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing sessions.
                }
            }
        }
    });
}
// ─── Browser-side client (singleton pattern) ───────────────────────
// Tarayıcıda tek oturum olduğu için singleton kullanımı güvenlidir.
let browserInstance = null;
function createBrowserClient() {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
    if (!browserInstance) {
        browserInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createBrowserClient"])(("TURBOPACK compile-time value", "https://jmxbyaamwbpnvgbnjbmo.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteGJ5YWFtd2JwbnZnYm5qYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzA1OTcsImV4cCI6MjA5MzE0NjU5N30.08BRMYj5CrsOdv66E-c38u4BJvo7b3PQ3ltCAKtmBbI"));
    }
    return browserInstance;
}
function getSupabase() {
    if (!isSupabaseConfigured()) return null;
    const isServer = ("TURBOPACK compile-time value", "object") === 'undefined';
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // Client-side: @supabase/ssr tabanlı singleton
    return createBrowserClient();
}
function enableRealtime(tableNames) {
    // Bu fonksiyon bilgi amaçlıdır. Gerçek etkinleştirme SQL migration ile yapılır.
    // Aşağıdaki SQL'i Supabase Dashboard > SQL Editor'de çalıştırın:
    //
    // ALTER TABLE match_chat REPLICA IDENTITY FULL;
    // ALTER TABLE manager_messages REPLICA IDENTITY FULL;
    // ALTER TABLE manager_conversations REPLICA IDENTITY FULL;
    // ALTER TABLE manager_presence REPLICA IDENTITY FULL;
    //
    // Ardından Dashboard > Database > Replication'da tabloları etkinleştirin.
    const note = [
        'Realtime etkinleştirme için şu SQL\'i Supabase Dashboard\'da çalıştırın:',
        ...tableNames.map((t)=>`ALTER TABLE ${t} REPLICA IDENTITY FULL;`),
        '',
        'Ardından Dashboard > Database > Replication\'da tabloları etkinleştirin.',
        'Client tarafında sadece .on("postgres_changes", ...) ile abone olun.'
    ].join('\n');
    return {
        enabled: tableNames,
        note
    };
}
const REALTIME_TABLES = [
    'match_chat',
    'manager_messages',
    'manager_conversations',
    'manager_presence'
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/contexts/AuthContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
const AuthProvider = ({ children })=>{
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [session, setSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isDemoMode, setIsDemoMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
                // Sabit demo ID — Supabase'de bu ID ile profil VARSA direkt oyuna girer
                // Profil YOKSA ManagerRegistration gösterilir, kullanıcı kendi kulübünü kurar
                const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
                // Eski localStorage demo ID'lerini temizle
                if ("TURBOPACK compile-time truthy", 1) {
                    localStorage.removeItem('sb_demo_user_id');
                }
                const demoId = DEMO_USER_ID;
                const demoUser = {
                    id: demoId,
                    email: 'demo@siyahbeyazfm.com',
                    aud: 'authenticated',
                    role: 'authenticated',
                    app_metadata: {},
                    user_metadata: {},
                    created_at: new Date().toISOString()
                };
                const demoToken = btoa(`demo-${demoId}-${Date.now()}-${Math.random()}`);
                const demoSession = {
                    access_token: demoToken,
                    token_type: 'bearer',
                    expires_at: Math.floor(Date.now() / 1000) + 86400,
                    user: demoUser
                };
                setUser(demoUser);
                setSession(demoSession);
                setIsDemoMode(true);
                setLoading(false);
                // NOT: Profil otomatik oluşturulmuyor.
                // page.tsx'de profil yoksa ManagerRegistration gösterilir,
                // kullanıcı kendi takım ismi, renkleri ve felsefesini seçer.
                return;
            }
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
            // Get initial session
            supabase.auth.getSession().then({
                "AuthProvider.useEffect": ({ data: { session: s } })=>{
                    setSession(s);
                    setUser(s?.user ?? null);
                    setLoading(false);
                }
            }["AuthProvider.useEffect"]);
            // Listen for auth changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange({
                "AuthProvider.useEffect": (_event, s)=>{
                    setSession(s);
                    setUser(s?.user ?? null);
                    setLoading(false);
                }
            }["AuthProvider.useEffect"]);
            return ({
                "AuthProvider.useEffect": ()=>subscription.unsubscribe()
            })["AuthProvider.useEffect"];
        }
    }["AuthProvider.useEffect"], []);
    const signUp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[signUp]": async (email, password, metadata)=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return {
                error: 'Supabase yapılandırılmamış'
            };
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata || {}
                }
            });
            return {
                error: error?.message ?? null
            };
        }
    }["AuthProvider.useCallback[signUp]"], []);
    const signIn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[signIn]": async (email, password)=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return {
                error: 'Supabase yapılandırılmamış'
            };
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            return {
                error: error?.message ?? null
            };
        }
    }["AuthProvider.useCallback[signIn]"], []);
    const signOut = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[signOut]": async ()=>{
            // Supabase oturumunu kapat (yapılandırılmışsa)
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
                try {
                    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                    await supabase.auth.signOut();
                } catch  {}
            }
            // Her durumda state'i ve localStorage'ı temizle
            setUser(null);
            setSession(null);
        }
    }["AuthProvider.useCallback[signOut]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            session,
            loading,
            isDemoMode,
            signUp,
            signIn,
            signOut
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/AuthContext.tsx",
        lineNumber: 117,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(AuthProvider, "cAc821k+U/vGzHoOF5ZV0E8oJXs=");
_c = AuthProvider;
const useAuth = ()=>{
    _s1();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
_s1(useAuth, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/fm/types.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Pozisyon gruplari ve spesifik mevkiler
__turbopack_context__.s([
    "AWARD_LABELS",
    ()=>AWARD_LABELS,
    "FITNESS_THRESHOLDS",
    ()=>FITNESS_THRESHOLDS,
    "getDefaultActiveTactic",
    ()=>getDefaultActiveTactic,
    "getDefaultGameTactics",
    ()=>getDefaultGameTactics,
    "getDefaultTrainingState",
    ()=>getDefaultTrainingState
]);
const AWARD_LABELS = {
    golden_boot: {
        title: 'Altın Krampon',
        icon: '👢',
        color: 'text-yellow-400'
    },
    mvp: {
        title: 'En Değerli Oyuncu',
        icon: '⭐',
        color: 'text-amber-300'
    },
    best_gk: {
        title: 'En İyi Kaleci',
        icon: '🧤',
        color: 'text-emerald-400'
    },
    top_assists: {
        title: 'Asist Kralı',
        icon: '🎯',
        color: 'text-blue-400'
    },
    best_young: {
        title: 'En İyi Genç',
        icon: '🌟',
        color: 'text-purple-400'
    },
    fair_play: {
        title: 'Fair Play',
        icon: '🤝',
        color: 'text-green-400'
    },
    champion: {
        title: 'Şampiyon',
        icon: '🏆',
        color: 'text-yellow-300'
    },
    fastest_goal: {
        title: 'En Hızlı Gol',
        icon: '⚡',
        color: 'text-cyan-400'
    },
    most_saves: {
        title: 'En Çok Kurtarış',
        icon: '🛡️',
        color: 'text-teal-400'
    },
    best_defender: {
        title: 'En İyi Savunmacı',
        icon: '🧱',
        color: 'text-lime-400'
    },
    most_motm: {
        title: 'En Çok Maçın Adamı',
        icon: '🎖️',
        color: 'text-rose-400'
    },
    clean_sheet_win: {
        title: 'Gol Yemeden Kazanma',
        icon: '🔒',
        color: 'text-indigo-400'
    },
    longest_streak: {
        title: 'En Uzun Galibiyet Serisi',
        icon: '🔥',
        color: 'text-orange-400'
    }
};
const FITNESS_THRESHOLDS = {
    CRITICAL: 70,
    LOW: 89,
    HIGH: 90
};
const getDefaultActiveTactic = ()=>({
        formation: '4-4-2',
        mentality: 3,
        pressing: false,
        passingStyle: 'Karışık',
        intensity: 'normal',
        lineHeight: 50,
        width: 50,
        aggression: 50,
        passingIntensity: 50,
        screenKeeper: false,
        wasteTime: false,
        parkTheBus: false,
        crossGame: false,
        loneStrikerCounter: false,
        offsideTrap: false,
        playStyle: 'dengeli',
        tempo: 'normal',
        defensiveLine: 'normal'
    });
const getDefaultGameTactics = ()=>({
        ...getDefaultActiveTactic()
    });
const getDefaultTrainingState = ()=>({
        assignments: [],
        coachQuality: 1.0,
        lastSessionResults: {},
        scouting: {
            scouts: [],
            foundPlayersPool: [],
            history: [],
            watchlist: []
        }
    });
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/fm/sharedUtils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * sharedUtils.ts — Tekrarlanan kod pattern'lerini merkezileştiren utility modülü
 *
 * Çözülen teknik borçlar:
 * - JSON parse pattern tekrarı (typeof x === 'string' ? JSON.parse(x) : x)
 * - Stat keys listesinin 3+ yerde tekrarı
 * - Youth player mapping'inin persistence.ts ve cron route'unda kopyası
 * - buildStatsObject'inin birden fazla yerde tanımı
 */ // ═══════════════════════════════════════════════════════════════
// JSON PARSE UTILITY
// ═══════════════════════════════════════════════════════════════
/**
 * Supabase'den gelen JSONB alanını güvenli şekilde parse eder.
 * Supabase bazen JSONB'yi string olarak döner, bazen direkt obje olarak.
 *
 * @param value - Parse edilecek değer (string, obje, veya null/undefined)
 * @param fallback - Parse başarısız olursa veya değer null ise dönecek varsayılan
 * @returns Parse edilmiş değer veya fallback
 *
 * @example
 * const stats = safeJsonParse(row.stats, {});
 * const traits = safeJsonParse(row.traits, []);
 */ __turbopack_context__.s([
    "CORE_STAT_KEYS",
    ()=>CORE_STAT_KEYS,
    "DEFAULT_STAT_VALUES",
    ()=>DEFAULT_STAT_VALUES,
    "MENTAL_STAT_KEYS",
    ()=>MENTAL_STAT_KEYS,
    "PHYSICAL_STAT_KEYS",
    ()=>PHYSICAL_STAT_KEYS,
    "TECHNICAL_STAT_KEYS",
    ()=>TECHNICAL_STAT_KEYS,
    "VALUATION_STAT_KEYS",
    ()=>VALUATION_STAT_KEYS,
    "YOUTH_STAT_KEYS",
    ()=>YOUTH_STAT_KEYS,
    "buildStatsObject",
    ()=>buildStatsObject,
    "mapYouthPlayerFromRow",
    ()=>mapYouthPlayerFromRow,
    "requireSupabase",
    ()=>requireSupabase,
    "safeJsonParse",
    ()=>safeJsonParse
]);
function safeJsonParse(value, fallback) {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') {
        if (value === '' || value === 'null' || value === 'undefined') return fallback;
        try {
            return JSON.parse(value);
        } catch  {
            return fallback;
        }
    }
    if (typeof value === 'object') return value;
    return fallback;
}
const CORE_STAT_KEYS = [
    'speed',
    'passing',
    'shooting',
    'defending',
    'power',
    'goalkeeping'
];
const TECHNICAL_STAT_KEYS = [
    'finishing',
    'dribbling',
    'firstTouch',
    'crossing',
    'marking',
    'tackling',
    'technique',
    'longShots',
    'offTheBall',
    'heading'
];
const MENTAL_STAT_KEYS = [
    'aggression',
    'bravery',
    'workRate',
    'decisions',
    'determination',
    'concentration',
    'leadership',
    'anticipation',
    'flair',
    'positioning',
    'composure',
    'teamwork',
    'vision'
];
const PHYSICAL_STAT_KEYS = [
    'agility',
    'balance',
    'strength',
    'acceleration',
    'jumping',
    'stamina',
    'control'
];
const YOUTH_STAT_KEYS = [
    ...CORE_STAT_KEYS,
    ...TECHNICAL_STAT_KEYS,
    ...MENTAL_STAT_KEYS,
    ...PHYSICAL_STAT_KEYS
];
const VALUATION_STAT_KEYS = [
    'speed',
    'passing',
    'shooting',
    'finishing',
    'dribbling',
    'defending',
    'tackling',
    'heading',
    'crossing',
    'longShots',
    'technique',
    'firstTouch',
    'vision',
    'anticipation',
    'composure',
    'workRate',
    'strength',
    'stamina',
    'agility'
];
const DEFAULT_STAT_VALUES = {
    speed: 50,
    passing: 50,
    shooting: 50,
    defending: 50,
    power: 50,
    goalkeeping: 15,
    finishing: 50,
    dribbling: 50,
    firstTouch: 50,
    crossing: 50,
    marking: 50,
    tackling: 50,
    technique: 50,
    longShots: 50,
    offTheBall: 50,
    heading: 50,
    aggression: 50,
    bravery: 50,
    workRate: 50,
    decisions: 50,
    determination: 50,
    concentration: 50,
    leadership: 30,
    anticipation: 50,
    flair: 20,
    positioning: 50,
    composure: 50,
    teamwork: 50,
    vision: 50,
    agility: 50,
    balance: 50,
    strength: 50,
    acceleration: 50,
    jumping: 50,
    stamina: 60,
    control: 50
};
function mapYouthPlayerFromRow(row) {
    const stats = safeJsonParse(row.stats, {});
    const personalityTraits = safeJsonParse(row.personality_traits, []);
    const traits = safeJsonParse(row.traits, []);
    const traitLevels = safeJsonParse(row.trait_levels, {});
    const scoutReport = safeJsonParse(row.scout_report, null);
    const statsGained = safeJsonParse(row.stats_gained_this_season, {});
    return {
        id: row.id,
        name: row.name,
        age: row.age,
        position: row.position,
        specificPosition: row.specific_position,
        rating: row.rating,
        potential: row.potential,
        hidden_potential: row.hidden_potential,
        academyLevel: row.academy_level,
        joinDate: row.join_date,
        weeklyTrainingHours: row.weekly_training_hours,
        totalTrainingWeeks: row.total_training_weeks,
        developmentCurve: row.development_curve,
        isWonderkid: row.is_wonderkid,
        category: row.category,
        scoutReport,
        personalityTraits,
        traits,
        traitLevels: Object.keys(traitLevels).length > 0 ? traitLevels : undefined,
        // Primary stats from stats JSONB
        speed: stats.speed ?? DEFAULT_STAT_VALUES.speed,
        passing: stats.passing ?? DEFAULT_STAT_VALUES.passing,
        shooting: stats.shooting ?? DEFAULT_STAT_VALUES.shooting,
        defending: stats.defending ?? DEFAULT_STAT_VALUES.defending,
        power: stats.power ?? DEFAULT_STAT_VALUES.power,
        goalkeeping: stats.goalkeeping ?? DEFAULT_STAT_VALUES.goalkeeping,
        // Technical
        finishing: stats.finishing ?? DEFAULT_STAT_VALUES.finishing,
        dribbling: stats.dribbling ?? DEFAULT_STAT_VALUES.dribbling,
        firstTouch: stats.firstTouch ?? DEFAULT_STAT_VALUES.firstTouch,
        crossing: stats.crossing ?? DEFAULT_STAT_VALUES.crossing,
        marking: stats.marking ?? DEFAULT_STAT_VALUES.marking,
        tackling: stats.tackling ?? DEFAULT_STAT_VALUES.tackling,
        technique: stats.technique ?? DEFAULT_STAT_VALUES.technique,
        longShots: stats.longShots ?? DEFAULT_STAT_VALUES.longShots,
        offTheBall: stats.offTheBall ?? DEFAULT_STAT_VALUES.offTheBall,
        heading: stats.heading ?? DEFAULT_STAT_VALUES.heading,
        // Mental
        aggression: stats.aggression ?? DEFAULT_STAT_VALUES.aggression,
        bravery: stats.bravery ?? DEFAULT_STAT_VALUES.bravery,
        workRate: stats.workRate ?? DEFAULT_STAT_VALUES.workRate,
        decisions: stats.decisions ?? DEFAULT_STAT_VALUES.decisions,
        determination: stats.determination ?? DEFAULT_STAT_VALUES.determination,
        concentration: stats.concentration ?? DEFAULT_STAT_VALUES.concentration,
        leadership: stats.leadership ?? DEFAULT_STAT_VALUES.leadership,
        anticipation: stats.anticipation ?? DEFAULT_STAT_VALUES.anticipation,
        flair: stats.flair ?? DEFAULT_STAT_VALUES.flair,
        positioning: stats.positioning ?? DEFAULT_STAT_VALUES.positioning,
        composure: stats.composure ?? DEFAULT_STAT_VALUES.composure,
        teamwork: stats.teamwork ?? DEFAULT_STAT_VALUES.teamwork,
        vision: stats.vision ?? DEFAULT_STAT_VALUES.vision,
        // Physical
        agility: stats.agility ?? DEFAULT_STAT_VALUES.agility,
        balance: stats.balance ?? DEFAULT_STAT_VALUES.balance,
        strength: stats.strength ?? DEFAULT_STAT_VALUES.strength,
        acceleration: stats.acceleration ?? stats.speed ?? DEFAULT_STAT_VALUES.acceleration,
        jumping: stats.jumping ?? DEFAULT_STAT_VALUES.jumping,
        stamina: stats.stamina ?? DEFAULT_STAT_VALUES.stamina,
        control: stats.control ?? DEFAULT_STAT_VALUES.control,
        // Condition
        cond: row.cond ?? 85,
        form: row.form ?? 60,
        morale: row.morale ?? 70,
        confidence: row.confidence ?? 60,
        // Injury
        injured: row.injured ?? false,
        injuryWeeksRemaining: row.injury_weeks_remaining ?? 0,
        // Stats gained
        statsGainedThisSeason: statsGained
    };
}
function buildStatsObject(player) {
    const stats = {};
    for (const key of YOUTH_STAT_KEYS){
        const val = player[key];
        if (typeof val === 'number') {
            stats[key] = val;
        }
    }
    return stats;
}
function requireSupabase() {
    const { getSupabase, isSupabaseConfigured } = __turbopack_context__.r("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase yapılandırılmamış');
    }
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client null');
    }
    return supabase;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/fm/persistence.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkConnectionHealth",
    ()=>checkConnectionHealth,
    "getMatchPreparations",
    ()=>getMatchPreparations,
    "loadActiveTactic",
    ()=>loadActiveTactic,
    "loadFixtures",
    ()=>loadFixtures,
    "loadLastMatchResult",
    ()=>loadLastMatchResult,
    "loadLeague",
    ()=>loadLeague,
    "loadMatchHistory",
    ()=>loadMatchHistory,
    "loadPlayers",
    ()=>loadPlayers,
    "loadProfile",
    ()=>loadProfile,
    "loadTrainingState",
    ()=>loadTrainingState,
    "loadWatchlist",
    ()=>loadWatchlist,
    "loadYouthFacilities",
    ()=>loadYouthFacilities,
    "loadYouthPlayers",
    ()=>loadYouthPlayers,
    "removeFromWatchlist",
    ()=>removeFromWatchlist,
    "resetLeague",
    ()=>resetLeague,
    "saveActiveTactic",
    ()=>saveActiveTactic,
    "saveCredits",
    ()=>saveCredits,
    "saveLeague",
    ()=>saveLeague,
    "saveMatchResult",
    ()=>saveMatchResult,
    "savePlayers",
    ()=>savePlayers,
    "saveProfile",
    ()=>saveProfile,
    "saveTrainingState",
    ()=>saveTrainingState,
    "saveWatchlist",
    ()=>saveWatchlist,
    "saveYouthFacilities",
    ()=>saveYouthFacilities,
    "saveYouthPlayers",
    ()=>saveYouthPlayers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/sharedUtils.ts [app-client] (ecmascript)");
;
;
const STORAGE_KEYS = {
    PROFILE: 'fm_profile',
    SQUAD: 'fm_squad',
    LEAGUE: 'fm_league',
    TACTIC: 'fm_active_tactic',
    TRAINING: 'fm_training_state',
    WATCHLIST: 'fm_watchlist',
    LAST_MATCH: 'fm_last_match',
    YOUTH_PLAYERS: 'fm_youth_players',
    YOUTH_FACILITIES: 'fm_youth_facilities'
};
const loadProfile = async (userId)=>{
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
        const { data } = await supabase.from('profiles').select('id,manager_name,team_name,league_name,level,xp,money,fans,reputation,credits,current_day,team_id,defense_powers,ticket_price,academy_level,academy_extra_slots,stadium_capacity,region,active_upgrade_type,active_upgrade_id,active_upgrade_finish_day,active_upgrade_speedup,active_upgrade_started_at,active_upgrade_end_at,stadium_upgrades,sponsors,philosophy,primary_color,secondary_color,stadium_name,is_bot,bot_difficulty,academy_weekly_budget,last_youth_intake_season,total_trophies,total_awards,season_badges,hof_count,created_at,scout_slots,staff_coaches,staff_physios,staff_monthly_fees').eq('id', userId).single();
        return data || null;
    }
    const local = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!local) return null;
    const profile = JSON.parse(local);
    // Offline modda: profil farklı bir userId'ye sahipse bile yükle
    // (demo user ID değişmiş olabilir ama veri hala geçerli)
    // Ancak şu anki userId ile profil ID'si farklıysa, profili güncelle
    if (profile && profile.id !== userId) {
        profile.id = userId;
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    }
    return profile;
};
const loadPlayers = async (userId, teamName)=>{
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
        const mapPlayer = (p)=>{
            const extra = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safeJsonParse"])(p.personality, {});
            return {
                ...p,
                ...extra,
                club: p.team_name || p.club || extra.club || undefined,
                rating: p.rating ?? p.klt ?? 60,
                potential: p.potential ?? p.klt ?? p.rating ?? 70,
                passing: p.passing ?? p.pas ?? 50,
                shooting: p.shooting ?? p.sut ?? 50,
                defending: p.defending ?? p.tk ?? 50,
                speed: p.speed ?? p.hiz ?? 50,
                power: p.power ?? p.guc ?? 50,
                vision: p.vision ?? p.alg ?? 50,
                control: p.control ?? p.top ?? 50,
                heading: p.heading ?? p.kfa ?? 50,
                goalkeeping: p.goalkeeping ?? p.klc ?? 10,
                scouting_stars: p.scouting_stars,
                scouting_count: p.scouting_count,
                preferred_foot: p.preferred_foot,
                injury: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safeJsonParse"])(p.injury, null),
                // ADIM 1: Form rating ve sakatlık geçmişi
                form_rating: p.form_rating ?? p.form ?? 50,
                injury_history: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safeJsonParse"])(p.injury_history, []),
                // ADIM 2: Kart cezaları ve sakatlık
                suspended_until: p.suspended_until || null,
                is_injured: p.is_injured || false,
                injury_end_date: p.injury_end_date || null,
                traitLevels: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safeJsonParse"])(p.trait_levels, extra.traitLevels || {}),
                styleLevels: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safeJsonParse"])(p.style_levels, extra.styleLevels || {}),
                playStyle: p.play_style || extra.playStyle,
                special_role: p.special_role || extra.special_role,
                is_starter: p.is_starter || false,
                squad_no: p.squad_no,
                fitness: p.cond ?? p.fitness ?? 100,
                // Detailed attributes
                finishing: p.finishing ?? p.sut ?? 50,
                dribbling: p.dribbling ?? p.top ?? 50,
                firstTouch: p.first_touch ?? p.control ?? 50,
                crossing: p.crossing ?? p.pas ?? 50,
                marking: p.marking ?? p.tk ?? 50,
                tackling: p.tackling_detailed ?? p.tk ?? 50,
                technique: p.technique ?? p.control ?? 50,
                longShots: p.long_shots ?? p.sut ?? 50,
                offTheBall: p.off_the_ball ?? p.vision ?? 50,
                acceleration: p.acceleration ?? p.hiz ?? 50,
                agility: p.agility ?? p.hiz ?? 50,
                balance: p.balance ?? p.guc ?? 50,
                jumping: p.jumping ?? p.guc ?? 50,
                leftFoot: p.left_foot_detailed ?? 50,
                rightFoot: p.right_foot_detailed ?? 50,
                workRate: p.work_rate ?? p.workrate ?? 50,
                specificPosition: p.specific_position || p.specificPosition || undefined,
                secondaryPositions: Array.isArray(p.secondary_positions) ? p.secondary_positions : undefined
            };
        };
        if (teamName) {
            const { data } = await supabase.from('players').select('id,name,position,specific_position,secondary_positions,rating,potential,hidden_potential,age,height,weight,market_value,salary,nation,club,team_name,preferred_foot,defending,passing,shooting,speed,power,vision,control,stamina,heading,goalkeeping,finishing,dribbling,first_touch,crossing,marking,tackling_detailed,technique,long_shots,off_the_ball,aggression,bravery,work_rate,decisions,determination,concentration,leadership,anticipation,flair,positioning,composure,teamwork,agility,balance,strength,acceleration,jumping,left_foot_detailed,right_foot_detailed,cond,form,morale,confidence,chemistry,is_legend,form_rating,injury_history,traits,personality,scouting_stars,scouting_count,injury,suspended_until,is_injured,injury_end_date,injury_severity,play_style,trait_levels,style_levels,special_role,is_starter,squad_no,photo_url,profile_id,is_for_sale,sale_price,is_retiring,isResting,is_free_agent,contract_end_week,match_ratings,last_match_rating').ilike('team_name', teamName);
            if (data && data.length > 0) return data.map(mapPlayer);
        }
        if (userId) {
            const { data, error } = await supabase.from('players').select('id,name,position,specific_position,secondary_positions,rating,potential,hidden_potential,age,height,weight,market_value,salary,nation,club,team_name,preferred_foot,defending,passing,shooting,speed,power,vision,control,stamina,heading,goalkeeping,finishing,dribbling,first_touch,crossing,marking,tackling_detailed,technique,long_shots,off_the_ball,aggression,bravery,work_rate,decisions,determination,concentration,leadership,anticipation,flair,positioning,composure,teamwork,agility,balance,strength,acceleration,jumping,left_foot_detailed,right_foot_detailed,cond,form,morale,confidence,chemistry,is_legend,form_rating,injury_history,traits,personality,scouting_stars,scouting_count,injury,suspended_until,is_injured,injury_end_date,injury_severity,play_style,trait_levels,style_levels,special_role,is_starter,squad_no,photo_url,profile_id,is_for_sale,sale_price,is_retiring,isResting,is_free_agent,contract_end_week,match_ratings,last_match_rating').eq('profile_id', userId);
            if (!error && data && data.length > 0) {
                return data.map(mapPlayer);
            }
        }
        return [];
    }
    const local = localStorage.getItem(STORAGE_KEYS.SQUAD);
    return local ? JSON.parse(local) : [];
};
const loadLeague = async ()=>{
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
        const { data } = await supabase.from('league_standings').select('id,team_id,season_id,league_id,played,won,drawn,lost,gf,ga,gd,points');
        return data || [];
    }
    const local = localStorage.getItem(STORAGE_KEYS.LEAGUE);
    return local ? JSON.parse(local) : [];
};
const loadFixtures = async (teamId)=>{
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
        const { data } = await supabase.from('fixtures').select('*, home:home_team_id(name), away:away_team_id(name)').or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`).order('tur', {
            ascending: true
        });
        if (data) return data;
    }
    return [];
};
const loadActiveTactic = async (userId)=>{
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
        const { data } = await supabase.from('active_tactics').select('id,tactic_data,updated_at').eq('id', userId).single();
        return data || null;
    }
    const local = localStorage.getItem(STORAGE_KEYS.TACTIC);
    return local ? JSON.parse(local) : null;
};
const loadTrainingState = async (userId)=>{
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
        const { data } = await supabase.from('training_state').select('id,state,updated_at').eq('id', userId).single();
        return data || null;
    }
    const local = localStorage.getItem(STORAGE_KEYS.TRAINING);
    return local ? JSON.parse(local) : null;
};
const loadWatchlist = async (userId)=>{
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
        const { data } = await supabase.from('watchlist').select('player_id').eq('user_id', userId);
        return data ? data.map((i)=>i.player_id) : [];
    }
    const local = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
    return local ? JSON.parse(local) : [];
};
const saveProfile = async (profile)=>{
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
        await supabase.from('profiles').upsert(profile);
    }
};
const savePlayers = async (players, userId, teamName)=>{
    localStorage.setItem(STORAGE_KEYS.SQUAD, JSON.stringify(players));
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])() && userId) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
        const playersToSave = players.map((p)=>{
            // Pack extra traits back into personality string
            const personalityObj = {
                traits: p.traits,
                negTraits: p.negTraits,
                personalityTraits: p.personalityTraits,
                traitLevels: p.traitLevels,
                styleLevels: p.styleLevels,
                archetype: p.archetype,
                special_role: p.special_role
            };
            return {
                id: p.id,
                name: p.name,
                position: p.position,
                rating: p.rating,
                speed: p.speed || 50,
                power: p.power || 50,
                passing: p.passing || 50,
                shooting: p.shooting || 50,
                defending: p.defending || 50,
                vision: p.vision || 50,
                control: p.control || 50,
                klt: p.rating,
                pas: p.passing || 50,
                sut: p.shooting || 50,
                tk: p.defending || 50,
                hiz: p.speed || 50,
                guc: p.power || 50,
                alg: p.vision || 50,
                top: p.control || 50,
                kfa: p.heading || p.heading || 50,
                klc: p.goalkeeping || p.goalkeeping || 10,
                potential: p.potential,
                hidden_potential: p.hidden_potential || p.potential,
                age: p.age,
                personality: JSON.stringify(personalityObj),
                form: p.form || 60,
                morale: p.morale || 60,
                confidence: p.confidence || 60,
                cond: p.cond || p.fitness || 100,
                play_style: p.playStyle,
                market_value: p.market_value,
                scouted: p.scouted || false,
                scouting_stars: p.scouting_stars || 0,
                scouting_count: p.scouting_count || 0,
                preferred_foot: p.preferred_foot || 'Right',
                is_legend: p.is_legend || false,
                is_starter: p.is_starter || false,
                squad_no: p.squad_no || null,
                injury: p.injury ? JSON.stringify(p.injury) : null,
                form_rating: p.form_rating ?? p.form ?? 50,
                injury_history: p.injury_history ? JSON.stringify(p.injury_history) : '[]',
                suspended_until: p.suspended_until || null,
                is_injured: p.is_injured || false,
                injury_end_date: p.injury_end_date || null,
                trait_levels: JSON.stringify(p.traitLevels || {}),
                style_levels: JSON.stringify(p.styleLevels || {}),
                profile_id: userId || null,
                team_name: teamName || p.team_name || p.club || 'Başakşehir',
                determination: p.determination || 50,
                concentration: p.concentration || 50,
                leadership: p.leadership || 50,
                anticipation: p.anticipation || 50,
                flair: p.flair || 50,
                positioning: p.positioning || 50,
                composure: p.composure || 50,
                teamwork: p.teamwork || 50,
                workrate: p.workrate || 50,
                aggression: p.aggression || 50,
                bravery: p.bravery || 50,
                decisions: p.decisions || 50,
                // Technical
                finishing: p.finishing || p.shooting || 50,
                dribbling: p.dribbling || p.control || 50,
                first_touch: p.firstTouch || p.control || 50,
                crossing: p.crossing || p.passing || 50,
                marking: p.marking || p.defending || 50,
                tackling_detailed: p.tackling || p.defending || 50,
                technique: p.technique || p.control || 50,
                long_shots: p.longShots || p.shooting || 50,
                off_the_ball: p.offTheBall || p.vision || 50,
                // Mental
                work_rate: p.workRate || p.workrate || 50,
                // Physical
                acceleration: p.acceleration || p.speed || 50,
                agility: p.agility || p.speed || 50,
                balance: p.balance || p.power || 50,
                jumping: p.jumping || p.power || 50,
                left_foot_detailed: p.leftFoot || 50,
                right_foot_detailed: p.rightFoot || 50,
                photo_url: p.photo_url,
                specific_position: p.specificPosition || p.specific_position || null,
                secondary_positions: p.secondaryPositions && Array.isArray(p.secondaryPositions) && p.secondaryPositions.length > 0 ? p.secondaryPositions : null,
                updated_at: new Date().toISOString()
            };
        });
        playersToSave.forEach((p)=>{
            delete p.user_id;
        });
        await supabase.from('players').upsert(playersToSave);
    }
};
const saveLeague = async (league)=>{
    localStorage.setItem(STORAGE_KEYS.LEAGUE, JSON.stringify(league));
};
const saveActiveTactic = async (userId, tactic)=>{
    localStorage.setItem(STORAGE_KEYS.TACTIC, JSON.stringify(tactic));
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
        await supabase.from('active_tactics').upsert({
            id: userId,
            ...tactic
        });
    }
};
const saveTrainingState = async (userId, state)=>{
    localStorage.setItem(STORAGE_KEYS.TRAINING, JSON.stringify(state));
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
        await supabase.from('training_state').upsert({
            id: userId,
            ...state
        });
    }
};
const saveWatchlist = async (userId, watchlist)=>{
    // localStorage'a yaz (fallback)
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
    // Supabase'e de yaz (tam senkronizasyon)
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])() && userId) {
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
            // Önce mevcut kayıtları sil
            await supabase.from('watchlist').delete().eq('user_id', userId);
            // Sonra yeni listeyi ekle
            if (watchlist.length > 0) {
                const rows = watchlist.map((playerId)=>({
                        user_id: userId,
                        player_id: playerId
                    }));
                const { error } = await supabase.from('watchlist').insert(rows);
                if (error) {
                    console.error('[saveWatchlist] Supabase insert error:', error.message);
                }
            }
        } catch (err) {
            console.error('[saveWatchlist] Supabase sync error:', err);
        }
    }
};
const removeFromWatchlist = async (userId, playerId, currentWatchlist)=>{
    const newWatchlist = currentWatchlist.filter((id)=>id !== playerId);
    // localStorage güncelle
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(newWatchlist));
    // Supabase'den sil
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])() && userId) {
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
            const { error } = await supabase.from('watchlist').delete().eq('user_id', userId).eq('player_id', playerId);
            if (error) {
                console.error('[removeFromWatchlist] Supabase delete error:', error.message);
            }
        } catch (err) {
            console.error('[removeFromWatchlist] Supabase error:', err);
        }
    }
    return newWatchlist;
};
const saveMatchResult = async (userId, result, homeTeamName, awayTeamName)=>{
    const matchInfo = {
        result,
        homeTeamName,
        awayTeamName,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.LAST_MATCH, JSON.stringify(matchInfo));
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])() && userId) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
        const score = result.score;
        await supabase.from('match_history').insert({
            user_id: userId,
            home_team: homeTeamName,
            away_team: awayTeamName,
            score: `${score.home}-${score.away}`,
            match_data: JSON.stringify(result)
        });
    }
};
const loadMatchHistory = async (userId)=>{
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
        const { data } = await supabase.from('match_history').select('id,user_id,home_team,away_team,score,match_data,created_at').eq('user_id', userId).order('created_at', {
            ascending: false
        });
        return data || [];
    }
    const local = localStorage.getItem('fm_match_history');
    return local ? JSON.parse(local) : [];
};
const loadLastMatchResult = async ()=>{
    const local = localStorage.getItem(STORAGE_KEYS.LAST_MATCH);
    return local ? JSON.parse(local) : null;
};
const checkConnectionHealth = async ()=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return {
        status: 'not_configured'
    };
    try {
        const start = Date.now();
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
        const { error } = await supabase.from('profiles').select('count', {
            count: 'exact',
            head: true
        }).limit(1);
        if (error) throw error;
        return {
            status: 'connected',
            latency: Date.now() - start
        };
    } catch  {
        return {
            status: 'error'
        };
    }
};
const resetLeague = async ()=>{
    const savedUserId = localStorage.getItem('fm_user_id');
    // Clear all localStorage data
    Object.values(STORAGE_KEYS).forEach((key)=>localStorage.removeItem(key));
    localStorage.removeItem('fm_fixtures');
    localStorage.removeItem('fm_user_id');
    localStorage.removeItem('fm_auth_email');
    localStorage.removeItem('fm_match_history');
    localStorage.removeItem('fm_last_processed_day');
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
            if (savedUserId) {
                const { data: profile } = await supabase.from('profiles').select('team_name, league_name').eq('id', savedUserId).single();
                if (profile) {
                    await supabase.from('players').delete().eq('profile_id', savedUserId);
                    if (profile.team_name) {
                        await supabase.from('league_teams').update({
                            is_npc: true,
                            profile_id: null,
                            strength: 45 + Math.floor(Math.random() * 10),
                            color: null
                        }).eq('name', profile.team_name);
                    }
                }
                await supabase.from('profiles').delete().eq('id', savedUserId);
                await supabase.from('active_tactics').delete().eq('id', savedUserId);
                await supabase.from('training_state').delete().eq('id', savedUserId);
                await supabase.from('watchlist').delete().eq('user_id', savedUserId);
                await supabase.from('match_history').delete().eq('user_id', savedUserId);
                await supabase.from('youth_players').delete().eq('profile_id', savedUserId);
                await supabase.from('youth_facilities').delete().eq('profile_id', savedUserId);
            }
        } catch (err) {
            console.error('Supabase reset error:', err);
        }
    }
    return {
        success: true
    };
};
const getMatchPreparations = async (id)=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return [];
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
        const { data: tsData, error: tsError } = await supabase.from('training_state').select('state').eq('id', id).single();
        if (tsError || !tsData?.state) return [];
        const state = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safeJsonParse"])(tsData.state, {});
        const activeOps = state.activeOperations || [];
        return activeOps.filter((op)=>op.status === 'pending').map((op)=>op.operationId || op.operation_id);
    } catch  {
        return [];
    }
};
const loadYouthPlayers = async (userId)=>{
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
            const { data, error } = await supabase.from('youth_players').select('id,profile_id,name,age,position,specific_position,rating,potential,hidden_potential,academy_level,category,is_wonderkid,development_curve,join_date,weekly_training_hours,total_training_weeks,stats_gained_this_season,personality_traits,traits,trait_levels,scout_report,injured,injury_weeks_remaining,cond,form,morale,confidence,stats,updated_at').eq('profile_id', userId);
            if (error) {
                console.error('[loadYouthPlayers] Supabase error:', error.message);
            } else if (data && data.length > 0) {
                return data.map((row)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapYouthPlayerFromRow"])(row));
            }
        } catch (err) {
            console.error('[loadYouthPlayers] Exception:', err);
        }
    }
    const local = localStorage.getItem(STORAGE_KEYS.YOUTH_PLAYERS);
    return local ? JSON.parse(local) : [];
};
const saveYouthPlayers = async (players, userId)=>{
    localStorage.setItem(STORAGE_KEYS.YOUTH_PLAYERS, JSON.stringify(players));
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])() && userId) {
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
            const rows = players.map((p)=>{
                const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildStatsObject"])(p);
                return {
                    id: p.id,
                    profile_id: userId,
                    name: p.name,
                    age: p.age,
                    position: p.position,
                    specific_position: p.specificPosition,
                    rating: p.rating,
                    potential: p.potential,
                    hidden_potential: p.hidden_potential,
                    academy_level: p.academyLevel,
                    category: p.category,
                    is_wonderkid: p.isWonderkid ?? false,
                    development_curve: p.developmentCurve ?? 'normal',
                    join_date: p.joinDate,
                    weekly_training_hours: p.weeklyTrainingHours ?? 15,
                    total_training_weeks: p.totalTrainingWeeks ?? 0,
                    stats_gained_this_season: JSON.stringify(p.statsGainedThisSeason ?? {}),
                    personality_traits: JSON.stringify(p.personalityTraits ?? []),
                    traits: JSON.stringify(p.traits ?? []),
                    trait_levels: JSON.stringify(p.traitLevels ?? {}),
                    scout_report: p.scoutReport ? JSON.stringify(p.scoutReport) : null,
                    injured: p.injured ?? false,
                    injury_weeks_remaining: p.injuryWeeksRemaining ?? 0,
                    cond: p.cond ?? 85,
                    form: p.form ?? 60,
                    morale: p.morale ?? 70,
                    confidence: p.confidence ?? 60,
                    stats: JSON.stringify(stats),
                    updated_at: new Date().toISOString()
                };
            });
            await supabase.from('youth_players').delete().eq('profile_id', userId);
            if (rows.length > 0) {
                const { error } = await supabase.from('youth_players').insert(rows);
                if (error) {
                    console.error('[saveYouthPlayers] Insert error:', error.message);
                }
            }
        } catch (err) {
            console.error('[saveYouthPlayers] Exception:', err);
        }
    }
};
const loadYouthFacilities = async (userId)=>{
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
            const { data, error } = await supabase.from('youth_facilities').select('facility_levels').eq('profile_id', userId).single();
            if (!error && data?.facility_levels) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safeJsonParse"])(data.facility_levels, {});
            }
        } catch (err) {
            console.error('[loadYouthFacilities] Exception:', err);
        }
    }
    const local = localStorage.getItem(STORAGE_KEYS.YOUTH_FACILITIES);
    return local ? JSON.parse(local) : {};
};
const saveCredits = async (credits, userId)=>{
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])() && userId) {
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
            const { error } = await supabase.from('profiles').update({
                credits
            }).eq('id', userId);
            if (error) {
                console.error('[saveCredits] Update error:', error.message);
            }
        } catch (err) {
            console.error('[saveCredits] Exception:', err);
        }
    }
};
const saveYouthFacilities = async (facilityLevels, userId)=>{
    localStorage.setItem(STORAGE_KEYS.YOUTH_FACILITIES, JSON.stringify(facilityLevels));
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])() && userId) {
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
            const { error } = await supabase.from('youth_facilities').upsert({
                profile_id: userId,
                facility_levels: JSON.stringify(facilityLevels),
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'profile_id'
            });
            if (error) {
                console.error('[saveYouthFacilities] Upsert error:', error.message);
            }
        } catch (err) {
            console.error('[saveYouthFacilities] Exception:', err);
        }
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/fm/i18n.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Uluslararasılaştırma (i18n) Modülü — Sadece Türkçe desteklenmektedir.
 *
 * İleride çoklu dil desteği planlanıyorsa, bu dosya genişletilebilir.
 * Şimdilik yanıltıcı yarım İtalya/İngilizce çeviriler kaldırılmıştır.
 * Kullanıcıya "Sadece Türkçe desteklenmektedir" uyarısı gösterilir.
 */ __turbopack_context__.s([
    "CURRENT_LOCALE",
    ()=>CURRENT_LOCALE,
    "getBrowserLocale",
    ()=>getBrowserLocale,
    "t",
    ()=>t,
    "translations",
    ()=>translations
]);
const CURRENT_LOCALE = 'tr';
const translations = {
    tr: {
        scouting: "Gözlemcilik",
        watchlist: "İzleme Listesi",
        stadium: "Yerleşke",
        ticket_price: "Bilet Fiyatı",
        academy: "Altyapı",
        upgrade: "Geliştir",
        money: "Bütçe",
        search: "Arama",
        onlyTurkishWarning: "Sadece Türkçe desteklenmektedir"
    }
};
function getBrowserLocale() {
    return 'tr';
}
function t(key) {
    return translations.tr[key] || key;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/utils/sound.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * utils/sound.ts
 *
 * Ses efektleri sistemi — gol sesi, şampiyonluk sesi, alkış vb.
 * Web Audio API kullanarak kısa sentezlenmiş sesler çalar.
 * Harici dosya gerektirmez (base64 dahil edilmez).
 *
 * Sesler varsayılan olarak kapalıdır.
 * Kullanıcı ayarlardan açabilir (localStorage: 'sound_enabled').
 */ // ─── Ses Tipi ────────────────────────────────────────────────────
__turbopack_context__.s([
    "isSoundEnabled",
    ()=>isSoundEnabled,
    "playSound",
    ()=>playSound,
    "setSoundEnabled",
    ()=>setSoundEnabled,
    "toggleSound",
    ()=>toggleSound
]);
// ─── Ayar Yönetimi ───────────────────────────────────────────────
const STORAGE_KEY = 'sound_enabled';
function isSoundEnabled() {
    try {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch  {
        return false;
    }
}
function setSoundEnabled(enabled) {
    try {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch (err) {
        console.error('[sound] setSoundEnabled error:', err);
    }
}
function toggleSound() {
    const newState = !isSoundEnabled();
    setSoundEnabled(newState);
    return newState;
}
// ─── Web Audio API Context ────────────────────────────────────────
let audioCtx = null;
function getAudioContext() {
    try {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    } catch (err) {
        console.error('[sound] getAudioContext error:', err);
        return null;
    }
}
// ─── Ses Sentez Fonksiyonları ─────────────────────────────────────
/**
 * Gol sesi — yükselen tiz ton + kısa patlama
 */ function playGoalSound(ctx) {
    try {
        const now = ctx.currentTime;
        // Yükselen ton
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(400, now);
        osc1.frequency.linearRampToValueAtTime(800, now + 0.2);
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc1.connect(gain1).connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.4);
        // İkinci dalga
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(600, now + 0.1);
        osc2.frequency.linearRampToValueAtTime(1200, now + 0.3);
        gain2.gain.setValueAtTime(0.15, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc2.connect(gain2).connect(ctx.destination);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.5);
    } catch (err) {
        console.error('[sound] playGoalSound error:', err);
    }
}
/**
 * Şampiyonluk sesi — fanfar benzeri yükselen arpej
 */ function playChampionSound(ctx) {
    try {
        const now = ctx.currentTime;
        const notes = [
            523,
            659,
            784,
            1047
        ]; // C5, E5, G5, C6
        notes.forEach((freq, i)=>{
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.15);
            gain.gain.setValueAtTime(0.25, now + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.5);
            osc.connect(gain).connect(ctx.destination);
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.5);
        });
        // Final akoru
        const oscFinal = ctx.createOscillator();
        const gainFinal = ctx.createGain();
        oscFinal.type = 'sine';
        oscFinal.frequency.setValueAtTime(1047, now + 0.6);
        gainFinal.gain.setValueAtTime(0.3, now + 0.6);
        gainFinal.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
        oscFinal.connect(gainFinal).connect(ctx.destination);
        oscFinal.start(now + 0.6);
        oscFinal.stop(now + 1.5);
    } catch (err) {
        console.error('[sound] playChampionSound error:', err);
    }
}
/**
 * Alkış sesi — beyaz gürültü patlaması
 */ function playApplauseSound(ctx) {
    try {
        const now = ctx.currentTime;
        const duration = 1.2;
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for(let i = 0; i < bufferSize; i++){
            data[i] = (Math.random() * 2 - 1) * 0.3;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3000, now);
        filter.Q.setValueAtTime(0.5, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        source.connect(filter).connect(gain).connect(ctx.destination);
        source.start(now);
        source.stop(now + duration);
    } catch (err) {
        console.error('[sound] playApplauseSound error:', err);
    }
}
/**
 * Düdük sesi
 */ function playWhistleSound(ctx) {
    try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.setValueAtTime(1100, now + 0.15);
        osc.frequency.setValueAtTime(900, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.setValueAtTime(0.3, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
    } catch (err) {
        console.error('[sound] playWhistleSound error:', err);
    }
}
/**
 * Kart sesi (kısa tık)
 */ function playCardSound(ctx) {
    try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    } catch (err) {
        console.error('[sound] playCardSound error:', err);
    }
}
/**
 * Transfer sesi — kasayı andıran "kaching"
 */ function playTransferSound(ctx) {
    try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.setValueAtTime(1600, now + 0.05);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
        // İkinci ton
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1800, now + 0.1);
        gain2.gain.setValueAtTime(0.2, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc2.connect(gain2).connect(ctx.destination);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.4);
    } catch (err) {
        console.error('[sound] playTransferSound error:', err);
    }
}
/**
 * Tıklama sesi — hafif ui geri bildirimi
 */ function playClickSound(ctx) {
    try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
    } catch (err) {
        console.error('[sound] playClickSound error:', err);
    }
}
/**
 * Rekor sesi — dramatik yükseliş
 */ function playRecordSound(ctx) {
    try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.5);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
    } catch (err) {
        console.error('[sound] playRecordSound error:', err);
    }
}
/**
 * Hata sesi — alçalan ton
 */ function playErrorSound(ctx) {
    try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
    } catch (err) {
        console.error('[sound] playErrorSound error:', err);
    }
}
/**
 * Başarı sesi — kısa pozitif "ding"
 */ function playSuccessSound(ctx) {
    try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
        // İkinci "ding"
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1320, now + 0.15);
        gain2.gain.setValueAtTime(0.2, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
        osc2.connect(gain2).connect(ctx.destination);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.55);
    } catch (err) {
        console.error('[sound] playSuccessSound error:', err);
    }
}
// ─── Ana Çalma Fonksiyonu ─────────────────────────────────────────
const SOUND_MAP = {
    goal: playGoalSound,
    champion: playChampionSound,
    applause: playApplauseSound,
    whistle: playWhistleSound,
    card: playCardSound,
    transfer: playTransferSound,
    click: playClickSound,
    record: playRecordSound,
    error: playErrorSound,
    success: playSuccessSound
};
function playSound(soundId) {
    try {
        if (!isSoundEnabled()) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        // AudioContext askıya alınmışsa devam ettir
        if (ctx.state === 'suspended') {
            ctx.resume().then(()=>{
                const player = SOUND_MAP[soundId];
                if (player) player(ctx);
            }).catch((err)=>{
                console.error('[sound] resume error:', err);
            });
        } else {
            const player = SOUND_MAP[soundId];
            if (player) player(ctx);
        }
    } catch (err) {
        console.error('[sound] playSound error:', err);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/fm/ToastNotifications.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToastNotifications",
    ()=>ToastNotifications,
    "showToast",
    ()=>showToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-toast.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$sound$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/sound.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function ToastNotifications({ showTrainingToast, migrationResult, onDismissMigration }) {
    _s();
    // Training toast gösterimi
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "ToastNotifications.useEffect": ()=>{
            if (showTrainingToast) {
                showToast('Antrenman tamamlandı! Oyuncular form kazandı.', 'success');
            }
        }
    }["ToastNotifications.useEffect"], [
        showTrainingToast
    ]);
    // Migration sonucu toast
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "ToastNotifications.useEffect": ()=>{
            if (migrationResult) {
                if (migrationResult.success) {
                    showToast(migrationResult.message || 'Veri taşıma başarılı!', 'success');
                } else {
                    showToast(migrationResult.message || 'Veri taşıma sırasında hata oluştu.', 'error');
                }
                onDismissMigration?.();
            }
        }
    }["ToastNotifications.useEffect"], [
        migrationResult,
        onDismissMigration
    ]);
    return null;
}
_s(ToastNotifications, "3ubReDTFssvu4DHeldAg55cW/CI=");
_c = ToastNotifications;
function showToast(msg, type = 'success') {
    try {
        // ── Sayfa görünür değilse bildirim gösterme ──
        if (typeof document !== 'undefined' && document.hidden) {
            console.log(`[Toast] Sayfa arka planda, bildirim atlandı [${type}]: ${msg}`);
            return;
        }
        const variantMap = {
            success: 'default',
            error: 'destructive',
            info: 'default'
        };
        const titleMap = {
            success: '✓ Başarılı',
            error: '✗ Hata',
            info: 'ℹ Bilgi'
        };
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])({
            title: titleMap[type] ?? titleMap.info,
            description: msg,
            variant: variantMap[type] ?? 'default',
            className: type === 'success' ? 'bg-green-900/90 border-green-500/30 text-green-100' : type === 'error' ? 'bg-red-900/90 border-red-500/30 text-red-100' : 'bg-blue-900/90 border-blue-500/30 text-blue-100'
        });
        // Play sound for error toasts
        if (type === 'error') {
            try {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$sound$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["playSound"])('error');
            } catch  {}
        }
    } catch (err) {
        console.error('[ToastNotifications] showToast error:', err);
        // Fallback: console
        console.log(`TOAST [${type}]: ${msg}`);
    }
}
var _c;
__turbopack_context__.k.register(_c, "ToastNotifications");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/fm/traitsData.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PERSONALITY_LABELS",
    ()=>PERSONALITY_LABELS,
    "PERSONALITY_TRAITS",
    ()=>PERSONALITY_TRAITS,
    "PLAY_STYLES",
    ()=>PLAY_STYLES,
    "TRAITS_DATA",
    ()=>TRAITS_DATA,
    "TRAIT_LEVELS",
    ()=>TRAIT_LEVELS
]);
const TRAITS_DATA = {
    defans: {
        pozitif: [
            {
                name: "Kale gibi",
                level: "MOR",
                description: "Geçilemez bir duvar."
            },
            {
                name: "Top kapma uzmanı",
                level: "ALTIN",
                description: "Müdahaleleri çok net."
            },
            {
                name: "Pozisyon ustası",
                level: "ALTIN",
                description: "Her zaman doğru yerde."
            },
            {
                name: "Hava hakimiyeti",
                level: "LACIVERT",
                description: "Hava toplarını toplar."
            },
            {
                name: "Markajcı",
                level: "LACIVERT",
                description: "Rakibi gölge gibi izler."
            },
            {
                name: "Oyun okuyan",
                level: "BEYAZ",
                description: "Rakibin hamlesini önceden sezer."
            },
            {
                name: "Lider stoper",
                level: "MOR",
                description: "Defansı organize eder."
            },
            {
                name: "Ofsayt ustası",
                level: "LACIVERT",
                description: "Ofsayt tuzağını %85 başarıyla kurar. (Motor Etkisi: %5)",
                counterFor: "Ofsayta düşer",
                engineEffect: {
                    successRate: 0.85,
                    engineWeight: 0.05
                }
            },
            {
                name: "Soğukkanlı",
                level: "BEYAZ",
                description: "Baskı altında %35 daha az hata yapar. (Motor Etkisi: %3)",
                counterFor: "Panik yapar",
                engineEffect: {
                    successRate: 0.35,
                    engineWeight: 0.03
                }
            },
            {
                name: "Risk hesaplayıcı",
                level: "BEYAZ",
                description: "Gereksiz riske girmez."
            },
            {
                name: "Hızlı stoper",
                level: "ALTIN",
                description: "Hızlı forvetlerin ataklarını %45 daha fazla keser. (Motor Etkisi: %3.5)",
                counterFor: "Hızlı forvet",
                engineEffect: {
                    successRate: 0.45,
                    engineWeight: 0.035
                }
            },
            {
                name: "Dayanıklı",
                level: "BEYAZ",
                description: "Yorgun rakiplere karşı %20 daha avantajlıdır. (Motor Etkisi: %2)",
                counterFor: "Tembel",
                engineEffect: {
                    successRate: 0.20,
                    engineWeight: 0.02
                }
            },
            {
                name: "Agresif",
                level: "LACIVERT",
                description: "Rakipten korkmaz."
            },
            {
                name: "Denge ustası",
                level: "BEYAZ",
                description: "İkili mücadelelerde yıkılmaz."
            },
            {
                name: "Topla çıkan stoper",
                level: "ALTIN",
                description: "Atak başlatma becerisi."
            },
            {
                name: "Uzun pas ustası",
                level: "LACIVERT",
                description: "Adrese teslim toplar."
            },
            {
                name: "Kanat bekçisi",
                level: "BEYAZ",
                description: "Kanatları güvene alır.",
                counterFor: "Hızlı kanat"
            },
            {
                name: "Çakılı savunmacı",
                level: "BEYAZ",
                description: "Yerini asla terk etmez.",
                counterFor: "Boşluk avcısı"
            },
            {
                name: "Süpürücü (libero)",
                level: "ALTIN",
                description: "Tüm gedikleri kapatır.",
                counterFor: "Kontra canavarı"
            },
            // Yeni Karşı (Counter) Traitler
            {
                name: "Gölge Markajcı",
                level: "ALTIN",
                description: "Bitirici forvetleri %42 daha sıkı tutar. (Motor Etkisi: %4)",
                counterFor: "Bitirici",
                engineEffect: {
                    successRate: 0.42,
                    engineWeight: 0.04
                }
            },
            {
                name: "Şut Engelleyici",
                level: "LACIVERT",
                description: "Uzaktan şutları %38 oranında bloke eder. (Motor Etkisi: %3.5)",
                counterFor: "Uzaktan şutçu",
                engineEffect: {
                    successRate: 0.38,
                    engineWeight: 0.035
                }
            },
            {
                name: "Alan Kapatıcı",
                level: "BEYAZ",
                description: "Boşluk bulucuların alanını %33 daha fazla daraltır. (Motor Etkisi: %3)",
                counterFor: "Boşluk bulucu",
                engineEffect: {
                    successRate: 0.33,
                    engineWeight: 0.03
                }
            },
            {
                name: "Pas Duvarı",
                level: "LACIVERT",
                description: "Ara pascı oyuncunun paslarını %38 oranında keser. (Motor Etkisi: %3)",
                counterFor: "Ara pascı",
                engineEffect: {
                    successRate: 0.38,
                    engineWeight: 0.03
                }
            },
            {
                name: "Tazı Defans",
                level: "ALTIN",
                description: "Sprinterlerin hızını %45 etkisiz hale getirir. (Motor Etkisi: %4)",
                counterFor: "Sprinter",
                engineEffect: {
                    successRate: 0.45,
                    engineWeight: 0.04
                }
            },
            {
                name: "Oyun Bozan",
                level: "ALTIN",
                description: "Oyun kurucuları %40 oranında baskılar. (Motor Etkisi: %3.5)",
                counterFor: "Oyun kurucu",
                engineEffect: {
                    successRate: 0.40,
                    engineWeight: 0.035
                }
            },
            {
                name: "Asla Pes Etmez",
                level: "BEYAZ",
                description: "Maç sonu konsantrasyonunu %30 korur. (Motor Etkisi: %2.5)",
                counterFor: "Konsantrasyon düşüklüğü",
                engineEffect: {
                    successRate: 0.30,
                    engineWeight: 0.025
                }
            },
            {
                name: "Pozisyon Bekçisi",
                level: "LACIVERT",
                description: "Fırsatçıları %36 oranında engeller. (Motor Etkisi: %3)",
                counterFor: "Fırsatçı",
                engineEffect: {
                    successRate: 0.36,
                    engineWeight: 0.03
                }
            },
            {
                name: "Top Hırsızı",
                level: "ALTIN",
                description: "Top saklayanlardan %39 oranında top çalar. (Motor Etkisi: %3.5)",
                counterFor: "Top saklayan",
                engineEffect: {
                    successRate: 0.39,
                    engineWeight: 0.035
                }
            },
            {
                name: "Gölge Takipçi",
                level: "ALTIN",
                description: "10 numaraların etkinliğini %44 azaltır. (Motor Etkisi: %4)",
                counterFor: "10 numara",
                engineEffect: {
                    successRate: 0.44,
                    engineWeight: 0.04
                }
            },
            {
                name: "Mücadeleci Stoper",
                level: "LACIVERT",
                description: "Fiziksel santraforları %40 oranında durdurur. (Motor Etkisi: %3.5)",
                counterFor: "Fiziksel santrafor",
                engineEffect: {
                    successRate: 0.40,
                    engineWeight: 0.035
                }
            }
        ],
        negatif: [
            {
                name: "Ağır kalır",
                description: "Hızı rakiplerine göre oldukça düşüktür.",
                penalty: {
                    speed: -10
                }
            },
            {
                name: "Zamanlama hatası",
                description: "Müdahale zamanlamasını sıkça kaçırır.",
                penalty: {
                    defending: -5
                }
            },
            {
                name: "Zayıf markaj",
                description: "Rakibini adam markajında kaçırabilir.",
                penalty: {
                    defending: -7
                }
            },
            {
                name: "Hava zaafı",
                description: "Hava toplarında etkisizdir.",
                penalty: {
                    heading: -15
                }
            },
            {
                name: "Top kontrolü kötü",
                description: "Topu ayağında tutmakta zorlanır.",
                penalty: {
                    control: -10
                }
            },
            {
                name: "Konsantrasyon düşüklüğü",
                description: "Maçın kritik anlarında oyundan kopabilir.",
                penalty: {
                    awareness: -15
                }
            },
            {
                name: "Panik yapar",
                description: "Baskı altında acele kararlar verir.",
                penalty: {
                    coolness: -20
                }
            },
            {
                name: "Yanlış karar verir",
                description: "Pas tercihlerinde sık sık hata yapar.",
                penalty: {
                    vision: -10
                }
            },
            {
                name: "Kart manyağı",
                description: "Gereksiz sertlikte müdahalelerle kart görür.",
                penalty: {
                    disciplin: -25
                }
            }
        ]
    },
    orta_saha: {
        pozitif: [
            {
                name: "Oyun kurucu",
                level: "MOR",
                description: "Maestro."
            },
            {
                name: "Top dağıtıcı",
                level: "ALTIN",
                description: "Merkez istasyonu."
            },
            {
                name: "Box-to-box",
                level: "MOR",
                description: "Her iki ceza sahası arasında."
            },
            {
                name: "Pres ustası",
                level: "ALTIN",
                description: "Rakipten topu söker alır."
            },
            {
                name: "Top saklayan",
                level: "LACIVERT",
                description: "Mıknatıs gibi."
            },
            {
                name: "Oyun görüşü yüksek",
                level: "MOR",
                description: "Sahayı yukarıdan izler gibi."
            },
            {
                name: "Boşluk bulucu",
                level: "ALTIN",
                description: "Savunma arasına sızar."
            },
            {
                name: "Tempo kontrolcüsü",
                level: "ALTIN",
                description: "Maçın hızını o belirler."
            },
            {
                name: "Pas arası ustası",
                level: "LACIVERT",
                description: "Rakip pasları keser."
            },
            {
                name: "Regista",
                level: "MOR",
                description: "Derinden oyun kurma dehası."
            },
            {
                name: "10 numara",
                level: "MOR",
                description: "Saf yetenek."
            },
            {
                name: "Uzaktan şutçu",
                level: "ALTIN",
                description: "Füzeleriyle meşhur."
            }
        ],
        negatif: [
            {
                name: "Top kaybı yapar",
                description: "Merkezde tehlikeli top kayıplarına meyillidir.",
                penalty: {
                    control: -10
                }
            },
            {
                name: "Yavaş karar verir",
                description: "Pas opsiyonlarını görmekte geç kalır.",
                penalty: {
                    vision: -15
                }
            },
            {
                name: "Savunmaya yardım etmez",
                description: "Defansif görevlerinden sık sık kaçar.",
                penalty: {
                    workrate: -20
                }
            },
            {
                name: "Pas hatası yapar",
                description: "Basit paslarda bile isabet oranı düşüktür.",
                penalty: {
                    passing: -12
                }
            }
        ]
    },
    forvet: {
        pozitif: [
            {
                name: "Bitirici",
                level: "MOR",
                description: "Fırsat tanımaz."
            },
            {
                name: "Pozisyoncu",
                level: "ALTIN",
                description: "Topun nereye geleceğini bilir."
            },
            {
                name: "Hızlı forvet",
                level: "ALTIN",
                description: "Rüzgarın oğlu."
            },
            {
                name: "Fiziksel santrafor",
                level: "LACIVERT",
                description: "Stoperleri hırpalar."
            },
            {
                name: "Fırsatçı",
                level: "ALTIN",
                description: "Dönen topları kaçırmaz."
            },
            {
                name: "Boşluk avcısı",
                level: "LACIVERT",
                description: "Defansı deler geçer."
            },
            {
                name: "Ofsayt ustası",
                level: "LACIVERT",
                description: "Çizgide dans eder."
            },
            {
                name: "Gol makinesi",
                level: "MOR",
                description: "Her maç tabela yapar."
            },
            {
                name: "Sahte 9",
                level: "MOR",
                description: "Modern futbolun zekası."
            },
            {
                name: "Kontra canavarı",
                level: "ALTIN",
                description: "Hızlı hücumların lideri."
            },
            {
                name: "Büyük maç oyuncusu",
                level: "MOR",
                description: "Final anlarını sever."
            }
        ],
        negatif: [
            {
                name: "Beceriksiz bitirici",
                description: "Net fırsatları cömertçe harcar.",
                penalty: {
                    shooting: -15
                }
            },
            {
                name: "Ofsayta düşer",
                description: "Hücum hattında yerini ayarlayamaz.",
                penalty: {
                    awareness: -10
                }
            },
            {
                name: "Bencil",
                description: "Müsait arkadaşına pas vermez.",
                penalty: {
                    passing: -20
                }
            },
            {
                name: "Kararsız",
                description: "Son vuruş veya pas arasında kalır.",
                penalty: {
                    decision: -15
                }
            }
        ]
    },
    kaleci: {
        pozitif: [
            {
                name: "Refleks canavarı",
                level: "MOR",
                description: "İnanılmaz kurtarışlar."
            },
            {
                name: "Güvenli eller",
                level: "ALTIN",
                description: "Hataya yer yok."
            },
            {
                name: "1v1 ustası",
                level: "ALTIN",
                description: "Forvetin kabusu."
            },
            {
                name: "Hava hakimiyeti",
                level: "LACIVERT",
                description: "Yan toplarda rakipsiz."
            },
            {
                name: "Lider kaleci",
                level: "ALTIN",
                description: "Defansın kumandanı."
            },
            {
                name: "Sweeper keeper",
                level: "MOR",
                description: "Kalesinden çıkıp süpürür."
            },
            {
                name: "Penaltı ustası",
                level: "ALTIN",
                description: "Atışlarda çok şanslı."
            },
            {
                name: "Büyük maç kalecisi",
                level: "MOR",
                description: "Basınç altında devleşir."
            }
        ],
        negatif: [
            {
                name: "Sektirir",
                description: "Topları tutmak yerine rakibin önüne çeler.",
                penalty: {
                    catching: -20
                }
            },
            {
                name: "Yavaş refleks",
                description: "Yakın mesafeden gelen şutlarda ağır kalır.",
                penalty: {
                    reflexes: -15
                }
            },
            {
                name: "Çıkış hatası",
                description: "Kalesini yanlış zamanlarda terk eder.",
                penalty: {
                    decision: -20
                }
            }
        ]
    }
};
const PERSONALITY_TRAITS = {
    karakter: {
        pozitif: [
            {
                name: "Profesyonel",
                description: "Antrenmanda hızlı gelişir",
                impact: {
                    training: 1.2
                }
            },
            {
                name: "Disiplinli",
                description: "Form düşüşü az olur",
                impact: {
                    form_stability: 1.2
                }
            },
            {
                name: "Çalışkan",
                description: "Ekstra gelişim bonusu",
                impact: {
                    growth: 1.15
                }
            },
            {
                name: "Hırslı",
                description: "Büyük maçlarda motive olur",
                impact: {
                    big_match_bonus: 1.1
                }
            },
            {
                name: "Kazanan karakter",
                description: "Takımı yukarı çeker",
                impact: {
                    team_morale_boost: 0.05
                }
            }
        ],
        negatif: [
            {
                name: "Tembel",
                description: "Yavaş gelişir",
                impact: {
                    training: 0.8
                }
            },
            {
                name: "Disiplinsiz",
                description: "Moral düşüşü yaşar",
                impact: {
                    morale_stability: 0.8
                }
            },
            {
                name: "Gece hayatı düşkünü",
                description: "Form dalgalı olur",
                impact: {
                    form_volatility: 1.5
                }
            },
            {
                name: "Rahatına düşkün",
                description: "Baskı altında düşer",
                impact: {
                    pressure_handling: 0.7
                }
            },
            {
                name: "İsteksiz",
                description: "Düşük tempoda oynar",
                impact: {
                    match_intensity: 0.8
                }
            }
        ]
    },
    takim: {
        pozitif: [
            {
                name: "Takım oyuncusu",
                description: "Kimya bonusu",
                impact: {
                    chemistry: 1.2
                }
            },
            {
                name: "Sessiz lider",
                description: "Moral artırır",
                impact: {
                    team_morale: 0.03
                }
            },
            {
                name: "Mentor",
                description: "Genç oyuncuları geliştirir",
                impact: {
                    academy_boost: 1.1
                }
            },
            {
                name: "Sadık",
                description: "Transfer istemez",
                impact: {
                    loyalty: 1.5
                }
            },
            {
                name: "Soyunma odası lideri",
                description: "Krizleri azaltır",
                impact: {
                    crisis_management: 1.3
                }
            }
        ],
        negatif: [
            {
                name: "Egoist",
                description: "Takım uyumunu bozar",
                impact: {
                    chemistry: 0.7
                }
            },
            {
                name: "Problem çıkaran",
                description: "Moral düşürür",
                impact: {
                    team_morale: -0.05
                }
            },
            {
                name: "Tartışmacı",
                description: "Teknik direktörle sorun yaşar",
                impact: {
                    manager_relation: 0.6
                }
            },
            {
                name: "Gruplaşan",
                description: "Takım bölünmesine neden olur",
                impact: {
                    cohesion: 0.7
                }
            },
            {
                name: "Kibirli",
                description: "Yedek kalınca sorun çıkarır",
                impact: {
                    bench_morale: 0.5
                }
            }
        ]
    },
    kariyer: {
        pozitif: [
            {
                name: "Kulüp bağlılığı yüksek",
                description: "Uzun süre kalır",
                impact: {
                    contract_renewal: 1.3
                }
            },
            {
                name: "Fedakar",
                description: "Maaş konusunda esnek",
                impact: {
                    wage_flexibility: 1.2
                }
            },
            {
                name: "Gençlere destek olur",
                description: "Akademi bonusu",
                impact: {
                    youth_growth: 1.1
                }
            }
        ],
        negatif: [
            {
                name: "Para odaklı",
                description: "Sürekli zam ister",
                impact: {
                    wage_demand: 1.4
                }
            },
            {
                name: "Fırsatçı",
                description: "Büyük kulüp görünce gitmek ister",
                impact: {
                    transfer_desire: 1.5
                }
            },
            {
                name: "Menajer kuklası",
                description: "Transfer dedikodusu çıkarır",
                impact: {
                    market_noise: 1.5
                }
            },
            {
                name: "Aidiyet sorunu",
                description: "Takıma bağlanmaz",
                impact: {
                    loyalty: 0.5
                }
            }
        ]
    },
    mental: {
        pozitif: [
            {
                name: "Büyük maç oyuncusu",
                description: "Derbilerde coşar",
                impact: {
                    big_match_rating: 1.25
                }
            },
            {
                name: "Soğukkanlı",
                description: "Kritik anlarda sakin",
                impact: {
                    composure: 1.3
                }
            },
            {
                name: "Geri dönüş lideri",
                description: "Takım gerideyken motive olur",
                impact: {
                    comeback_odds: 1.2
                }
            },
            {
                name: "Baskı sever",
                description: "Taraftar önünde daha iyi oynar",
                impact: {
                    away_pressure: 1.2
                }
            }
        ],
        negatif: [
            {
                name: "Panikçi",
                description: "Kritik maçlarda düşer",
                impact: {
                    composure: 0.6
                }
            },
            {
                name: "Kırılgan mental",
                description: "Hata sonrası çöker",
                impact: {
                    recovery_speed: 0.6
                }
            },
            {
                name: "Taraftar baskısından etkilenir",
                description: "İç saha stres yaşar",
                impact: {
                    home_performance: 0.7
                }
            },
            {
                name: "Özgüven sorunu",
                description: "Formsuzluk uzar",
                impact: {
                    slump_duration: 1.5
                }
            }
        ]
    },
    nadir: [
        {
            name: "Derbi canavarı",
            description: "Ezeli rekabetlerde durdurulamaz",
            impact: {
                derby_boost: 1.5
            }
        },
        {
            name: "Kupacı",
            description: "Eliminasyon maçlarının uzmanı",
            impact: {
                cup_boost: 1.4
            }
        },
        {
            name: "Antrenman yıldızı",
            description: "Hafta içi muazzam çalışır",
            impact: {
                training_peak: 1.5
            }
        },
        {
            name: "Sosyal medya bağımlısı",
            description: "Popülerliği artırır ama odak dağıtabilir",
            impact: {
                fan_growth: 1.2,
                focus: 0.9
            }
        },
        {
            name: "Sessiz suikastçı",
            description: "Beklenmedik anlarda sahneye çıkar",
            impact: {
                surprise_goal: 1.3
            }
        },
        {
            name: "Kaos adamı",
            description: "Maçı karıştırır, rakibi bozar",
            impact: {
                opponent_mistake: 1.2
            }
        },
        {
            name: "Fan favorisi",
            description: "Bilet ve forma satışlarını artırır",
            impact: {
                commercial: 1.4
            }
        },
        {
            name: "Kulüp efsanesi",
            description: "Camianın sevgilisi",
            impact: {
                reputation_boost: 1.5
            }
        },
        {
            name: "Gezgin futbolcu",
            description: "Çabuk uyum sağlar",
            impact: {
                adaptation: 2.0
            }
        },
        {
            name: "Tek sezonluk yıldız",
            description: "Kısa süreli patlama yapar",
            impact: {
                temporary_peak: 2.0,
                fall_off: 0.5
            }
        }
    ]
};
const TRAIT_LEVELS = {
    BEYAZ: {
        label: 'Standart',
        color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        icon: '⚪'
    },
    LACIVERT: {
        label: 'Elit',
        color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        icon: '🔵'
    },
    ALTIN: {
        label: 'Efsanevi',
        color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        icon: '🟠'
    },
    MOR: {
        label: 'Üstat',
        color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        icon: '🟣'
    }
};
const PERSONALITY_LABELS = {
    "Profesyonel": "Antrenmanda çok hızlı gelişir, disiplini elden bırakmaz.",
    "Egoist": "Takım uyumunu bozar, pas vermeyi sevmez.",
    "Sadık": "Transfer tekliflerini reddeder, kulübüne bağlıdır.",
    "Hırslı": "Kaybetmeye tahammülü yoktur, büyük maçlarda vites artırır.",
    "Tembel": "Kondisyonu yavaş toparlanır, antrenmanı sevmez.",
    "Panikçi": "Skor darlarıldığında hata yapma riski çok yüksektir.",
    "Mentor": "Yanındaki gençlerin gelişim hızını %25 artırır.",
    "Problem çıkaran": "Kötü sonuçlarda soyunma odasında huzursuzluk yaratır."
};
const PLAY_STYLES = {
    defans: [
        {
            name: "Kafacı (defans)",
            bonus: {
                heading: 0.3
            }
        },
        {
            name: "Uzun pasçı",
            bonus: {
                passing: 0.2
            }
        },
        {
            name: "Yerinde müdahale",
            bonus: {
                defending: 0.15
            }
        },
        {
            name: "Blokçu",
            bonus: {
                defending: 0.2
            }
        }
    ],
    orta_saha: [
        {
            name: "Ara pasçı",
            bonus: {
                assist_rate: 0.25
            }
        },
        {
            name: "Plaseci",
            bonus: {
                shooting: 0.15
            }
        },
        {
            name: "Power shot",
            bonus: {
                long_shot: 0.2
            }
        },
        {
            name: "Uzaktan şutçu",
            bonus: {
                long_shot: 0.2
            }
        }
    ],
    forvet: [
        {
            name: "Plaseci",
            bonus: {
                shooting: 0.15
            }
        },
        {
            name: "Power shot",
            bonus: {
                shooting: 0.2
            }
        },
        {
            name: "Kafacı (forvet)",
            bonus: {
                heading: 0.3
            }
        },
        {
            name: "Koşu ustası",
            bonus: {
                speed: 0.2
            }
        },
        {
            name: "Kontra bitiricisi",
            bonus: {
                goal_rate: 0.2
            }
        }
    ],
    kaleci: [
        {
            name: "Penaltı kurtarıcı",
            bonus: {
                penalty_save: 0.3
            }
        },
        {
            name: "Uzun degajcı",
            bonus: {
                passing: 0.2
            }
        },
        {
            name: "Libero kaleci",
            bonus: {
                control: 0.2
            }
        }
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/fm/injuryManager.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Injury Manager — Sakatlık Sistemi
 *
 * Sakatlık riski, sakatlık üretimi ve fizyoterapist iyileştirme hesaplamaları.
 * Maç motoru veya cron tarafından çağrılır; bu modül sadece hesaplama yapar.
 */ // ═══════════════════════════════════════════════════════════════
// Sakatlık Riski Hesaplama
// ═══════════════════════════════════════════════════════════════
/**
 * Dayanıklılık (stamina) değerine göre sakatlık riski olasılığını hesaplar.
 *
 * @param stamina - Oyuncunun dayanıklılık değeri (0-100)
 * @returns Sakatlık olasılığı (0-1 arası)
 *
 * - stamina >= 60 → %0 risk (sakatlık yok)
 * - stamina 50-59 → %10 risk
 * - stamina 40-49 → %30 risk
 * - stamina < 40 → %60 risk
 */ __turbopack_context__.s([
    "applyHealingToDate",
    ()=>applyHealingToDate,
    "calculateInjuryRisk",
    ()=>calculateInjuryRisk,
    "calculatePhysioHealing",
    ()=>calculatePhysioHealing,
    "generateInjury",
    ()=>generateInjury
]);
function calculateInjuryRisk(stamina) {
    try {
        const s = Math.max(0, Math.min(100, stamina));
        if (s >= 60) return 0;
        if (s >= 50) return 0.10; // 10%
        if (s >= 40) return 0.30; // 30%
        return 0.60; // 60%
    } catch  {
        return 0;
    }
}
/** Ağırlıklar: %50 hafif, %35 orta, %15 ağır */ const SEVERITY_WEIGHTS = [
    {
        severity: 'light',
        weight: 0.50,
        minDays: 1,
        maxDays: 3
    },
    {
        severity: 'medium',
        weight: 0.35,
        minDays: 4,
        maxDays: 10
    },
    {
        severity: 'heavy',
        weight: 0.15,
        minDays: 11,
        maxDays: 30
    }
];
function generateInjury() {
    try {
        const roll = Math.random();
        let cumulative = 0;
        for (const entry of SEVERITY_WEIGHTS){
            cumulative += entry.weight;
            if (roll < cumulative) {
                const days = Math.floor(Math.random() * (entry.maxDays - entry.minDays + 1)) + entry.minDays;
                return {
                    severity: entry.severity,
                    days
                };
            }
        }
        // Fallback — hafif sakatlık
        return {
            severity: 'light',
            days: Math.floor(Math.random() * 3) + 1
        };
    } catch  {
        return {
            severity: 'light',
            days: 2
        };
    }
}
// ═══════════════════════════════════════════════════════════════
// Fizyoterapist İyileştirme Hesaplama
// ═══════════════════════════════════════════════════════════════
/**
 * Yıldız seviyesine göre gün kısaltma tablosu
 */ const STAR_HEALING_MAP = {
    1: 2,
    2: 4,
    3: 8,
    4: 12,
    5: 16
};
function calculatePhysioHealing(physioStars) {
    try {
        if (!physioStars || physioStars.length === 0) return 0;
        let totalHealing = 0;
        for (const stars of physioStars){
            const clampedStars = Math.max(1, Math.min(5, Math.round(stars)));
            totalHealing += STAR_HEALING_MAP[clampedStars] || 0;
        }
        return totalHealing;
    } catch  {
        return 0;
    }
}
function applyHealingToDate(injuryEndDate, healingDays) {
    try {
        const endDate = new Date(injuryEndDate);
        const newEndMs = endDate.getTime() - healingDays * 24 * 60 * 60 * 1000;
        const now = new Date();
        // Yeni bitiş tarihi geçmişse sakatlık sona erdi
        if (newEndMs <= now.getTime()) {
            return null;
        }
        return new Date(newEndMs).toISOString();
    } catch  {
        return injuryEndDate;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/fm/formRatingService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * formRatingService.ts - Oyuncu Form Puanı Hesaplama Servisi (ADIM 1B)
 *
 * Her oyuncunun son 5 maçındaki performans ortalamasını (gol, asist, pas isabeti,
 * top çalma, kurtarış) hesaplayıp form_rating (0-100) alanına yazar.
 * Günlük cron job tarafından çağrılır.
 */ __turbopack_context__.s([
    "addInjuryRecord",
    ()=>addInjuryRecord,
    "calculateFormRating",
    ()=>calculateFormRating,
    "cleanupOldInjuryRecords",
    ()=>cleanupOldInjuryRecords,
    "countRecentInjuries",
    ()=>countRecentInjuries,
    "generateInjuryRecord",
    ()=>generateInjuryRecord,
    "updateAllFormRatings",
    ()=>updateAllFormRatings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/sharedUtils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$injuryManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/injuryManager.ts [app-client] (ecmascript)");
;
;
;
function calculateFormRating(player, careerStats) {
    let formScore = 50; // Başlangıç değeri (ortalam form)
    // 1. match_ratings dizisi varsa, son 5 maçın ortalamasını al
    if (player.match_ratings && player.match_ratings.length > 0) {
        const lastFive = player.match_ratings.slice(-5);
        const avgRating = lastFive.reduce((sum, r)=>sum + r, 0) / lastFive.length;
        // match_ratings 0-10 arası olabilir (6.5, 7.2 gibi) veya 0-100 arası
        // 0-10 skalasıysa 10 ile çarp, 0-100 skalasıysa direkt kullan
        const normalizedRating = avgRating <= 10 ? avgRating * 10 : avgRating;
        formScore = normalizedRating;
    }
    // 2. career_stats varsa bonus/ceza uygula
    if (careerStats) {
        const matchesPlayed = careerStats.matches_played || 1;
        // Gol bonusu: forvetler için daha yüksek etki
        const goalsPerMatch = (careerStats.goals || 0) / matchesPlayed;
        if (player.position === 'FWD' || player.position === 'MID') {
            if (goalsPerMatch >= 0.8) formScore += 8;
            else if (goalsPerMatch >= 0.5) formScore += 5;
            else if (goalsPerMatch >= 0.3) formScore += 2;
        } else {
            if (goalsPerMatch >= 0.3) formScore += 3;
        }
        // Asist bonusu
        const assistsPerMatch = (careerStats.assists || 0) / matchesPlayed;
        if (assistsPerMatch >= 0.5) formScore += 5;
        else if (assistsPerMatch >= 0.3) formScore += 3;
        // Pas isabeti bonusu
        if (careerStats.pass_accuracy !== undefined) {
            if (careerStats.pass_accuracy >= 85) formScore += 5;
            else if (careerStats.pass_accuracy >= 75) formScore += 3;
            else if (careerStats.pass_accuracy < 60) formScore -= 3;
        }
        // Top çalma bonusu (defansif oyuncular için)
        if (player.position === 'DEF' || player.position === 'GK') {
            const tacklesPerMatch = (careerStats.tackles || 0) / matchesPlayed;
            if (tacklesPerMatch >= 4) formScore += 5;
            else if (tacklesPerMatch >= 2) formScore += 2;
        }
        // Kurtarış bonusu (kaleciler için)
        if (player.position === 'GK' && careerStats.saves !== undefined) {
            const savesPerMatch = careerStats.saves / matchesPlayed;
            if (savesPerMatch >= 5) formScore += 8;
            else if (savesPerMatch >= 3) formScore += 4;
        }
    }
    // 3. Mevcut kondisyon (cond) etkisi
    if (player.cond < 50) formScore -= 10;
    else if (player.cond < 70) formScore -= 5;
    else if (player.cond >= 90) formScore += 3;
    // 4. Moral etkisi
    if (player.morale < 30) formScore -= 8;
    else if (player.morale < 50) formScore -= 4;
    else if (player.morale >= 80) formScore += 3;
    // 5. Sakatlık durumunda form düşüşü
    if (player.injury) {
        formScore -= 15;
    }
    // 0-100 aralığına sınırla
    return Math.max(0, Math.min(100, Math.round(formScore)));
}
async function updateAllFormRatings() {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        return {
            updated: 0,
            errors: [
                'Supabase not configured'
            ]
        };
    }
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
    if (!supabase) {
        return {
            updated: 0,
            errors: [
                'Supabase client is null'
            ]
        };
    }
    const errors = [];
    let updated = 0;
    try {
        // 1. Tüm oyuncuları çek — round-robin batch için LIMIT + OFFSET kullanımı
        // Sıralama yerine, her cron çalışması farklı bir batch işler
        // böylece zaman aşımı olsa bile tüm oyuncular zamanla işlenir
        const BATCH_SIZE = 500;
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        const totalPlayersResult = await supabase.from('players').select('id', {
            count: 'exact',
            head: true
        });
        const totalPlayers = totalPlayersResult.count || 0;
        const maxOffset = Math.max(0, totalPlayers - BATCH_SIZE);
        const offset = dayOfYear * BATCH_SIZE % (maxOffset + 1);
        const { data: allPlayers, error: playersError } = await supabase.from('players').select('id, match_ratings, position, cond, form, morale, injury, injury_history, goalkeeping, defending, passing, shooting, speed, profile_id, team_name').range(offset, offset + BATCH_SIZE - 1);
        if (playersError) {
            console.error('[formRatingService] Error fetching players:', playersError);
            return {
                updated: 0,
                errors: [
                    playersError.message
                ]
            };
        }
        if (!allPlayers || allPlayers.length === 0) {
            return {
                updated: 0,
                errors: []
            };
        }
        console.log(`[formRatingService] Processing ${allPlayers.length} players for form_rating update (offset: ${offset}, total: ${totalPlayers})`);
        // 2. Son maç istatistiklerini player_career_stats'dan çek
        const { data: careerStats } = await supabase.from('player_career_stats').select('player_id, goals, assists, matches_played').order('created_at', {
            ascending: false
        });
        // careerStats'i player_id bazında map'le
        const statsMap = new Map();
        if (careerStats) {
            for (const stat of careerStats){
                if (!statsMap.has(stat.player_id)) {
                    statsMap.set(stat.player_id, stat);
                }
            }
        }
        // 3. Her oyuncu için form_rating hesapla ve güncelle
        const updates = [];
        for (const dbPlayer of allPlayers){
            try {
                // DB'den gelen player'ı Player tipine dönüştür
                const player = {
                    id: dbPlayer.id,
                    position: dbPlayer.position,
                    cond: dbPlayer.cond ?? dbPlayer.form ?? 75,
                    form: dbPlayer.form ?? 50,
                    morale: dbPlayer.morale ?? 60,
                    injury: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safeJsonParse"])(dbPlayer.injury, undefined),
                    match_ratings: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safeJsonParse"])(dbPlayer.match_ratings, []),
                    injury_history: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safeJsonParse"])(dbPlayer.injury_history, [])
                };
                // Career stats'ı al
                const stats = statsMap.get(dbPlayer.id);
                const formRating = calculateFormRating(player, stats ? {
                    goals: stats.goals,
                    assists: stats.assists,
                    matches_played: stats.matches_played
                } : undefined);
                updates.push({
                    id: dbPlayer.id,
                    form_rating: formRating
                });
            } catch (err) {
                const errMsg = `Error calculating form_rating for player ${dbPlayer.id}: ${err}`;
                errors.push(errMsg);
                console.error(`[formRatingService] ${errMsg}`);
            }
        }
        // 4. Toplu güncelleme (batch upsert, 100'erli gruplar)
        for(let i = 0; i < updates.length; i += 100){
            const batch = updates.slice(i, i + 100);
            try {
                const { error: updateError } = await supabase.from('players').upsert(batch, {
                    onConflict: 'id'
                });
                if (updateError) {
                    errors.push(`Batch update error (offset ${i}): ${updateError.message}`);
                    console.error(`[formRatingService] Batch update error:`, updateError);
                } else {
                    updated += batch.length;
                }
            } catch (err) {
                errors.push(`Batch update exception (offset ${i}): ${err}`);
            }
        }
        console.log(`[formRatingService] Updated ${updated}/${allPlayers.length} players, ${errors.length} errors`);
    } catch (err) {
        const errMsg = `Fatal error in updateAllFormRatings: ${err}`;
        errors.push(errMsg);
        console.error(`[formRatingService] ${errMsg}`);
    }
    return {
        updated,
        errors
    };
}
// ═══════════════════════════════════════════════════════════════
// SAKATLIK GEÇMİŞİ YARDIMCI FONKSİYONLARI
// ═══════════════════════════════════════════════════════════════
/** Sakatlık tipleri — injuryManager ile tutarlı */ const INJURY_TYPES = [
    'hamstring',
    'ankle',
    'knee',
    'shoulder',
    'back',
    'groin',
    'calf',
    'thigh',
    'wrist',
    'rib',
    'concussion',
    'muscle_strain',
    'ligament',
    'tendinitis'
];
function generateInjuryRecord(durationDays) {
    // Eğer süre belirtilmemişse, injuryManager'dan tutarlı sakatlık hesapla
    if (durationDays === undefined) {
        const { days } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$injuryManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateInjury"])();
        durationDays = days;
    }
    return {
        date: new Date().toISOString().split('T')[0],
        duration_days: durationDays,
        type: INJURY_TYPES[Math.floor(Math.random() * INJURY_TYPES.length)]
    };
}
function addInjuryRecord(injuryHistory, record) {
    const history = injuryHistory || [];
    return [
        ...history,
        record
    ];
}
function countRecentInjuries(injuryHistory, days = 30) {
    if (!injuryHistory || injuryHistory.length === 0) return 0;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return injuryHistory.filter((record)=>{
        try {
            const recordDate = new Date(record.date);
            return recordDate >= cutoffDate;
        } catch  {
            return false;
        }
    }).length;
}
function cleanupOldInjuryRecords(injuryHistory) {
    if (!injuryHistory || injuryHistory.length === 0) return [];
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return injuryHistory.filter((record)=>{
        try {
            return new Date(record.date) >= oneYearAgo;
        } catch  {
            return false;
        }
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/fm/inflation.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * inflation.ts — Sezon Bazlı Enflasyon Sistemi
 *
 * Oyun ekonomisi enflasyon değerleri:
 * - Her sezon %8 enflasyon (bütünleşik)
 * - Sezon 1: 1.00x (baz)
 * - Sezon 2: 1.08x
 * - Sezon 3: 1.17x
 * - Sezon 5: 1.36x
 * - Sezon 10: 1.85x
 *
 * Kullanım:
 *   const factor = getInflationFactor(currentDay);
 *   const adjustedValue = baseValue * factor;
 */ /** Sezon başına enflasyon oranı (%8) */ __turbopack_context__.s([
    "DAYS_PER_SEASON",
    ()=>DAYS_PER_SEASON,
    "INFLATION_RATE_PER_SEASON",
    ()=>INFLATION_RATE_PER_SEASON,
    "calculateLoanFeeEuro",
    ()=>calculateLoanFeeEuro,
    "getCurrentSeason",
    ()=>getCurrentSeason,
    "getDayInSeason",
    ()=>getDayInSeason,
    "getInflationFactor",
    ()=>getInflationFactor,
    "getInflationSummary",
    ()=>getInflationSummary
]);
const INFLATION_RATE_PER_SEASON = 0.08;
const DAYS_PER_SEASON = 294;
function getCurrentSeason(currentDay) {
    if (currentDay < 1) return 1;
    return Math.floor((currentDay - 1) / DAYS_PER_SEASON) + 1;
}
function getDayInSeason(currentDay) {
    if (currentDay < 1) return 1;
    return (currentDay - 1) % DAYS_PER_SEASON + 1;
}
function getInflationFactor(currentDay) {
    const season = getCurrentSeason(currentDay);
    const dayInSeason = getDayInSeason(currentDay);
    // Tam sezonlar için üstel enflasyon
    const fullSeasonFactor = Math.pow(1 + INFLATION_RATE_PER_SEASON, season - 1);
    // Mevsim içi oransal ilerleme (yumuşak geçiş)
    const seasonProgress = (dayInSeason - 1) / DAYS_PER_SEASON;
    const intraSeasonFactor = 1 + INFLATION_RATE_PER_SEASON * seasonProgress;
    return fullSeasonFactor * intraSeasonFactor;
}
function calculateLoanFeeEuro(marketValue, currentDay, loanPercentage = 0.15) {
    const inflationFactor = getInflationFactor(currentDay);
    const rawFee = marketValue * loanPercentage * inflationFactor;
    // Minimum kiralama ücreti: 50.000 €
    // Maksimum kiralama ücreti: piyasa değerinin %40'ı (enflasyon dahil)
    const minFee = 50_000;
    const maxFee = marketValue * 0.40 * inflationFactor;
    return Math.max(minFee, Math.min(maxFee, Math.round(rawFee)));
}
function getInflationSummary(currentDay) {
    const season = getCurrentSeason(currentDay);
    const dayInSeason = getDayInSeason(currentDay);
    const factor = getInflationFactor(currentDay);
    return {
        season,
        dayInSeason,
        inflationFactor: parseFloat(factor.toFixed(4)),
        inflationPercent: `${((factor - 1) * 100).toFixed(1)}%`
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/fm/valuation.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * valuation.ts - Oyuncu Piyasa Değeri Hesaplama (ADIM 1C güncellendi)
 *
 * FM-tarzı değerleme mantığı:
 * - Temel değer: rating'e göre üstel büyüme
 * - Yaş faktörleri: gençler potansiyel bonusu, yaşlılar düşüş
 * - Form rating: son 5 maç performansı (±%25)
 * - Sakatlık geçmişi: son 30 günde 2+ sakatlık → %20 düşüş
 * - Trait, arketip, istisnai istatistik bonusları
 */ __turbopack_context__.s([
    "calculateMarketValue",
    ()=>calculateMarketValue,
    "formatCurrency",
    ()=>formatCurrency,
    "getTransferCorridor",
    ()=>getTransferCorridor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$formRatingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/formRatingService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/sharedUtils.ts [app-client] (ecmascript)");
;
;
function formatCurrency(val) {
    if (val >= 1_000_000) {
        return `${(val / 1_000_000).toFixed(1)}M €`;
    }
    if (val >= 1_000) {
        return `${(val / 1_000).toFixed(0)}K €`;
    }
    return `${Math.round(val)} €`;
}
function calculateMarketValue(player, currentDay) {
    // ═══════════════════════════════════════════════════════════
    // TEMEL DEĞER: Rating'e göre üstel büyüme
    // ═══════════════════════════════════════════════════════════
    const baseValue = 50000;
    const ratingFactor = Math.pow(1.11, player.rating - 40);
    let value = baseValue * ratingFactor;
    // ═══════════════════════════════════════════════════════════
    // YAŞ FAKTÖRÜ (ADIM 1C - Güncellendi)
    // Gençler (<22): +%30 potansiyel bonusu
    // Yaşlılar (>32): -%20 düşüş
    // ═══════════════════════════════════════════════════════════
    if (player.age < 22) {
        // Genç oyuncular: potansiyel bonusu +%30
        value *= 1.30;
    } else if (player.age < 24) {
        value *= 1.4;
    } else if (player.age < 28) {
        value *= 1.1;
    } else if (player.age > 32) {
        // Yaşlı oyuncular: -%20 düşüş
        value *= 0.80;
    } else if (player.age > 30) {
        value *= 0.6;
    }
    // Potansiyel etki: Genç oyuncularda potential > rating ise ek bonus
    if (player.potential > player.rating && player.age < 23) {
        const potentialGap = player.potential - player.rating;
        value *= 1 + potentialGap * 0.08;
    }
    // ═══════════════════════════════════════════════════════════
    // FORM RATING FAKTÖRÜ (ADIM 1C - YENİ)
    // Son 5 maç performansı: ±%25 etki
    // form_rating 50 = nötr, >50 = artış, <50 = düşüş
    // ═══════════════════════════════════════════════════════════
    const formRating = player.form_rating ?? player.form ?? 50;
    if (formRating !== 50) {
        // 50'den her 1 puan sapma = %0.5 etki (max ±%25)
        // formRating=100 → +25%, formRating=0 → -25%, formRating=50 → 0%
        const formMultiplier = 1 + (formRating - 50) / 100;
        // ±%25 sınırla
        const clampedMultiplier = Math.max(0.75, Math.min(1.25, formMultiplier));
        value *= clampedMultiplier;
    }
    // ═══════════════════════════════════════════════════════════
    // SAKATLIK GEÇMİŞİ FAKTÖRÜ (ADIM 1C - YENİ)
    // Son 30 günde 2+ sakatlık → -%20 düşüş
    // ═══════════════════════════════════════════════════════════
    const recentInjuryCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$formRatingService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["countRecentInjuries"])(player.injury_history, 30);
    if (recentInjuryCount >= 2) {
        value *= 0.80; // %20 düşüş
    } else if (recentInjuryCount === 1) {
        value *= 0.92; // Tek sakatlık: %8 düşüş
    }
    // Aktif sakatlık varsa ek düşüş
    if (player.injury) {
        value *= 0.85; // Aktif sakatlık: %15 düşüş
    }
    // ═══════════════════════════════════════════════════════════
    // TRAIT LEVEL ÖDÜLLERİ
    // ═══════════════════════════════════════════════════════════
    if (player.traitLevels) {
        Object.values(player.traitLevels).forEach((lvl)=>{
            if (lvl === 'MOR') value *= 1.40;
            else if (lvl === 'ALTIN') value *= 1.25;
            else if (lvl === 'LACIVERT') value *= 1.10;
            else if (lvl === 'BEYAZ') value *= 1.02;
        });
    }
    // Pozitif trait bonusu (her biri +%3, max +%15)
    const positiveTraitCount = player.traits?.length || 0;
    if (positiveTraitCount > 0) {
        value *= 1 + Math.min(0.15, positiveTraitCount * 0.03);
    }
    // Negatif trait cezası (her biri -%5, max -%25)
    const negTraitCount = player.negTraits?.length || 0;
    if (negTraitCount > 0) {
        value *= Math.max(0.75, 1 - negTraitCount * 0.05);
    }
    // ═══════════════════════════════════════════════════════════
    // ARKETİP BONUSU
    // ═══════════════════════════════════════════════════════════
    if (player.archetype) {
        const highValueArchetypes = [
            'Playmaker',
            'Ball Winner',
            'Target Man',
            'Complete Forward',
            'Sweeper Keeper',
            'Regista',
            'Mezzala',
            'Inverted Wing Back',
            'False 9',
            'Complete Midfielder',
            'Box to Box'
        ];
        if (highValueArchetypes.some((a)=>player.archetype.includes(a))) {
            value *= 1.08;
        } else {
            value *= 1.05;
        }
    }
    // ═══════════════════════════════════════════════════════════
    // YAN MEVKİ ÇOKYÖNLÜLÜK BONUSU
    // ═══════════════════════════════════════════════════════════
    const secPosCount = player.secondaryPositions?.length || 0;
    if (secPosCount > 0) {
        value *= 1 + Math.min(0.06, secPosCount * 0.02);
    }
    // ═══════════════════════════════════════════════════════════
    // ESKİ FORM ETKİSİ (backward compat - artık form_rating kullanılıyor)
    // ═══════════════════════════════════════════════════════════
    // form_rating yoksa eski form alanını hafif etki olarak kullan
    if (!player.form_rating && player.form) {
        if (player.form > 75) value *= 1.03;
        else if (player.form < 40) value *= 0.97;
    }
    // ═══════════════════════════════════════════════════════════
    // İSTİSNAİ İSTATİSTİK BONUSU
    // ═══════════════════════════════════════════════════════════
    const statKeys = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$sharedUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VALUATION_STAT_KEYS"];
    let exceptional90Count = 0;
    let exceptional95Count = 0;
    for (const key of statKeys){
        const val = player[key];
        if (typeof val === 'number') {
            if (val >= 95) exceptional95Count++;
            else if (val >= 90) exceptional90Count++;
        }
    }
    if (exceptional90Count > 0) value *= 1 + Math.min(0.10, exceptional90Count * 0.02);
    if (exceptional95Count > 0) value *= 1 + Math.min(0.15, exceptional95Count * 0.03);
    // ═══════════════════════════════════════════════════════════
    // ENFLASYON FAKTÖRÜ (cron ile tutarlılık için)
    // currentDay verilirse enflasyon çarpanı uygulanır
    // ═══════════════════════════════════════════════════════════
    if (currentDay && currentDay > 1) {
        const { getInflationFactor } = __turbopack_context__.r("[project]/src/lib/fm/inflation.ts [app-client] (ecmascript)");
        value *= getInflationFactor(currentDay);
    }
    // Minimum değer (150K) ve yuvarlama
    return Math.max(150000, Math.round(value));
}
function getTransferCorridor(value) {
    // Pahalı oyuncular için daha geniş koridor
    const minMult = value > 5_000_000 ? 0.75 : 0.80;
    const maxMult = value > 5_000_000 ? 1.6 : 1.5;
    return {
        min: Math.round(value * minMult),
        max: Math.round(value * maxMult)
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/fm/traitConflicts.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CONFLICTING_TRAITS",
    ()=>CONFLICTING_TRAITS,
    "findConflicts",
    ()=>findConflicts,
    "hasConflict",
    ()=>hasConflict
]);
const CONFLICTING_TRAITS = {
    // Positive vs Negative Skills
    "Ofsayt ustası": [
        "Ofsayta düşer"
    ],
    "Ofsayta düşer": [
        "Ofsayt ustası"
    ],
    "Soğukkanlı": [
        "Panik yapar",
        "Panikçi",
        "Panik yapar",
        "Kararsız"
    ],
    "Panik yapar": [
        "Soğukkanlı",
        "Lider stoper",
        "Lider kaleci"
    ],
    "Panikçi": [
        "Soğukkanlı",
        "Büyük maç oyuncusu",
        "Büyük maç kalecisi",
        "Lider stoper",
        "Lider kaleci"
    ],
    "Profesyonel": [
        "Tembel",
        "Disiplinsiz",
        "Gece hayatı düşkünü",
        "Rahatına düşkün",
        "Problem çıkaran",
        "Tartışmacı",
        "Gece hayatı düşkünü"
    ],
    "Tembel": [
        "Profesyonel",
        "Çalışkan",
        "İsteksiz",
        "Dayanıklı",
        "Pres ustası",
        "Box-to-box"
    ],
    "Disiplinsiz": [
        "Profesyonel",
        "Disiplinli",
        "Lider stoper",
        "Lider kaleci",
        "Soyunma odası lideri"
    ],
    "Disiplinli": [
        "Disiplinsiz",
        "Problem çıkaran",
        "Tartışmacı",
        "Kart manyağı"
    ],
    "Hırslı": [
        "İsteksiz",
        "Rahatına düşkün",
        "Pısırık"
    ],
    "Çalışkan": [
        "Tembel",
        "İsteksiz",
        "Yedek kalmayı sever"
    ],
    "İsteksiz": [
        "Hırslı",
        "Çalışkan",
        "Kazanan karakter",
        "Taraftar baskısından etkilenir"
    ],
    "Takım oyuncusu": [
        "Egoist",
        "Bencil",
        "Problem çıkaran"
    ],
    "Egoist": [
        "Takım oyuncusu",
        "Sessiz lider",
        "Soyunma odası lideri",
        "Mentor"
    ],
    "Bencil": [
        "Takım oyuncusu",
        "Ara pasçı",
        "Oyun kurucu"
    ],
    "Pres ustası": [
        "Savunmaya yardım etmez",
        "Tembel",
        "Ağır kalır"
    ],
    "Savunmaya yardım etmez": [
        "Pres ustası",
        "Dayanıklı",
        "Çalışkan",
        "Box-to-box",
        "Lider stoper"
    ],
    "Bitirici": [
        "Beceriksiz bitirici"
    ],
    "Gol makinesi": [
        "Beceriksiz bitirici"
    ],
    "Beceriksiz bitirici": [
        "Bitirici",
        "Gol makinesi",
        "Fırsatçı",
        "Fırsatçı (forvet)",
        "Kontra bitiricisi"
    ],
    "Oyun kurucu": [
        "Pas hatası yapar",
        "Top kaybı yapar",
        "Yavaş karar verir"
    ],
    "Top dağıtıcı": [
        "Pas hatası yapar",
        "Top kaybı yapar",
        "Yavaş karar verir"
    ],
    "Pas hatası yapar": [
        "Oyun kurucu",
        "Top dağıtıcı",
        "Uzun pas ustası",
        "Pas arası ustası",
        "Uzun pasçı",
        "Ara pasçı"
    ],
    "Top saklayan": [
        "Top kaybı yapar"
    ],
    "Top kaybı yapar": [
        "Top saklayan",
        "Oyun okuyan",
        "Risk hesaplayıcı",
        "Top dağıtıcı"
    ],
    "Oyun görüşü yüksek": [
        "Yanlış karar verir",
        "Yavaş karar verir"
    ],
    "Yanlış karar verir": [
        "Oyun görüşü yüksek",
        "Soğukkanlı",
        "Oyun okuyan",
        "Libero kaleci"
    ],
    "Yavaş karar verir": [
        "Oyun görüşü yüksek",
        "Zamanlama hatası",
        "Refleks canavarı",
        "Regista",
        "Sweeper keeper"
    ],
    "Güvenli eller": [
        "Sektirir"
    ],
    "Sektirir": [
        "Güvenli eller"
    ],
    "Refleks canavarı": [
        "Yavaş refleks"
    ],
    "Yavaş refleks": [
        "Refleks canavarı"
    ],
    "Hava hakimiyeti": [
        "Hava zaafı"
    ],
    "Hava zaafı": [
        "Hava hakimiyeti",
        "Kafacı (defans)",
        "Kafacı (forvet)"
    ],
    "Büyük maç oyuncusu": [
        "Panikçi",
        "Panik yapar"
    ],
    "Büyük maç kalecisi": [
        "Panik yapar",
        "Panikçi"
    ],
    // PlayStyles vs Negative Traits
    "Uzun pasçı": [
        "Pas hatası yapar"
    ],
    "Ara pasçı": [
        "Pas hatası yapar",
        "Yanlış karar verir"
    ],
    "Koşu ustası": [
        "Ağır kalır"
    ],
    "Kontra bitiricisi": [
        "Beceriksiz bitirici",
        "Ofsayta düşer"
    ],
    "Kafacı (defans)": [
        "Hava zaafı"
    ],
    "Kafacı (forvet)": [
        "Hava zaafı"
    ],
    "Penaltı kurtarıcı": [
        "Yavaş refleks"
    ],
    "Libero kaleci": [
        "Yanlış karar verir",
        "Çıkış hatası"
    ],
    "Ağır kalır": [
        "Hızlı forvet",
        "Hızlı stoper",
        "Koşu ustası",
        "Hızlı kanat",
        "Sprinter",
        "Advanced fwd",
        "Inside fwd"
    ],
    "Konsantrasyon düşüklüğü": [
        "Lider stoper",
        "Lider kaleci",
        "Maestro",
        "Oyun okuyan",
        "Pozisyon ustası",
        "Pozisyoncu",
        "Sahte 9",
        "Regista"
    ],
    "Oyun okuyan": [
        "Anticipation hatası",
        "Yanlış karar verir",
        "Panik yapar"
    ],
    "Pozisyon ustası": [
        "Zayıf markaj",
        "Zamanlama hatası",
        "Hücum hattında yerini ayarlayamaz"
    ],
    "Regista": [
        "Pas hatası yapar",
        "Yavaş karar verir",
        "Oyun kurucu"
    ],
    "10 numara": [
        "Egoist",
        "Pas hatası yapar",
        "Sessiz lider"
    ],
    "Sahte 9": [
        "Beceriksiz bitirici",
        "Top kaybı yapar"
    ],
    "Sprinter": [
        "Ağır kalır",
        "Tembel"
    ],
    "Lider stoper": [
        "Disiplinsiz",
        "Problem çıkaran",
        "Panik yapar",
        "Konsantrasyon düşüklüğü"
    ],
    "Lider kaleci": [
        "Panik yapar",
        "Sektirir",
        "Yavaş refleks"
    ],
    "Gölge Markajcı": [
        "Zayıf markaj",
        "Zamanlama hatası"
    ],
    "Şut Engelleyici": [
        "Konsantrasyon düşüklüğü"
    ],
    "Alan Kapatıcı": [
        "Yanlış karar verir",
        "Pozisyon hatası"
    ],
    "Pas Duvarı": [
        "Pas hatası yapar",
        "Ağır kalır"
    ],
    "Tazı Defans": [
        "Ağır kalır",
        "Tembel"
    ],
    "Oyun Bozan": [
        "Savunmaya yardım etmez",
        "İsteksiz"
    ],
    "Asla Pes Etmez": [
        "Konsantrasyon düşüklüğü",
        "İsteksiz"
    ],
    "Pozisyon Bekçisi": [
        "Zamanlama hatası",
        "Yanlış karar verir"
    ],
    "Top Hırsızı": [
        "Top kaybı yapar"
    ],
    "Gölge Takipçi": [
        "Savunmaya yardım etmez"
    ],
    "Mücadeleci Stoper": [
        "Panik yapar",
        "Pısırık"
    ]
};
function hasConflict(trait1, trait2) {
    if (trait1 === trait2) return true;
    const conflicts = CONFLICTING_TRAITS[trait1];
    return conflicts ? conflicts.includes(trait2) : false;
}
function findConflicts(traits) {
    const found = [];
    for(let i = 0; i < traits.length; i++){
        for(let j = i + 1; j < traits.length; j++){
            if (hasConflict(traits[i], traits[j])) {
                found.push([
                    traits[i],
                    traits[j]
                ]);
            }
        }
    }
    return found;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/fm/attributeGenerator.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Mevki Bazlı Ağırlıklı Rastgele Özellik Dağıtım Sistemi
 * Position-Based Weighted Random Attribute Distribution
 */ __turbopack_context__.s([
    "ATTRIBUTE_KEY_MAP",
    ()=>ATTRIBUTE_KEY_MAP,
    "generateAllAttributes",
    ()=>generateAllAttributes,
    "generateAttributeValue",
    ()=>generateAttributeValue,
    "getPositionKey",
    ()=>getPositionKey,
    "positionPriorities",
    ()=>positionPriorities
]);
const priorityRanges = {
    cok_dusuk: [
        20,
        50
    ],
    dusuk: [
        30,
        65
    ],
    orta: [
        40,
        80
    ],
    yuksek: [
        55,
        90
    ],
    cok_yuksek: [
        70,
        95
    ]
};
function generateAttributeValue(priority) {
    const [min, max] = priorityRanges[priority];
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const positionPriorities = {
    GK: {
        teknik: {
            bitiricilik: 'cok_dusuk',
            dribbling: 'cok_dusuk',
            ilk_kontrol: 'dusuk',
            kafa_vurusu: 'dusuk',
            markaj: 'cok_dusuk',
            orta_yapma: 'cok_dusuk',
            pas: 'dusuk',
            teknik: 'dusuk',
            top_kapma: 'cok_dusuk',
            uzaktan_sut: 'cok_dusuk'
        },
        mental: {
            agresiflik: 'dusuk',
            cesaret: 'dusuk',
            caliskanlik: 'orta',
            karar_alma: 'yuksek',
            kararlilik: 'orta',
            konsantrasyon: 'cok_yuksek',
            liderlik: 'orta',
            onsezi: 'yuksek',
            ozel_yetenek: 'cok_dusuk',
            pozisyon_alma: 'cok_yuksek',
            sogukkanlilik: 'yuksek',
            takim_oyunu: 'dusuk',
            vizyon: 'cok_dusuk'
        },
        fiziksel: {
            ceviklik: 'yuksek',
            dayaniklilik: 'dusuk',
            denge: 'yuksek',
            guc: 'yuksek',
            hiz: 'dusuk',
            hizlanma: 'dusuk',
            ziplama: 'yuksek'
        }
    },
    DEF: {
        teknik: {
            bitiricilik: 'dusuk',
            dribbling: 'dusuk',
            ilk_kontrol: 'orta',
            kafa_vurusu: 'yuksek',
            markaj: 'yuksek',
            orta_yapma: 'yuksek',
            pas: 'orta',
            teknik: 'orta',
            top_kapma: 'yuksek',
            uzaktan_sut: 'dusuk'
        },
        mental: {
            agresiflik: 'yuksek',
            cesaret: 'yuksek',
            caliskanlik: 'yuksek',
            karar_alma: 'yuksek',
            kararlilik: 'yuksek',
            konsantrasyon: 'yuksek',
            liderlik: 'yuksek',
            onsezi: 'yuksek',
            ozel_yetenek: 'dusuk',
            pozisyon_alma: 'yuksek',
            sogukkanlilik: 'orta',
            takim_oyunu: 'yuksek',
            vizyon: 'dusuk'
        },
        fiziksel: {
            ceviklik: 'orta',
            dayaniklilik: 'yuksek',
            denge: 'yuksek',
            guc: 'yuksek',
            hiz: 'yuksek',
            hizlanma: 'orta',
            ziplama: 'yuksek'
        }
    },
    MID: {
        teknik: {
            bitiricilik: 'orta',
            dribbling: 'yuksek',
            ilk_kontrol: 'yuksek',
            kafa_vurusu: 'orta',
            markaj: 'orta',
            orta_yapma: 'yuksek',
            pas: 'cok_yuksek',
            teknik: 'yuksek',
            top_kapma: 'yuksek',
            uzaktan_sut: 'yuksek'
        },
        mental: {
            agresiflik: 'orta',
            cesaret: 'orta',
            caliskanlik: 'yuksek',
            karar_alma: 'yuksek',
            kararlilik: 'yuksek',
            konsantrasyon: 'orta',
            liderlik: 'orta',
            onsezi: 'orta',
            ozel_yetenek: 'yuksek',
            pozisyon_alma: 'orta',
            sogukkanlilik: 'orta',
            takim_oyunu: 'yuksek',
            vizyon: 'cok_yuksek'
        },
        fiziksel: {
            ceviklik: 'yuksek',
            dayaniklilik: 'cok_yuksek',
            denge: 'orta',
            guc: 'orta',
            hiz: 'yuksek',
            hizlanma: 'yuksek',
            ziplama: 'orta'
        }
    },
    FWD: {
        teknik: {
            bitiricilik: 'cok_yuksek',
            dribbling: 'yuksek',
            ilk_kontrol: 'yuksek',
            kafa_vurusu: 'yuksek',
            markaj: 'cok_dusuk',
            orta_yapma: 'orta',
            pas: 'orta',
            teknik: 'yuksek',
            top_kapma: 'dusuk',
            uzaktan_sut: 'yuksek'
        },
        mental: {
            agresiflik: 'orta',
            cesaret: 'yuksek',
            caliskanlik: 'orta',
            karar_alma: 'orta',
            kararlilik: 'yuksek',
            konsantrasyon: 'dusuk',
            liderlik: 'dusuk',
            onsezi: 'dusuk',
            ozel_yetenek: 'yuksek',
            pozisyon_alma: 'dusuk',
            sogukkanlilik: 'yuksek',
            takim_oyunu: 'orta',
            vizyon: 'orta'
        },
        fiziksel: {
            ceviklik: 'yuksek',
            dayaniklilik: 'orta',
            denge: 'orta',
            guc: 'yuksek',
            hiz: 'cok_yuksek',
            hizlanma: 'cok_yuksek',
            ziplama: 'yuksek'
        }
    }
};
function getPositionKey(position) {
    if (position === 'GK') return 'GK';
    if ([
        'CB',
        'LB',
        'RB',
        'LWB',
        'RWB'
    ].includes(position)) return 'DEF';
    if ([
        'CDM',
        'CM',
        'CAM',
        'LM',
        'RM'
    ].includes(position)) return 'MID';
    return 'FWD';
}
const ATTRIBUTE_KEY_MAP = {
    // Teknik
    bitiricilik: 'finishing',
    dribbling: 'dribbling',
    ilk_kontrol: 'firstTouch',
    kafa_vurusu: 'heading',
    markaj: 'marking',
    orta_yapma: 'crossing',
    pas: 'passing',
    teknik: 'technique',
    top_kapma: 'tackling',
    uzaktan_sut: 'longShots',
    // Mental
    agresiflik: 'aggression',
    cesaret: 'bravery',
    caliskanlik: 'workRate',
    karar_alma: 'decisions',
    kararlilik: 'determination',
    konsantrasyon: 'concentration',
    liderlik: 'leadership',
    onsezi: 'anticipation',
    ozel_yetenek: 'flair',
    pozisyon_alma: 'positioning',
    sogukkanlilik: 'composure',
    takim_oyunu: 'teamwork',
    vizyon: 'vision',
    // Fiziksel
    ceviklik: 'agility',
    dayaniklilik: 'stamina',
    denge: 'balance',
    guc: 'strength',
    hiz: 'speed',
    hizlanma: 'acceleration',
    ziplama: 'jumping'
};
function generateAllAttributes(position) {
    const posKey = getPositionKey(position);
    const priorities = positionPriorities[posKey];
    if (!priorities) {
        // Fallback: orta öncelik ile tüm özellikleri üret
        const result = {};
        for (const [trKey, enKey] of Object.entries(ATTRIBUTE_KEY_MAP)){
            result[enKey] = generateAttributeValue('orta');
        }
        return result;
    }
    const result = {};
    // Teknik özellikler
    for (const [trKey, priority] of Object.entries(priorities.teknik)){
        const enKey = ATTRIBUTE_KEY_MAP[trKey];
        if (enKey) {
            result[enKey] = generateAttributeValue(priority);
        }
    }
    // Mental özellikler
    for (const [trKey, priority] of Object.entries(priorities.mental)){
        const enKey = ATTRIBUTE_KEY_MAP[trKey];
        if (enKey) {
            result[enKey] = generateAttributeValue(priority);
        }
    }
    // Fiziksel özellikler
    for (const [trKey, priority] of Object.entries(priorities.fiziksel)){
        const enKey = ATTRIBUTE_KEY_MAP[trKey];
        if (enKey) {
            result[enKey] = generateAttributeValue(priority);
        }
    }
    return result;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/fm/salaryUtils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * MAAŞ HESAPLAMA — TEK KAYNAK (Single Source of Truth)
 *
 * Oyuncu maaşı hesaplamasında tutarlılık sağlar.
 * Hem playerGenerator.ts (üretim) hem ContractOfferModal.tsx (talep)
 * bu modülü kullanır.
 *
 * Formül:
 *   Normal oyuncular:  rating × SALARY_MULTIPLIER_NORMAL (950)
 *   Serbest oyuncular: rating × SALARY_MULTIPLIER_FREE_AGENT (3500)
 *
 * Serbest oyuncular piyasa değerine yakın maaş ister çünkü
 * kulüpsüzlük riski ve kısa sözleşme tercih edilir.
 */ // ── Sabitler ──────────────────────────────────────────────────────
/** Normal kadro oyuncusu: rating × 950 (rating 80 → 76.000 €/hafta) */ __turbopack_context__.s([
    "SALARY_MULTIPLIER_FREE_AGENT",
    ()=>SALARY_MULTIPLIER_FREE_AGENT,
    "SALARY_MULTIPLIER_NORMAL",
    ()=>SALARY_MULTIPLIER_NORMAL,
    "calculateFreeAgentSalary",
    ()=>calculateFreeAgentSalary,
    "calculatePlayerSalary",
    ()=>calculatePlayerSalary,
    "calculateSalaryRange",
    ()=>calculateSalaryRange,
    "calculateSigningFeeRange",
    ()=>calculateSigningFeeRange,
    "calculateTotalWages",
    ()=>calculateTotalWages
]);
const SALARY_MULTIPLIER_NORMAL = 950;
const SALARY_MULTIPLIER_FREE_AGENT = 900;
function calculatePlayerSalary(rating, isFreeAgent) {
    const multiplier = isFreeAgent ? SALARY_MULTIPLIER_FREE_AGENT : SALARY_MULTIPLIER_NORMAL;
    return Math.floor(rating * multiplier);
}
function calculateSalaryRange(rating, isFreeAgent) {
    const baseSalary = calculatePlayerSalary(rating, isFreeAgent);
    // Max maaş = base × 1.8 (pazarlık payı)
    const maxWeeklySalary = Math.floor(baseSalary * 1.8);
    return {
        minWeeklySalary: baseSalary,
        maxWeeklySalary
    };
}
function calculateFreeAgentSalary(marketValue, rating) {
    if (marketValue > 0) {
        // Piyasa değerinin haftalık ~%2.5'ü (yıllık 1.3 kat spread)
        return Math.max(1000, Math.round(marketValue * 0.025 / 52));
    }
    // Fallback: rating bazlı
    return Math.floor((rating || 60) * SALARY_MULTIPLIER_FREE_AGENT);
}
function calculateSigningFeeRange(rating) {
    // Kademeli hesaplama — yüksek rating'li oyuncular daha çok ister
    const baseFee = Math.floor(rating * rating * 0.004); // rating 80 → 25 kredi
    const maxFee = Math.floor(baseFee * 2.0);
    return {
        minSigningFee: Math.max(1, baseFee),
        maxSigningFee: Math.max(2, maxFee)
    };
}
function calculateTotalWages(players) {
    return players.reduce((sum, p)=>sum + (p.salary || 0), 0);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/fm/playerGenerator.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GROUP_POSITIONS",
    ()=>GROUP_POSITIONS,
    "POS_LABELS",
    ()=>POS_LABELS,
    "POS_ORDER",
    ()=>POS_ORDER,
    "POS_TO_GROUP",
    ()=>POS_TO_GROUP,
    "aiTeamNames",
    ()=>aiTeamNames,
    "generateEliteWonderkid",
    ()=>generateEliteWonderkid,
    "generatePlayer",
    ()=>generatePlayer,
    "generateStableSquad",
    ()=>generateStableSquad,
    "generateStarterPlayer",
    ()=>generateStarterPlayer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/traitsData.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/valuation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitConflicts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/traitConflicts.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/attributeGenerator.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$salaryUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/salaryUtils.ts [app-client] (ecmascript)");
;
;
;
;
;
const POS_TO_GROUP = {
    GK: 'GK',
    CB: 'DEF',
    LB: 'DEF',
    RB: 'DEF',
    LWB: 'DEF',
    RWB: 'DEF',
    CDM: 'MID',
    CM: 'MID',
    CAM: 'MID',
    LM: 'MID',
    RM: 'MID',
    LW: 'MID',
    RW: 'MID',
    CF: 'FWD',
    ST: 'FWD'
};
const GROUP_POSITIONS = {
    GK: [
        'GK'
    ],
    DEF: [
        'CB',
        'LB',
        'RB',
        'LWB',
        'RWB'
    ],
    MID: [
        'CDM',
        'CM',
        'CAM',
        'LM',
        'RM',
        'LW',
        'RW'
    ],
    FWD: [
        'CF',
        'ST'
    ]
};
const POS_ORDER = {
    GK: 0,
    CB: 10,
    LB: 11,
    RB: 12,
    LWB: 13,
    RWB: 14,
    CDM: 20,
    CM: 21,
    CAM: 22,
    LM: 23,
    RM: 24,
    LW: 25,
    RW: 26,
    CF: 30,
    ST: 31,
    DEF: 10,
    MID: 20,
    FWD: 30
};
// Uyumlu yan mevki haritası
const COMPATIBLE_POSITIONS = {
    GK: [],
    CB: [
        'LB',
        'RB',
        'CDM'
    ],
    LB: [
        'CB',
        'LWB',
        'LM'
    ],
    RB: [
        'CB',
        'RWB',
        'RM'
    ],
    LWB: [
        'LB',
        'LM',
        'LW'
    ],
    RWB: [
        'RB',
        'RM',
        'RW'
    ],
    CDM: [
        'CM',
        'CB'
    ],
    CM: [
        'CDM',
        'CAM'
    ],
    CAM: [
        'CM',
        'CF'
    ],
    LM: [
        'LW',
        'LB',
        'LWB',
        'CM'
    ],
    RM: [
        'RW',
        'RB',
        'RWB',
        'CM'
    ],
    LW: [
        'LM',
        'ST',
        'CF'
    ],
    RW: [
        'RM',
        'ST',
        'CF'
    ],
    CF: [
        'ST',
        'CAM',
        'LW',
        'RW'
    ],
    ST: [
        'CF',
        'LW',
        'RW'
    ]
};
const POS_LABELS = {
    GK: 'Kaleci',
    CB: 'Merkez Defans',
    LB: 'Sol Bek',
    RB: 'Sağ Bek',
    LWB: 'Sol Kanat Bek',
    RWB: 'Sağ Kanat Bek',
    CDM: 'Defansif Orta Saha',
    CM: 'Merkez Orta Saha',
    CAM: 'Ofansif Orta Saha',
    LM: 'Sol Açık',
    RM: 'Sağ Açık',
    LW: 'Sol Kanat',
    RW: 'Sağ Kanat',
    CF: 'Göbek Forvet',
    ST: 'Santrfor'
};
// Stat key → Player field mapping
const STAT_FIELDS = {
    goalkeeping: 'goalkeeping',
    reflexes: 'goalkeeping',
    marking: 'marking',
    tackling: 'tackling',
    heading: 'heading',
    passing: 'passing',
    crossing: 'crossing',
    vision: 'vision',
    longShots: 'longShots',
    shooting: 'shooting',
    finishing: 'finishing',
    offTheBall: 'offTheBall',
    dribbling: 'dribbling',
    firstTouch: 'firstTouch',
    technique: 'technique',
    speed: 'speed',
    acceleration: 'acceleration',
    agility: 'agility',
    stamina: 'stamina',
    strength: 'strength',
    jumping: 'jumping',
    balance: 'balance',
    positioning: 'positioning',
    composure: 'composure',
    anticipation: 'anticipation',
    workRate: 'workRate',
    decisions: 'decisions',
    concentration: 'concentration',
    determination: 'determination',
    leadership: 'leadership',
    teamwork: 'teamwork',
    aggression: 'aggression',
    bravery: 'bravery',
    flair: 'flair'
};
// TR shortcut → stat key mapping
const TR_TO_STAT = {
    Klc: 'goalkeeping',
    Tk: 'tackling',
    Pas: 'passing',
    Sut: 'shooting',
    Kfa: 'heading',
    Hiz: 'speed',
    Guc: 'strength',
    Alg: 'anticipation',
    Top: 'dribbling'
};
const ARCHETYPES = {
    GK: {
        name: 'Kaleci',
        strong: [
            'goalkeeping',
            'reflexes',
            'positioning',
            'jumping',
            'bravery',
            'composure'
        ],
        medium: [
            'concentration',
            'determination',
            'communication',
            'strength',
            'agility'
        ],
        weak: [
            'speed',
            'dribbling',
            'shooting',
            'crossing',
            'finishing',
            'tackling',
            'marking'
        ],
        traitBoosts: {
            'Refleks canavarı': [
                'goalkeeping',
                'reflexes'
            ],
            'Güvenli eller': [
                'goalkeeping',
                'composure'
            ],
            '1v1 ustası': [
                'goalkeeping',
                'bravery'
            ],
            'Hava hakimiyeti': [
                'heading',
                'jumping'
            ]
        }
    },
    CB: {
        name: 'Merkez Defans',
        strong: [
            'marking',
            'tackling',
            'heading',
            'positioning',
            'strength',
            'anticipation'
        ],
        medium: [
            'concentration',
            'composure',
            'jumping',
            'passing',
            'aggression',
            'decisions'
        ],
        weak: [
            'speed',
            'dribbling',
            'crossing',
            'shooting',
            'finishing',
            'agility'
        ],
        traitBoosts: {
            'Kale gibi': [
                'marking',
                'tackling'
            ],
            'Lider stoper': [
                'leadership',
                'positioning'
            ],
            'Hava hakimiyeti': [
                'heading',
                'jumping'
            ],
            'Topla çıkan stoper': [
                'passing',
                'dribbling'
            ],
            'Hızlı stoper': [
                'speed',
                'acceleration'
            ],
            'Markajcı': [
                'marking'
            ],
            'Gölge Markajcı': [
                'marking'
            ]
        }
    },
    LB: {
        name: 'Sol Bek',
        strong: [
            'speed',
            'stamina',
            'crossing',
            'tackling',
            'workRate',
            'acceleration'
        ],
        medium: [
            'dribbling',
            'passing',
            'marking',
            'positioning',
            'agility',
            'teamwork'
        ],
        weak: [
            'heading',
            'shooting',
            'finishing',
            'strength',
            'longShots',
            'vision'
        ],
        traitBoosts: {
            'Topla çıkan stoper': [
                'crossing',
                'passing'
            ],
            'Kanat bekçisi': [
                'marking',
                'tackling'
            ],
            'Uzun pas ustası': [
                'crossing',
                'passing'
            ],
            'Süpürücü (libero)': [
                'marking',
                'positioning'
            ]
        }
    },
    RB: {
        name: 'Sağ Bek',
        strong: [
            'speed',
            'stamina',
            'crossing',
            'tackling',
            'workRate',
            'acceleration'
        ],
        medium: [
            'dribbling',
            'passing',
            'marking',
            'positioning',
            'agility',
            'teamwork'
        ],
        weak: [
            'heading',
            'shooting',
            'finishing',
            'strength',
            'longShots',
            'vision'
        ],
        traitBoosts: {
            'Topla çıkan stoper': [
                'crossing',
                'passing'
            ],
            'Kanat bekçisi': [
                'marking',
                'tackling'
            ],
            'Uzun pas ustası': [
                'crossing',
                'passing'
            ]
        }
    },
    LWB: {
        name: 'Sol Kanat Beki',
        strong: [
            'speed',
            'stamina',
            'crossing',
            'dribbling',
            'acceleration',
            'agility'
        ],
        medium: [
            'workRate',
            'passing',
            'tackling',
            'balance',
            'teamwork',
            'firstTouch'
        ],
        weak: [
            'heading',
            'shooting',
            'strength',
            'marking',
            'longShots',
            'finishing'
        ],
        traitBoosts: {
            'Uzun pas ustası': [
                'crossing',
                'passing'
            ],
            'Top saklayan': [
                'dribbling',
                'balance'
            ]
        }
    },
    RWB: {
        name: 'Sağ Kanat Beki',
        strong: [
            'speed',
            'stamina',
            'crossing',
            'dribbling',
            'acceleration',
            'agility'
        ],
        medium: [
            'workRate',
            'passing',
            'tackling',
            'balance',
            'teamwork',
            'firstTouch'
        ],
        weak: [
            'heading',
            'shooting',
            'strength',
            'marking',
            'longShots',
            'finishing'
        ],
        traitBoosts: {
            'Uzun pas ustası': [
                'crossing',
                'passing'
            ],
            'Top saklayan': [
                'dribbling',
                'balance'
            ]
        }
    },
    CDM: {
        name: 'Defansif Orta Saha',
        strong: [
            'tackling',
            'positioning',
            'passing',
            'strength',
            'anticipation',
            'workRate'
        ],
        medium: [
            'marking',
            'vision',
            'decisions',
            'concentration',
            'teamwork',
            'composure'
        ],
        weak: [
            'dribbling',
            'shooting',
            'crossing',
            'finishing',
            'speed',
            'flair'
        ],
        traitBoosts: {
            'Pres ustası': [
                'tackling',
                'workRate'
            ],
            'Tempo kontrolcüsü': [
                'passing',
                'vision'
            ],
            'Regista': [
                'passing',
                'vision'
            ],
            'Oyun Bozan': [
                'tackling',
                'anticipation'
            ]
        }
    },
    CM: {
        name: 'Merkez Orta Saha',
        strong: [
            'passing',
            'vision',
            'stamina',
            'workRate',
            'teamwork',
            'firstTouch'
        ],
        medium: [
            'dribbling',
            'technique',
            'decisions',
            'tackling',
            'longShots',
            'composure'
        ],
        weak: [
            'heading',
            'shooting',
            'speed',
            'marking',
            'crossing',
            'finishing'
        ],
        traitBoosts: {
            'Oyun kurucu': [
                'passing',
                'vision'
            ],
            'Box-to-box': [
                'stamina',
                'tackling',
                'shooting'
            ],
            'Top dağıtıcı': [
                'passing',
                'firstTouch'
            ],
            'Uzaktan şutçu': [
                'longShots',
                'shooting'
            ],
            'Pas arası ustası': [
                'anticipation',
                'tackling'
            ]
        }
    },
    CAM: {
        name: 'Ofansif Orta Saha',
        strong: [
            'passing',
            'vision',
            'dribbling',
            'technique',
            'flair',
            'offTheBall'
        ],
        medium: [
            'shooting',
            'finishing',
            'longShots',
            'composure',
            'creativity',
            'decisions'
        ],
        weak: [
            'tackling',
            'marking',
            'heading',
            'strength',
            'stamina',
            'positioning'
        ],
        traitBoosts: {
            '10 numara': [
                'passing',
                'vision',
                'dribbling'
            ],
            'Boşluk bulucu': [
                'offTheBall',
                'dribbling'
            ],
            'Oyun görüşü yüksek': [
                'vision',
                'passing'
            ],
            'Uzaktan şutçu': [
                'longShots',
                'shooting'
            ]
        }
    },
    LM: {
        name: 'Sol Açık',
        strong: [
            'speed',
            'crossing',
            'dribbling',
            'stamina',
            'workRate',
            'acceleration'
        ],
        medium: [
            'passing',
            'firstTouch',
            'technique',
            'agility',
            'balance',
            'teamwork'
        ],
        weak: [
            'shooting',
            'finishing',
            'heading',
            'marking',
            'tackling',
            'strength'
        ],
        traitBoosts: {
            'Uzun pas ustası': [
                'crossing',
                'passing'
            ],
            'Koşu ustası': [
                'speed',
                'stamina'
            ],
            'Top saklayan': [
                'dribbling',
                'balance'
            ]
        }
    },
    RM: {
        name: 'Sağ Açık',
        strong: [
            'speed',
            'crossing',
            'dribbling',
            'stamina',
            'workRate',
            'acceleration'
        ],
        medium: [
            'passing',
            'firstTouch',
            'technique',
            'agility',
            'balance',
            'teamwork'
        ],
        weak: [
            'shooting',
            'finishing',
            'heading',
            'marking',
            'tackling',
            'strength'
        ],
        traitBoosts: {
            'Uzun pas ustası': [
                'crossing',
                'passing'
            ],
            'Koşu ustası': [
                'speed',
                'stamina'
            ],
            'Top saklayan': [
                'dribbling',
                'balance'
            ]
        }
    },
    LW: {
        name: 'Sol Kanat',
        strong: [
            'speed',
            'dribbling',
            'acceleration',
            'agility',
            'flair',
            'crossing'
        ],
        medium: [
            'finishing',
            'firstTouch',
            'technique',
            'balance',
            'offTheBall',
            'vision'
        ],
        weak: [
            'heading',
            'strength',
            'tackling',
            'marking',
            'stamina',
            'positioning'
        ],
        traitBoosts: {
            'Hızlı forvet': [
                'speed',
                'acceleration'
            ],
            'Boşluk avcısı': [
                'dribbling',
                'offTheBall'
            ],
            'Kontra canavarı': [
                'speed',
                'dribbling'
            ]
        }
    },
    RW: {
        name: 'Sağ Kanat',
        strong: [
            'speed',
            'dribbling',
            'acceleration',
            'agility',
            'flair',
            'crossing'
        ],
        medium: [
            'finishing',
            'firstTouch',
            'technique',
            'balance',
            'offTheBall',
            'vision'
        ],
        weak: [
            'heading',
            'strength',
            'tackling',
            'marking',
            'stamina',
            'positioning'
        ],
        traitBoosts: {
            'Hızlı forvet': [
                'speed',
                'acceleration'
            ],
            'Boşluk avcısı': [
                'dribbling',
                'offTheBall'
            ],
            'Kontra canavarı': [
                'speed',
                'dribbling'
            ]
        }
    },
    CF: {
        name: 'Göbek Forvet',
        strong: [
            'shooting',
            'finishing',
            'passing',
            'vision',
            'dribbling',
            'offTheBall'
        ],
        medium: [
            'technique',
            'firstTouch',
            'composure',
            'flair',
            'decisions',
            'balance'
        ],
        weak: [
            'heading',
            'speed',
            'strength',
            'tackling',
            'marking',
            'stamina'
        ],
        traitBoosts: {
            'Bitirici': [
                'shooting',
                'finishing'
            ],
            'Sahte 9': [
                'vision',
                'passing',
                'dribbling'
            ],
            'Pozisyoncu': [
                'offTheBall',
                'finishing'
            ],
            'Fırsatçı': [
                'offTheBall',
                'finishing'
            ]
        }
    },
    ST: {
        name: 'Santrfor',
        strong: [
            'shooting',
            'finishing',
            'heading',
            'speed',
            'offTheBall',
            'strength'
        ],
        medium: [
            'acceleration',
            'jumping',
            'composure',
            'aggression',
            'determination',
            'balance'
        ],
        weak: [
            'vision',
            'crossing',
            'tackling',
            'marking',
            'dribbling',
            'passing'
        ],
        traitBoosts: {
            'Gol makinesi': [
                'shooting',
                'finishing',
                'offTheBall'
            ],
            'Fiziksel santrafor': [
                'strength',
                'heading'
            ],
            'Hızlı forvet': [
                'speed',
                'acceleration'
            ],
            'Kafacı (forvet)': [
                'heading',
                'finishing'
            ],
            'Bitirici': [
                'shooting',
                'finishing'
            ]
        }
    }
};
// Eski POS_MAP backward compat
const POS_MAP = {
    GK: 'kaleci',
    DEF: 'defans',
    MID: 'orta_saha',
    FWD: 'forvet'
};
// Takım kadro şablonu (20 oyuncu)
const SQUAD_TEMPLATE = [
    'GK',
    'GK',
    'CB',
    'CB',
    'CB',
    'LB',
    'RB',
    'CDM',
    'CM',
    'CM',
    'CAM',
    'LM',
    'RM',
    'LW',
    'ST',
    'ST',
    'CF'
];
// ═══ ÇİFT/ÜÇ MEVKİ SİSTEMİ ═══
function assignSecondaryPositions(mainPos, rng) {
    const roll = rng();
    if (mainPos === 'GK') return undefined; // Kaleci yan mevki oynayamaz
    const compatibles = COMPATIBLE_POSITIONS[mainPos] || [];
    if (compatibles.length === 0) return undefined;
    let count = 0;
    if (roll < 0.06) count = 2; // %6 → 3 mevki
    else if (roll < 0.24) count = 1; // %18 → 2 mevki
    else return undefined; // %76 → 1 mevki
    const shuffled = [
        ...compatibles
    ].sort(()=>0.5 - rng());
    return shuffled.slice(0, count);
}
// ═══ POZİSYON BAZLI NİTELİK ÜRETME MOTORU ═══
// Pozisyon öncelik tablolarına dayalı ağırlıklı rastgele nitelik dağıtımı
// Pozisyon bazlı rating ağırlıkları (hangi nitelikler overall rating'i daha çok etkiler)
const RATING_WEIGHTS = {
    GK: {
        goalkeeping: 0.20,
        positioning: 0.12,
        composure: 0.10,
        concentration: 0.10,
        jumping: 0.08,
        agility: 0.06,
        bravery: 0.06,
        strength: 0.05,
        anticipation: 0.05,
        reactions: 0.05,
        balance: 0.04,
        determination: 0.03,
        decisions: 0.03,
        leadership: 0.03
    },
    DEF: {
        tackling: 0.12,
        marking: 0.10,
        heading: 0.08,
        positioning: 0.08,
        anticipation: 0.07,
        strength: 0.06,
        concentration: 0.06,
        composure: 0.05,
        decisions: 0.05,
        aggression: 0.05,
        jumping: 0.04,
        passing: 0.04,
        bravery: 0.04,
        workRate: 0.04,
        teamwork: 0.04,
        leadership: 0.04
    },
    MID: {
        passing: 0.12,
        vision: 0.10,
        technique: 0.08,
        firstTouch: 0.07,
        tackling: 0.06,
        workRate: 0.06,
        decisions: 0.06,
        stamina: 0.05,
        dribbling: 0.05,
        crossing: 0.05,
        longShots: 0.05,
        composure: 0.05,
        anticipation: 0.04,
        teamwork: 0.04,
        flair: 0.04,
        agility: 0.04
    },
    FWD: {
        finishing: 0.15,
        longShots: 0.08,
        composure: 0.08,
        speed: 0.08,
        acceleration: 0.07,
        dribbling: 0.07,
        technique: 0.06,
        firstTouch: 0.06,
        heading: 0.05,
        bravery: 0.05,
        offTheBall: 0.05,
        agility: 0.05,
        strength: 0.04,
        determination: 0.04,
        crossing: 0.03,
        positioning: 0.04
    }
};
/** Pozisyon öncelik tablolarından tüm nitelikleri üret */ function generatePositionBasedStats(positionGroup) {
    const posKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPositionKey"])(positionGroup);
    const priorities = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["positionPriorities"][posKey];
    if (!priorities) {
        // Fallback: MID önceliklerini kullan
        return generatePositionBasedStats('MID');
    }
    const stats = {};
    // Teknik nitelikler
    for (const [trKey, priority] of Object.entries(priorities.teknik)){
        const engKey = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ATTRIBUTE_KEY_MAP"][trKey];
        if (engKey) {
            stats[engKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateAttributeValue"])(priority);
        }
    }
    // Mental nitelikler
    for (const [trKey, priority] of Object.entries(priorities.mental)){
        const engKey = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ATTRIBUTE_KEY_MAP"][trKey];
        if (engKey) {
            stats[engKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateAttributeValue"])(priority);
        }
    }
    // Fiziksel nitelikler
    for (const [trKey, priority] of Object.entries(priorities.fiziksel)){
        const engKey = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ATTRIBUTE_KEY_MAP"][trKey];
        if (engKey) {
            stats[engKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateAttributeValue"])(priority);
        }
    }
    // Ek nitelikler: goalkeeping (sadece GK'de yüksek, diğerlerinde çok düşük)
    if (posKey === 'GK') {
        stats.goalkeeping = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateAttributeValue"])('cok_yuksek'); // 70-95
    } else {
        stats.goalkeeping = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateAttributeValue"])('cok_dusuk'); // 20-50
    }
    // Ek nitelikler: offTheBall (positionPriorities'de yok, pozisyona göre ekle)
    if (posKey === 'FWD') {
        stats.offTheBall = stats.offTheBall || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateAttributeValue"])('yuksek');
    } else if (posKey === 'MID') {
        stats.offTheBall = stats.offTheBall || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateAttributeValue"])('orta');
    } else if (posKey === 'DEF') {
        stats.offTheBall = stats.offTheBall || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateAttributeValue"])('orta');
    } else {
        stats.offTheBall = stats.offTheBall || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateAttributeValue"])('dusuk');
    }
    return stats;
}
/** Niteliklerden ağırlıklı ortalama rating hesapla */ function computeRatingFromStats(stats, positionGroup) {
    const posKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$attributeGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPositionKey"])(positionGroup);
    const weights = RATING_WEIGHTS[posKey];
    if (!weights) {
        // Basit ortalama
        const vals = Object.values(stats).filter((v)=>typeof v === 'number');
        return Math.round(vals.reduce((a, b)=>a + b, 0) / vals.length);
    }
    let weightedSum = 0;
    let totalWeight = 0;
    for (const [stat, weight] of Object.entries(weights)){
        if (stats[stat] !== undefined && stats[stat] !== null) {
            weightedSum += stats[stat] * weight;
            totalWeight += weight;
        }
    }
    // Ağırlığı olmayan nitelikler de küçük etki yapsın
    const unweightedStats = Object.entries(stats).filter(([key])=>!weights[key] && typeof stats[key] === 'number');
    if (unweightedStats.length > 0 && totalWeight < 1) {
        const remainingWeight = 1 - totalWeight;
        const perStat = remainingWeight / unweightedStats.length;
        for (const [key] of unweightedStats){
            weightedSum += stats[key] * perStat;
            totalWeight += perStat;
        }
    }
    if (totalWeight === 0) {
        const vals = Object.values(stats).filter((v)=>typeof v === 'number');
        return Math.round(vals.reduce((a, b)=>a + b, 0) / vals.length);
    }
    return Math.round(weightedSum / totalWeight);
}
/** Nitelikleri hedef rating'e göre ölçekle */ function scaleStatsToRating(stats, targetRating, positionGroup) {
    const currentRating = computeRatingFromStats(stats, positionGroup);
    if (currentRating === 0) return stats;
    const diff = targetRating - currentRating;
    if (Math.abs(diff) <= 2) return stats; // Zaten yakın, ölçeklemeye gerek yok
    const scaled = {};
    for (const [key, val] of Object.entries(stats)){
        if (typeof val !== 'number') {
            scaled[key] = val;
            continue;
        }
        // 1:1 ölçekleme yerine %50 oranında yakınlaştır (doğallık için)
        const adjustment = diff * 0.6;
        const newVal = val + adjustment + (Math.random() * 6 - 3); // küçük rastgelelik
        scaled[key] = Math.min(99, Math.max(5, Math.round(newVal)));
    }
    return scaled;
}
const generatePlayer = (positionOrGroup, forcedRating, randomFn = Math.random, specificPosOverride, currentWeek)=>{
    const names = [
        'Ahmet',
        'Mehmet',
        'Can',
        'Demir',
        'Emre',
        'Burak',
        'Ozan',
        'Arda',
        'Kerem',
        'Kaan',
        'Mert',
        'Yiğit',
        'Onur',
        'Deniz',
        'Selim',
        'Okan',
        'Ali',
        'Hakan',
        'Efe',
        'Yusuf',
        'Tolga',
        'Sercan',
        'Umut',
        'Berk',
        'Furkan',
        'Oğuz',
        'Salih',
        'İbrahim',
        'Baran',
        'Alper',
        'Murat',
        'Cem',
        'Semih',
        'Batuhan',
        'Emirhan',
        'Taha',
        'Gökhan',
        'Erkan',
        'Savaş',
        'Rıza',
        'Cengiz',
        'Volkan',
        'Levent',
        'Taner',
        'Serkan',
        'Kubilay',
        'Emrah',
        'Ayhan',
        'Orhan',
        'Bedirhan'
    ];
    const surnames = [
        'Yılmaz',
        'Kaya',
        'Demir',
        'Çelik',
        'Yıldız',
        'Aydın',
        'Öztürk',
        'Arslan',
        'Doğan',
        'Kılıç',
        'Güneş',
        'Aksoy',
        'Özcan',
        'Tekin',
        'Koç',
        'Keskin',
        'Akar',
        'Çetin',
        'Korkmaz',
        'Gündüz',
        'Polat',
        'Erdoğan',
        'Şen',
        'Güven',
        'Tan',
        'Aktaş',
        'Karadağ',
        'Uğur',
        'Başaran',
        'Söğüt',
        'Tuncel',
        'Balcı',
        'Kıraç',
        'Soysal',
        'Yavuz',
        'Dinç',
        'Köse',
        'Okutan',
        'Şahin',
        'Erdogan',
        'Velioğlu',
        'Özdemir',
        'Ayaz',
        'Korkmaz',
        'Batur',
        'Eren',
        'Turan',
        'Cevik',
        'Avcı',
        'Kara',
        'Kaplan'
    ];
    const name = names[Math.floor(randomFn() * names.length)] + ' ' + surnames[Math.floor(randomFn() * surnames.length)];
    const age = 17 + Math.floor(randomFn() * 18);
    // Determine specific position
    let specificPosition;
    let positionGroup;
    if (specificPosOverride) {
        specificPosition = specificPosOverride;
        positionGroup = POS_TO_GROUP[specificPosOverride];
    } else if ([
        'GK',
        'DEF',
        'MID',
        'FWD'
    ].includes(positionOrGroup)) {
        // Eski grup bazlı çağrı → rastgele spesifik pozisyon ata
        positionGroup = positionOrGroup;
        const groupPos = GROUP_POSITIONS[positionGroup];
        specificPosition = groupPos[Math.floor(randomFn() * groupPos.length)];
    } else {
        specificPosition = positionOrGroup;
        positionGroup = POS_TO_GROUP[specificPosition];
    }
    // Yan mevki ata (%18 çift, %6 üçlü)
    const secondaryPositions = assignSecondaryPositions(specificPosition, randomFn);
    // Arketip al
    const archetype = ARCHETYPES[specificPosition];
    const posKey = POS_MAP[positionGroup];
    const posTraits = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TRAITS_DATA"][posKey];
    const posStyles = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PLAY_STYLES"][posKey];
    // ═══ TRAİT SEÇİMİ ═══
    const traitsToPick = randomFn() > 0.9 ? 3 : randomFn() > 0.6 ? 2 : 1;
    const selectedTraits = [];
    const traitLevels = {};
    // Arketip uyumlu traitleri önce
    const archetypeTraits = archetype.traitBoosts;
    const archetypeTraitNames = Object.keys(archetypeTraits);
    const shuffledArchetypeTraits = [
        ...archetypeTraitNames
    ].sort(()=>0.5 - randomFn());
    const allPosTraits = [
        ...posTraits.pozitif
    ];
    for(let i = 0; i < shuffledArchetypeTraits.length && selectedTraits.length < traitsToPick; i++){
        const traitName = shuffledArchetypeTraits[i];
        const conflictFound = selectedTraits.some((t)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitConflicts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasConflict"])(t, traitName));
        if (!conflictFound) {
            const traitDef = allPosTraits.find((t)=>t.name === traitName);
            selectedTraits.push(traitName);
            traitLevels[traitName] = traitDef?.level || 'BEYAZ';
        }
    }
    // Eğer arketip traitleri yetersizse genel trait havuzundan ekle
    const shuffledPosTraits = [
        ...allPosTraits
    ].sort(()=>0.5 - randomFn());
    for(let i = 0; i < shuffledPosTraits.length && selectedTraits.length < traitsToPick; i++){
        const trait = shuffledPosTraits[i];
        const conflictFound = selectedTraits.some((t)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitConflicts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasConflict"])(t, trait.name));
        if (!conflictFound && !selectedTraits.includes(trait.name)) {
            selectedTraits.push(trait.name);
            traitLevels[trait.name] = trait.level;
        }
    }
    // Negatif traitler
    const negTraits = [];
    const negRoll = randomFn();
    if (negRoll > 0.4 && posTraits?.negatif && posTraits.negatif.length > 0) {
        const shuffledNeg = [
            ...posTraits.negatif
        ].sort(()=>0.5 - randomFn());
        for(let i = 0; i < shuffledNeg.length; i++){
            if (negTraits.length >= (negRoll > 0.8 ? 2 : 1)) break;
            const trait = shuffledNeg[i];
            const conflictWithPos = selectedTraits.some((t)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitConflicts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasConflict"])(t, trait.name));
            const conflictWithNeg = negTraits.some((t)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitConflicts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasConflict"])(t, trait.name));
            if (!conflictWithPos && !conflictWithNeg) negTraits.push(trait.name);
        }
    }
    // Kişilik traitleri
    const personalityTraits = [];
    const pickFromPool = (pool, currentList, allOtherTraits)=>{
        if (!pool || pool.length === 0) return null;
        const shuffled = [
            ...pool
        ].sort(()=>0.5 - randomFn());
        for (const item of shuffled){
            const hasAnyConflict = [
                ...currentList,
                ...allOtherTraits
            ].some((t)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitConflicts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasConflict"])(t, item.name));
            if (!hasAnyConflict) return item.name;
        }
        return null;
    };
    const mainCats = [
        'karakter',
        'takim',
        'kariyer',
        'mental'
    ];
    const pickedCat = mainCats[Math.floor(randomFn() * mainCats.length)];
    const isNegMain = randomFn() < 0.35;
    const catPool = isNegMain ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PERSONALITY_TRAITS"][pickedCat]?.negatif || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PERSONALITY_TRAITS"][pickedCat]?.pozitif : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PERSONALITY_TRAITS"][pickedCat]?.pozitif || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PERSONALITY_TRAITS"][pickedCat]?.negatif;
    const mainTrait = pickFromPool(catPool, personalityTraits, [
        ...selectedTraits,
        ...negTraits
    ]);
    if (mainTrait) personalityTraits.push(mainTrait);
    const sideCats = mainCats.filter((c)=>c !== pickedCat);
    const pickedSideCat = sideCats[Math.floor(randomFn() * sideCats.length)];
    const isNegSide = randomFn() < 0.25;
    const sidePool = isNegSide ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PERSONALITY_TRAITS"][pickedSideCat]?.negatif || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PERSONALITY_TRAITS"][pickedSideCat]?.pozitif : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PERSONALITY_TRAITS"][pickedSideCat]?.pozitif || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PERSONALITY_TRAITS"][pickedSideCat]?.negatif;
    const sideTrait = pickFromPool(sidePool, personalityTraits, [
        ...selectedTraits,
        ...negTraits
    ]);
    if (sideTrait) personalityTraits.push(sideTrait);
    if (randomFn() < 0.15) {
        const negCat = mainCats[Math.floor(randomFn() * mainCats.length)];
        const negPool = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PERSONALITY_TRAITS"][negCat]?.negatif;
        const extraNeg = pickFromPool(negPool, personalityTraits, [
            ...selectedTraits,
            ...negTraits
        ]);
        if (extraNeg) personalityTraits.push(extraNeg);
    }
    // ═══ POZİSYON BAZLI NİTELİK ÜRETME ═══
    // Pozisyon öncelik tablolarından temel nitelikleri üret
    let aStats = generatePositionBasedStats(positionGroup);
    // Eğer forcedRating verildiyse, nitelikleri hedef rating'e ölçekle
    if (forcedRating) {
        aStats = scaleStatsToRating(aStats, forcedRating, positionGroup);
    }
    // Trait boost uygula (arketip bazlı, nitelikler üretildikten sonra)
    selectedTraits.forEach((tName)=>{
        const boosts = archetypeTraits[tName];
        if (boosts) {
            boosts.forEach((stat)=>{
                if (aStats[stat] !== undefined) aStats[stat] = Math.min(99, aStats[stat] + 4 + Math.floor(randomFn() * 4));
            });
        }
        // Genel boostlar
        if (tName.includes('Bitirici') || tName.includes('Gol')) {
            if (aStats.finishing) aStats.finishing = Math.min(99, aStats.finishing + 5);
        }
        if (tName.includes('Refleks') || tName.includes('Güvenli')) {
            if (aStats.goalkeeping) aStats.goalkeeping = Math.min(99, aStats.goalkeeping + 5);
        }
        if (tName.includes('Kale gibi') || tName.includes('Top kapma')) {
            if (aStats.tackling) aStats.tackling = Math.min(99, aStats.tackling + 5);
        }
        if (tName.includes('Oyun kurucu') || tName.includes('Pas')) {
            if (aStats.passing) aStats.passing = Math.min(99, aStats.passing + 5);
        }
    });
    // Yan mevki bonusu: Ek mevkisi olan oyuncular yan mevkinin en önemli statına küçük bonus alır
    if (secondaryPositions && secondaryPositions.length > 0) {
        secondaryPositions.forEach((sp)=>{
            const secArchetype = ARCHETYPES[sp];
            if (secArchetype) {
                // Yan mevkinin en güçlü 2 statına +3 bonus
                const topStats = secArchetype.strong.slice(0, 2);
                topStats.forEach((stat)=>{
                    if (aStats[stat] !== undefined) aStats[stat] = Math.min(99, aStats[stat] + 3);
                });
            }
        });
    }
    // Rating'i niteliklerden hesapla (ağırlıklı ortalama)
    const computedRating = computeRatingFromStats(aStats, positionGroup);
    // forcedRating yoksa 60-85 arası sınır uygula, varsa forcedRating'e yakın olmalı
    const baseRating = forcedRating || Math.max(60, Math.min(85, computedRating));
    // Ofsayt temizliği
    if (negTraits.includes("Ofsayta düşer")) {
        if (baseRating > 75 || selectedTraits.includes("Ofsayt ustası")) {
            const idx = negTraits.indexOf("Ofsayta düşer");
            negTraits.splice(idx, 1);
        }
    }
    // Nadir trait
    if (randomFn() < 0.05) {
        const rarePool = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitsData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PERSONALITY_TRAITS"].nadir;
        const rareTrait = pickFromPool(rarePool, personalityTraits, [
            ...selectedTraits,
            ...negTraits
        ]);
        if (rareTrait && personalityTraits.length > 1) personalityTraits[1] = rareTrait;
        else if (rareTrait) personalityTraits.push(rareTrait);
    }
    // PlayStyle
    let playStyle = '';
    const shuffledStyles = [
        ...posStyles
    ].sort(()=>0.5 - randomFn());
    for (const style of shuffledStyles){
        const hasAnyConflict = [
            ...selectedTraits,
            ...negTraits,
            ...personalityTraits
        ].some((t)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$traitConflicts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasConflict"])(t, style.name));
        if (!hasAnyConflict) {
            playStyle = style.name;
            break;
        }
    }
    if (!playStyle) playStyle = posStyles[0].name;
    // Trait level kısıtlama
    let morPicked = 0, altınPicked = 0;
    const restrictedTraits = [];
    const restrictedLevels = {};
    selectedTraits.forEach((tName)=>{
        let level = traitLevels[tName];
        if (level === 'MOR') {
            if (morPicked >= 1) level = 'ALTIN';
            else morPicked++;
        }
        if (level === 'ALTIN') {
            if (altınPicked >= 1) level = 'LACIVERT';
            else altınPicked++;
        }
        restrictedTraits.push(tName);
        restrictedLevels[tName] = level;
    });
    // ADIM 1D: Genç oyuncularda (age < 22) potential > rating olmasını garanti et
    let potential;
    if (age < 22) {
        // Gençler: potential her zaman rating'den yüksek olmalı
        const minPotentialBonus = 5; // Minimum +5
        const maxPotentialBonus = 20; // Maksimum +20
        const potentialBonus = minPotentialBonus + Math.floor(randomFn() * (maxPotentialBonus - minPotentialBonus));
        potential = Math.min(99, baseRating + potentialBonus);
    } else {
        // 22+ yaş: potential rating'e eşit veya biraz fazla olabilir
        potential = Math.min(99, baseRating + Math.floor(randomFn() * 10));
    }
    const hidden_potential = Math.min(99, potential + Math.floor(randomFn() * 10));
    const preferredFoot = randomFn() > 0.8 ? 'Left' : 'Right';
    const rightFoot = preferredFoot === 'Right' ? 100 : 20 + Math.floor(randomFn() * 60);
    const leftFoot = preferredFoot === 'Left' ? 100 : 20 + Math.floor(randomFn() * 60);
    // Kısa stat'lar (backward compat) - türetilmiş istatistikler
    const derivedShooting = Math.round(((aStats.finishing || 50) + (aStats.longShots || 50)) / 2);
    const derivedDefending = Math.round(((aStats.tackling || 50) + (aStats.marking || 50) + (aStats.positioning || 50)) / 3);
    const derivedGoalkeeping = positionGroup === 'GK' ? Math.round(((aStats.goalkeeping || 70) + (aStats.positioning || 70) + (aStats.composure || 70)) / 3) : Math.round(aStats.goalkeeping || 10);
    const stats = {
        Klc: derivedGoalkeeping,
        Tk: derivedDefending,
        Pas: aStats.passing || 50,
        Sut: derivedShooting,
        Kfa: aStats.heading || 50,
        Hiz: aStats.speed || 50,
        Guc: aStats.strength || 50,
        Alg: aStats.anticipation || 50,
        Top: aStats.dribbling || 50
    };
    const partialPlayer = {
        rating: baseRating,
        age,
        potential,
        traitLevels: restrictedLevels
    };
    const marketValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateMarketValue"])(partialPlayer);
    return {
        id: Math.random().toString(36).substr(2, 9),
        name,
        position: positionGroup,
        specificPosition,
        secondaryPositions: secondaryPositions && secondaryPositions.length > 0 ? secondaryPositions : undefined,
        rating: baseRating,
        age,
        height: positionGroup === 'GK' ? 185 + Math.floor(randomFn() * 15) : 170 + Math.floor(randomFn() * 30),
        weight: 65 + Math.floor(randomFn() * 25),
        potential,
        hidden_potential,
        market_value: marketValue,
        salary: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$salaryUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculatePlayerSalary"])(baseRating, false),
        nation: 'Turkey',
        preferred_foot: preferredFoot,
        defending: stats.Tk,
        passing: stats.Pas,
        shooting: stats.Sut,
        speed: stats.Hiz,
        power: stats.Guc,
        goalkeeping: stats.Klc,
        cond: 75 + Math.floor(randomFn() * 22),
        form: 40 + Math.floor(randomFn() * 50),
        morale: 50 + Math.floor(randomFn() * 40),
        confidence: 40 + Math.floor(randomFn() * 50),
        traits: restrictedTraits,
        negTraits,
        personalityTraits,
        playStyle,
        archetype: restrictedTraits.length > 0 ? restrictedTraits[0] : archetype.name,
        traitLevels: restrictedLevels,
        styleLevels: {
            [playStyle]: 1
        },
        match_ratings: [],
        scouted: false,
        // SÖZLEŞME SİSTEMİ
        contract_end_week: (currentWeek || 1) + 34,
        is_free_agent: false,
        // ADIM 1: Form rating ve sakatlık geçmişi
        form_rating: 50,
        injury_history: [],
        // Detailed Technical (pozisyon öncelik tablolarından üretilen değerler)
        finishing: aStats.finishing || 50,
        dribbling: aStats.dribbling || 50,
        firstTouch: aStats.firstTouch || 50,
        crossing: aStats.crossing || 50,
        marking: aStats.marking || 50,
        tackling: aStats.tackling || 50,
        technique: aStats.technique || 50,
        longShots: aStats.longShots || 50,
        offTheBall: aStats.offTheBall || 50,
        heading: aStats.heading || 50,
        // Detailed Mental (pozisyon öncelik tablolarından üretilen değerler)
        determination: aStats.determination || 50,
        aggression: aStats.aggression || 40,
        bravery: aStats.bravery || 40,
        workRate: aStats.workRate || 50,
        decisions: aStats.decisions || 50,
        concentration: aStats.concentration || 50,
        leadership: aStats.leadership || 30,
        anticipation: stats.Alg,
        flair: aStats.flair || 20,
        positioning: aStats.positioning || 50,
        composure: aStats.composure || 50,
        teamwork: aStats.teamwork || 50,
        vision: aStats.vision || 50,
        // Detailed Physical
        acceleration: aStats.acceleration || stats.Hiz,
        agility: aStats.agility || 50,
        balance: aStats.balance || 50,
        strength: stats.Guc,
        stamina: aStats.stamina || 60,
        jumping: aStats.jumping || 50,
        leftFoot,
        rightFoot,
        // Compatibility stats (backward compat — used in MultiplayerTab etc.)
        Klc: stats.Klc,
        Tk: stats.Tk,
        Pas: stats.Pas,
        Sut: stats.Sut,
        Kfa: stats.Kfa,
        Hiz: stats.Hiz,
        Guc: stats.Guc,
        Alg: stats.Alg,
        Top: stats.Top,
        Kon: 100
    };
};
const generateStarterPlayer = generatePlayer;
function generateStableSquad(teamName, tier, rng) {
    const randomFn = rng || (()=>Math.random());
    const TR_FIRST_NAMES = [
        "Ahmet",
        "Mehmet",
        "Mustafa",
        "Can",
        "Burak",
        "Emre",
        "Arda",
        "Ömer",
        "Yiğit",
        "Mert",
        "Ali",
        "Hakan",
        "Kerem",
        "Efe",
        "Deniz",
        "Tolga",
        "Sercan",
        "Cengiz",
        "Umut",
        "Berk",
        "Furkan",
        "Oğuz",
        "Salih",
        "İbrahim",
        "Yusuf",
        "Kaan",
        "Baran",
        "Alper",
        "Murat",
        "Cem",
        "Semih",
        "Batuhan",
        "Emirhan",
        "Taha",
        "Rıza",
        "Niyazi",
        "Tayfun",
        "Gökhan",
        "Savaş",
        "Erkan"
    ];
    const TR_LAST_NAMES = [
        "Yılmaz",
        "Kaya",
        "Demir",
        "Çelik",
        "Şahin",
        "Yıldız",
        "Erdogan",
        "Aydın",
        "Özdemir",
        "Arslan",
        "Koç",
        "Öztürk",
        "Kılıç",
        "Doğan",
        "Keskin",
        "Akar",
        "Çetin",
        "Korkmaz",
        "Gündüz",
        "Polat",
        "Erdoğan",
        "Şen",
        "Güven",
        "Tan",
        "Aktaş",
        "Karadağ",
        "Uğur",
        "Başaran",
        "Söğüt",
        "Tuncel",
        "Balcı",
        "Kıraç",
        "Soysal",
        "Velioğlu",
        "Yavuz",
        "Dinç",
        "Köse",
        "Okutan"
    ];
    return SQUAD_TEMPLATE.map((pos, i)=>{
        const baseRating = 80 - tier * 10;
        const rating = baseRating + Math.floor(randomFn() * 15);
        const firstName = TR_FIRST_NAMES[Math.floor(randomFn() * TR_FIRST_NAMES.length)];
        const lastName = TR_LAST_NAMES[Math.floor(randomFn() * TR_LAST_NAMES.length)];
        const p = generatePlayer(pos, rating, randomFn);
        return {
            ...p,
            name: `${firstName} ${lastName}`,
            nation: 'Türkiye',
            id: `npc-${teamName.replace(/\s+/g, '-')}-${i}`,
            club: teamName,
            team_name: teamName
        };
    });
}
const aiTeamNames = [
    'Anadolu Gücü',
    'Ege Fırtınası',
    'Karadeniz Yıldızı',
    'Akdeniz Dalga',
    'İç Anadolu Kartalı',
    'Marmara Rüzgarı',
    'Doğu Anadolu Ateşi',
    'Güneydoğu Güneşi',
    'Trakya Birlik',
    'Boğaz Korelasi',
    'FC Random 42',
    'Spor Kulübü 17',
    'United Anka',
    'City Perspektif',
    'FC Volkan',
    'United Çelik',
    'City Horizon',
    'FC Dayanışma',
    'Demir Fırtına',
    'Altın Ayak',
    'Gümüş Kanat',
    'Bakır Kale',
    'Volkan Spor',
    'Buz Kılıcı',
    'Ateş Çemberi',
    'Rüzgar Süpürücü',
    'Fırtına Kuşu',
    'Güneş Kulesi',
    'Yıldırım Ordu',
    'Şimşek Gücü',
    'Kartal Yuvası',
    'Aslan Yüreği',
    'Bozkurt FK',
    'Çita Hızı',
    'Panter Spor',
    'Doğan Akademi',
    'Atmaca Birlik',
    'Karga Şaşkınlık',
    'Zirve Peşinde',
    'Ufuk Ötesi',
    'Vadi Yıldızı',
    'Ova Birliği',
    'Tepe Kuşatı',
    'Sahil Güvenliği',
    'Liman Feneri',
    'Adalet FK',
    'Siyah Şimşek',
    'Beyaz Fırtına',
    'Kırmızı Kale',
    'Yeşilova SK',
    'Mavi Cephane',
    'Turuncu Güç',
    'Mor Yıldız',
    'Gri Duvar',
    'Spor 1923',
    'FK 57',
    'United 38',
    'City 74',
    'FC 91',
    'Birlik 1905',
    'Güç 1961',
    'Yıldız 2010',
    'Yeni Ufuklar',
    'Işık Yolu',
    'Gelecek FK',
    'Kömür Madeni',
    'Çelik Fabrikası',
    'İpek Yolu SK',
    'Bahar Canlılığı',
    'Son Kale'
];
const generateEliteWonderkid = ()=>{
    const allPositions = [
        'GK',
        'CB',
        'LB',
        'RB',
        'CDM',
        'CM',
        'CAM',
        'LW',
        'RW',
        'CF',
        'ST'
    ];
    const pos = allPositions[Math.floor(Math.random() * allPositions.length)];
    const rating = 75 + Math.floor(Math.random() * 8);
    const player = generateStarterPlayer(pos, rating);
    return {
        ...player,
        age: 16 + Math.floor(Math.random() * 2),
        hidden_potential: 92 + Math.floor(Math.random() * 8),
        morale: 100,
        personalityTraits: [
            ...player.personalityTraits || [],
            'Gelecek vaat eden',
            'Elit Wonderkid'
        ],
        is_legend: false
    };
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/fm/region-generator.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateLocalizedPlayer",
    ()=>generateLocalizedPlayer,
    "getRegionConfig",
    ()=>getRegionConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$playerGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/playerGenerator.ts [app-client] (ecmascript)");
;
/**
 * Bölge Verileri — Sadece Türkçe desteklenmektedir.
 * İleride çoklu dil desteği eklenebilir, ancak şimdilik yanıltıcı
 * yarım İtalya desteği kaldırılmıştır.
 */ const REGION_DATA = {
    tr: {
        firstNames: [
            "Ahmet",
            "Mehmet",
            "Mustafa",
            "Can",
            "Burak",
            "Emre",
            "Arda",
            "Omer",
            "Yigit",
            "Mert",
            "Ali",
            "Hasan",
            "Huseyin",
            "Ibrahim",
            "Ismail",
            "Yusuf",
            "Osman",
            "Suleyman",
            "Fatih",
            "Selim",
            "Kemal",
            "Murat",
            "Serkan",
            "Cem",
            "Deniz",
            "Efe",
            "Egemen",
            "Emir",
            "Enes",
            "Eray",
            "Eren",
            "Erkan",
            "Furkan",
            "Gokhan",
            "Gorkem",
            "Hakan",
            "Hamza",
            "Harun",
            "Ilker",
            "Ilyas",
            "Kaan",
            "Kagan",
            "Kerem",
            "Koray",
            "Levent",
            "Mirac",
            "Oguz",
            "Onur",
            "Ozer",
            "Polat",
            "Rahmi",
            "Remzi",
            "Ridvan",
            "Salih",
            "Samet",
            "Serdar",
            "Serhat",
            "Sinan",
            "Taha",
            "Tarkan",
            "Tugay",
            "Umit",
            "Uras",
            "Volkan",
            "Yagiz",
            "Yakup",
            "Yalcin",
            "Yavuz",
            "Zafer",
            "Bulent",
            "Cengiz",
            "Engin",
            "Erhan",
            "Galip",
            "Haldun",
            "Kadir",
            "Mahmut",
            "Nail",
            "Oktay",
            "Orhan",
            "Refik",
            "Sadik",
            "Tarik",
            "Tevfik",
            "Vedat",
            "Cuneyt",
            "Baris",
            "Dogan",
            "Erdal",
            "Gurkan",
            "Kenan",
            "Mesut",
            "Nihat",
            "Olgun",
            "Resat",
            "Saffet",
            "Tolga",
            "Ugur",
            "Veli",
            "Yunus",
            "Abdullah",
            "Adem",
            "Bekir",
            "Cihad",
            "Davut",
            "Ebubekir",
            "Faruk",
            "Gaffar",
            "Hilmi",
            "Izzet"
        ],
        lastNames: [
            "Yilmaz",
            "Kaya",
            "Demir",
            "Celik",
            "Sahin",
            "Yildiz",
            "Erdogan",
            "Aydin",
            "Ozdemir",
            "Arslan",
            "Ozturk",
            "Kilic",
            "Aslan",
            "Cetin",
            "Kose",
            "Kurt",
            "Ozkan",
            "Simsek",
            "Polat",
            "Korkmaz",
            "Ekinci",
            "Acar",
            "Balci",
            "Cakir",
            "Colak",
            "Dogan",
            "Duman",
            "Efe",
            "Elci",
            "Ercan",
            "Ersoy",
            "Genc",
            "Guler",
            "Gunay",
            "Gundogdu",
            "Gunes",
            "Hancer",
            "Ileri",
            "Inan",
            "Isik",
            "Kaplan",
            "Karaca",
            "Karadag",
            "Karakas",
            "Karatas",
            "Keskin",
            "Koc",
            "Kocyigit",
            "Mert",
            "Oner",
            "Orhan",
            "Ozen",
            "Pala",
            "Sari",
            "Saygin",
            "Sen",
            "Sever",
            "Sonmez",
            "Tas",
            "Tekin",
            "Tunc",
            "Turgut",
            "Turk",
            "Ucar",
            "Ulusoy",
            "Unal",
            "Unver",
            "Varol",
            "Yalcin",
            "Yavuz",
            "Yesil",
            "Yetkin",
            "Yildirim",
            "Zengin",
            "Akbulut",
            "Akgun",
            "Akinci",
            "Akkaya",
            "Aksu",
            "Aktas",
            "Alemdar",
            "Altan",
            "Altintas",
            "Avci",
            "Baysal",
            "Cevik",
            "Dalkiran",
            "Duran",
            "Duygulu",
            "Erbay",
            "Erdinc",
            "Erol",
            "Eryilmaz",
            "Gonul",
            "Gurdal",
            "Ilhan",
            "Kalafat",
            "Karaman",
            "Kaya",
            "Keser",
            "Kizil",
            "Koç",
            "Ogut",
            "Oz",
            "Ozdamar",
            "Sahin",
            "Sasmaz",
            "Sezer",
            "Sahin",
            "Tasan",
            "Topal",
            "Tore",
            "Turan",
            "Uysal",
            "Yoruk",
            "Acar",
            "Basturk",
            "Coban",
            "Gozubuyuk",
            "Karahan"
        ],
        teams: [
            "Anadolu Kartalı",
            "Bozkır Gücü",
            "Yıldız Spor",
            "Karadeniz Fırtınası",
            "Altın Şahin",
            "Çelik Kale",
            "Akdeniz Yıldızı",
            "Ateş Parıltısı",
            "Orta Anadolu FK",
            "Başkent Birlik",
            "Yıldırım Spor",
            "Erciyes Gücü",
            "Akdeniz Kılıcı",
            "Marmara Gücü",
            "Güney Rüzgarı",
            "Doğu Yıldızı",
            "Boğaz Kalesi",
            "Ege Fırtınası",
            "Kızıl Kurt",
            "Gök Bozkurt",
            "Sönmez Spor",
            "Kartal Yuvası",
            "Boz Ayı FK",
            "Altın Boynuz",
            "Demirpençe"
        ],
        leagueNames: [
            "Super Lig",
            "1. Lig",
            "2. Lig",
            "3. Lig"
        ]
    }
};
function generateLocalizedPlayer(_region, club, tier, position, currentWeek) {
    // Her zaman Türkiye bölgesini kullan
    const data = REGION_DATA.tr;
    const firstName = data.firstNames[Math.floor(Math.random() * data.firstNames.length)];
    const lastName = data.lastNames[Math.floor(Math.random() * data.lastNames.length)];
    // Rating based on tier: Tier 1 (70-85), Tier 2 (60-75), Tier 3 (50-65), Tier 4 (40-55)
    const baseRating = 80 - tier * 10;
    const rating = baseRating + Math.floor(Math.random() * 15);
    const pos = position || [
        "GK",
        "DEF",
        "MID",
        "FWD"
    ][Math.floor(Math.random() * 4)];
    const p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$playerGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generatePlayer"])(pos, rating, Math.random, undefined, currentWeek);
    return {
        ...p,
        name: `${firstName} ${lastName}`,
        club: club,
        team_name: club,
        nation: 'Türkiye'
    };
}
function getRegionConfig(_region) {
    return REGION_DATA.tr;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/fm/GameContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FMProvider",
    ()=>FMProvider,
    "useFM",
    ()=>useFM
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/persistence.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/i18n.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$ToastNotifications$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/fm/ToastNotifications.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$sound$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/sound.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$region$2d$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/region-generator.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/valuation.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
const FMContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
const FMProvider = ({ children })=>{
    _s();
    // Get auth state from AuthContext
    const { user: authUser, signOut: authSignOut } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const userId = authUser?.id ?? null;
    const authEmail = authUser?.email ?? null;
    const [profile, setProfileState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const setProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FMProvider.useCallback[setProfile]": (newProfileData)=>{
            setProfileState({
                "FMProvider.useCallback[setProfile]": (prev)=>{
                    const updated = typeof newProfileData === 'function' ? newProfileData(prev) : newProfileData;
                    return updated;
                }
            }["FMProvider.useCallback[setProfile]"]);
        }
    }["FMProvider.useCallback[setProfile]"], []);
    // Check for completed upgrades when profile or day changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FMProvider.useEffect": ()=>{
            if (!profile) return;
            if (profile.active_upgrade_type && profile.current_day >= (profile.active_upgrade_finish_day || 0)) {
                setProfile({
                    "FMProvider.useEffect": (prev)=>{
                        if (!prev) return prev;
                        const finalProfile = {
                            ...prev
                        };
                        if (finalProfile.active_upgrade_type === 'academy') {
                            finalProfile.academy_level = (finalProfile.academy_level || 0) + 1;
                        } else if (finalProfile.active_upgrade_type === 'stadium' || finalProfile.active_upgrade_type === 'stadium_matrix') {
                            const upId = finalProfile.active_upgrade_id;
                            if (upId) {
                                const currentUps = {
                                    ...finalProfile.stadium_upgrades || {}
                                };
                                currentUps[upId] = (currentUps[upId] || 1) + 1;
                                finalProfile.stadium_upgrades = currentUps;
                            }
                            finalProfile.stadium_capacity = (finalProfile.stadium_capacity || 0) + 5000;
                            finalProfile.reputation = (finalProfile.reputation || 0) + 2;
                        }
                        // Clear upgrade state
                        finalProfile.active_upgrade_type = null;
                        finalProfile.active_upgrade_id = null;
                        finalProfile.active_upgrade_finish_day = null;
                        return finalProfile;
                    }
                }["FMProvider.useEffect"]);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$ToastNotifications$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["showToast"])('İnşaat projesi tamamlandı!', 'success');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$sound$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["playSound"])('success');
            }
        }
    }["FMProvider.useEffect"], [
        profile?.current_day,
        profile?.active_upgrade_type,
        profile?.active_upgrade_finish_day,
        setProfile,
        profile
    ]);
    // Sync to database (with localStorage backup and await)
    // Columns that may not exist in the database yet (pending migrations)
    // consecutive_losses already exists; these are the ones still missing:
    const PENDING_MIGRATION_COLUMNS = [];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FMProvider.useEffect": ()=>{
            if (profile?.id) {
                // Always save to localStorage first as backup
                try {
                    localStorage.setItem('fm_profile', JSON.stringify(profile));
                } catch (e) {}
                // Then persist to Supabase with await
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
                    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                    if (supabase) {
                        // Strip columns that may not exist in the database yet to prevent sync errors
                        const profileForDb = {
                            ...profile
                        };
                        for (const col of PENDING_MIGRATION_COLUMNS){
                            delete profileForDb[col];
                        }
                        supabase.from('profiles').update(profileForDb).eq('id', profile.id).then({
                            "FMProvider.useEffect": ({ error })=>{
                                if (error) {
                                    // Only log non-migration-related errors
                                    if (!error.message?.includes('does not exist') && !error.message?.includes('schema cache')) {
                                        console.error('[GameContext] Profile sync error:', error.message);
                                    }
                                }
                            }
                        }["FMProvider.useEffect"]);
                    }
                }
            }
        }
    }["FMProvider.useEffect"], [
        profile
    ]);
    const [locale, setLocale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBrowserLocale"])());
    // authEmail is now derived from authUser.email — no localStorage needed
    const [squad, setSquad] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [activeTactic, setActiveTactic] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDefaultGameTactics"])());
    const [trainingState, setTrainingState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDefaultTrainingState"])());
    const [watchlist, setWatchlist] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [league, setLeague] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedTeamProfile, setSelectedTeamProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [directMessageRecipient, setDirectMessageRecipient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isAdmin, setIsAdmin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Safety timeout: if loading hangs for more than 8 seconds, force it to false
    // This prevents the app from being stuck on the loading spinner forever
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FMProvider.useEffect": ()=>{
            const timeout = setTimeout({
                "FMProvider.useEffect.timeout": ()=>{
                    setLoading({
                        "FMProvider.useEffect.timeout": (prev)=>{
                            if (prev) {
                                console.warn('[GameContext] Loading timeout - forcing loading=false');
                                return false;
                            }
                            return prev;
                        }
                    }["FMProvider.useEffect.timeout"]);
                }
            }["FMProvider.useEffect.timeout"], 8000);
            return ({
                "FMProvider.useEffect": ()=>clearTimeout(timeout)
            })["FMProvider.useEffect"];
        }
    }["FMProvider.useEffect"], []);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('dashboard');
    // Admin check: refreshData ile birleştirildi (ayrı sorgu yok)
    // Sadece Supabase yapılandırılmamışsa false kalır
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FMProvider.useEffect": ()=>{
            if (!userId || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
                setIsAdmin(false);
            }
        // Supabase configured ise, refreshData zaten rolü kontrol ediyor
        }
    }["FMProvider.useEffect"], [
        userId
    ]);
    const initTeam = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FMProvider.useCallback[initTeam]": async (teamNameInput, managerName, philosophy, color1, color2)=>{
            if (!userId) {
                console.error('[initTeam] HATA: userId bos, takim kurulamiyor!');
                return;
            }
            console.log(`[initTeam] /api/auth/register cagriliyor: teamName="${teamNameInput}", userId="${userId}"`);
            setLoading(true);
            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId,
                        teamName: teamNameInput.trim(),
                        managerName: managerName.trim(),
                        philosophy,
                        color1,
                        color2,
                        region: locale || 'TR'
                    })
                });
                const data = await res.json();
                if (!res.ok || data.error) {
                    console.error('[initTeam] Register API hatası:', data.error || data.message);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$ToastNotifications$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["showToast"])(data.error || data.message || 'Takım kurulurken hata oluştu.', 'error');
                    return;
                }
                // Lig ataması başarısız olduysa uyarı göster
                if (!data.tookOverBot && !data.leagueName) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$ToastNotifications$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["showToast"])('Lig ataması yapılamadı. Lütfen sayfayı yenileyip tekrar deneyin.', 'error');
                }
                // Fikstür yoksa uyarı göster
                if (data.hasFixtures === false) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$ToastNotifications$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["showToast"])('Fikstür oluşturulamadı. Sezon başlangıcında fikstürler oluşturulacak.', 'info');
                }
                // API'den dönen oyuncuları context'e yaz
                // NOT: Profil set etmeyi aşağıdaki loadProfile + freshProfile akışına bırak
                // (BÖLÜM 15.4: iki setProfileState çağrısı race condition'ı önle)
                if (data.players && data.players.length > 0) {
                    setSquad(data.players);
                }
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$ToastNotifications$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["showToast"])(`${data.leagueName}'te "${teamNameInput}" kuruldu!`, 'success');
                // Verileri yeniden yükle (doğrudan persistence fonksiyonları ile)
                try {
                    const freshProfile = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadProfile"])(userId);
                    if (freshProfile) setProfileState(freshProfile);
                    const freshPlayers = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadPlayers"])(userId, teamNameInput.trim());
                    if (freshPlayers && freshPlayers.length > 0) setSquad(freshPlayers);
                } catch (reloadErr) {
                    console.warn('[initTeam] Veri yeniden yükleme hatası (veriler kaydedildi):', reloadErr);
                }
            } catch (err) {
                // API çağrısı başarısız (sunucu çökmüş, ağ hatası vb.)
                // Client-side fallback: doğrudan tarayıcıda profil ve oyuncu oluştur
                console.warn('[initTeam] API fetch failed, using client-side fallback:', err);
                try {
                    const BASE_MONEY = 25_000_000;
                    const BASE_CREDITS = 250;
                    const BASE_REPUTATION = 30;
                    const BASE_ACADEMY_LEVEL = 1;
                    let startMoney = BASE_MONEY;
                    let startCredits = BASE_CREDITS;
                    let startReputation = BASE_REPUTATION;
                    let startAcademyLevel = BASE_ACADEMY_LEVEL;
                    let squadQualityMod = 1.0;
                    switch(philosophy){
                        case 'financial':
                            startMoney += 15_000_000;
                            break;
                        case 'legend':
                            startCredits += 250;
                            break;
                        case 'youth':
                            startAcademyLevel = 3;
                            break;
                        case 'squad':
                            squadQualityMod = 1.1;
                            break;
                        case 'reputation':
                            startReputation += 20;
                            break;
                        default:
                            break;
                    }
                    const fallbackProfile = {
                        id: userId,
                        team_name: teamNameInput.trim(),
                        league_name: '4. Lig',
                        manager_name: managerName.trim(),
                        money: startMoney,
                        credits: startCredits,
                        level: 1,
                        xp: 0,
                        fans: 1000,
                        current_day: 1,
                        ticket_price: 35,
                        stadium_capacity: 10000,
                        region: locale || 'TR',
                        philosophy,
                        primary_color: color1,
                        secondary_color: color2,
                        reputation: startReputation,
                        academy_level: startAcademyLevel,
                        is_bot: false,
                        created_at: new Date().toISOString()
                    };
                    const posCounts = {
                        GK: 2,
                        DEF: 6,
                        MID: 6,
                        FWD: 5
                    };
                    const playersToInsert = [];
                    Object.entries(posCounts).forEach({
                        "FMProvider.useCallback[initTeam]": ([pos, count])=>{
                            for(let i = 0; i < count; i++){
                                const p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$region$2d$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateLocalizedPlayer"])(locale || 'TR', teamNameInput.trim(), 4, pos);
                                playersToInsert.push({
                                    ...p,
                                    rating: Math.min(94, Math.floor(p.rating * squadQualityMod)),
                                    potential: Math.min(99, Math.floor((p.potential || p.rating + 10) * squadQualityMod)),
                                    position: pos,
                                    profile_id: userId,
                                    team_name: teamNameInput.trim()
                                });
                            }
                        }
                    }["FMProvider.useCallback[initTeam]"]);
                    setProfileState(fallbackProfile);
                    setSquad(playersToInsert);
                    // localStorage'a kaydet
                    try {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveProfile"])(fallbackProfile);
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["savePlayers"])(playersToInsert, userId, teamNameInput.trim());
                    } catch (saveErr) {
                        console.warn('[initTeam] localStorage save failed:', saveErr);
                    }
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$ToastNotifications$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["showToast"])(`4. Lig'de "${teamNameInput}" kuruldu! (Çevrimdışı mod)`, 'success');
                } catch (fallbackErr) {
                    console.error('[initTeam] Client-side fallback also failed:', fallbackErr);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$ToastNotifications$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["showToast"])('Takım kurulurken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.', 'error');
                }
            } finally{
                setLoading(false);
            }
        }
    }["FMProvider.useCallback[initTeam]"], [
        userId,
        locale
    ]);
    const refreshData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FMProvider.useCallback[refreshData]": async (id)=>{
            const targetId = id || userId;
            if (!targetId) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const isConfigured = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])();
                const supabase = isConfigured ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])() : null;
                let savedProfile = null;
                let pError = null;
                if (isConfigured && supabase) {
                    const result = await supabase.from('profiles').select('*').eq('id', targetId).single();
                    savedProfile = result.data;
                    pError = result.error;
                    // Admin rolünü aynı sorgudan kontrol et (ayrı sorguya gerek yok)
                    setIsAdmin(result.data?.role === 'admin');
                    // Akademi seviyesini user_academy tablosundan oku (tek kaynak: user_academy.current_level)
                    // Eğer user_academy kaydı varsa, profiles.academy_level'ı bu değerle override et
                    if (savedProfile) {
                        const { data: academyData } = await supabase.from('user_academy').select('current_level').eq('profile_id', targetId).maybeSingle();
                        if (academyData) {
                            savedProfile.academy_level = academyData.current_level;
                        }
                        // user_academy kaydı yoksa profiles.academy_level varsayılan olarak kalır
                        // ─── BÖLÜM 13: Sezon senkronizasyonu ─────────────
                        // current_day yerel profilde tutuluyor, diğer oyuncularla farklı olabilir.
                        // Lig'in sezonundan current_tur okuyup current_day'i senkronize et.
                        // Formül: current_day = (current_tur - 1) * 7 + 1
                        // (Her tur 7 gün, tur 1 = gün 1, tur 2 = gün 8, vb.)
                        try {
                            const { data: userTeam } = await supabase.from('league_teams').select('league_id').eq('profile_id', targetId).maybeSingle();
                            if (userTeam?.league_id) {
                                const { data: seasonData } = await supabase.from('seasons').select('current_tur').eq('league_id', userTeam.league_id).eq('is_finished', false).order('created_at', {
                                    ascending: false
                                }).limit(1).maybeSingle();
                                if (seasonData?.current_tur && seasonData.current_tur > 1) {
                                    const syncedDay = (seasonData.current_tur - 1) * 7 + 1;
                                    // Sadece yerel gün gerideyse güncelle (ileriye doğru)
                                    if (savedProfile.current_day < syncedDay) {
                                        savedProfile.current_day = syncedDay;
                                    }
                                }
                            }
                        } catch (syncErr) {
                            // Senkronizasyon hatası kritik değil — mevcut current_day ile devam et
                            console.warn('[refreshData] Sezon senkronizasyonu hatası:', syncErr);
                        }
                    }
                }
                const savedTactic = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadActiveTactic"])(targetId);
                const savedTraining = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadTrainingState"])(targetId);
                // Load League Players (Global Ranking)
                if (isConfigured && supabase) {
                    const { data: topPlayers } = await supabase.from('players').select('*').order('rating', {
                        ascending: false
                    }).limit(100);
                    if (topPlayers) {
                        const mapped = topPlayers.map({
                            "FMProvider.useCallback[refreshData].mapped": (p)=>({
                                    ...p,
                                    rating: p.rating ?? p.klt ?? 60,
                                    passing: p.passing ?? p.pas ?? 50,
                                    shooting: p.shooting ?? p.sut ?? 50,
                                    defending: p.defending ?? p.tk ?? 50,
                                    speed: p.speed ?? p.hiz ?? 50,
                                    power: p.power ?? p.guc ?? 50,
                                    vision: p.vision ?? p.alg ?? 50,
                                    control: p.control ?? p.top ?? 50,
                                    heading: p.heading ?? p.kfa ?? 50,
                                    goalkeeping: p.goalkeeping ?? p.klc ?? 10
                                })
                        }["FMProvider.useCallback[refreshData].mapped"]);
                        setLeague(mapped);
                    }
                }
                if (pError || !savedProfile) {
                    // NEW USER FLOW: Stop auto-seeding here. ManagerRegistration will handle initTeam.
                    // IMPORTANT: If a profile is already set in context (e.g., from just-completed
                    // registration), don't reset it to null — that would cause an infinite loop
                    // (register → setProfile → refreshData → profile=null → ManagerRegistration again).
                    setProfileState({
                        "FMProvider.useCallback[refreshData]": (prev)=>{
                            if (prev) {
                                // Profile already exists in context (e.g., just registered)
                                // Keep it and don't reset. Just log a warning.
                                console.warn('[refreshData] Supabase read returned no profile, but context already has one. Keeping existing profile.');
                                return prev;
                            }
                            // Genuinely new user — no profile anywhere
                            return null;
                        }
                    }["FMProvider.useCallback[refreshData]"]);
                    setSquad({
                        "FMProvider.useCallback[refreshData]": (prev)=>prev.length > 0 ? prev : []
                    }["FMProvider.useCallback[refreshData]"]);
                    setLoading(false);
                    return;
                } else {
                    // Backfill for existing users
                    const backfilledProfile = {
                        ...savedProfile,
                        league_name: savedProfile.league_name || '4. Lig',
                        primary_color: savedProfile.primary_color || '#ffffff',
                        secondary_color: savedProfile.secondary_color || '#000000'
                    };
                    setProfileState(backfilledProfile);
                    const players = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadPlayers"])(targetId, savedProfile.team_name);
                    if (players && players.length > 0) {
                        setSquad(players);
                    } else {
                        // Profile exists but NO players. This might happen if seeding failed or was skipped.
                        // Seed them now at the correct tier.
                        const userRegion = savedProfile.region || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBrowserLocale"])();
                        const team = savedProfile.team_name || 'İsimsiz Kulüp';
                        const tier = (savedProfile.league_name || '').includes('4') ? 4 : 1;
                        const playersToInsert = [];
                        const posCounts = {
                            GK: 2,
                            DEF: 6,
                            MID: 6,
                            FWD: 5
                        };
                        Object.entries(posCounts).forEach({
                            "FMProvider.useCallback[refreshData]": ([pos, count])=>{
                                for(let i = 0; i < count; i++){
                                    const p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$region$2d$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateLocalizedPlayer"])(userRegion, team, tier, pos);
                                    playersToInsert.push({
                                        ...p,
                                        position: pos,
                                        profile_id: targetId,
                                        team_name: team
                                    });
                                }
                            }
                        }["FMProvider.useCallback[refreshData]"]);
                        if (isConfigured && supabase) {
                            const { data } = await supabase.from('players').insert(playersToInsert).select();
                            if (data) setSquad(data);
                            else setSquad(playersToInsert);
                        } else {
                            setSquad(playersToInsert);
                        }
                    }
                }
                if (savedTactic) setActiveTactic(savedTactic);
                if (savedTraining) setTrainingState(savedTraining);
                const savedWatchlist = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadWatchlist"])(targetId);
                if (savedWatchlist && isConfigured && supabase) {
                    // PERMANENT WATCHLIST REFINEMENT: Remove retired players
                    const { data: activeWatchlistPlayers } = await supabase.from('players').select('id, age').in('id', savedWatchlist);
                    if (activeWatchlistPlayers) {
                        const retiredIds = activeWatchlistPlayers.filter({
                            "FMProvider.useCallback[refreshData].retiredIds": (p)=>(p.age || 0) >= 38
                        }["FMProvider.useCallback[refreshData].retiredIds"]).map({
                            "FMProvider.useCallback[refreshData].retiredIds": (p)=>p.id
                        }["FMProvider.useCallback[refreshData].retiredIds"]);
                        const validIds = activeWatchlistPlayers.filter({
                            "FMProvider.useCallback[refreshData].validIds": (p)=>(p.age || 0) < 38
                        }["FMProvider.useCallback[refreshData].validIds"]).map({
                            "FMProvider.useCallback[refreshData].validIds": (p)=>p.id
                        }["FMProvider.useCallback[refreshData].validIds"]);
                        if (retiredIds.length > 0) {
                            await supabase.from('watchlist').delete().eq('user_id', targetId).in('player_id', retiredIds);
                        }
                        setWatchlist(validIds);
                    } else {
                        setWatchlist(savedWatchlist);
                    }
                } else if (savedWatchlist) {
                    setWatchlist(savedWatchlist);
                }
            } catch (err) {
                console.error('Failed to load FM data:', err);
                // Fallback with random team even on failure if possible
                const region = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBrowserLocale"])();
                const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$region$2d$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRegionConfig"])(region);
                const randomT = config.teams[Math.floor(Math.random() * config.teams.length)];
                setProfile({
                    "FMProvider.useCallback[refreshData]": (current)=>{
                        if (!current) {
                            return {
                                id: targetId,
                                team_name: randomT,
                                manager_name: 'Misafir Menajer',
                                money: 50000000,
                                credits: 100,
                                ticket_price: 20,
                                academy_level: 1,
                                reputation: 50,
                                stadium_capacity: 5000,
                                stadium_upgrades: {},
                                current_day: 1,
                                created_at: new Date().toISOString()
                            };
                        }
                        return current;
                    }
                }["FMProvider.useCallback[refreshData]"]);
            } finally{
                setLoading(false);
            }
        }
    }["FMProvider.useCallback[refreshData]"], [
        userId,
        setProfile
    ]);
    const processFinancials = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FMProvider.useCallback[processFinancials]": (day)=>{
            setProfile({
                "FMProvider.useCallback[processFinancials]": (prev)=>{
                    if (!prev) return prev;
                    let newMoney = prev.money || 0;
                    const sponsors = prev.sponsors || [];
                    const upgrades = prev.stadium_upgrades || {};
                    // 1. Sponsor payouts are handled by /api/cron/weekly-income ONLY (no client-side duplication)
                    // The cron job properly calculates weekly revenue including sponsors, TV, and stadium income.
                    // Client-side sponsor payments have been removed to prevent double-counting.
                    // 2. Passive Stadium Income (Daily)
                    // Merchandising (Store)
                    const storeLvl = upgrades['store'] || 0;
                    const storeIncome = storeLvl * 25000;
                    // VIP Passive (Level 10 bonus)
                    const vipLvl = upgrades['vip'] || 0;
                    const vipIncome = vipLvl === 10 ? 500000 : vipLvl * 15000;
                    newMoney += storeIncome + vipIncome;
                    // 3. Player Wages (Daily)
                    const dailyWages = squad.reduce({
                        "FMProvider.useCallback[processFinancials].dailyWages": (acc, p)=>acc + p.salary / 30
                    }["FMProvider.useCallback[processFinancials].dailyWages"], 0);
                    newMoney -= dailyWages;
                    // 4. Update Sponsor durations (UI-level countdown, not financial)
                    const updatedSponsors = sponsors.map({
                        "FMProvider.useCallback[processFinancials].updatedSponsors": (s)=>({
                                ...s,
                                remainingDays: Math.max(0, s.remainingDays - 1)
                            })
                    }["FMProvider.useCallback[processFinancials].updatedSponsors"]).filter({
                        "FMProvider.useCallback[processFinancials].updatedSponsors": (s)=>s.remainingDays > 0
                    }["FMProvider.useCallback[processFinancials].updatedSponsors"]);
                    return {
                        ...prev,
                        money: Math.max(0, newMoney),
                        sponsors: updatedSponsors
                    };
                }
            }["FMProvider.useCallback[processFinancials]"]);
        }
    }["FMProvider.useCallback[processFinancials]"], [
        squad,
        setProfile
    ]);
    const processScouting = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FMProvider.useCallback[processScouting]": (day)=>{
            setTrainingState({
                "FMProvider.useCallback[processScouting]": (prev)=>{
                    if (!prev || !prev.scouting) return prev;
                    const currentScouting = prev.scouting;
                    const updatedScouts = currentScouting.scouts.map({
                        "FMProvider.useCallback[processScouting].updatedScouts": (s)=>{
                            if (s.status === 'SCOUTING') {
                                const nextDays = Math.max(0, s.remainingDays - 1);
                                return {
                                    ...s,
                                    remainingDays: nextDays
                                };
                            }
                            return s;
                        }
                    }["FMProvider.useCallback[processScouting].updatedScouts"]);
                    const finishingScouts = updatedScouts.filter({
                        "FMProvider.useCallback[processScouting].finishingScouts": (s)=>s.status === 'SCOUTING' && s.remainingDays === 0
                    }["FMProvider.useCallback[processScouting].finishingScouts"]);
                    let newPlayers = [];
                    finishingScouts.forEach({
                        "FMProvider.useCallback[processScouting]": (s)=>{
                            // Find continent duration to match back to minStars/region if needed
                            // Or just generate 1-3 players per scout
                            const playersToFind = 1 + Math.floor(Math.random() * 2); // 1-2 players
                            for(let i = 0; i < playersToFind; i++){
                                // Determine region from scout location
                                let region = 'TR'; // Default
                                if (s.location === 'AVRUPA') region = 'EN';
                                else if (s.location === 'GÜNEY AMERİKA') region = 'BR';
                                else if (s.location === 'AFRİKA') region = 'NG'; // Approximate
                                else if (s.location === 'ASYA') region = 'CN';
                                else if (s.location === 'KUZEY AMERİKA') region = 'US';
                                // Quality based on scout stars
                                // s.stars 1: ~60 rating, 5: ~85 rating
                                const minRating = 40 + s.stars * 8;
                                const p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$region$2d$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateLocalizedPlayer"])(region, 'Serbest', 1);
                                newPlayers.push({
                                    ...p,
                                    rating: Math.max(minRating, p.rating),
                                    scouted: true,
                                    scouting_stars: s.stars
                                });
                            }
                            s.status = 'IDLE';
                            s.location = undefined;
                        }
                    }["FMProvider.useCallback[processScouting]"]);
                    return {
                        ...prev,
                        scouting: {
                            ...currentScouting,
                            scouts: updatedScouts,
                            foundPlayersPool: [
                                ...currentScouting.foundPlayersPool || [],
                                ...newPlayers
                            ]
                        }
                    };
                }
            }["FMProvider.useCallback[processScouting]"]);
        }
    }["FMProvider.useCallback[processScouting]"], [
        setTrainingState
    ]);
    // Financials and Day end processing
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FMProvider.useEffect": ()=>{
            if (!profile) return;
            // Check if a new day has started in game terms (this is a simplified check)
            // In a real multi-user app, this would be server-side.
            const lastProcessedDay = parseInt(localStorage.getItem('fm_last_processed_day') || '0');
            if (profile.current_day > lastProcessedDay) {
                processFinancials(profile.current_day);
                processScouting(profile.current_day);
                localStorage.setItem('fm_last_processed_day', profile.current_day.toString());
            }
        }
    }["FMProvider.useEffect"], [
        profile?.current_day,
        processFinancials,
        processScouting,
        profile
    ]);
    const addMatchRevenue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FMProvider.useCallback[addMatchRevenue]": (isHome, leaguePosition, totalTeams)=>{
            setProfile({
                "FMProvider.useCallback[addMatchRevenue]": (prev)=>{
                    if (!prev || !isHome) return prev;
                    try {
                        const upgrades = prev.stadium_upgrades || {};
                        const capacityLvl = upgrades['capacity'] || 0;
                        const ticketPrice = prev.ticket_price ?? 35;
                        const pos = leaguePosition ?? 10;
                        const teams = totalTeams ?? 18;
                        // Use the formula from financialModel
                        // stadiumCapacity = 10000 + stadiumLevel * 2000
                        const capacity = 10000 + capacityLvl * 2000;
                        const positionFactor = 0.5 + 0.5 * ((teams - pos + 1) / teams);
                        const baseAttendance = capacity * positionFactor;
                        const priceElasticity = Math.max(0.1, 1 - (ticketPrice - 50) / 100);
                        const attendance = Math.floor(Math.min(capacity, baseAttendance * priceElasticity));
                        const ticketRevenue = attendance * ticketPrice;
                        // Food & Beverage
                        const fbRevenue = attendance * 15;
                        const totalMatchRevenue = ticketRevenue + fbRevenue;
                        return {
                            ...prev,
                            money: (prev.money || 0) + totalMatchRevenue
                        };
                    } catch  {
                        return prev;
                    }
                }
            }["FMProvider.useCallback[addMatchRevenue]"]);
        }
    }["FMProvider.useCallback[addMatchRevenue]"], [
        setProfile
    ]);
    const negotiatePurchase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FMProvider.useCallback[negotiatePurchase]": async (player, offerPrice)=>{
            if (!profile) return {
                success: false,
                reason: 'Profil bulunamadı'
            };
            try {
                // market_value null/0 koruması: Oyuncunun rating'ine göre tahmini değer hesapla
                const effectiveMarketValue = player.market_value && player.market_value > 0 ? player.market_value : Math.round(Math.pow(player.rating || 60, 2.5) * 5000);
                const ratio = effectiveMarketValue > 0 ? offerPrice / effectiveMarketValue : 999;
                let accepted = false;
                let counterOffer = 0;
                if (ratio >= 1.2) {
                    accepted = true; // %120+ her zaman kabul
                } else if (ratio < 0.5) {
                    return {
                        success: false,
                        reason: 'Kulüp bu düşük teklifi hakaret olarak gördü ve masadan kalktı.'
                    };
                } else if (ratio < 0.8) {
                    // %50-80 arası: %20 kabul şansı, yoksa karşı teklif
                    if (Math.random() < 0.2) {
                        accepted = true;
                    } else {
                        counterOffer = Math.round(effectiveMarketValue * (1.0 + Math.random() * 0.2));
                        return {
                            success: false,
                            reason: `Kulüp teklifi yetersiz buldu. Karşı teklif: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(counterOffer)}`,
                            counterOffer
                        };
                    }
                } else {
                    // %80-120 arası: %85 kabul şansı
                    const chance = (ratio - 0.8) / 0.4; // 0 to 1
                    if (Math.random() < 0.7 + chance * 0.15) {
                        accepted = true;
                    } else {
                        counterOffer = Math.round(effectiveMarketValue * (1.05 + Math.random() * 0.1));
                        return {
                            success: false,
                            reason: `Kulüp teklifi yetersiz buldu. Karşı teklif: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(counterOffer)}`,
                            counterOffer
                        };
                    }
                }
                if (accepted) {
                    // Komisyon ve Bonus
                    const agentCommission = Math.round(offerPrice * 0.05);
                    const signingBonus = Math.round(offerPrice * 0.03);
                    const totalCost = offerPrice + agentCommission + signingBonus;
                    const currentMoney = profile.money || 0;
                    if (currentMoney < totalCost) {
                        return {
                            success: false,
                            reason: `Yetersiz bütçe. Toplam maliyet (Komisyonlar dahil): ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(totalCost)}. Bütçen: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(currentMoney)}`
                        };
                    }
                    // Oyuncuyu kadroya ekle
                    const transferredPlayer = {
                        ...player,
                        profile_id: profile.id,
                        team_name: profile.team_name,
                        club: profile.team_name,
                        market_value: effectiveMarketValue
                    };
                    setSquad({
                        "FMProvider.useCallback[negotiatePurchase]": (prev)=>[
                                ...prev,
                                transferredPlayer
                            ]
                    }["FMProvider.useCallback[negotiatePurchase]"]);
                    // Bütçeyi güncelle
                    const newMoney = currentMoney - totalCost;
                    setProfile({
                        "FMProvider.useCallback[negotiatePurchase]": (prev)=>({
                                ...prev,
                                money: newMoney
                            })
                    }["FMProvider.useCallback[negotiatePurchase]"]);
                    // Oyuncuyu transfer listesinden (league state) kaldır
                    setLeague({
                        "FMProvider.useCallback[negotiatePurchase]": (prev)=>prev.filter({
                                "FMProvider.useCallback[negotiatePurchase]": (p)=>p.id !== player.id
                            }["FMProvider.useCallback[negotiatePurchase]"])
                    }["FMProvider.useCallback[negotiatePurchase]"]);
                    // Supabase'e kaydet
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
                        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                        await supabase.from('players').update({
                            profile_id: profile.id,
                            team_name: profile.team_name,
                            club: profile.team_name,
                            is_for_sale: false
                        }).eq('id', player.id);
                        await supabase.from('profiles').update({
                            money: newMoney
                        }).eq('id', profile.id);
                    }
                    console.log(`[TRANSFER] ${player.name} → ${profile.team_name}, Bedel: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(offerPrice)}`);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$sound$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["playSound"])('transfer');
                    return {
                        success: true,
                        totalCost,
                        agentCommission,
                        signingBonus
                    };
                }
                return {
                    success: false,
                    reason: 'Bilinmeyen bir hata oluştu.'
                };
            } catch (err) {
                console.error('[TRANSFER HATASI]', err);
                return {
                    success: false,
                    reason: `Transfer sırasında hata oluştu: ${err.message || 'Bilinmeyen hata'}`
                };
            }
        }
    }["FMProvider.useCallback[negotiatePurchase]"], [
        profile,
        setProfile,
        setSquad,
        setLeague
    ]);
    const addSponsor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FMProvider.useCallback[addSponsor]": async (sponsor)=>{
            // Önce state'i güncelle
            const updatedSponsors = [
                ...profile?.sponsors || [],
                sponsor
            ];
            setProfile({
                "FMProvider.useCallback[addSponsor]": (prev)=>({
                        ...prev,
                        sponsors: updatedSponsors
                    })
            }["FMProvider.useCallback[addSponsor]"]);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$sound$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["playSound"])('success');
            // Sonra doğrudan Supabase'e kaydet (auto-save beklemeden)
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])() && userId) {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                if (supabase) {
                    const { error } = await supabase.from('profiles').update({
                        sponsors: updatedSponsors
                    }).eq('id', userId);
                    if (error) {
                        console.error('[addSponsor] Supabase kayıt hatası:', error.message);
                    }
                }
            }
        }
    }["FMProvider.useCallback[addSponsor]"], [
        profile,
        userId,
        setProfile
    ]);
    const sellPlayer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FMProvider.useCallback[sellPlayer]": async (player)=>{
            if (!profile) return;
            const taxRate = 0.025;
            const salePrice = player.market_value;
            const taxAmount = salePrice * taxRate;
            const netRevenue = salePrice - taxAmount;
            // 1. Remove from squad
            setSquad({
                "FMProvider.useCallback[sellPlayer]": (prev)=>prev.filter({
                        "FMProvider.useCallback[sellPlayer]": (p)=>p.id !== player.id
                    }["FMProvider.useCallback[sellPlayer]"])
            }["FMProvider.useCallback[sellPlayer]"]);
            // 2. Add money to profile
            setProfile({
                "FMProvider.useCallback[sellPlayer]": (prev)=>({
                        ...prev,
                        money: (prev.money || 0) + netRevenue
                    })
            }["FMProvider.useCallback[sellPlayer]"]);
            // 3. Update in Supabase (Mark as free agent or handled by system)
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                // Record transaction? For now just move player to system
                await supabase.from('players').update({
                    club: 'Transfer Listesi',
                    team_name: 'Transfer Listesi',
                    profile_id: null,
                    is_for_sale: false
                }).eq('id', player.id);
                // Update profile money in DB
                await supabase.from('profiles').update({
                    money: (profile.money || 0) + netRevenue
                }).eq('id', profile.id);
            }
            return {
                success: true,
                netRevenue,
                taxAmount
            };
        }
    }["FMProvider.useCallback[sellPlayer]"], [
        profile,
        setProfile
    ]);
    const scoutPlayer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FMProvider.useCallback[scoutPlayer]": async (playerId, playerObj)=>{
            if (!profile || (profile.money || 0) < 150000) return {
                success: false,
                reason: `Yetersiz bütçe (${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$valuation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(150000)} gerekli)`
            };
            const newMoney = (profile.money || 0) - 150000;
            // Find player in squad or use provided object
            const targetPlayer = squad.find({
                "FMProvider.useCallback[scoutPlayer]": (p)=>p.id === playerId
            }["FMProvider.useCallback[scoutPlayer]"]) || playerObj;
            if (!targetPlayer) return {
                success: false,
                reason: 'Oyuncu bulunamadı'
            };
            // Calculate accuracy
            const scoutCount = (targetPlayer.scouting_count || 0) + 1;
            const scoutStars = trainingState?.scouting?.stars || 1;
            const accuracy = Math.min(0.95, 0.2 + scoutCount * 0.1 + scoutStars * 0.05);
            const isCorrect = Math.random() < accuracy;
            let guessedStars = 3;
            const actualStars = Math.max(1, Math.min(5, Math.ceil((targetPlayer.potential || 70) / 20)));
            guessedStars = actualStars;
            if (!isCorrect) {
                // If wrong, deviate by 1-2 stars
                const offset = Math.random() < 0.5 ? 1 : -1;
                guessedStars = Math.max(1, Math.min(5, actualStars + offset));
            }
            const updatedPlayer = {
                ...targetPlayer,
                scouted: true,
                scouting_stars: guessedStars,
                scouting_count: scoutCount
            };
            // Update squad if player is in it
            if (squad.find({
                "FMProvider.useCallback[scoutPlayer]": (p)=>p.id === playerId
            }["FMProvider.useCallback[scoutPlayer]"])) {
                setSquad({
                    "FMProvider.useCallback[scoutPlayer]": (prev)=>prev.map({
                            "FMProvider.useCallback[scoutPlayer]": (p)=>p.id === playerId ? updatedPlayer : p
                        }["FMProvider.useCallback[scoutPlayer]"])
                }["FMProvider.useCallback[scoutPlayer]"]);
            }
            // Update profile money
            setProfile({
                "FMProvider.useCallback[scoutPlayer]": (prev)=>({
                        ...prev,
                        money: newMoney
                    })
            }["FMProvider.useCallback[scoutPlayer]"]);
            // Update in Supabase
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                await supabase.from('players').update({
                    scouted: true,
                    scouting_stars: guessedStars,
                    scouting_count: scoutCount
                }).eq('id', playerId);
                await supabase.from('profiles').update({
                    money: newMoney
                }).eq('id', profile.id);
            }
            return {
                success: true,
                player: updatedPlayer
            };
        }
    }["FMProvider.useCallback[scoutPlayer]"], [
        profile,
        trainingState,
        setProfile,
        squad
    ]);
    const playFriendlyMatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FMProvider.useCallback[playFriendlyMatch]": async (isPaid = false)=>{
            if (!profile) return {
                success: false,
                reason: 'Profil bulunamadı'
            };
            // ── Günlük limit kontrolü ──
            const today = new Date().toISOString().split('T')[0];
            const lastFriendly = profile.last_friendly_date;
            const friendlyCount = lastFriendly === today ? profile.daily_friendly_count || 0 : 0;
            if (friendlyCount >= 2) {
                return {
                    success: false,
                    reason: 'Günlük hazırlık maçı limitine ulaştınız (2/2).'
                };
            }
            if (isPaid && (profile.credits || 0) < 1) {
                return {
                    success: false,
                    reason: 'Yetersiz Kredi (1 Kredi gerekli)'
                };
            }
            const newCredits = isPaid ? (profile.credits || 0) - 1 : profile.credits || 0;
            // ── Poisson tabanlı skor hesaplama ──
            const homeAvgRating = squad.slice(0, 11).reduce({
                "FMProvider.useCallback[playFriendlyMatch]": (s, p)=>s + p.rating
            }["FMProvider.useCallback[playFriendlyMatch]"], 0) / Math.max(1, Math.min(11, squad.length));
            const enemyRating = 60 + Math.random() * 15; // random AI opponent
            const homeGoalLambda = Math.max(0.3, (homeAvgRating - enemyRating) * 0.05 + 1.2);
            const awayGoalLambda = Math.max(0.3, (enemyRating - homeAvgRating) * 0.05 + 1.2);
            const poissonSample = {
                "FMProvider.useCallback[playFriendlyMatch].poissonSample": (lambda)=>{
                    let k = 0, p = Math.random();
                    while(p > Math.exp(-lambda)){
                        p *= Math.random();
                        k++;
                    }
                    return Math.min(k, 6);
                }
            }["FMProvider.useCallback[playFriendlyMatch].poissonSample"];
            const homeScore = poissonSample(homeGoalLambda);
            const awayScore = poissonSample(awayGoalLambda);
            // ── Kondisyon maliyeti: her oyuncu 5-10 cond kaybeder ──
            const updatedSquad = squad.map({
                "FMProvider.useCallback[playFriendlyMatch].updatedSquad": (p)=>({
                        ...p,
                        cond: Math.max(0, (p.cond || 100) - (5 + Math.floor(Math.random() * 6)))
                    })
            }["FMProvider.useCallback[playFriendlyMatch].updatedSquad"]);
            setSquad(updatedSquad);
            const newCount = friendlyCount + 1;
            setProfile({
                "FMProvider.useCallback[playFriendlyMatch]": (prev)=>prev ? {
                        ...prev,
                        credits: newCredits,
                        last_friendly_date: today,
                        daily_friendly_count: newCount
                    } : prev
            }["FMProvider.useCallback[playFriendlyMatch]"]);
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
                try {
                    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                    if (!supabase) return {
                        success: false,
                        reason: 'Supabase bağlantı hatası'
                    };
                    await supabase.from('profiles').update({
                        credits: newCredits
                    }).eq('id', profile.id);
                    await supabase.from('friendly_matches').insert({
                        home_team_id: profile.id,
                        away_team_id: 'cpu',
                        home_score: homeScore,
                        away_score: awayScore,
                        home_team_name: profile.team_name || 'Bilinmeyen',
                        away_team_name: 'CPU Takımı',
                        match_data: {
                            homeAvgRating,
                            enemyRating,
                            simulated: true
                        }
                    });
                    // Batch update players (only cond changed)
                    for (const p of updatedSquad){
                        await supabase.from('players').update({
                            cond: p.cond
                        }).eq('id', p.id);
                    }
                } catch (err) {
                    console.error('[playFriendlyMatch] Supabase error:', err);
                }
            }
            return {
                success: true,
                homeScore,
                awayScore
            };
        }
    }["FMProvider.useCallback[playFriendlyMatch]"], [
        profile,
        squad,
        setProfile
    ]);
    const toggleWatchlist = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FMProvider.useCallback[toggleWatchlist]": async (player)=>{
            if (!profile || !player) return;
            // Retirement check
            if ((player.age || 0) >= 38) {
                alert('Emekli olmuş oyuncular izleme listesine eklenemez.');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$ToastNotifications$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["showToast"])('Emekli olmuş oyuncular izleme listesine eklenemez.', 'info');
                return;
            }
            const playerId = player.id;
            const isWatched = watchlist.includes(playerId);
            const newWatchlist = isWatched ? watchlist.filter({
                "FMProvider.useCallback[toggleWatchlist]": (id)=>id !== playerId
            }["FMProvider.useCallback[toggleWatchlist]"]) : [
                ...watchlist,
                playerId
            ];
            setWatchlist(newWatchlist);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveWatchlist"])(profile.id, newWatchlist);
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabase"])();
                try {
                    if (isWatched) {
                        await supabase.from('watchlist').delete().eq('user_id', profile.id).eq('player_id', playerId);
                    } else {
                        // CRITICAL: Ensure player exists in 'players' table first due to FK constraint
                        const { data: existingPlayer } = await supabase.from('players').select('id').eq('id', playerId).single();
                        if (!existingPlayer) {
                            // Insert player data if missing
                            await supabase.from('players').insert({
                                ...player,
                                profile_id: null,
                                scouted: true // Mark as scouted since they are in watchlist
                            });
                        }
                        await supabase.from('watchlist').insert({
                            user_id: profile.id,
                            player_id: playerId
                        });
                    }
                } catch (err) {
                    console.error('Watchlist sync error:', err);
                }
            }
        }
    }["FMProvider.useCallback[toggleWatchlist]"], [
        profile,
        watchlist
    ]);
    // userId is now derived from authUser.id — no localStorage UUID needed
    // When authUser changes (login/logout), refresh data automatically
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FMProvider.useEffect": ()=>{
            if (userId) {
                refreshData(userId);
            } else {
                // No user = clear all game state
                setProfileState(null);
                setSquad([]);
                setWatchlist([]);
                setLoading(false);
            }
        }
    }["FMProvider.useEffect"], [
        userId
    ]); // eslint-disable-line react-hooks/exhaustive-deps
    // Profile check: if user is authenticated but has no profile, show ManagerRegistration
    // Auto-save logic
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FMProvider.useEffect": ()=>{
            if (userId && profile) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveProfile"])(profile);
            }
        }
    }["FMProvider.useEffect"], [
        profile,
        userId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FMProvider.useEffect": ()=>{
            if (userId && squad.length > 0) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["savePlayers"])(squad, userId, profile?.team_name || 'Başakşehir');
            }
        }
    }["FMProvider.useEffect"], [
        squad,
        userId,
        profile?.team_name
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FMProvider.useEffect": ()=>{
            if (userId && activeTactic) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveActiveTactic"])(userId, activeTactic);
            }
        }
    }["FMProvider.useEffect"], [
        activeTactic,
        userId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FMProvider.useEffect": ()=>{
            if (userId && trainingState) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$persistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveTrainingState"])(userId, trainingState);
            }
        }
    }["FMProvider.useEffect"], [
        trainingState,
        userId
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FMContext.Provider, {
        value: {
            userId,
            authEmail,
            isAdmin,
            profile,
            setProfile,
            squad,
            setSquad,
            activeTactic,
            setActiveTactic,
            trainingState,
            setTrainingState,
            league,
            setLeague,
            selectedTeamProfile,
            setSelectedTeamProfile,
            directMessageRecipient,
            setDirectMessageRecipient,
            loading,
            setLoading,
            refreshData,
            locale,
            setLocale,
            sellPlayer,
            scoutPlayer,
            playFriendlyMatch,
            watchlist,
            toggleWatchlist,
            negotiatePurchase,
            addSponsor,
            initTeam,
            activeTab,
            setActiveTab
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/lib/fm/GameContext.tsx",
        lineNumber: 1058,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(FMProvider, "soGJZ8WR0yul6xGfnLIr/HvAGuw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = FMProvider;
const useFM = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(FMContext);
    if (!context) throw new Error('useFM must be used within an FMProvider');
    return context;
};
_s1(useFM, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "FMProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/fm/MatchContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MatchProvider",
    ()=>MatchProvider,
    "useMatchContext",
    ()=>useMatchContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
function getDefaultMatchState() {
    return {
        minute: 0,
        score: {
            home: 0,
            away: 0
        },
        result: null,
        visibleEvents: [],
        matchSummaryEvents: {
            home: [],
            away: []
        },
        isActive: false,
        isFinished: false,
        isPaused: false,
        playerConditions: {}
    };
}
const MatchContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
const MatchProvider = ({ children })=>{
    _s();
    const [matchState, setMatchState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(getDefaultMatchState());
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MatchContext.Provider, {
        value: {
            matchState,
            setMatchState
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/lib/fm/MatchContext.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(MatchProvider, "FvnoQq6y74wfu2eCjfne8KCwhw0=");
_c = MatchProvider;
const useMatchContext = ()=>{
    _s1();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(MatchContext);
    if (!ctx) throw new Error('useMatchContext must be used within MatchProvider');
    return ctx;
};
_s1(useMatchContext, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "MatchProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/fm/ToastContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToastProvider",
    ()=>ToastProvider,
    "useToast",
    ()=>useToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.js [app-client] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-client] (ecmascript) <export default as XCircle>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
// ═══════════════════════════════════════════════════
// Context
// ═══════════════════════════════════════════════════
const ToastContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function useToast() {
    _s();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
_s(useToast, "/dMy7t63NXD4eYACoT93CePwGrg=");
function ToastProvider({ children }) {
    _s1();
    const [toasts, setToasts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const counterRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const removeToast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ToastProvider.useCallback[removeToast]": (id)=>{
            setToasts({
                "ToastProvider.useCallback[removeToast]": (prev)=>prev.filter({
                        "ToastProvider.useCallback[removeToast]": (t)=>t.id !== id
                    }["ToastProvider.useCallback[removeToast]"])
            }["ToastProvider.useCallback[removeToast]"]);
        }
    }["ToastProvider.useCallback[removeToast]"], []);
    const addToast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ToastProvider.useCallback[addToast]": (type, message, duration = 3500)=>{
            const id = `toast-${++counterRef.current}`;
            setToasts({
                "ToastProvider.useCallback[addToast]": (prev)=>[
                        ...prev,
                        {
                            id,
                            type,
                            message,
                            duration
                        }
                    ]
            }["ToastProvider.useCallback[addToast]"]);
            if (duration > 0) {
                setTimeout({
                    "ToastProvider.useCallback[addToast]": ()=>removeToast(id)
                }["ToastProvider.useCallback[addToast]"], duration);
            }
        }
    }["ToastProvider.useCallback[addToast]"], [
        removeToast
    ]);
    const value = {
        toast: addToast,
        success: (msg)=>addToast('success', msg),
        error: (msg)=>addToast('error', msg, 5000),
        warning: (msg)=>addToast('warning', msg, 4000),
        info: (msg)=>addToast('info', msg, 3000)
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastContext.Provider, {
        value: value,
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm pointer-events-none",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                    children: toasts.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastItem, {
                            toast: t,
                            onDismiss: ()=>removeToast(t.id)
                        }, t.id, false, {
                            fileName: "[project]/src/lib/fm/ToastContext.tsx",
                            lineNumber: 75,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/lib/fm/ToastContext.tsx",
                    lineNumber: 73,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/lib/fm/ToastContext.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/lib/fm/ToastContext.tsx",
        lineNumber: 69,
        columnNumber: 5
    }, this);
}
_s1(ToastProvider, "fZKUqF/OLOMJqzPjGoiWCde9To8=");
_c = ToastProvider;
// ═══════════════════════════════════════════════════
// Toast Item Component
// ═══════════════════════════════════════════════════
const TOAST_CONFIG = {
    success: {
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
            size: 16
        }, void 0, false, {
            fileName: "[project]/src/lib/fm/ToastContext.tsx",
            lineNumber: 89,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0)),
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400'
    },
    error: {
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
            size: 16
        }, void 0, false, {
            fileName: "[project]/src/lib/fm/ToastContext.tsx",
            lineNumber: 95,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0)),
        bg: 'bg-red-500/15',
        border: 'border-red-500/30',
        text: 'text-red-400'
    },
    warning: {
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
            size: 16
        }, void 0, false, {
            fileName: "[project]/src/lib/fm/ToastContext.tsx",
            lineNumber: 101,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0)),
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/30',
        text: 'text-amber-400'
    },
    info: {
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
            size: 16
        }, void 0, false, {
            fileName: "[project]/src/lib/fm/ToastContext.tsx",
            lineNumber: 107,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0)),
        bg: 'bg-sky-500/15',
        border: 'border-sky-500/30',
        text: 'text-sky-400'
    }
};
function ToastItem({ toast, onDismiss }) {
    const config = TOAST_CONFIG[toast.type];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            opacity: 0,
            x: 80,
            scale: 0.9
        },
        animate: {
            opacity: 1,
            x: 0,
            scale: 1
        },
        exit: {
            opacity: 0,
            x: 80,
            scale: 0.9
        },
        transition: {
            duration: 0.25,
            ease: 'easeOut'
        },
        className: `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl ${config.bg} ${config.border}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `shrink-0 ${config.text}`,
                children: config.icon
            }, void 0, false, {
                fileName: "[project]/src/lib/fm/ToastContext.tsx",
                lineNumber: 125,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: `text-[11px] font-bold leading-snug flex-1 ${config.text}`,
                children: toast.message
            }, void 0, false, {
                fileName: "[project]/src/lib/fm/ToastContext.tsx",
                lineNumber: 126,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onDismiss,
                className: "shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                    size: 12,
                    className: "text-white/30"
                }, void 0, false, {
                    fileName: "[project]/src/lib/fm/ToastContext.tsx",
                    lineNumber: 133,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/lib/fm/ToastContext.tsx",
                lineNumber: 129,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/lib/fm/ToastContext.tsx",
        lineNumber: 118,
        columnNumber: 5
    }, this);
}
_c1 = ToastItem;
var _c, _c1;
__turbopack_context__.k.register(_c, "ToastProvider");
__turbopack_context__.k.register(_c1, "ToastItem");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/DemoBanner.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DemoBanner",
    ()=>DemoBanner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AuthContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
function DemoBanner() {
    _s();
    const { isDemoMode } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    if (!isDemoMode) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-amber-500/20 border-b border-amber-500/30 px-4 py-1 text-center",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-amber-400 text-xs font-bold uppercase",
            children: "Demo Modu — Veriler sadece bu tarayıcıda saklanıyor"
        }, void 0, false, {
            fileName: "[project]/src/components/DemoBanner.tsx",
            lineNumber: 12,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/DemoBanner.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
_s(DemoBanner, "ybBq0JlbLUqYAFlkGlgFwsF05Ew=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = DemoBanner;
var _c;
__turbopack_context__.k.register(_c, "DemoBanner");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_842a5a6e._.js.map