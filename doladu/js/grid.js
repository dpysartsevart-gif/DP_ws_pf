/* ============================================================
   DoLadu — жива сітка фону.
   Дослівний витяг зі скрипта neuralCanvas з "Wireframecode - Final.html"
   (той самий файл, що працює фоном застосунку). Нічого не вирізано:
   минулого разу спроба «прибрати зайве» з'їла setMousePos, і сітка
   перестала реагувати на мишу. Хуки __hub* лишаються — вони просто
   визначають функції, які на сайті ніхто не викликає.
   ============================================================ */
(function(){
'use strict';
var __c = document.getElementById('neuralCanvas');
if (!__c) return;
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
const canvas = document.getElementById('neuralCanvas');
        const ctx = canvas.getContext('2d');
        
        // 1. Механіка плавності миші
        const mouse = { x: -2000, y: -2000, targetX: -2000, targetY: -2000, v: 0 };
        let bgLiveMode = true;
        let bgThemeId = 'classic';

        const BG_THEMES = {
            classic: {
                gridStroke: 'rgba(255, 255, 255, 0.04)',
                vertex: 'rgba(255, 255, 255, 0.15)',
                glitchA: 'rgba(91, 69, 200, ',
                glitchB: 'rgba(34, 211, 238, ',
                glowShadow: 'rgba(34, 211, 238, 0.6)',
                glowFill: 'rgba(34, 211, 238, 0.9)',
            },
            silver: {
                gridStroke: 'rgba(255, 255, 255, 0.06)',
                vertex: 'rgba(255, 255, 255, 0.11)',
                glitchA: 'rgba(16, 16, 20, ',
                glitchB: 'rgba(118, 122, 132, ',
                glowShadow: 'rgba(247, 213, 62, 0.65)',
                glowFill: 'rgba(247, 213, 62, 0.95)',
            },
            groove: {
                gridStroke: 'rgba(132, 98, 172, 0.38)',
                vertex: 'rgba(148, 118, 188, 0.26)',
                glitchA: 'rgba(247, 213, 62, ',
                glitchB: 'rgba(255, 140, 48, ',
                glowShadow: 'rgba(247, 213, 62, 0.65)',
                glowFill: 'rgba(247, 213, 62, 0.95)',
            },
            void: {
                gridStroke: 'rgba(255, 252, 228, 0.05)',
                vertex: 'rgba(255, 250, 220, 0.13)',
                glitchA: 'rgba(168, 255, 72, ',
                glitchB: 'rgba(168, 85, 255, ',
                glowShadow: 'rgba(255, 130, 48, 0.72)',
                glowFill: 'rgba(255, 120, 40, 0.95)',
            },
        };

        const HUB_ALT_THEMES = new Set(['silver', 'groove', 'void']);

        function palette() {
            return BG_THEMES[bgThemeId] || BG_THEMES.classic;
        }

        function resetMeshToOrigin() {
            mouse.targetX = mouse.x = -2000;
            mouse.targetY = mouse.y = -2000;
            mouse.v = 0;
            points.forEach(p => {
                p.x = p.tx = p.originX;
                p.y = p.ty = p.originY;
                p.isInfluenced = false;
            });
        }

        function drawStaticWireframe() {
            if (!width || !height || !points.length) return;
            const pal = palette();
            const gridStroke = bgThemeId === 'classic'
                ? 'rgba(255, 255, 255, 0.04)'
                : pal.gridStroke;
            const vertex = bgThemeId === 'classic'
                ? 'rgba(255, 255, 255, 0.15)'
                : pal.vertex;
            ctx.clearRect(0, 0, width, height);
            ctx.beginPath();
            ctx.strokeStyle = gridStroke;
            ctx.lineWidth = 1;
            for (let j = 0; j < rows - 1; j++) {
                for (let i = 0; i < columns - 1; i++) {
                    const idx = j * columns + i;
                    const p1 = points[idx], p2 = points[idx + 1];
                    const p3 = points[(j + 1) * columns + i + 1];
                    const p4 = points[(j + 1) * columns + i];
                    ctx.moveTo(p1.originX, p1.originY); ctx.lineTo(p2.originX, p2.originY);
                    ctx.lineTo(p3.originX, p3.originY); ctx.lineTo(p4.originX, p4.originY);
                    ctx.lineTo(p1.originX, p1.originY);
                }
            }
            ctx.stroke();
            points.forEach(p => {
                ctx.fillStyle = vertex;
                ctx.beginPath();
                ctx.arc(p.originX, p.originY, 0.8, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        function drawClassicVertices() {
            points.forEach(p => {
                if (p.isInfluenced && p.glowId < 0.25) {
                    ctx.save();
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = 'rgba(34, 211, 238, 0.6)';
                    ctx.fillStyle = 'rgba(34, 211, 238, 0.9)';
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                } else {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 0.8, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }

        function drawAltVertices() {
            const pal = palette();
            points.forEach(p => {
                if (p.isInfluenced && p.glowId < 0.25) {
                    ctx.save();
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = pal.glowShadow;
                    ctx.fillStyle = pal.glowFill;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                } else {
                    ctx.fillStyle = pal.vertex;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 0.8, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }

        window.__hubSetBgLive = (live) => {
            bgLiveMode = !!live;
            if (!bgLiveMode) {
                resetMeshToOrigin();
                drawStaticWireframe();
            }
        };

        window.__hubSetBgTheme = (themeId) => {
            let id = String(themeId || '').toLowerCase();
            if (id === 'graphite') id = 'groove';
            bgThemeId = HUB_ALT_THEMES.has(id) ? id : 'classic';
            document.body.classList.remove('theme-classic', 'theme-silver', 'theme-groove', 'theme-void');
            document.body.classList.add('theme-' + bgThemeId);
            if (!bgLiveMode) {
                resetMeshToOrigin();
                drawStaticWireframe();
            }
        };

        window.__hubResize = () => resize();

        // Цю функцію викликає Python
        window.setMousePos = (x, y) => {
            if (!bgLiveMode) return;
            mouse.targetX = x;
            mouse.targetY = y;
            // Запобігаємо різкому стрибку при першому русі
            if (mouse.x < -1000) { mouse.x = x; mouse.y = y; }
        };
        window.updateMouseFromPython = window.setMousePos;

        // Резервне керування (працює, якщо відкрити файл просто в браузері)
        window.addEventListener('mousemove', (e) => window.setMousePos(e.clientX, e.clientY));

        let width, height, points = [], columns, rows;
        const spacing = 60;
        const jitterAmount = 15;
        const interactionRadius = 130; 
        const MAX_DISPLACEMENT = 7;
        const padding = 3;

        function init() {
            resize();
            window.addEventListener('resize', resize);
            requestAnimationFrame(animate);
        }

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            createMesh();
            if (!bgLiveMode) {
                resetMeshToOrigin();
                drawStaticWireframe();
            }
        }

        function createMesh() {
            points = [];
            columns = Math.ceil(width / spacing) + (padding * 2);
            rows = Math.ceil(height / spacing) + (padding * 2);

            for (let j = 0; j < rows; j++) {
                for (let i = 0; i < columns; i++) {
                    const isChaotic = Math.random() < 0.3;
                    let ox = (i - padding) * spacing;
                    let oy = (j - padding) * spacing;

                    if (isChaotic) {
                        ox += (Math.random() * jitterAmount - jitterAmount / 2);
                        oy += (Math.random() * jitterAmount - jitterAmount / 2);
                    }
                    
                    points.push({
                        x: ox, y: oy, originX: ox, originY: oy, tx: ox, ty: oy,
                        glowId: Math.random(), isInfluenced: false 
                    });
                }
            }
        }

        function animate() {
            if (!bgLiveMode) {
                requestAnimationFrame(animate);
                return;
            }

            // --- РОЗРАХУНОК ПЛАВНОСТІ (LERP) ---
            const dxM = mouse.targetX - mouse.x;
            const dyM = mouse.targetY - mouse.y;
            
            // Розрахунок швидкості для ефекту глічу
            const currentSpeed = Math.sqrt(dxM * dxM + dyM * dyM);
            mouse.v = (mouse.v * 0.85) + (currentSpeed * 0.15); // М'яка інерція
            
            // Плавне підтягування координат (0.15 - швидкість відгуку)
            mouse.x += dxM * 0.15;
            mouse.y += dyM * 0.15;

            ctx.clearRect(0, 0, width, height);

            // --- ОНОВЛЕННЯ ФІЗИКИ СІТКИ ---
            points.forEach(p => {
                const dx = mouse.x - p.x; 
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < interactionRadius) {
                    p.isInfluenced = true;
                    const angle = Math.atan2(dy, dx); 
                    const t = Math.min(dist / interactionRadius, 1);
                    const smoothForce = Math.pow(1 - t, 2.5);
                    const finalD = Math.min(dist * smoothForce, 15);

                    p.tx = p.originX + Math.cos(angle) * finalD;
                    p.ty = p.originY + Math.sin(angle) * finalD;
                    
                    const dOX = p.tx - p.originX;
                    const dOY = p.ty - p.originY;
                    if (Math.sqrt(dOX * dOX + dOY * dOY) > MAX_DISPLACEMENT) {
                        const aOrigin = Math.atan2(dOY, dOX);
                        p.tx = p.originX + Math.cos(aOrigin) * MAX_DISPLACEMENT;
                        p.ty = p.originY + Math.sin(aOrigin) * MAX_DISPLACEMENT;
                    }
                } else {
                    p.isInfluenced = false;
                    p.tx = p.originX;
                    p.ty = p.originY;
                }
                
                // Плавне повернення точок
                p.x += (p.tx - p.x) * 0.08;
                p.y += (p.ty - p.y) * 0.08;
            });

            // --- МАЛЮВАННЯ CHROMATIC ABERRATION ---
            const zone1Radius = 140; 
            const threshold = 30; // Вищий поріг: ефект стартує лише на різких рухах
            const excessSpeed = Math.max(mouse.v - threshold, 0);
            const glitchBoost = Math.min(Math.pow(excessSpeed * 0.04, 1.35), 10);
            const pal = palette();

            for (let j = 0; j < rows - 1; j++) {
                for (let i = 0; i < columns - 1; i++) {
                    const idx = j * columns + i;
                    const quad = [points[idx], points[idx+1], points[(j+1)*columns+i+1], points[(j+1)*columns+i]];
                    const edges = [[0, 1], [1, 2], [2, 3], [3, 0]]; 

                    edges.forEach(([s, e]) => {
                        const p_start = quad[s];
                        const p_end = quad[e];
                        if (!p_start || !p_end) return;

                        const dx = mouse.x - p_start.x; 
                        const dy = mouse.y - p_start.y;
                        const distFromOrigin = Math.sqrt(dx * dx + dy * dy);

                        if (distFromOrigin < zone1Radius && p_start.isInfluenced) {
                            const strength = 1 - (distFromOrigin / zone1Radius);
                            const opacity = strength * (0.4 + (glitchBoost * 0.05));
                            
                            const M = { 
                                x: p_start.x + (p_end.x - p_start.x) * 0.9, 
                                y: p_start.y + (p_end.y - p_start.y) * 0.9 
                            };
                            
                            // Запобіжник від крашу PySide WebEngine
                            if (Math.abs(p_start.x - M.x) < 0.1 && Math.abs(p_start.y - M.y) < 0.1) return;

                            const nudgeVec = { x: p_start.x - mouse.x, y: p_start.y - mouse.y };
                            const nDist = Math.sqrt(nudgeVec.x * nudgeVec.x + nudgeVec.y * nudgeVec.y) || 1;
                            const currentOffset = 1.1 + glitchBoost;
                            const offX = (nudgeVec.x / nDist) * currentOffset;
                            const offY = (nudgeVec.y / nDist) * currentOffset;

                            ctx.save();
                            ctx.lineWidth = 1.05 + (glitchBoost * 0.14);

                            // Split-tone glitch channel A
                            const gR = ctx.createLinearGradient(p_start.x, p_start.y, M.x, M.y);
                            gR.addColorStop(0, `${pal.glitchA}${opacity})`); 
                            gR.addColorStop(1, `${pal.glitchA}0)`);
                            ctx.strokeStyle = gR;
                            ctx.beginPath();
                            ctx.moveTo(p_start.x + offX, p_start.y + offY);
                            ctx.lineTo(M.x + offX, M.y + offY);
                            ctx.stroke();

                            // Split-tone glitch channel B
                            const gB = ctx.createLinearGradient(p_start.x, p_start.y, M.x, M.y);
                            gB.addColorStop(0, `${pal.glitchB}${opacity})`);
                            gB.addColorStop(1, `${pal.glitchB}0)`);
                            ctx.strokeStyle = gB;
                            ctx.beginPath();
                            ctx.moveTo(p_start.x - offX, p_start.y - offY);
                            ctx.lineTo(M.x - offX, M.y - offY);
                            ctx.stroke();

                            ctx.restore();
                        }
                    });
                }
            }

            // --- БАЗОВИЙ WIREFRAME ---
            if (bgThemeId === 'classic') {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
                ctx.lineWidth = 1;
                for (let j = 0; j < rows - 1; j++) {
                    for (let i = 0; i < columns - 1; i++) {
                        const idx = j * columns + i;
                        const p1 = points[idx], p2 = points[idx+1], p3 = points[(j+1)*columns+i+1], p4 = points[(j+1)*columns+i];
                        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
                        ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
                        ctx.lineTo(p1.x, p1.y);
                    }
                }
                ctx.stroke();
                drawClassicVertices();
            } else {
                ctx.beginPath();
                ctx.strokeStyle = pal.gridStroke;
                ctx.lineWidth = 1;
                for (let j = 0; j < rows - 1; j++) {
                    for (let i = 0; i < columns - 1; i++) {
                        const idx = j * columns + i;
                        const p1 = points[idx], p2 = points[idx+1], p3 = points[(j+1)*columns+i+1], p4 = points[(j+1)*columns+i];
                        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
                        ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
                        ctx.lineTo(p1.x, p1.y);
                    }
                }
                ctx.stroke();
                drawAltVertices();
            }

            requestAnimationFrame(animate);
        }

        // Python tab-curtain: export full viewport or pane slice at native canvas resolution.
        window.__hubExportFullBackdrop = function() {
            try {
                var src = document.getElementById('neuralCanvas');
                if (!src || src.width < 2 || src.height < 2) return '';
                var c = document.createElement('canvas');
                c.width = src.width;
                c.height = src.height;
                var ctx = c.getContext('2d');
                ctx.fillStyle = getComputedStyle(document.body).backgroundColor || '#171b26';
                ctx.fillRect(0, 0, c.width, c.height);
                ctx.drawImage(src, 0, 0);
                return c.toDataURL('image/png');
            } catch (e) {
                return '';
            }
        };

        window.__hubExportPaneSlice = function(x, y, w, h, bw, bh) {
            try {
                var src = document.getElementById('neuralCanvas');
                if (!src || src.width < 2 || src.height < 2) return '';
                bw = Math.max(1, bw | 0);
                bh = Math.max(1, bh | 0);
                w = Math.max(1, w | 0);
                h = Math.max(1, h | 0);
                var sx = Math.round(x * src.width / bw);
                var sy = Math.round(y * src.height / bh);
                var sw = Math.round(w * src.width / bw);
                var sh = Math.round(h * src.height / bh);
                sx = Math.max(0, Math.min(sx, src.width - 1));
                sy = Math.max(0, Math.min(sy, src.height - 1));
                sw = Math.max(1, Math.min(sw, src.width - sx));
                sh = Math.max(1, Math.min(sh, src.height - sy));
                var c = document.createElement('canvas');
                c.width = w;
                c.height = h;
                var ctx = c.getContext('2d');
                ctx.fillStyle = getComputedStyle(document.body).backgroundColor || '#171b26';
                ctx.fillRect(0, 0, w, h);
                var needsScale = (sw !== w || sh !== h);
                ctx.imageSmoothingEnabled = needsScale;
                if (needsScale) {
                    ctx.imageSmoothingQuality = 'high';
                }
                ctx.drawImage(src, sx, sy, sw, sh, 0, 0, w, h);
                return c.toDataURL('image/png');
            } catch (e) {
                return '';
            }
        };

        init();
    
/* Малюємо статичну сітку одразу після init: якщо вкладку відкрили у фоні,
   requestAnimationFrame не виконується, і полотно лишалось би порожнім до
   першого показу. false -> намалювати статично, true -> знов жива. */
try {
    if (typeof window.__hubSetBgLive === 'function') {
        window.__hubSetBgLive(false);
        window.__hubSetBgLive(true);
    }
} catch (e) { /* сітка — прикраса, вона не має права ламати сторінку */ }
})();
