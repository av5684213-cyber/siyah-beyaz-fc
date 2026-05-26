(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/hooks/useDraggableModal.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDraggableModal",
    ()=>useDraggableModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
/**
 * useDraggableModal — Modal'ları sürüklenebilir yapan React hook'u.
 *
 * Kullanım:
 *   const { modalRef, handleRef, position, isDragging } = useDraggableModal();
 *
 *   <div ref={modalRef} style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
 *     <div ref={handleRef} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
 *       Başlık / Sürükleme Tutamacı
 *     </div>
 *     <div className="overflow-y-auto">İçerik</div>
 *   </div>
 *
 * - Sadece handle alanından sürüklenebilir (tüm modal değil)
 * - Çift tıklama ile merkeze sıfırlar
 * - Ekran sınırlarını aşmaz
 * - Touch event desteği (mobil)
 */ 'use client';
;
function useDraggableModal() {
    _s();
    const modalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const handleRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [position, setPosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        x: 0,
        y: 0
    });
    const [isDragging, setIsDragging] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const dragStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        x: 0,
        y: 0
    });
    const dragOffset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        x: 0,
        y: 0
    });
    const resetPosition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useDraggableModal.useCallback[resetPosition]": ()=>{
            setPosition({
                x: 0,
                y: 0
            });
        }
    }["useDraggableModal.useCallback[resetPosition]"], []);
    // ── Mouse Events ──
    const handleMouseDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useDraggableModal.useCallback[handleMouseDown]": (e)=>{
            // Sadece sol tıklama (mouse) veya touch
            if ('button' in e && e.button !== 0) return;
            e.preventDefault();
            setIsDragging(true);
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            dragStart.current = {
                x: clientX,
                y: clientY
            };
            dragOffset.current = {
                ...position
            };
        }
    }["useDraggableModal.useCallback[handleMouseDown]"], [
        position
    ]);
    const handleMouseMove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useDraggableModal.useCallback[handleMouseMove]": (e)=>{
            if (!isDragging) return;
            e.preventDefault();
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            const deltaX = clientX - dragStart.current.x;
            const deltaY = clientY - dragStart.current.y;
            let newX = dragOffset.current.x + deltaX;
            let newY = dragOffset.current.y + deltaY;
            // Ekran sınırlarını kontrol et
            if (modalRef.current) {
                const rect = modalRef.current.getBoundingClientRect();
                const maxX = window.innerWidth - rect.width;
                const maxY = window.innerHeight - 40; // En az 40px görünür kalsın
                newX = Math.max(-rect.width + 100, Math.min(maxX, newX));
                newY = Math.max(0, Math.min(maxY, newY));
            }
            setPosition({
                x: newX,
                y: newY
            });
        }
    }["useDraggableModal.useCallback[handleMouseMove]"], [
        isDragging
    ]);
    const handleMouseUp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useDraggableModal.useCallback[handleMouseUp]": ()=>{
            setIsDragging(false);
        }
    }["useDraggableModal.useCallback[handleMouseUp]"], []);
    // ── Double-click to reset ──
    const handleDoubleClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useDraggableModal.useCallback[handleDoubleClick]": ()=>{
            resetPosition();
        }
    }["useDraggableModal.useCallback[handleDoubleClick]"], [
        resetPosition
    ]);
    // ── Event Listener Kayıt ──
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDraggableModal.useEffect": ()=>{
            const handle = handleRef.current;
            if (!handle) return;
            // Mouse
            handle.addEventListener('mousedown', handleMouseDown);
            handle.addEventListener('dblclick', handleDoubleClick);
            // Touch
            handle.addEventListener('touchstart', handleMouseDown, {
                passive: false
            });
            return ({
                "useDraggableModal.useEffect": ()=>{
                    handle.removeEventListener('mousedown', handleMouseDown);
                    handle.removeEventListener('dblclick', handleDoubleClick);
                    handle.removeEventListener('touchstart', handleMouseDown);
                }
            })["useDraggableModal.useEffect"];
        }
    }["useDraggableModal.useEffect"], [
        handleMouseDown,
        handleDoubleClick
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDraggableModal.useEffect": ()=>{
            if (!isDragging) return;
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleMouseMove, {
                passive: false
            });
            window.addEventListener('touchend', handleMouseUp);
            return ({
                "useDraggableModal.useEffect": ()=>{
                    window.removeEventListener('mousemove', handleMouseMove);
                    window.removeEventListener('mouseup', handleMouseUp);
                    window.removeEventListener('touchmove', handleMouseMove);
                    window.removeEventListener('touchend', handleMouseUp);
                }
            })["useDraggableModal.useEffect"];
        }
    }["useDraggableModal.useEffect"], [
        isDragging,
        handleMouseMove,
        handleMouseUp
    ]);
    return {
        modalRef,
        handleRef,
        position,
        isDragging,
        resetPosition
    };
}
_s(useDraggableModal, "bCDMsSXaGj3DXQgHIkfIYanDtCU=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_hooks_useDraggableModal_ts_fafb34ef._.js.map