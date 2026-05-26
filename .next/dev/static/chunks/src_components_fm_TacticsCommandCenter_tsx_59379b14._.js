(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/fm/TacticsCommandCenter.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TacticsCommandCenter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.js [app-client] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/swords.js [app-client] (ecmascript) <export default as Swords>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flame.js [app-client] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRightLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right-left.js [app-client] (ecmascript) <export default as ArrowRightLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$TacticsRolesPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/fm/TacticsRolesPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$tacticsRoles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/tacticsRoles.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$playerGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/playerGenerator.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fm/ui-helpers.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-client] (ecmascript) <export default as ChevronUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/tooltip.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function toTitleCase(str) {
    return str.replace(/\b\w/g, (c)=>c.toUpperCase());
}
;
;
;
;
// Arketip açıklama haritası
const ARCHETYPE_INFO = {
    'Refleks canavarı': {
        desc: 'Kaleci arketipi — Refleks ve kurtarış ustası',
        boosts: [
            'Kalecilik',
            'Refleksler'
        ]
    },
    'Güvenli eller': {
        desc: 'Kaleci arketipi — Top tutma ve soğukkanlılık',
        boosts: [
            'Kalecilik',
            'Soğukkanlılık'
        ]
    },
    '1v1 ustası': {
        desc: 'Kaleci arketipi — Bire bir durumlarda uzman',
        boosts: [
            'Kalecilik',
            'Cesaret'
        ]
    },
    'Hava hakimiyeti': {
        desc: 'Hava toplarında dominant — Kafa ve zıplama',
        boosts: [
            'Kafa',
            'Zıplama'
        ]
    },
    'Kale gibi': {
        desc: 'Defans arketipi — Markaj ve top kapma ustası',
        boosts: [
            'Markaj',
            'Top Kapma'
        ]
    },
    'Lider stoper': {
        desc: 'Defans arketipi — Liderlik ve pozisyon alma',
        boosts: [
            'Liderlik',
            'Pozisyon'
        ]
    },
    'Topla çıkan stoper': {
        desc: 'Defans arketipi — Pas ve dribling yeteneği yüksek',
        boosts: [
            'Pas',
            'Dribling'
        ]
    },
    'Hızlı stoper': {
        desc: 'Defans arketipi — Hız ve iverlenme',
        boosts: [
            'Hız',
            'İverlenme'
        ]
    },
    'Markajcı': {
        desc: 'Defans arketipi — Adam adama markaj ustası',
        boosts: [
            'Markaj'
        ]
    },
    'Gölge Markajcı': {
        desc: 'Defans arketipi — Gölge markaj tekniği',
        boosts: [
            'Markaj'
        ]
    },
    'Kanat bekçisi': {
        desc: 'Bek arketipi — Markaj ve top kapma',
        boosts: [
            'Markaj',
            'Top Kapma'
        ]
    },
    'Uzun pas ustası': {
        desc: 'Orta ve uzun pas uzmanı',
        boosts: [
            'Orta',
            'Pas'
        ]
    },
    'Süpürücü (libero)': {
        desc: 'Defans arketipi — Markaj ve pozisyon alma',
        boosts: [
            'Markaj',
            'Pozisyon'
        ]
    },
    'Top saklayan': {
        desc: 'Top saklama ve denge ustası',
        boosts: [
            'Dribling',
            'Denge'
        ]
    },
    'Pres ustası': {
        desc: 'Orta saha arketipi — Top kapma ve çalışkanlık',
        boosts: [
            'Top Kapma',
            'Çalışkanlık'
        ]
    },
    'Tempo kontrolcüsü': {
        desc: 'Orta saha arketipi — Pas ve vizyon',
        boosts: [
            'Pas',
            'Vizyon'
        ]
    },
    'Regista': {
        desc: 'Orta saha arketipi — Derin oyun kurucu',
        boosts: [
            'Pas',
            'Vizyon'
        ]
    },
    'Oyun Bozan': {
        desc: 'Orta saha arketipi — Top kapma ve öngörü',
        boosts: [
            'Top Kapma',
            'Öngörü'
        ]
    },
    'Oyun kurucu': {
        desc: 'Orta saha arketipi — Pas ve vizyon ile oyun kurar',
        boosts: [
            'Pas',
            'Vizyon'
        ]
    },
    'Box-to-box': {
        desc: 'Orta saha arketipi — Dayanıklılık, top kapma ve şut',
        boosts: [
            'Dayanıklılık',
            'Top Kapma',
            'Şut'
        ]
    },
    'Top dağıtıcı': {
        desc: 'Orta saha arketibi — Pas ve ilk kontrol',
        boosts: [
            'Pas',
            'İlk Kontrol'
        ]
    },
    'Uzaktan şutçu': {
        desc: 'Uzaktan şut uzmanı',
        boosts: [
            'Uzaktan Şut',
            'Şut'
        ]
    },
    'Pas arası ustası': {
        desc: 'Öngörü ve top kapma ile pas arası',
        boosts: [
            'Öngörü',
            'Top Kapma'
        ]
    },
    '10 numara': {
        desc: 'Ofansif orta saha — Pas, vizyon ve dribling',
        boosts: [
            'Pas',
            'Vizyon',
            'Dribling'
        ]
    },
    'Boşluk bulucu': {
        desc: 'Ofansif orta saha — Boş alan bulma ve dribling',
        boosts: [
            'Boş Alan',
            'Dribling'
        ]
    },
    'Oyun görüşü yüksek': {
        desc: 'Vizyon ve pas ile oyun okuma',
        boosts: [
            'Vizyon',
            'Pas'
        ]
    },
    'Koşu ustası': {
        desc: 'Hız ve dayanıklılık ile sürekli koşu',
        boosts: [
            'Hız',
            'Dayanıklılık'
        ]
    },
    'Hızlı forvet': {
        desc: 'Forvet arketipi — Hız ve iverlenme',
        boosts: [
            'Hız',
            'İverlenme'
        ]
    },
    'Boşluk avcısı': {
        desc: 'Forvet arketibi — Dribling ve boş alan bulma',
        boosts: [
            'Dribling',
            'Boş Alan'
        ]
    },
    'Kontra canavarı': {
        desc: 'Kontra atak ustası — Hız ve dribling',
        boosts: [
            'Hız',
            'Dribling'
        ]
    },
    'Bitirici': {
        desc: 'Forvet arketibi — Şut ve bitiricilik',
        boosts: [
            'Şut',
            'Bitiricilik'
        ]
    },
    'Sahte 9': {
        desc: 'Forvet arketibi — Vizyon, pas ve dribling',
        boosts: [
            'Vizyon',
            'Pas',
            'Dribling'
        ]
    },
    'Pozisyoncu': {
        desc: 'Forvet arketibi — Boş alan ve bitiricilik',
        boosts: [
            'Boş Alan',
            'Bitiricilik'
        ]
    },
    'Fırsatçı': {
        desc: 'Forvet arketibi — Fırsatları değerlendirir',
        boosts: [
            'Boş Alan',
            'Bitiricilik'
        ]
    },
    'Gol makinesi': {
        desc: 'Forvet arketibi — Gol atma ustası',
        boosts: [
            'Şut',
            'Bitiricilik',
            'Boş Alan'
        ]
    },
    'Fiziksel santrafor': {
        desc: 'Forvet arketibi — Güç ve kafa',
        boosts: [
            'Güç',
            'Kafa'
        ]
    },
    'Kafacı (forvet)': {
        desc: 'Forvet arketibi — Kafa vuruşu ve bitiricilik',
        boosts: [
            'Kafa',
            'Bitiricilik'
        ]
    }
};
// Helper to darken a hex color by a given percentage
const darkenColor = (hex, percent)=>{
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
    const g = Math.max(0, (num >> 8 & 0x00ff) - Math.round(2.55 * percent));
    const b = Math.max(0, (num & 0x0000ff) - Math.round(2.55 * percent));
    return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
};
// Position group → primary kit color mapping
const POS_GROUP_COLORS = {
    GK: '#7AB4E8',
    DEF: '#7EDBC8',
    MID: '#F0C87A',
    FWD: '#E87878'
};
const POS_GROUP_SECONDARY = {
    GK: '#4A8BC2',
    DEF: '#4BB89E',
    MID: '#C9A24E',
    FWD: '#C44E4E'
};
function useTouchDrag(onSwap) {
    _s();
    const dragRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const justDraggedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const onDocumentTouchMove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useTouchDrag.useCallback[onDocumentTouchMove]": (e)=>{
            if (!dragRef.current) return;
            const touch = e.touches[0];
            if (!dragRef.current.isDragging) {
                const dx = touch.clientX - dragRef.current.startX;
                const dy = touch.clientY - dragRef.current.startY;
                if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
                    dragRef.current.isDragging = true;
                    if (dragRef.current.sourceEl) {
                        const rect = dragRef.current.sourceEl.getBoundingClientRect();
                        const ghost = dragRef.current.sourceEl.cloneNode(true);
                        ghost.style.position = 'fixed';
                        ghost.style.zIndex = '9999';
                        ghost.style.pointerEvents = 'none';
                        ghost.style.opacity = '0.75';
                        ghost.style.width = `${rect.width}px`;
                        ghost.style.height = `${rect.height}px`;
                        ghost.style.left = `${touch.clientX - rect.width / 2}px`;
                        ghost.style.top = `${touch.clientY - rect.height / 2}px`;
                        ghost.style.transform = 'scale(1.1)';
                        ghost.style.transition = 'none';
                        ghost.style.boxShadow = '0 0 20px rgba(16,185,129,0.5)';
                        document.body.appendChild(ghost);
                        dragRef.current.ghostEl = ghost;
                        dragRef.current.sourceEl.style.opacity = '0.3';
                    }
                }
            }
            if (dragRef.current.isDragging) {
                e.preventDefault();
                if (dragRef.current.ghostEl) {
                    const w = dragRef.current.ghostEl.offsetWidth;
                    const h = dragRef.current.ghostEl.offsetHeight;
                    dragRef.current.ghostEl.style.left = `${touch.clientX - w / 2}px`;
                    dragRef.current.ghostEl.style.top = `${touch.clientY - h / 2}px`;
                }
            }
        }
    }["useTouchDrag.useCallback[onDocumentTouchMove]"], []);
    const onDocumentTouchEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useTouchDrag.useCallback[onDocumentTouchEnd]": (e)=>{
            if (!dragRef.current) return;
            if (dragRef.current.sourceEl) {
                dragRef.current.sourceEl.style.opacity = '';
            }
            if (dragRef.current.ghostEl) {
                dragRef.current.ghostEl.remove();
            }
            if (dragRef.current.isDragging) {
                justDraggedRef.current = true;
                setTimeout({
                    "useTouchDrag.useCallback[onDocumentTouchEnd]": ()=>{
                        justDraggedRef.current = false;
                    }
                }["useTouchDrag.useCallback[onDocumentTouchEnd]"], 300);
                const touch = e.changedTouches[0];
                // Temporarily hide ghost to use elementFromPoint
                const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                const pitchEl = elementBelow?.closest('[data-pitch-idx]');
                const benchEl = elementBelow?.closest('[data-bench-idx]');
                if (pitchEl) {
                    const targetIdx = parseInt(pitchEl.getAttribute('data-pitch-idx'));
                    onSwap(dragRef.current.sourceIdx, dragRef.current.sourceType, targetIdx, 'pitch');
                } else if (benchEl) {
                    const targetIdx = parseInt(benchEl.getAttribute('data-bench-idx'));
                    onSwap(dragRef.current.sourceIdx, dragRef.current.sourceType, targetIdx, 'bench');
                }
            }
            document.removeEventListener('touchmove', onDocumentTouchMove);
            document.removeEventListener('touchend', onDocumentTouchEnd);
            dragRef.current = null;
        }
    }["useTouchDrag.useCallback[onDocumentTouchEnd]"], [
        onSwap,
        onDocumentTouchMove
    ]);
    const handleTouchStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useTouchDrag.useCallback[handleTouchStart]": (playerId, sourceIdx, sourceType)=>({
                "useTouchDrag.useCallback[handleTouchStart]": (e)=>{
                    dragRef.current = {
                        playerId,
                        sourceIdx,
                        sourceType,
                        ghostEl: null,
                        startX: e.touches[0].clientX,
                        startY: e.touches[0].clientY,
                        isDragging: false,
                        sourceEl: e.currentTarget
                    };
                    document.addEventListener('touchmove', onDocumentTouchMove, {
                        passive: false
                    });
                    document.addEventListener('touchend', onDocumentTouchEnd);
                }
            })["useTouchDrag.useCallback[handleTouchStart]"]
    }["useTouchDrag.useCallback[handleTouchStart]"], [
        onDocumentTouchMove,
        onDocumentTouchEnd
    ]);
    return {
        handleTouchStart,
        justDraggedRef
    };
}
_s(useTouchDrag, "CVLyZ+a6PizFQXppLbCryQiajOQ=");
const PlayerIcon = ({ player, condition, pos, onDrop, onDragOver, onDragStart, onDragLeave, onClick, isDragOver, isSelected, teamPrimaryColor, teamSecondaryColor, onTouchStart, pitchIdx })=>{
    if (!player) return null;
    const displayName = toTitleCase(player.name || 'Bilinmeyen');
    const getRingColor = (cond)=>{
        if (cond >= 100) return 'rgb(34, 197, 94)';
        if (cond < 20) return 'rgb(239, 68, 68)';
        if (cond < 50) return 'rgb(234, 179, 8)';
        return 'rgba(255, 255, 255, 0.3)';
    };
    const ringColor = getRingColor(condition);
    // Team colors for outfield players, green variant for GK
    const isGoalkeeper = (player.specificPosition || player.position) === 'GK';
    const primaryColor = isGoalkeeper ? '#2E8B57' : teamPrimaryColor || '#9B9B9B';
    const secondaryColor = isGoalkeeper ? '#1A5C3A' : teamSecondaryColor || '#6B6B6B';
    const posCode = player.specificPosition || player.position;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        layout: true,
        initial: {
            opacity: 0,
            scale: 0
        },
        animate: {
            opacity: 1,
            scale: 1,
            left: `${pos.x}%`,
            top: `${pos.y}%`
        },
        draggable: true,
        onDragStart: onDragStart,
        onDragOver: onDragOver,
        onDrop: onDrop,
        onDragLeave: onDragLeave,
        onClick: onClick,
        onTouchStart: onTouchStart,
        "data-pitch-idx": pitchIdx,
        style: {
            touchAction: 'none'
        },
        className: `absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-grab active:cursor-grabbing ${isDragOver ? 'z-30 scale-110' : isSelected ? 'z-20 scale-110' : 'z-10'}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative w-14 h-14 flex items-center justify-center",
                children: [
                    isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute -inset-1 rounded-full border-2 border-amber-400 animate-pulse z-10"
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                        lineNumber: 271,
                        columnNumber: 15
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "absolute inset-0 w-full h-full -rotate-90",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: "28",
                                cy: "28",
                                r: "25",
                                fill: "none",
                                stroke: "rgba(0,0,0,0.1)",
                                strokeWidth: "4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                lineNumber: 275,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: "28",
                                cy: "28",
                                r: "25",
                                fill: "none",
                                stroke: ringColor,
                                strokeWidth: condition >= 100 ? 4 : 3,
                                strokeDasharray: "157",
                                strokeDashoffset: 157 * (1 - (condition || 100) / 100),
                                className: "transition-all duration-500"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                lineNumber: 276,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                        lineNumber: 274,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-12 h-[54px] relative group-hover:scale-110 transition-transform",
                        style: {
                            filter: `drop-shadow(0 0 1px ${secondaryColor}99) drop-shadow(0 4px 8px ${primaryColor}35) drop-shadow(0 2px 5px rgba(0,0,0,0.55))`
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-0 flex flex-col items-center justify-center overflow-hidden",
                            style: {
                                background: `linear-gradient(175deg, ${primaryColor} 0%, ${darkenColor(primaryColor, 10)} 35%, ${darkenColor(primaryColor, 22)} 100%)`,
                                clipPath: 'polygon(0% 8%, 0% 26%, 22% 26%, 18% 100%, 82% 100%, 78% 26%, 100% 26%, 100% 8%, 73% 0%, 58% 0%, 50% 13%, 42% 0%, 27% 0%)'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute top-0 left-1/2 -translate-x-1/2 w-[14px] h-[8px]",
                                    style: {
                                        background: `linear-gradient(180deg, ${secondaryColor}dd 0%, ${secondaryColor}55 65%, transparent 100%)`,
                                        clipPath: 'polygon(0 0, 100% 0, 66% 100%, 34% 100%)'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                    lineNumber: 303,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute top-[1px] left-1/2 -translate-x-1/2 w-[16px] h-[3px]",
                                    style: {
                                        background: `${secondaryColor}40`,
                                        clipPath: 'polygon(5% 0, 95% 0, 70% 100%, 30% 100%)'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                    lineNumber: 311,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute left-0 top-[10%] w-[20%] h-[5%]",
                                    style: {
                                        background: `${secondaryColor}45`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                    lineNumber: 319,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute left-0 top-[22%] w-[20%] h-[3%]",
                                    style: {
                                        background: `${secondaryColor}70`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                    lineNumber: 321,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute right-0 top-[10%] w-[20%] h-[5%]",
                                    style: {
                                        background: `${secondaryColor}45`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                    lineNumber: 323,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute right-0 top-[22%] w-[20%] h-[3%]",
                                    style: {
                                        background: `${secondaryColor}70`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                    lineNumber: 325,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute inset-0 opacity-[0.06]",
                                    style: {
                                        background: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${secondaryColor} 3px, ${secondaryColor} 4px)`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                    lineNumber: 327,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute left-[22%] top-[33%] w-[5px] h-[5px] rounded-full",
                                    style: {
                                        background: `${secondaryColor}cc`,
                                        boxShadow: `0 0 2px ${secondaryColor}80`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                    lineNumber: 334,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "absolute top-[30%] text-[17px] font-black text-white/20 leading-none tracking-tighter select-none",
                                    style: {
                                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                    },
                                    children: player.rating
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                    lineNumber: 339,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "absolute bottom-[8%] text-[8px] font-black text-white tracking-tight leading-none z-10",
                                    style: {
                                        textShadow: '0 1px 3px rgba(0,0,0,0.6)'
                                    },
                                    children: posCode
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                    lineNumber: 346,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                            lineNumber: 295,
                            columnNumber: 15
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                        lineNumber: 288,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                lineNumber: 268,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-11 h-[6px] bg-black/20 rounded-[50%] blur-[3px] mx-auto -mt-1"
            }, void 0, false, {
                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                lineNumber: 356,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-0.5 bg-black/80 backdrop-blur-sm text-white px-2 py-0.5 shadow-xl border border-white/10 min-w-[52px] max-w-[92px] rounded-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-[8px] font-black tracking-tight block text-center leading-tight uppercase",
                    children: displayName
                }, void 0, false, {
                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                    lineNumber: 358,
                    columnNumber: 13
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                lineNumber: 357,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
        lineNumber: 253,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c = PlayerIcon;
function TacticsCommandCenter({ activeTactic, onActiveTacticChange, squad, onSquadUpdate, playerConditions = {}, onPlayerClick, transferOffers, onAcceptOffer, onRejectOffer, teamPrimaryColor, teamSecondaryColor, playerRoles: externalRoles, onPlayerRolesChange, activeInstructions: externalInstructions, onInstructionsChange }) {
    _s1();
    const [hoveredInfo, setHoveredInfo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [dragOverIdx, setDragOverIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [sortBy, setSortBy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Poz');
    // ── Touch/Mobile: Tap-to-select & swap ──
    const [selectedForSwap, setSelectedForSwap] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // ── Shared swap logic (used by both tap-to-swap and touch drag) ──
    const performSwap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TacticsCommandCenter.useCallback[performSwap]": (srcIdx, srcType, tgtIdx, tgtType)=>{
            if (srcType === tgtType && srcIdx === tgtIdx) return;
            let newSquad = [
                ...squad
            ];
            if (srcType === 'bench' && tgtType === 'pitch') {
                const temp = newSquad[srcIdx];
                newSquad[srcIdx] = newSquad[tgtIdx];
                newSquad[tgtIdx] = temp;
            } else if (srcType === 'pitch' && tgtType === 'bench') {
                const temp = newSquad[srcIdx];
                newSquad[srcIdx] = newSquad[tgtIdx];
                newSquad[tgtIdx] = temp;
            } else {
                const temp = newSquad[srcIdx];
                newSquad[srcIdx] = newSquad[tgtIdx];
                newSquad[tgtIdx] = temp;
            }
            newSquad = newSquad.map({
                "TacticsCommandCenter.useCallback[performSwap]": (p, i)=>({
                        ...p,
                        is_starter: i < 11
                    })
            }["TacticsCommandCenter.useCallback[performSwap]"]);
            onSquadUpdate(newSquad);
            setSelectedForSwap(null);
        }
    }["TacticsCommandCenter.useCallback[performSwap]"], [
        squad,
        onSquadUpdate
    ]);
    // ── Touch drag-and-drop hook ──
    const { handleTouchStart: touchDragStart, justDraggedRef } = useTouchDrag(performSwap);
    const [sortDirection, setSortDirection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('asc');
    const [hoveredPlayerId, setHoveredPlayerId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // New: sub-view (squad management vs role assignment)
    const [activeView, setActiveView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('squad');
    // Role state — use external if provided, else local
    const [localRoles, setLocalRoles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [localInstructions, setLocalInstructions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const playerRoles = externalRoles ?? localRoles;
    const activeInstructions = externalInstructions ?? localInstructions;
    const handleRoleChange = (playerId, roleId)=>{
        const updated = {
            ...playerRoles,
            [playerId]: roleId
        };
        if (onPlayerRolesChange) onPlayerRolesChange(updated);
        else setLocalRoles(updated);
    };
    const handleInstructionToggle = (instructionId)=>{
        const updated = activeInstructions.includes(instructionId) ? activeInstructions.filter((i)=>i !== instructionId) : [
            ...activeInstructions,
            instructionId
        ];
        if (onInstructionsChange) onInstructionsChange(updated);
        else setLocalInstructions(updated);
    };
    // Tactical score
    const tacticalScore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "TacticsCommandCenter.useMemo[tacticalScore]": ()=>{
            try {
                if (!squad.length) return null;
                const starters = squad.slice(0, 11);
                // Build SquadSlot[] for calculateTacticalScore
                const squadSlots = starters.map({
                    "TacticsCommandCenter.useMemo[tacticalScore].squadSlots": (p)=>({
                            player: p,
                            position: p.specificPosition || p.position,
                            roleId: playerRoles[p.id] || 'no_role'
                        })
                }["TacticsCommandCenter.useMemo[tacticalScore].squadSlots"]);
                const tacticConfig = {
                    formation: activeTactic.formation || '4-4-2',
                    instructions: activeInstructions.map({
                        "TacticsCommandCenter.useMemo[tacticalScore]": (i)=>({
                                instructionName: i,
                                option: 'on'
                            })
                    }["TacticsCommandCenter.useMemo[tacticalScore]"]),
                    playStyle: activeTactic.playStyle
                };
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$tacticsRoles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateTacticalScore"])(squadSlots, tacticConfig);
            } catch  {
                return null;
            }
        }
    }["TacticsCommandCenter.useMemo[tacticalScore]"], [
        squad,
        playerRoles,
        activeInstructions,
        activeTactic
    ]);
    const getStatValue = (player, key)=>{
        const rating = player.rating || 50;
        switch(key){
            case 'Poz':
                return 0; // handled separately
            case 'Oyuncu':
                return 0; // handled separately
            case 'Klt':
                return Math.round(player.potential || rating);
            case 'Klc':
                return Math.round(player.goalkeeping || (player.position === 'GK' ? rating * 1.05 : rating * 0.12));
            case 'Tk':
                return Math.round(player.defending || rating);
            case 'Pas':
                return Math.round(player.passing || rating);
            case 'Şut':
                return Math.round(player.shooting || rating);
            case 'Kfa':
                return Math.round(player.heading || rating * 0.95);
            case 'Hız':
                return Math.round(player.speed || rating);
            case 'Güç':
                return Math.round(player.power || rating);
            case 'Alg':
                return Math.round(player.vision || rating);
            case 'Top':
                return Math.round(player.control || rating);
            case 'Tplm':
                return Math.round(rating * 11.2);
            case 'Knd':
                return Math.round(player.cond || 100);
            case 'rating':
                return rating;
            default:
                return rating;
        }
    };
    const sortedSquad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "TacticsCommandCenter.useMemo[sortedSquad]": ()=>{
            const list = [
                ...squad
            ];
            const posOrder = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$playerGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["POS_ORDER"];
            if (sortBy === 'Oyuncu') {
                list.sort({
                    "TacticsCommandCenter.useMemo[sortedSquad]": (a, b)=>sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
                }["TacticsCommandCenter.useMemo[sortedSquad]"]);
            } else if (sortBy === 'Poz') {
                list.sort({
                    "TacticsCommandCenter.useMemo[sortedSquad]": (a, b)=>{
                        const oA = posOrder[a.specificPosition || a.position] ?? 99;
                        const oB = posOrder[b.specificPosition || b.position] ?? 99;
                        // Aynı grupta OVR'ye göre azalan
                        if (oA === oB) return b.rating - a.rating;
                        return sortDirection === 'asc' ? oA - oB : oB - oA;
                    }
                }["TacticsCommandCenter.useMemo[sortedSquad]"]);
            } else {
                list.sort({
                    "TacticsCommandCenter.useMemo[sortedSquad]": (a, b)=>{
                        const vA = getStatValue(a, sortBy);
                        const vB = getStatValue(b, sortBy);
                        if (vA !== vB) return sortDirection === 'asc' ? vA - vB : vB - vA;
                        // Eşitse mevki grubu sırasına göre
                        const oA = posOrder[a.specificPosition || a.position] ?? 99;
                        const oB = posOrder[b.specificPosition || b.position] ?? 99;
                        return oA - oB;
                    }
                }["TacticsCommandCenter.useMemo[sortedSquad]"]);
            }
            return list;
        }
    }["TacticsCommandCenter.useMemo[sortedSquad]"], [
        squad,
        sortBy,
        sortDirection
    ]);
    const toggleSort = (key)=>{
        if (sortBy === key) {
            setSortDirection((prev)=>prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortDirection('desc');
        }
    };
    const getPositionColor = (position)=>{
        const rowStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPosRowStyle"])(position);
        const group = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPosGroup"])(position);
        const textColor = group === 'GK' ? 'text-[#7AB4E8]' : group === 'DEF' ? 'text-[#7EDBC8]' : group === 'MID' ? 'text-[#F0C87A]' : group === 'FWD' ? 'text-[#E87878]' : 'text-[#9B9B9B]';
        return `${rowStyle} ${textColor}`;
    };
    const players = squad.slice(0, 11);
    const bench = squad.slice(11);
    const tacticalParams = [
        {
            label: 'Hücum Hattı',
            key: 'lineHeight',
            type: 'slider',
            min: 0,
            max: 100,
            info: "Savunma hattının saha derinliğindeki konumunu belirler."
        },
        {
            label: 'Oyun Genişliği',
            key: 'width',
            type: 'slider',
            min: 0,
            max: 100,
            info: "Takımın saha yayılım genişliğini belirler."
        },
        {
            label: 'Sertlik Seviyesi',
            key: 'aggression',
            type: 'slider',
            min: 0,
            max: 100,
            info: "Top çalma ve ikili mücadelelerdeki müdahale sertliğini belirler."
        },
        {
            label: 'Pas Şiddeti',
            key: 'passingIntensity',
            type: 'slider',
            min: 0,
            max: 100,
            info: "Pasların hızını ve mesafesini belirler."
        }
    ];
    const toggles = [
        {
            label: 'Tam Saha Pres',
            key: 'pressing',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"], {
                size: 14,
                className: "text-emerald-400"
            }, void 0, false, {
                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                lineNumber: 515,
                columnNumber: 54
            }, this),
            info: "Tüm saha boyunca yoğun baskı uygulanır. Kondisyonu hızla tüketir."
        },
        {
            label: 'Kaleciyi Perdele',
            key: 'screenKeeper',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                size: 14,
                className: "text-blue-400"
            }, void 0, false, {
                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                lineNumber: 516,
                columnNumber: 61
            }, this),
            info: "Kornerlerde bir oyuncuyu rakip kaleci dairesinin üzerine sabitler."
        },
        {
            label: 'Zamana Oyna',
            key: 'wasteTime',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                size: 14,
                className: "text-amber-400"
            }, void 0, false, {
                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                lineNumber: 517,
                columnNumber: 53
            }, this),
            info: "Skor üstünlüğü varken oyun hızını yavaşlatır."
        },
        {
            label: 'Otobüs Çek',
            key: 'parkTheBus',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                size: 14,
                className: "text-red-400"
            }, void 0, false, {
                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                lineNumber: 518,
                columnNumber: 53
            }, this),
            info: "Tamamen savunma odaklı yerleşim. Hücum gücü azalır, savunma direnci artar."
        },
        {
            label: 'Orta Açma Oyunu',
            key: 'crossGame',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__["Swords"], {
                size: 14,
                className: "text-cyan-400"
            }, void 0, false, {
                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                lineNumber: 519,
                columnNumber: 57
            }, this),
            info: "Kanat bekleri ve açıklar sürekli orta arar."
        },
        {
            label: 'Tek Forvet Kontra',
            key: 'loneStrikerCounter',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                size: 14,
                className: "text-yellow-400"
            }, void 0, false, {
                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                lineNumber: 520,
                columnNumber: 68
            }, this),
            info: "Savunmada kalıp sadece tek forvetle hızlı çıkışlar denenir."
        },
        {
            label: 'Ofsayt Tuzağı',
            key: 'offsideTrap',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                size: 14,
                className: "text-purple-400"
            }, void 0, false, {
                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                lineNumber: 521,
                columnNumber: 57
            }, this),
            info: "Savunma hattı birlikte ileri atarak rakip forvetleri ofsayta düşürür. Konsantrasyon ve zamanlama kritik. Hata = gol riski."
        }
    ];
    const posRoles = {
        GK: [
            {
                id: 'standard_gk',
                label: 'Geleneksel Kaleci',
                color: 'text-white',
                info: "Kalesini terk etmez, çizgi performansına odaklanır."
            },
            {
                id: 'sweeper_gk',
                label: 'Libero Kaleci (SK)',
                color: 'text-emerald-400',
                info: "Savunma arkasına sarkan topları süpürür, oyun kurmaya katılır."
            }
        ],
        DEF: [
            {
                id: 'bpd',
                label: 'Pasör Stoper (BPD)',
                color: 'text-blue-400',
                info: "Savunmadan oyun kurma becerisi %20 artar."
            },
            {
                id: 'wingback',
                label: 'Hücumcu Bek (WB)',
                color: 'text-yellow-400',
                info: "Kanat bindirmeleriyle ofansa destek verir."
            },
            {
                id: 'stopper',
                label: 'Kesici (Stopper)',
                color: 'text-red-400',
                info: "Rakip forveti fiziksel olarak sindirmeye çalışır."
            },
            {
                id: 'enforcer',
                label: 'Kasap (Enforcer)',
                color: 'text-red-600',
                info: "Sadece rakibi durdurmaya odaklanır, sertliği artırır."
            }
        ],
        MID: [
            {
                id: 'bwm',
                label: 'Savaşçı (BWM)',
                color: 'text-red-500',
                info: "Orta sahada dinamizm ve top kapma odaklı oynar."
            },
            {
                id: 'dlp',
                label: 'Oyun Kurucu (DLP)',
                color: 'text-blue-500',
                info: "Derinden oyunun yönünü tayin eder."
            },
            {
                id: 'btb',
                label: 'İki Yönlü (BTB)',
                color: 'text-emerald-500',
                info: "Hem savunma hem hücumda her yerde bulunur."
            },
            {
                id: 'mezzala',
                label: 'Mezzala',
                color: 'text-purple-400',
                info: "İç kanat boşluklarına sızarak skor katkısı arar."
            },
            {
                id: 'playmaker',
                label: 'Beyin (Playmaker)',
                color: 'text-blue-300',
                info: "Oyunun tüm kontrolünü üstlenir, pas isabetini artırır."
            }
        ],
        FWD: [
            {
                id: 'advanced_fwd',
                label: 'Fırsatçı (AF)',
                color: 'text-yellow-500',
                info: "Savunma hattını zorlar ve bitiriciliği odak noktasıdır."
            },
            {
                id: 'target_man',
                label: 'Hedef Santrafor (TM)',
                color: 'text-orange-500',
                info: "Hava toplarında hakimiyet kurar, top saklar."
            },
            {
                id: 'false_nine',
                label: 'Sahte Dokuz (F9)',
                color: 'text-blue-300',
                info: "Orta sahaya gelerek savunmayı üstüne çeker."
            },
            {
                id: 'inside_fwd',
                label: 'Ters Kanat (IF)',
                color: 'text-cyan-400',
                info: "Kanattan içeri katederek şut imkanı arar."
            },
            {
                id: 'sprinter',
                label: 'Sprinter',
                color: 'text-amber-400',
                info: "Kontra ataklarda normal hızının %115'ine çıkar."
            }
        ]
    };
    const getPitchPositions = (formation)=>{
        const gk = {
            x: 50,
            y: 88
        };
        const defs = formation === '3-5-2' || formation === '3-4-3' || formation === '3-1-4-2' || formation === '3-3-3-1' ? [
            {
                x: 25,
                y: 73
            },
            {
                x: 50,
                y: 76
            },
            {
                x: 75,
                y: 73
            }
        ] : formation === '5-4-1' || formation === '5-3-2' ? [
            {
                x: 15,
                y: 70
            },
            {
                x: 32,
                y: 73
            },
            {
                x: 50,
                y: 75
            },
            {
                x: 68,
                y: 73
            },
            {
                x: 85,
                y: 70
            }
        ] : [
            {
                x: 15,
                y: 70
            },
            {
                x: 38,
                y: 73
            },
            {
                x: 62,
                y: 73
            },
            {
                x: 85,
                y: 70
            }
        ];
        let mids = [];
        if (formation === '4-3-3') mids = [
            {
                x: 25,
                y: 45
            },
            {
                x: 50,
                y: 48
            },
            {
                x: 75,
                y: 45
            }
        ];
        else if (formation === '3-5-2') mids = [
            {
                x: 10,
                y: 45
            },
            {
                x: 30,
                y: 48
            },
            {
                x: 50,
                y: 50
            },
            {
                x: 70,
                y: 48
            },
            {
                x: 90,
                y: 45
            }
        ];
        else if (formation === '4-2-3-1') mids = [
            {
                x: 35,
                y: 55
            },
            {
                x: 65,
                y: 55
            },
            {
                x: 20,
                y: 35
            },
            {
                x: 50,
                y: 32
            },
            {
                x: 80,
                y: 35
            }
        ];
        else if (formation === '3-4-3') mids = [
            {
                x: 15,
                y: 50
            },
            {
                x: 38,
                y: 53
            },
            {
                x: 62,
                y: 53
            },
            {
                x: 85,
                y: 50
            }
        ];
        else if (formation === '4-1-4-1') mids = [
            {
                x: 50,
                y: 58
            },
            {
                x: 20,
                y: 40
            },
            {
                x: 40,
                y: 42
            },
            {
                x: 60,
                y: 42
            },
            {
                x: 80,
                y: 40
            }
        ];
        else if (formation === '4-3-2-1') mids = [
            {
                x: 25,
                y: 50
            },
            {
                x: 50,
                y: 52
            },
            {
                x: 75,
                y: 50
            },
            {
                x: 35,
                y: 32
            },
            {
                x: 65,
                y: 32
            }
        ];
        else if (formation === '5-3-2') mids = [
            {
                x: 25,
                y: 48
            },
            {
                x: 50,
                y: 50
            },
            {
                x: 75,
                y: 48
            }
        ];
        else if (formation === '4-3-1-2') mids = [
            {
                x: 25,
                y: 52
            },
            {
                x: 50,
                y: 55
            },
            {
                x: 75,
                y: 52
            },
            {
                x: 50,
                y: 35
            }
        ];
        else if (formation === '3-1-4-2') mids = [
            {
                x: 50,
                y: 60
            },
            {
                x: 15,
                y: 45
            },
            {
                x: 38,
                y: 48
            },
            {
                x: 62,
                y: 48
            },
            {
                x: 85,
                y: 45
            }
        ];
        else if (formation === '4-4-1-1') mids = [
            {
                x: 15,
                y: 45
            },
            {
                x: 38,
                y: 48
            },
            {
                x: 62,
                y: 48
            },
            {
                x: 85,
                y: 45
            },
            {
                x: 50,
                y: 32
            }
        ];
        else if (formation === '4-5-1') mids = [
            {
                x: 10,
                y: 45
            },
            {
                x: 30,
                y: 48
            },
            {
                x: 50,
                y: 50
            },
            {
                x: 70,
                y: 48
            },
            {
                x: 90,
                y: 45
            }
        ];
        else if (formation === '3-3-3-1') mids = [
            {
                x: 25,
                y: 55
            },
            {
                x: 50,
                y: 58
            },
            {
                x: 75,
                y: 55
            },
            {
                x: 25,
                y: 35
            },
            {
                x: 50,
                y: 38
            },
            {
                x: 75,
                y: 35
            }
        ];
        else mids = [
            {
                x: 15,
                y: 45
            },
            {
                x: 38,
                y: 48
            },
            {
                x: 62,
                y: 48
            },
            {
                x: 85,
                y: 45
            }
        ];
        let fwds = [];
        if (formation === '4-3-3') fwds = [
            {
                x: 20,
                y: 18
            },
            {
                x: 50,
                y: 13
            },
            {
                x: 80,
                y: 18
            }
        ];
        else if (formation === '3-5-2' || formation === '5-3-2' || formation === '4-3-1-2' || formation === '3-1-4-2') fwds = [
            {
                x: 35,
                y: 18
            },
            {
                x: 65,
                y: 18
            }
        ];
        else if (formation === '5-4-1' || formation === '4-1-4-1' || formation === '4-3-2-1' || formation === '4-4-1-1' || formation === '4-5-1' || formation === '3-3-3-1') fwds = [
            {
                x: 50,
                y: 18
            }
        ];
        else if (formation === '4-2-3-1') fwds = [
            {
                x: 50,
                y: 15
            }
        ];
        else if (formation === '3-4-3') fwds = [
            {
                x: 20,
                y: 22
            },
            {
                x: 50,
                y: 18
            },
            {
                x: 80,
                y: 22
            }
        ];
        else fwds = [
            {
                x: 35,
                y: 18
            },
            {
                x: 65,
                y: 18
            }
        ];
        return [
            gk,
            ...defs,
            ...mids,
            ...fwds
        ];
    };
    const handlePitchDrop = (targetIdx)=>(e)=>{
            e.preventDefault();
            const playerInId = e.dataTransfer.getData("playerId");
            const sourceIdx = e.dataTransfer.getData("sourceIdx");
            let newSquad = [
                ...squad
            ];
            if (sourceIdx !== '' && parseInt(sourceIdx) !== targetIdx) {
                const temp = newSquad[targetIdx];
                newSquad[targetIdx] = newSquad[parseInt(sourceIdx)];
                newSquad[parseInt(sourceIdx)] = temp;
            } else if (sourceIdx === '') {
                const inPIdx = squad.findIndex((p)=>p.id === playerInId);
                if (inPIdx !== -1) {
                    const inP = newSquad[inPIdx];
                    const outP = newSquad[targetIdx];
                    newSquad[targetIdx] = inP;
                    newSquad[inPIdx] = outP;
                }
            }
            // Mark starters
            newSquad = newSquad.map((p, idx)=>({
                    ...p,
                    is_starter: idx < 11
                }));
            onSquadUpdate(newSquad);
            setDragOverIdx(null);
        };
    // ── Touch/Mobile: Tap-to-swap logic ──
    const handleTapPlayer = (type, idx)=>{
        if (!selectedForSwap) {
            // First tap: select this player
            const player = type === 'pitch' ? squad[idx] : squad[idx];
            if (player) {
                setSelectedForSwap({
                    type,
                    idx,
                    playerId: player.id
                });
            }
            return;
        }
        // Second tap: swap with the selected player
        if (selectedForSwap.type === type && selectedForSwap.idx === idx) {
            // Tapped same player — deselect
            setSelectedForSwap(null);
            return;
        }
        let newSquad = [
            ...squad
        ];
        const srcIdx = selectedForSwap.idx;
        const tgtIdx = idx;
        if (selectedForSwap.type === 'bench' && type === 'pitch') {
            // Bench → Pitch: swap bench player into pitch position
            const benchPlayer = newSquad[srcIdx];
            const pitchPlayer = newSquad[tgtIdx];
            newSquad[tgtIdx] = benchPlayer;
            newSquad[srcIdx] = pitchPlayer;
        } else if (selectedForSwap.type === 'pitch' && type === 'bench') {
            // Pitch → Bench: swap pitch player into bench position
            const pitchPlayer = newSquad[srcIdx];
            const benchPlayer = newSquad[tgtIdx];
            newSquad[srcIdx] = benchPlayer;
            newSquad[tgtIdx] = pitchPlayer;
        } else if (selectedForSwap.type === 'pitch' && type === 'pitch') {
            // Pitch → Pitch: swap two pitch players
            const temp = newSquad[srcIdx];
            newSquad[srcIdx] = newSquad[tgtIdx];
            newSquad[tgtIdx] = temp;
        } else {
            // Bench → Bench: swap two bench players
            const temp = newSquad[srcIdx];
            newSquad[srcIdx] = newSquad[tgtIdx];
            newSquad[tgtIdx] = temp;
        }
        // Mark starters
        newSquad = newSquad.map((p, i)=>({
                ...p,
                is_starter: i < 11
            }));
        onSquadUpdate(newSquad);
        setSelectedForSwap(null);
    };
    const pitchPos = getPitchPositions(activeTactic.formation || '4-4-2');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between gap-4 px-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex bg-black/40 border border-white/8 rounded-xl p-1 gap-1",
                        children: [
                            {
                                id: 'squad',
                                label: 'Kadro & Taktik',
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                    size: 13
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                    lineNumber: 674,
                                    columnNumber: 59
                                }, this)
                            },
                            {
                                id: 'roles',
                                label: 'Roller & Talimatlar',
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                    size: 13
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                    lineNumber: 675,
                                    columnNumber: 64
                                }, this)
                            }
                        ].map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setActiveView(tab.id),
                                className: `flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${activeView === tab.id ? 'bg-white text-black shadow-sm' : 'text-white/40 hover:text-white/70'}`,
                                children: [
                                    tab.icon,
                                    tab.label
                                ]
                            }, tab.id, true, {
                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                lineNumber: 677,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                        lineNumber: 672,
                        columnNumber: 9
                    }, this),
                    tacticalScore && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/8 rounded-xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-[10px] font-black uppercase tracking-widest text-white/30",
                                children: "Taktik Skoru"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                lineNumber: 695,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `text-lg font-black italic tabular-nums ${tacticalScore.overall >= 75 ? 'text-emerald-400' : tacticalScore.overall >= 55 ? 'text-amber-400' : 'text-red-400'}`,
                                children: tacticalScore.overall
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                lineNumber: 696,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "hidden sm:flex flex-col gap-0.5",
                                children: [
                                    {
                                        label: 'Rol',
                                        v: tacticalScore.roleCompatibility
                                    },
                                    {
                                        label: 'Talim',
                                        v: tacticalScore.instructionSynergy
                                    },
                                    {
                                        label: 'Attr',
                                        v: tacticalScore.attributeFit
                                    }
                                ].map(({ label, v })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[8px] text-white/25 w-7",
                                                children: label
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 709,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-1 w-16 bg-white/5 rounded-full overflow-hidden",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-full bg-white/40 rounded-full",
                                                    style: {
                                                        width: `${v}%`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                    lineNumber: 711,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 710,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[8px] text-white/40 tabular-nums w-5",
                                                children: v
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 713,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, label, true, {
                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                        lineNumber: 708,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                lineNumber: 702,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                        lineNumber: 694,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                lineNumber: 671,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                mode: "wait",
                children: [
                    activeView === 'roles' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0,
                            y: 8
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        exit: {
                            opacity: 0,
                            y: -8
                        },
                        transition: {
                            duration: 0.2
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fm$2f$TacticsRolesPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            squad: squad.slice(0, 11),
                            currentFormation: activeTactic.formation || '4-4-2',
                            onFormationChange: (f)=>onActiveTacticChange({
                                    ...activeTactic,
                                    formation: f
                                }),
                            playerRoles: playerRoles,
                            onRoleChange: handleRoleChange,
                            activeInstructions: activeInstructions,
                            onToggleInstruction: handleInstructionToggle
                        }, void 0, false, {
                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                            lineNumber: 731,
                            columnNumber: 13
                        }, this)
                    }, "roles", false, {
                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                        lineNumber: 724,
                        columnNumber: 11
                    }, this),
                    activeView === 'squad' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0,
                            y: 8
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        exit: {
                            opacity: 0,
                            y: -8
                        },
                        transition: {
                            duration: 0.2
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "md:col-span-4 lg:col-span-4 xl:col-span-4 p-4 md:p-6 bg-zinc-900/80 backdrop-blur-xl border border-white/5 rounded-3xl space-y-6 md:space-y-8 h-full",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "border-b border-white/5 pb-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-xl font-black italic text-white uppercase tracking-tighter flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$swords$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Swords$3e$__["Swords"], {
                                                                className: "text-emerald-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 758,
                                                                columnNumber: 17
                                                            }, this),
                                                            " Taktik Lab"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 757,
                                                        columnNumber: 15
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]",
                                                        children: "Operasyonel Parametreler"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 760,
                                                        columnNumber: 15
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 756,
                                                columnNumber: 12
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-6",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-2 gap-4",
                                                        children: [
                                                            {
                                                                label: 'Diziliş',
                                                                val: activeTactic.formation || '4-4-2',
                                                                key: 'formation',
                                                                options: [
                                                                    '4-4-2',
                                                                    '4-3-3',
                                                                    '3-5-2',
                                                                    '5-4-1',
                                                                    '4-2-3-1',
                                                                    '3-4-3',
                                                                    '4-1-4-1',
                                                                    '4-3-2-1',
                                                                    '5-3-2',
                                                                    '4-3-1-2',
                                                                    '3-1-4-2',
                                                                    '4-4-1-1',
                                                                    '4-5-1',
                                                                    '3-3-3-1'
                                                                ]
                                                            },
                                                            {
                                                                label: 'Tarz',
                                                                val: activeTactic.playStyle,
                                                                key: 'playStyle',
                                                                options: [
                                                                    'dengeli',
                                                                    'hucum',
                                                                    'savunma',
                                                                    'kontra',
                                                                    'tikitaka',
                                                                    'Gegenpressing',
                                                                    'Catenaccio',
                                                                    'Direct Play',
                                                                    'Wing Play',
                                                                    'Total Football',
                                                                    'Route One',
                                                                    'Possession Football',
                                                                    'High Press',
                                                                    'Parking the Bus'
                                                                ]
                                                            }
                                                        ].map((ctrl)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "space-y-1.5",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "text-[8px] font-black text-white/30 uppercase tracking-[0.2em] block",
                                                                        children: ctrl.label
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                        lineNumber: 770,
                                                                        columnNumber: 21
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                        value: ctrl.val,
                                                                        onChange: (e)=>onActiveTacticChange({
                                                                                ...activeTactic,
                                                                                [ctrl.key]: e.target.value
                                                                            }),
                                                                        className: "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-white outline-none focus:border-emerald-500/50 transition-colors",
                                                                        children: ctrl.options.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: opt,
                                                                                children: opt.toUpperCase()
                                                                            }, opt, false, {
                                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                lineNumber: 776,
                                                                                columnNumber: 48
                                                                            }, this))
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                        lineNumber: 771,
                                                                        columnNumber: 21
                                                                    }, this)
                                                                ]
                                                            }, ctrl.key, true, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 769,
                                                                columnNumber: 19
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 764,
                                                        columnNumber: 14
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-5",
                                                        children: tacticalParams.map((param)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "space-y-3",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center justify-between",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                className: "text-[9px] font-black text-white/40 uppercase tracking-widest",
                                                                                children: param.label
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                lineNumber: 786,
                                                                                columnNumber: 23
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-[10px] font-mono text-emerald-400 font-bold",
                                                                                children: [
                                                                                    activeTactic[param.key],
                                                                                    "%"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                lineNumber: 787,
                                                                                columnNumber: 23
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                        lineNumber: 785,
                                                                        columnNumber: 21
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "range",
                                                                        min: param.min,
                                                                        max: param.max,
                                                                        value: activeTactic[param.key],
                                                                        onChange: (e)=>onActiveTacticChange({
                                                                                ...activeTactic,
                                                                                [param.key]: parseInt(e.target.value)
                                                                            }),
                                                                        className: "w-full h-1 bg-white/10 rounded-full appearance-none accent-emerald-500"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                        lineNumber: 789,
                                                                        columnNumber: 21
                                                                    }, this)
                                                                ]
                                                            }, param.key, true, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 784,
                                                                columnNumber: 19
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 782,
                                                        columnNumber: 14
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-2 gap-2 pt-4",
                                                        children: toggles.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>{
                                                                    const nextValue = !activeTactic[t.key];
                                                                    const newTactic = {
                                                                        ...activeTactic,
                                                                        [t.key]: nextValue
                                                                    };
                                                                    // Mutual exclusivity logic
                                                                    if (nextValue) {
                                                                        if (t.key === 'pressing') {
                                                                            newTactic.parkTheBus = false;
                                                                            newTactic.wasteTime = false;
                                                                        } else if (t.key === 'parkTheBus') {
                                                                            newTactic.pressing = false;
                                                                            newTactic.offsideTrap = false;
                                                                        } else if (t.key === 'wasteTime') {
                                                                            newTactic.pressing = false;
                                                                        } else if (t.key === 'offsideTrap') {
                                                                            newTactic.parkTheBus = false;
                                                                        }
                                                                    }
                                                                    onActiveTacticChange(newTactic);
                                                                },
                                                                className: `flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all ${activeTactic[t.key] ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-black/20 border-white/5 text-white/30'}`,
                                                                children: [
                                                                    t.icon,
                                                                    " ",
                                                                    t.label
                                                                ]
                                                            }, t.key, true, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 801,
                                                                columnNumber: 19
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 799,
                                                        columnNumber: 14
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 763,
                                                columnNumber: 12
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                        lineNumber: 755,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "md:col-span-8 lg:col-span-5 xl:col-span-5 relative aspect-[2/3] xl:aspect-auto bg-[#1a472a] border-4 border-white/20 rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[400px] md:min-h-[600px]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-0 opacity-20",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-full w-full bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1),rgba(0,0,0,0.1)_40px,transparent_40px,transparent_80px)]"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                    lineNumber: 837,
                                                    columnNumber: 57
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 837,
                                                columnNumber: 12
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-4 border-2 border-white/20 rounded-xl"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 838,
                                                columnNumber: 12
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-x-4 top-1/2 h-0.5 bg-white/20"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 839,
                                                columnNumber: 12
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/20 rounded-full"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 840,
                                                columnNumber: 12
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-x-1/4 top-4 h-32 border-2 border-white/20"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 841,
                                                columnNumber: 12
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-x-1/4 bottom-4 h-32 border-2 border-white/20"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 842,
                                                columnNumber: 12
                                            }, this),
                                            players.map((player, idx)=>{
                                                const pos = pitchPos[idx] || {
                                                    x: 50,
                                                    y: 50
                                                };
                                                const isSelected = selectedForSwap?.type === 'pitch' && selectedForSwap?.idx === idx;
                                                const iconProps = {
                                                    player,
                                                    condition: playerConditions[player.id] || 100,
                                                    pos,
                                                    onDragOver: (e)=>{
                                                        e.preventDefault();
                                                        setDragOverIdx(idx);
                                                    },
                                                    onDragLeave: ()=>{
                                                        setDragOverIdx(null);
                                                    },
                                                    onDragStart: (e)=>{
                                                        e.dataTransfer.setData('playerId', player.id);
                                                        e.dataTransfer.setData('sourceIdx', String(idx));
                                                    },
                                                    onDrop: handlePitchDrop(idx),
                                                    onClick: ()=>{
                                                        if (justDraggedRef.current) return;
                                                        if (selectedForSwap) {
                                                            handleTapPlayer('pitch', idx);
                                                        } else {
                                                            onPlayerClick?.(player);
                                                        }
                                                    },
                                                    onTouchStart: touchDragStart(player.id, idx, 'pitch'),
                                                    pitchIdx: idx,
                                                    isDragOver: dragOverIdx === idx,
                                                    isSelected,
                                                    teamPrimaryColor: teamPrimaryColor || '',
                                                    teamSecondaryColor: teamSecondaryColor || ''
                                                };
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PlayerIcon, {
                                                    ...iconProps
                                                }, player.id, false, {
                                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                    lineNumber: 873,
                                                    columnNumber: 22
                                                }, this);
                                            })
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                        lineNumber: 836,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "md:col-span-12 lg:col-span-3 xl:col-span-3 p-4 md:p-6 bg-zinc-900/60 border border-white/5 rounded-3xl flex flex-col h-full max-h-[700px]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                className: "text-[10px] text-white/30 uppercase font-black tracking-[0.4em] mb-6 flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                        size: 14
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 880,
                                                        columnNumber: 16
                                                    }, this),
                                                    " KADRO LİSTESİ"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 879,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar",
                                                children: [
                                                    selectedForSwap && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[9px] font-bold text-amber-400 text-center uppercase tracking-wider mb-2",
                                                        children: "Takas için hedef oyuncuya dokun • İptal: aynı oyuncuya tekrar dokun"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 885,
                                                        columnNumber: 19
                                                    }, this),
                                                    bench.sort((a, b)=>{
                                                        const oA = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$playerGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["POS_ORDER"][a.specificPosition || a.position] ?? 99;
                                                        const oB = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$playerGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["POS_ORDER"][b.specificPosition || b.position] ?? 99;
                                                        return oA !== oB ? oA - oB : b.rating - a.rating;
                                                    }).map((player, benchIdx)=>{
                                                        const actualIdx = squad.findIndex((p)=>p.id === player.id);
                                                        const isBenchSelected = selectedForSwap?.type === 'bench' && selectedForSwap?.playerId === player.id;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            draggable: true,
                                                            onDragStart: (e)=>{
                                                                e.dataTransfer.setData("playerId", player.id);
                                                                e.dataTransfer.setData("sourceIdx", '');
                                                            },
                                                            onTouchStart: touchDragStart(player.id, actualIdx, 'bench'),
                                                            onClick: ()=>{
                                                                if (justDraggedRef.current) return;
                                                                if (selectedForSwap) {
                                                                    handleTapPlayer('bench', actualIdx);
                                                                } else {
                                                                    onPlayerClick?.(player);
                                                                }
                                                            },
                                                            "data-bench-idx": actualIdx,
                                                            style: {
                                                                touchAction: 'none'
                                                            },
                                                            className: `p-3 rounded-xl flex items-center justify-between cursor-grab active:cursor-grabbing hover:border-white/20 transition-all group ${isBenchSelected ? 'bg-amber-500/15 border-2 border-amber-500/50' : 'bg-black/40 border border-white/5'}`,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-center gap-3",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-[8px] font-black p-1 bg-white/5 rounded text-white/30",
                                                                            children: player.specificPosition || player.position
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                            lineNumber: 922,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-[10px] font-bold text-white uppercase truncate max-w-[100px]",
                                                                            children: player.name
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                            lineNumber: 923,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                    lineNumber: 921,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[10px] font-black text-emerald-400",
                                                                    children: player.rating
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                    lineNumber: 925,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, player.id, true, {
                                                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                            lineNumber: 897,
                                                            columnNumber: 19
                                                        }, this);
                                                    })
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 882,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                        lineNumber: 878,
                                        columnNumber: 9
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                lineNumber: 752,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-6 bg-zinc-900/30 border border-white/5 rounded-3xl",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4",
                                        children: "OYUNCU ROLLERİ"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                        lineNumber: 935,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3",
                                        children: players.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-3 bg-black/40 rounded-xl border border-white/5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between mb-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[9px] font-bold text-white truncate max-w-[80px]",
                                                                children: p.name.split(' ').pop()
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 940,
                                                                columnNumber: 17
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[8px] font-black text-white/20",
                                                                children: p.position
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 941,
                                                                columnNumber: 17
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 939,
                                                        columnNumber: 15
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        value: p.special_role || '',
                                                        onChange: (e)=>{
                                                            const newSquad = squad.map((sp)=>sp.id === p.id ? {
                                                                    ...sp,
                                                                    special_role: e.target.value || null
                                                                } : sp);
                                                            onSquadUpdate(newSquad);
                                                        },
                                                        className: `w-full bg-zinc-800/50 border border-white/10 rounded-lg px-2 py-1.5 text-[9px] font-black uppercase outline-none focus:border-emerald-500/50 transition-colors`,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "",
                                                                children: "VARZAYILAN"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 951,
                                                                columnNumber: 17
                                                            }, this),
                                                            (()=>{
                                                                const posKey = p.position === 'GK' ? 'GK' : p.position.startsWith('D') ? 'DEF' : p.position.startsWith('M') ? 'MID' : 'FWD';
                                                                return posRoles[posKey]?.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: r.id,
                                                                        children: r.label
                                                                    }, r.id, false, {
                                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                        lineNumber: 954,
                                                                        columnNumber: 54
                                                                    }, this));
                                                            })()
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 943,
                                                        columnNumber: 15
                                                    }, this)
                                                ]
                                            }, p.id, true, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 938,
                                                columnNumber: 13
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                        lineNumber: 936,
                                        columnNumber: 9
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                lineNumber: 934,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-6 bg-zinc-900/30 border border-emerald-500/10 rounded-3xl",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 mb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRightLeft$3e$__["ArrowRightLeft"], {
                                                    size: 14,
                                                    className: "text-emerald-400"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                    lineNumber: 966,
                                                    columnNumber: 13
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 965,
                                                columnNumber: 11
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-[10px] uppercase font-bold tracking-widest text-white/30",
                                                children: "TRANSFER TEKLİFLERİ"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 968,
                                                columnNumber: 11
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                        lineNumber: 964,
                                        columnNumber: 9
                                    }, this),
                                    !transferOffers || transferOffers.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 py-3 text-white/20 text-xs",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                size: 14,
                                                className: "opacity-50"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 972,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Gelen transfer teklifi bulunmuyor."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 973,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                        lineNumber: 971,
                                        columnNumber: 11
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2 max-h-48 overflow-y-auto",
                                        children: transferOffers.map((offer)=>{
                                            const statusConfig = {
                                                pending: {
                                                    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                                                    label: 'Beklemede',
                                                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                        size: 10
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 979,
                                                        columnNumber: 115
                                                    }, this)
                                                },
                                                accepted: {
                                                    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                                                    label: 'Kabul',
                                                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                        size: 10
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 980,
                                                        columnNumber: 118
                                                    }, this)
                                                },
                                                rejected: {
                                                    color: 'text-red-400 bg-red-500/10 border-red-500/20',
                                                    label: 'Red',
                                                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                                        size: 10
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 981,
                                                        columnNumber: 104
                                                    }, this)
                                                }
                                            };
                                            const sc = statusConfig[offer.status] || statusConfig.pending;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between gap-3 p-2.5 bg-black/30 border border-white/5 rounded-xl hover:border-emerald-500/20 transition-all",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2.5 min-w-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center shrink-0",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                                                    size: 12,
                                                                    className: offer.status === 'pending' ? 'text-amber-400' : 'text-white/20'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                    lineNumber: 988,
                                                                    columnNumber: 23
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 987,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "min-w-0",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-[9px] font-bold text-white/80 truncate",
                                                                        children: [
                                                                            offer.fromTeam,
                                                                            " → ",
                                                                            toTitleCase(offer.playerName)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                        lineNumber: 991,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-[7px] text-white/25 font-bold uppercase tracking-widest",
                                                                        children: [
                                                                            offer.playerPosition,
                                                                            " • ",
                                                                            offer.date
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                        lineNumber: 992,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 990,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 986,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2.5 shrink-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[10px] font-black text-emerald-400",
                                                                children: [
                                                                    (offer.amount / 1000000).toFixed(1),
                                                                    "M €"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 996,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `inline-flex items-center gap-1 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider border rounded-full ${sc.color}`,
                                                                children: [
                                                                    sc.icon,
                                                                    " ",
                                                                    sc.label
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 997,
                                                                columnNumber: 21
                                                            }, this),
                                                            offer.status === 'pending' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex gap-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>onAcceptOffer?.(offer.id),
                                                                        className: "px-2 py-0.5 text-[7px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500/30 transition-colors",
                                                                        children: "Kabul"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                        lineNumber: 1002,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>onRejectOffer?.(offer.id),
                                                                        className: "px-2 py-0.5 text-[7px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors",
                                                                        children: "Reddet"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                        lineNumber: 1005,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 1001,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 995,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, offer.id, true, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 985,
                                                columnNumber: 17
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                        lineNumber: 976,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                lineNumber: 963,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-6 bg-zinc-900/30 border border-emerald-500/10 rounded-3xl",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 mb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                                                    size: 14,
                                                    className: "text-emerald-400"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                    lineNumber: 1022,
                                                    columnNumber: 13
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 1021,
                                                columnNumber: 11
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-[10px] uppercase font-bold tracking-widest text-white/30",
                                                children: "TAKIM SIRALAMASI"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 1024,
                                                columnNumber: 11
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 1025,
                                                columnNumber: 11
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-3 text-[7px] font-black uppercase tracking-widest",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "w-3 h-3 rounded-sm bg-[#7AB4E8]/10 border-2 border-[#7AB4E8]"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 1027,
                                                                columnNumber: 55
                                                            }, this),
                                                            " Kaleci"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 1027,
                                                        columnNumber: 13
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "w-3 h-3 rounded-sm bg-[#7EDBC8]/10 border-2 border-[#7EDBC8]"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 1028,
                                                                columnNumber: 55
                                                            }, this),
                                                            " Defans"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 1028,
                                                        columnNumber: 13
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "w-3 h-3 rounded-sm bg-[#F0C87A]/10 border-2 border-[#F0C87A]"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 1029,
                                                                columnNumber: 55
                                                            }, this),
                                                            " Orta Saha"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 1029,
                                                        columnNumber: 13
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "w-3 h-3 rounded-sm bg-[#E87878]/10 border-2 border-[#E87878]"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 1030,
                                                                columnNumber: 55
                                                            }, this),
                                                            " Forvet"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 1030,
                                                        columnNumber: 13
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 1026,
                                                columnNumber: 11
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                        lineNumber: 1020,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "overflow-x-auto",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid gap-px min-w-[950px] text-[8px] font-black uppercase tracking-wider text-white/30 px-3 py-2.5 bg-black/30 rounded-t-xl border border-white/5 border-b-0",
                                                style: {
                                                    gridTemplateColumns: '56px 1fr repeat(12, 52px)'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        onClick: ()=>toggleSort('Poz'),
                                                        className: `text-center cursor-pointer hover:text-emerald-400 transition-colors flex items-center justify-center gap-0.5 ${sortBy === 'Poz' ? 'text-emerald-400' : ''}`,
                                                        children: [
                                                            "Poz ",
                                                            sortBy === 'Poz' && (sortDirection === 'desc' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                size: 10
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 1037,
                                                                columnNumber: 68
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                                                                size: 10
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 1037,
                                                                columnNumber: 96
                                                            }, this))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 1036,
                                                        columnNumber: 13
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        onClick: ()=>toggleSort('Oyuncu'),
                                                        className: `text-left cursor-pointer hover:text-emerald-400 transition-colors flex items-center gap-0.5 ${sortBy === 'Oyuncu' ? 'text-emerald-400' : ''}`,
                                                        children: [
                                                            "Oyuncu ",
                                                            sortBy === 'Oyuncu' && (sortDirection === 'desc' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                size: 10
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 1040,
                                                                columnNumber: 74
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                                                                size: 10
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 1040,
                                                                columnNumber: 102
                                                            }, this))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 1039,
                                                        columnNumber: 13
                                                    }, this),
                                                    [
                                                        'Klt',
                                                        'Klc',
                                                        'Tk',
                                                        'Pas',
                                                        'Şut',
                                                        'Kfa',
                                                        'Hız',
                                                        'Güç',
                                                        'Alg',
                                                        'Top',
                                                        'Tplm',
                                                        'Knd'
                                                    ].map((col)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            onClick: ()=>toggleSort(col),
                                                            className: `text-center cursor-pointer hover:text-emerald-400 transition-colors flex items-center justify-center gap-0.5 ${sortBy === col ? 'text-emerald-400' : ''}`,
                                                            children: [
                                                                col,
                                                                " ",
                                                                sortBy === col && (sortDirection === 'desc' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                    size: 10
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                    lineNumber: 1048,
                                                                    columnNumber: 70
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                                                                    size: 10
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                    lineNumber: 1048,
                                                                    columnNumber: 98
                                                                }, this))
                                                            ]
                                                        }, col, true, {
                                                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                            lineNumber: 1043,
                                                            columnNumber: 15
                                                        }, this))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 1035,
                                                columnNumber: 11
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "max-h-[400px] overflow-y-auto",
                                                children: sortedSquad.map((player)=>{
                                                    const rating = player.rating || 50;
                                                    const posColor = getPositionColor(player.specificPosition || player.position);
                                                    const statKeys = [
                                                        'Klt',
                                                        'Klc',
                                                        'Tk',
                                                        'Pas',
                                                        'Şut',
                                                        'Kfa',
                                                        'Hız',
                                                        'Güç',
                                                        'Alg',
                                                        'Top',
                                                        'Tplm',
                                                        'Knd'
                                                    ];
                                                    const isHovered = hoveredPlayerId === player.id;
                                                    // Tooltip data
                                                    const archetypeName = player.archetype || player.playStyle || null;
                                                    const formVal = player.form ?? player.form_rating ?? null;
                                                    const condVal = player.cond ?? null;
                                                    const moraleVal = player.morale ?? null;
                                                    const formRating = player.form_rating ?? null;
                                                    // Generate Son 5 maç indicators from form_rating as proxy
                                                    const getLast5Indicators = (fr)=>{
                                                        if (fr === null) return Array.from({
                                                            length: 5
                                                        }, ()=>({
                                                                letter: '-',
                                                                color: 'text-white/20'
                                                            }));
                                                        // Use form_rating to derive a simple pattern
                                                        const results = [];
                                                        const seed = Math.floor(fr);
                                                        const patterns = [
                                                            // Higher form_rating = more wins
                                                            fr >= 80 ? [
                                                                'W',
                                                                'W',
                                                                'W',
                                                                'D',
                                                                'W'
                                                            ] : fr >= 65 ? [
                                                                'W',
                                                                'D',
                                                                'W',
                                                                'D',
                                                                'L'
                                                            ] : fr >= 50 ? [
                                                                'D',
                                                                'L',
                                                                'D',
                                                                'W',
                                                                'L'
                                                            ] : fr >= 35 ? [
                                                                'L',
                                                                'D',
                                                                'L',
                                                                'D',
                                                                'L'
                                                            ] : [
                                                                'L',
                                                                'L',
                                                                'L',
                                                                'D',
                                                                'L'
                                                            ]
                                                        ][0];
                                                        const colorMap = {
                                                            W: 'text-emerald-400',
                                                            D: 'text-amber-400',
                                                            L: 'text-red-400'
                                                        };
                                                        // Vary slightly based on seed for visual interest
                                                        for(let i = 0; i < 5; i++){
                                                            const idx = (seed + i) % patterns.length;
                                                            const letter = patterns[idx];
                                                            results.push({
                                                                letter,
                                                                color: colorMap[letter] || 'text-white/20'
                                                            });
                                                        }
                                                        return results;
                                                    };
                                                    const last5 = getLast5Indicators(formRating);
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "relative",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: `absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none transition-all duration-200 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`,
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl px-4 py-3 min-w-[220px]",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "absolute top-full left-1/2 -translate-x-1/2 -mt-px",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "w-3 h-3 bg-zinc-900/95 border-r border-b border-white/10 rotate-45 -mt-[7px]"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                lineNumber: 1108,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                            lineNumber: 1107,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        archetypeName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipProvider"], {
                                                                            delayDuration: 200,
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipTrigger"], {
                                                                                        asChild: true,
                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "flex items-center gap-2 mb-2 pb-2 border-b border-white/5 cursor-help",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                    className: "w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-black",
                                                                                                    style: {
                                                                                                        background: `linear-gradient(135deg, ${POS_GROUP_COLORS[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPosGroup"])(player.specificPosition || player.position)] || '#9B9B9B'}40 0%, ${POS_GROUP_COLORS[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPosGroup"])(player.specificPosition || player.position)] || '#9B9B9B'}20 100%)`,
                                                                                                        color: POS_GROUP_COLORS[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fm$2f$ui$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPosGroup"])(player.specificPosition || player.position)] || '#9B9B9B'
                                                                                                    },
                                                                                                    children: player.specificPosition?.charAt(0) || player.position.charAt(0)
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                                    lineNumber: 1117,
                                                                                                    columnNumber: 33
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                    children: [
                                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                            className: "text-[9px] font-black text-white/90",
                                                                                                            children: archetypeName
                                                                                                        }, void 0, false, {
                                                                                                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                                            lineNumber: 1125,
                                                                                                            columnNumber: 35
                                                                                                        }, this),
                                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                            className: "text-[7px] text-white/30 font-medium",
                                                                                                            children: "Arketip"
                                                                                                        }, void 0, false, {
                                                                                                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                                            lineNumber: 1126,
                                                                                                            columnNumber: 35
                                                                                                        }, this)
                                                                                                    ]
                                                                                                }, void 0, true, {
                                                                                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                                    lineNumber: 1124,
                                                                                                    columnNumber: 33
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                            lineNumber: 1116,
                                                                                            columnNumber: 31
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                        lineNumber: 1115,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipContent"], {
                                                                                        side: "top",
                                                                                        className: "bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl max-w-[220px]",
                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "px-1 py-0.5",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                    className: "text-[10px] font-black text-white/90 mb-1",
                                                                                                    children: archetypeName
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                                    lineNumber: 1132,
                                                                                                    columnNumber: 33
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                    className: "text-[9px] text-white/60 leading-relaxed mb-1.5",
                                                                                                    children: ARCHETYPE_INFO[archetypeName]?.desc || 'Bu arketip hakkında bilgi bulunmuyor.'
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                                    lineNumber: 1133,
                                                                                                    columnNumber: 33
                                                                                                }, this),
                                                                                                ARCHETYPE_INFO[archetypeName]?.boosts && ARCHETYPE_INFO[archetypeName].boosts.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                    className: "flex flex-wrap gap-1",
                                                                                                    children: ARCHETYPE_INFO[archetypeName].boosts.map((b)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                            className: "px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[7px] font-bold text-amber-400",
                                                                                                            children: [
                                                                                                                "+",
                                                                                                                b
                                                                                                            ]
                                                                                                        }, b, true, {
                                                                                                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                                            lineNumber: 1139,
                                                                                                            columnNumber: 39
                                                                                                        }, this))
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                                    lineNumber: 1137,
                                                                                                    columnNumber: 35
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                            lineNumber: 1131,
                                                                                            columnNumber: 31
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                        lineNumber: 1130,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                lineNumber: 1114,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                            lineNumber: 1113,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "grid grid-cols-3 gap-3 mb-2",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "text-center",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: `text-[11px] font-black ${formVal !== null ? formVal >= 75 ? 'text-emerald-400' : formVal >= 50 ? 'text-amber-400' : 'text-red-400' : 'text-white/20'}`,
                                                                                            children: formVal !== null ? formVal : '-'
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                            lineNumber: 1154,
                                                                                            columnNumber: 27
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "text-[7px] text-white/25 font-bold uppercase tracking-wider",
                                                                                            children: "Form"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                            lineNumber: 1159,
                                                                                            columnNumber: 27
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                    lineNumber: 1153,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "text-center",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: `text-[11px] font-black ${condVal !== null ? condVal >= 75 ? 'text-emerald-400' : condVal >= 50 ? 'text-amber-400' : 'text-red-400' : 'text-white/20'}`,
                                                                                            children: condVal !== null ? condVal : '-'
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                            lineNumber: 1162,
                                                                                            columnNumber: 27
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "text-[7px] text-white/25 font-bold uppercase tracking-wider",
                                                                                            children: "Kondisyon"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                            lineNumber: 1167,
                                                                                            columnNumber: 27
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                    lineNumber: 1161,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "text-center",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: `text-[11px] font-black ${moraleVal !== null ? moraleVal >= 75 ? 'text-emerald-400' : moraleVal >= 50 ? 'text-amber-400' : 'text-red-400' : 'text-white/20'}`,
                                                                                            children: moraleVal !== null ? moraleVal : '-'
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                            lineNumber: 1170,
                                                                                            columnNumber: 27
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "text-[7px] text-white/25 font-bold uppercase tracking-wider",
                                                                                            children: "Moral"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                            lineNumber: 1175,
                                                                                            columnNumber: 27
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                    lineNumber: 1169,
                                                                                    columnNumber: 25
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                            lineNumber: 1152,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "pt-2 border-t border-white/5",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-center justify-between",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "text-[7px] text-white/25 font-bold uppercase tracking-wider",
                                                                                        children: "Son 5 Maç"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                        lineNumber: 1182,
                                                                                        columnNumber: 27
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex gap-1",
                                                                                        children: last5.map((ind, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: `w-5 h-5 rounded text-[8px] font-black flex items-center justify-center ${ind.letter === 'W' ? 'bg-emerald-500/15 text-emerald-400' : ind.letter === 'D' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`,
                                                                                                children: ind.letter
                                                                                            }, i, false, {
                                                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                                lineNumber: 1185,
                                                                                                columnNumber: 31
                                                                                            }, this))
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                        lineNumber: 1183,
                                                                                        columnNumber: 27
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                lineNumber: 1181,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                            lineNumber: 1180,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                    lineNumber: 1105,
                                                                    columnNumber: 21
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 1102,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                onClick: ()=>onPlayerClick?.(player),
                                                                onMouseEnter: ()=>setHoveredPlayerId(player.id),
                                                                onMouseLeave: ()=>setHoveredPlayerId(null),
                                                                className: `grid gap-px min-w-[950px] px-3 py-2 border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-all ${posColor}`,
                                                                style: {
                                                                    gridTemplateColumns: '56px 1fr repeat(12, 52px)'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: `text-center text-[9px] font-black flex items-center justify-center gap-0.5 ${player.position === 'GK' ? 'text-green-300' : [
                                                                            'CB',
                                                                            'LB',
                                                                            'RB',
                                                                            'LWB',
                                                                            'RWB'
                                                                        ].includes(player.specificPosition || player.position) ? 'text-blue-300' : [
                                                                            'CDM',
                                                                            'CM',
                                                                            'CAM',
                                                                            'LM',
                                                                            'RM'
                                                                        ].includes(player.specificPosition || player.position) ? 'text-amber-300' : 'text-red-300'}`,
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                children: player.specificPosition || player.position
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                lineNumber: 1213,
                                                                                columnNumber: 23
                                                                            }, this),
                                                                            player.secondaryPositions && player.secondaryPositions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-[6px] text-white/25 font-normal",
                                                                                children: [
                                                                                    "/",
                                                                                    player.secondaryPositions.join('/')
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                lineNumber: 1215,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                        lineNumber: 1207,
                                                                        columnNumber: 21
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-left text-[9px] font-bold text-white/80 truncate flex items-center gap-1",
                                                                        children: [
                                                                            toTitleCase(player.name),
                                                                            (player.archetype || player.playStyle) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "relative group/arch inline-flex items-center",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                                                                                        size: 10,
                                                                                        className: "text-amber-400/40 group-hover/arch:text-amber-400 transition-colors cursor-help"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                        lineNumber: 1222,
                                                                                        columnNumber: 27
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-zinc-900/95 border border-amber-500/20 shadow-2xl text-[9px] font-bold text-amber-300 whitespace-nowrap pointer-events-none opacity-0 group-hover/arch:opacity-100 transition-all z-50 backdrop-blur-xl",
                                                                                        children: [
                                                                                            player.archetype || player.playStyle,
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900/95 border-r border-b border-amber-500/20 rotate-45 -mt-1"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                                lineNumber: 1225,
                                                                                                columnNumber: 29
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                        lineNumber: 1223,
                                                                                        columnNumber: 27
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                                lineNumber: 1221,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                        lineNumber: 1218,
                                                                        columnNumber: 21
                                                                    }, this),
                                                                    statKeys.map((key)=>{
                                                                        const val = getStatValue(player, key);
                                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: `text-center text-[9px] font-black flex items-center justify-center ${val >= 85 ? 'text-emerald-300' : val >= 75 ? 'text-emerald-400' : val >= 60 ? 'text-yellow-400' : val >= 45 ? 'text-orange-400' : 'text-red-400'}`,
                                                                            children: val
                                                                        }, key, false, {
                                                                            fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                            lineNumber: 1233,
                                                                            columnNumber: 25
                                                                        }, this);
                                                                    })
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                                lineNumber: 1200,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, player.id, true, {
                                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                        lineNumber: 1097,
                                                        columnNumber: 17
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                                lineNumber: 1053,
                                                columnNumber: 11
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                        lineNumber: 1033,
                                        columnNumber: 9
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                                lineNumber: 1019,
                                columnNumber: 7
                            }, this)
                        ]
                    }, "squad", true, {
                        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                        lineNumber: 745,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
                lineNumber: 722,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fm/TacticsCommandCenter.tsx",
        lineNumber: 668,
        columnNumber: 5
    }, this);
}
_s1(TacticsCommandCenter, "/0e6rWbNTzGKCDK07lNfLolwtuw=", false, function() {
    return [
        useTouchDrag
    ];
});
_c1 = TacticsCommandCenter;
var _c, _c1;
__turbopack_context__.k.register(_c, "PlayerIcon");
__turbopack_context__.k.register(_c1, "TacticsCommandCenter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_fm_TacticsCommandCenter_tsx_59379b14._.js.map