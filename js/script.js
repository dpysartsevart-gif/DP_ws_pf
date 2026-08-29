document.addEventListener('DOMContentLoaded', () => {
// === MOBILE DETECTION (touch + size) ===
function isMobile() {
    const hasTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const isSmall = window.innerWidth <= 1000;
    return hasTouch && isSmall;
}
// === BOOT SEQUENCE ===
const bootScreen = document.getElementById('boot-screen');
const bootLines = document.getElementById('boot-lines');
const bootMessages = [
  '> INITIALIZING DPYSARTSEV_OS v2.0.26...',
  '> LOADING ASSET REGISTRY... [OK]',
  '> MOUNTING 3D ENGINE... [OK]',
  '> CALIBRATING RENDER PIPELINE... [OK]',
  '<span style="color:#f7d53e">> SYSTEM READY.</span>'
];
let bi = 0;
function typeBootLine() {
  if (bi < bootMessages.length) {
    bootLines.innerHTML += bootMessages[bi] + '<br>';
    bi++;
    setTimeout(typeBootLine, 80);
  } else {
    setTimeout(() => {
      bootScreen.style.transition = 'opacity 0.5s ease';
      bootScreen.style.opacity = '0';
      setTimeout(() => bootScreen.remove(), 100);
    }, 100);
  }
}
typeBootLine();

// === DYNAMIC DUST ===
const dustContainer = document.getElementById('dust-container');
for (let i = 0; i < 12; i++) {
  const d = document.createElement('div');
  d.className = 'dust-speck';
  d.style.cssText = `top:${Math.random()*100}%;left:${Math.random()*100}%;animation-delay:${(Math.random()*6).toFixed(1)}s;opacity:${(0.3 + Math.random()*0.5).toFixed(1)}`;
  dustContainer.appendChild(d);
}

// === TYPING SUBTITLE ===
// Рядок 1 — 3D-профіль. Рядок 2 — друга професія (продукт / процеси / AI).
// Друкуються по черзі: курсор "переїжджає" з першого рядка на другий.
const subtitleEl = document.getElementById('typed-subtitle');
const subtitleText = '3D CHARACTER ARTIST \\ GAMEDEV \\ LOOKDEV';
const subtitleEl2 = document.getElementById('typed-subtitle-2');
const subtitleText2 = 'PRODUCT DESIGN \\ PROCESS ANALYSIS & UPGRADE \\ AI-ASSISTED DEV';

let si = 0;
function typeSubtitle() {
  if (si <= subtitleText.length) {
    subtitleEl.textContent = subtitleText.slice(0, si);
    si++;
    setTimeout(typeSubtitle, 60);
  } else {
    startSubtitle2();
  }
}

let si2 = 0;
function typeSubtitle2() {
  if (!subtitleEl2) return;
  if (si2 <= subtitleText2.length) {
    subtitleEl2.textContent = subtitleText2.slice(0, si2);
    si2++;
    setTimeout(typeSubtitle2, 40);
  }
}

function startSubtitle2() {
  if (!subtitleEl2) return;
  // Гасимо курсор на першому рядку і вмикаємо на другому
  const cursor1 = document.querySelector('.role-subtitle.sub-1 .cursor-blink');
  if (cursor1) cursor1.style.visibility = 'hidden';
  const row2 = document.querySelector('.role-subtitle.sub-2');
  if (row2) row2.classList.add('typing');
  setTimeout(typeSubtitle2, 300);
}

// Запусти після boot screen (приблизно 0.50 секунди)
setTimeout(typeSubtitle, 500);


// === ANIMATED STATS COUNTER ===
function runStatsAnimation() {
    // Числові стати
    document.querySelectorAll('.stat-num[data-target]').forEach(el => {
        el.textContent = '0';
        const raw = String(el.dataset.target);
        const target = parseInt(raw) || 0;
        const suffix = raw.replace(/[0-9]/g, '');   // напр. "+"
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 20));
        const interval = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = current + (current >= target ? suffix : '');
            if (current >= target) clearInterval(interval);
        }, 60);
    });

    // Pipeline cycling
    const pipelineEl = document.getElementById('pipeline-stat');
    if (!pipelineEl) return;

    const stages = [
        'REFERENCES',
        'HI-POLY',
        'LOW-POLY',
        'UV MAPPING',
        'BAKING',
        'TEXTURING',
        'LIGHTING',
        'SHADING',
        'RENDERING'
    ];
    let stageIndex = 0;

    function cycleStage() {
        pipelineEl.style.opacity = '0';
        pipelineEl.style.transform = 'translateY(-6px)';
        setTimeout(() => {
            pipelineEl.textContent = stages[stageIndex];
            pipelineEl.style.opacity = '1';
            pipelineEl.style.transform = 'translateY(0)';
            stageIndex = (stageIndex + 1) % stages.length;
        }, 250);
    }

    pipelineEl.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    pipelineEl.textContent = stages[0];
    stageIndex = 1;
    
    // Очищаємо старий інтервал якщо Credits відкривали вже раніше
    if (window._pipelineInterval) clearInterval(window._pipelineInterval);
    window._pipelineInterval = setInterval(cycleStage, 1200);
}


    // === HISTORY API ===
    history.replaceState({ screen: 'main-menu' }, '', '');
window.addEventListener('popstate', (event) => {
        const lightboxOverlay = document.getElementById('lightbox-overlay');
        if (lightboxOverlay && lightboxOverlay.classList.contains('active')) {
            lightboxOverlay.classList.remove('active');
            setTimeout(() => { if(document.getElementById('lightbox-img')) document.getElementById('lightbox-img').src = ''; }, 300);
            return; 
        }

        // Універсальне закриття мобільного модуля (Галерея або Журнал)
        const activeViewport = document.querySelector('.gallery-viewport.active-screen');
        if (isMobile() && activeViewport) {
            const parentScreen = activeViewport.closest('.screen');
            const currentSidebar = parentScreen.querySelector('.gallery-sidebar');
            
            activeViewport.classList.remove('active-screen');
            activeViewport.style.display = 'none';
            if (currentSidebar) currentSidebar.style.display = 'flex';
            
            document.querySelectorAll('.project-slot').forEach(s => s.classList.remove('selected'));
            return;
        }

        if (event.state && event.state.screen && event.state.screen !== 'mobile-project-view' && event.state.screen !== 'mobile-journal-view' && event.state.screen !== 'mobile-shop-view') {
            showScreen(event.state.screen); 
        } else {
            showScreen('main-menu');
        }
    });

    // === ЗМІННІ ===
    const preloader = document.getElementById('gallery-preloader');
    const barFill = document.querySelector('.bar-fill');
    const pctText = document.querySelector('.loader-percentage');
    const loaderText = document.querySelector('.loader-text'); 
    const audioToggle = document.getElementById('audio-toggle');
    
    // Деякі браузери (Safari у приватному режимі, налаштування «блокувати дані сайтів»)
    // кидають SecurityError на БУДЬ-ЯКИЙ дотик до localStorage. Без цієї обгортки
    // виняток тут зупиняв увесь скрипт нижче — меню переставало реагувати взагалі.
    function safeStorageGet(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }
    function safeStorageSet(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* без збереження — просто не запам'ятовуємо */ }
    }

    let isMuted = safeStorageGet('dp_audio_muted') === 'true';

    if (audioToggle && isMuted) {
        audioToggle.innerText = "[ AUDIO : OFF ]";
        audioToggle.classList.add('muted');
    }

    const terminal = document.getElementById('dev-terminal');
    const termInput = document.getElementById('term-input');
    const termOutput = document.getElementById('term-output');
    const lightbox = document.getElementById('lightbox-overlay');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const dot = document.querySelector('.cursor-dot');
    const circle = document.querySelector('.cursor-circle');
    const banner = document.getElementById('mobile-banner');
    const closeBanner = document.getElementById('close-banner');
    const screens = document.querySelectorAll('.screen');
    const menuItems = document.querySelectorAll('.menu-item');
    const dlcBtn = document.querySelector('.dlc-btn');
    const projectSlots = document.querySelectorAll('.project-slot');
    const vpContent = document.getElementById('viewport-content');
    const achievementPopup = document.getElementById('achievement-popup');
    const sidebar = document.querySelector('.gallery-sidebar');
    const viewport = document.querySelector('.gallery-viewport');
    const mobileBackBtn = document.getElementById('btn-back-to-list');
    const menuBackBtns = document.querySelectorAll('.menu-back-btn');
    const emailPopup = document.getElementById('email-popup');
    const btnEmailConfirm = document.getElementById('btn-email-confirm');
    const btnEmailCancel = document.getElementById('btn-email-cancel');
    const donateBtn = document.getElementById('donate-btn');
    const backHints = document.querySelectorAll('.back-hint');
    const journalPopup = document.getElementById('journal-popup');
    const btnJournalClose = document.getElementById('btn-journal-close'); 

    let currentMenuIndex = 0;
    let inSubMenu = false;
    let isDlcActive = false;

    // === DYNAMIC FAVICON LOGIC ===
    // Повертаємось на справжній файл, а не на data:-URI — чіткіше у вкладці
    const faviconDefault = 'assets/favicon-192.png';
    const faviconTerminal = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23ff3d00" rx="20"/><text y="65" x="15" fill="white" font-family="monospace" font-size="55">>_</text></svg>';

    function setFavicon(url) {
        // Іконок у <head> тепер кілька (ico/svg/png різних розмірів), тому
        // міняти href лише в першій недостатньо — браузер може лишити іншу.
        // Прибираємо всі й ставимо одну. rel="apple-touch-icon" не чіпаємо.
        document.querySelectorAll("link[rel~='icon']").forEach(l => l.remove());
        const link = document.createElement('link');
        link.rel = 'icon';
        link.id = 'dynamic-favicon';
        link.href = url;
        document.head.appendChild(link);
    }
    // На старті НЕ перезаписуємо іконку: статичні теги з <head> дають ту саму
    // картинку, але у справжніх файлах — чіткіше і видимо для пошукових систем.

// === SYSTEM BOOT ===
    // Стартовий екран завантаження вимкнено. Одразу показуємо мобільний банер, якщо треба.
    if (isMobile() && banner) {
        banner.classList.add('active');
    }

    // === PRELOADER ГАЛЕРЕЇ ===
    function runGalleryPreloader(callback) {
        if (!preloader) { callback(); return; }
        preloader.classList.remove('hidden');
        preloader.style.display = 'flex';
        preloader.style.opacity = '1';
        if(loaderText) loaderText.innerText = "LOADING PROJECT DATA...";
        if(barFill) barFill.style.width = '0%';
        if(pctText) pctText.textContent = '0%';
        
        let loadPct = 0;
        const interval = setInterval(() => {
            loadPct += Math.floor(Math.random() * 15) + 5; 
            if(loadPct > 100) loadPct = 100;
            if(barFill) barFill.style.width = `${loadPct}%`;
            if(pctText) pctText.textContent = `${loadPct}%`;
            if(loadPct === 100) {
                clearInterval(interval);
                setTimeout(() => {
                    preloader.classList.add('hidden'); 
                    preloader.style.display = 'none';
                    callback();
                }, 300);
            }
        }, 30);
    }



// === СИСТЕМА: ЄДИНИЙ РЕАЛЬНИЙ ЛІЧИЛЬНИК (COUNTERAPI + SCRAMBLE) ===
    const visitorsEl = document.getElementById('sys-visitors');
    if (visitorsEl) {
        // Лічильник: Abacus (безкоштовний, без акаунта і без токена).
        // Старий api.counterapi.dev/v1 вимкнули — він віддає 410 Gone.
        // /hit/<простір>/<ключ> одночасно рахує і повертає {"value": N}.
        const VISITS_BASE = 4713;  // база зі старого лічильника, щоб цифра не відкотилась
        const VISITS_URL  = 'https://abacus.jasoncameron.dev/hit/dpysartsev-art/visits';

        function showVisits(n) {
            visitorsEl.textContent = String(n).padStart(4, '0');
            if (typeof scrambleText === "function") scrambleText(visitorsEl, 1500);
        }

        fetch(VISITS_URL)
            .then(response => {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.json();
            })
            .then(data => {
                const count = Number(data.value);
                if (!Number.isFinite(count)) throw new Error('bad payload');
                showVisits(count + VISITS_BASE);
            })
            .catch(() => {
                console.warn('SYS_WARN: Telemetry offline.');
                showVisits(VISITS_BASE); // Fallback цифра
            });
    }



    if(closeBanner) {
        closeBanner.addEventListener('click', () => { 
            if(banner) banner.classList.remove('active'); 
            safePlay('snd-select'); 
        });
    }

// === CURSOR & DUST ===
    let mouseX = 0, mouseY = 0, dotX = 0, dotY = 0, circleX = 0, circleY = 0;
    let dustScheduled = false;
    if (window.matchMedia("(min-width: 1000px)").matches) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX; mouseY = e.clientY;

const target = e.target.closest('.menu-item, .dlc-btn, .buy-btn, .alt-toggle-btn, .project-slot, .vp-link, .lightbox-close, .shop-item, .shop-btn, .sp-buy, .contact-link');
            // 1. Очищаємо ефект ТІЛЬКИ з тих кнопок, на яких немає курсору
            document.querySelectorAll('.menu-item, .dlc-btn, .buy-btn').forEach(btn => {
                if (btn !== target) {
                    btn.style.transform = ''; 
                }
            });

            if (target) {
                if(circle) circle.classList.add('magnetic');
                
                // 2. MAGNETIC PHYSICAL HOVER (Справжня фізика)
                if (target.classList.contains('menu-item') || target.classList.contains('dlc-btn') || target.classList.contains('buy-btn')) {
                    const rect = target.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    
                    // Сила тяжіння (Збільшено до 0.10 для відчутності)
                    const pullX = (mouseX - centerX) * 0.08; 
                    const pullY = (mouseY - centerY) * 0.08; 
                    
                    const baseTranslate = target.classList.contains('menu-item') ? 'translateX(7px)' : '';
                    target.style.transform = `${baseTranslate} translate(${pullX}px, ${pullY}px)`;
                }
            } else {
                if(circle) circle.classList.remove('magnetic');
            }

            const bg = document.getElementById('parallax-bg');
            if(bg) {
                const moveX = (window.innerWidth / 2 - mouseX) * 0.02; 
                const moveY = (window.innerHeight / 2 - mouseY) * 0.02;
                bg.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }

            // === РОЗУМНИЙ ПИЛ (М'ЯКИЙ РОЗЛІТ) — throttle 1/кадр, читання→запис ===
            if (!dustScheduled) {
                dustScheduled = true;
                requestAnimationFrame(() => {
                    dustScheduled = false;
                    const specks = document.querySelectorAll('.dust-speck');
                    const pos = [];
                    specks.forEach(speck => {           // спершу всі читання
                        const rect = speck.getBoundingClientRect();
                        pos.push([rect.left + rect.width / 2, rect.top + rect.height / 2]);
                    });
                    specks.forEach((speck, i) => {      // потім всі записи
                        const dist = Math.hypot(mouseX - pos[i][0], mouseY - pos[i][1]);
                        if (dist < 90) {
                            const angle = Math.atan2(pos[i][1] - mouseY, pos[i][0] - mouseX);
                            const force = (90 - dist) * 0.25;
                            speck.style.marginLeft = `${Math.cos(angle) * force}px`;
                            speck.style.marginTop = `${Math.sin(angle) * force}px`;
                            speck.style.transition = 'margin 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
                        } else {
                            speck.style.marginLeft = '0px';
                            speck.style.marginTop = '0px';
                            speck.style.transition = 'margin 1.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
                        }
                    });
                });
            }
        });

function animateCursor() {
    // Dot — жорстко до миші, нуль затримки
    dotX = mouseX;
    dotY = mouseY;

    // Circle — інерція (0.3 — швидко і чутливо)
    const prevCircleX = circleX;
    const prevCircleY = circleY;
    circleX += (mouseX - circleX) * 0.3;
    circleY += (mouseY - circleY) * 0.3;

    // Аберація — рахується по швидкості circle
    const vx = circleX - prevCircleX;
    const vy = circleY - prevCircleY;
    const speed = Math.sqrt(vx * vx + vy * vy);

    if (circle) {
        const caStrength = Math.min(speed * 0.6, 5);
        circle.style.setProperty('--ca-x', `${(vx / (speed || 1)) * caStrength}px`);
        circle.style.setProperty('--ca-y', `${(vy / (speed || 1)) * caStrength}px`);
        if (speed > 0.3) {
            circle.classList.add('moving');
        } else {
            circle.classList.remove('moving');
        }
    }

    if(dot) dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
    if(circle) circle.style.transform = `translate3d(${circleX}px, ${circleY}px, 0) translate(-50%, -50%)`;

    requestAnimationFrame(animateCursor);
}
        animateCursor();
    }

    // === SOUNDS ===
    function safePlay(id) {
        if (isMuted) return; 
        const audio = document.getElementById(id);
        if(audio) { 
            audio.volume = 0.04; 
            audio.currentTime = 0; 
            audio.play().catch(() => {}); 
        }
    }

// === SCREEN LOGIC ===
    function showScreen(screenId) {
        if(screenId === 'gallery-screen' && !inSubMenu) {
            runGalleryPreloader(() => { activateScreen(screenId); });
        } else if (screenId === 'journal-screen' && !inSubMenu) {
            runJournalPreloader(() => { activateScreen(screenId); });
        } else {
            activateScreen(screenId);
        }
    }

    function runJournalPreloader(callback) {
        const jPreloader = document.getElementById('journal-preloader');
        if (!jPreloader) { callback(); return; }
        
        jPreloader.classList.remove('hidden');
        jPreloader.style.display = 'flex';
        jPreloader.style.opacity = '1';
        safePlay('snd-hover'); 
        
        const jBar = document.getElementById('j-bar-fill');
        const jPct = document.getElementById('j-pct-text');
        const jText = document.getElementById('j-loader-text');
        
        if(jBar) jBar.style.width = '0%';
        if(jPct) jPct.textContent = '0%';
        if(jText) jText.innerText = "SEARCHING TEXT MODULES...";
        
        let loadPct = 0;
        const messages = ["SEARCHING TEXT MODULES...", "DECRYPTING LOG FILES...", "MOUNTING DATABASE..."];
        
        const interval = setInterval(() => {
            loadPct += Math.floor(Math.random() * 20) + 5; 
            if(loadPct > 100) loadPct = 100;
            
            if(jBar) jBar.style.width = `${loadPct}%`;
            if(jPct) jPct.textContent = `${loadPct}%`;
            
            if (loadPct > 35 && loadPct < 75 && jText) jText.innerText = messages[1];
            if (loadPct >= 75 && jText) jText.innerText = messages[2];

if(loadPct === 100) {
                clearInterval(interval);
                setTimeout(() => {
                    jPreloader.classList.add('hidden'); 
                    jPreloader.style.display = 'none';
                    // Звук прибрано
                    callback();
                }, 400);
            }
        }, 50);
    }

    // === SCRAMBLE TEXT LOGIC ===
    const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*<>[]';
    function scrambleText(element, duration = 1500) {
        const originalText = element.getAttribute('data-original') || element.textContent.trim();
        if (!originalText) return;
        if (!element.getAttribute('data-original')) element.setAttribute('data-original', originalText);
        
        let startTime = null;
        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1); 

            let scrambled = '';
            for (let i = 0; i < originalText.length; i++) {
                if (originalText[i] === ' ') scrambled += ' '; 
                else if (i < originalText.length * progress) scrambled += originalText[i]; 
                else scrambled += scrambleChars[Math.floor(Math.random() * scrambleChars.length)]; 
            }
            element.textContent = scrambled;

            if (progress < 1) requestAnimationFrame(animate);
            else element.textContent = originalText;
        }
        requestAnimationFrame(animate);
    }

    let queenScrambleInterval = null;

    function activateScreen(screenId) {
        // Раніше цей виклик стояв УСЕРЕДИНІ forEach — тобто спрацьовував 7 разів
        // (по разу на кожен .screen) і плодив 6 зайвих вічних інтервалів на кожен
        // захід у Credits. Тепер — рівно один раз.
        if (screenId === 'credits-screen') {
            setTimeout(runStatsAnimation, 400);
        } else if (window._pipelineInterval) {
            // Пішли з Credits — глушимо цикл стадій пайплайну
            clearInterval(window._pipelineInterval);
            window._pipelineInterval = null;
        }

        screens.forEach(s => {
            s.classList.remove('active-screen');
            if (s.id !== screenId && s.id !== 'email-popup') {
                s.style.display = 'none';
                s.classList.add('hidden');
            }
            if (s.id === 'dlc-screen') s.classList.add('dlc-centered'); 
            else s.classList.remove('dlc-centered');
        });

        const target = document.getElementById(screenId);
        if(target) { 
            target.classList.remove('hidden'); 
            target.style.display = 'flex'; 
            setTimeout(() => {
                target.classList.add('active-screen');




              
                if (screenId === 'gallery-screen') {
                    if (Math.random() < 0.33) {
                        document.body.classList.add('glitch-transition');
                        safePlay('snd-gamestart'); 
                        setTimeout(() => document.body.classList.remove('glitch-transition'), 300);
                    }

                    const queenTitle = document.querySelector('.project-slot[data-id="queen"] .p-title');
                    if (queenTitle) {
                        scrambleText(queenTitle, 1500); 
                        if (queenScrambleInterval) clearInterval(queenScrambleInterval);
                        queenScrambleInterval = setInterval(() => { scrambleText(queenTitle, 1500); }, 20000);
                    }
                } else {
                    if (queenScrambleInterval) {
                        clearInterval(queenScrambleInterval);
                        queenScrambleInterval = null;
                    }
                }
            }, 10); 
        }
        
        inSubMenu = (screenId !== 'main-menu');
        
// HUD ховаємо на нестандартних роздільностях при відкритті меню
const hudWidget = document.getElementById('hud-widget');
if (hudWidget) {
    const w = window.innerWidth;
    const isStandard = (w >= 1800 && w <= 2100) || (w >= 3600);
    if (!isStandard) {
        hudWidget.style.display = screenId === 'main-menu' ? 'block' : 'none';
    }
}


if((screenId === 'gallery-screen' || screenId === 'journal-screen' || screenId === 'shop-screen') && isMobile()) {
            const currentSidebar = document.querySelector(`#${screenId} .gallery-sidebar`);
            const currentViewport = document.querySelector(`#${screenId} .gallery-viewport`);
            if(currentSidebar) currentSidebar.style.display = 'flex';
            if(currentViewport) {
                currentViewport.style.display = 'none';
                currentViewport.classList.remove('active-screen');
            }
        }
    }

function goBack() {
        if(emailPopup && emailPopup.style.display === 'flex') { closeEmailPopup(); return; }
        if(journalPopup && journalPopup.style.display === 'flex') { journalPopup.style.display = 'none'; return; }
        
        // Універсальне закриття відкритого модуля (і Галереї, і Журналу)
        const activeViewport = document.querySelector('.gallery-viewport.active-screen');
        if(isMobile() && activeViewport) {
             const parentScreen = activeViewport.closest('.screen');
             const currentSidebar = parentScreen.querySelector('.gallery-sidebar');
             
             activeViewport.classList.remove('active-screen');
             activeViewport.style.display = 'none';
             if (currentSidebar) currentSidebar.style.display = 'flex';
             
             safePlay('snd-select');
             document.querySelectorAll('.project-slot').forEach(s => s.classList.remove('selected'));
             return;
        }

        if(history.state && history.state.screen !== 'main-menu') { history.back(); return; }

        screens.forEach(s => { s.classList.remove('active-screen'); if(s.id !== 'main-menu') { s.style.display = 'none'; s.classList.add('hidden'); } });
        const menu = document.getElementById('main-menu');
        if(menu) {
            menu.classList.remove('hidden'); 
            menu.style.display = 'flex'; 
            setTimeout(() => menu.classList.add('active-screen'), 10);
        }
        
        inSubMenu = false; safePlay('snd-select');
        if(vpContent) vpContent.innerHTML = '<div class="vp-placeholder">SELECT A PROJECT FILE...</div>';
        projectSlots.forEach(s => s.classList.remove('selected'));
        updateVisuals(); 
    }

    // === CLICKS ===
    menuBackBtns.forEach(btn => btn.addEventListener('click', () => { safePlay('snd-select'); history.back(); }));
    backHints.forEach(hint => { hint.addEventListener('click', () => { safePlay('snd-select'); goBack(); }); });
    
    if(mobileBackBtn) {
        mobileBackBtn.addEventListener('click', () => {
            if(viewport) { viewport.classList.remove('active-screen'); viewport.style.display = 'none'; }
            if(sidebar) sidebar.style.display = 'flex';
            safePlay('snd-select');
            if(vpContent) vpContent.innerHTML = '<div class="vp-placeholder">SELECT A PROJECT FILE...</div>';
            projectSlots.forEach(s => s.classList.remove('selected'));
        });
    }

    // === DATA ===
    const projectData = {
        'wod': ['wod01.jpg', 'wod02|alt.jpg', 'wod03|alt.jpg', 'wod04.jpg', 'wod05|alt.jpg', 'wod06.jpg', 'wod07.jpg', 'wod08.jpg', 'wod09.jpg', 'wod_demo.mp4'],
        'jinx': ['jinxr1.jpg', 'jinxr2.jpg', 'jinxr3|alt.jpg', 'jinxr4.jpg', 'jinxr5.jpg', 'Jinx_Gun_TT.mp4'], 
        'sequoia': ['youtube:gPoXD8hg3P0', 'Sequoia01.jpg', 'Sequoia02|alt.jpg', 'Sequoia03|alt.jpg', 'Sequoia04.jpg', 'Sequoia05.jpg', 'Sequoia06.jpg', 'Sequoia07.jpg', 'Sequoia08.jpg', 'Sequoia09.jpg', 'Sequoia10.jpg'],
        'mermaid': ['Marmeid01.jpg', 'Marmeid02.jpg', 'Marmeid03.jpg', 'Mermaid_tt.mp4'],
        'scifi': ['sf01|alt.jpg', 'sf02.jpg', 'sf03.jpg', 'sf04.jpg', 'sf05.jpg', 'scifi_turntable.mp4', 'sf06|alt.jpg', 'sf07|alt.jpg'],
        'wolverine': ['Wolverine01.jpg', 'Wolverine02.jpg', 'Wolverine03.jpg', 'Wolverine04.jpg', 'Wolverine05.jpg', 'wolv_turntable|alt.mp4'],
        'boy': ['boy1.jpg', 'boy2|alt.jpg', 'boy3.jpg', 'boy4.jpg', 'boy5.jpg', 'boy6.jpg', 'boy7.jpg', 'boy8.jpg'],
        'queen': ['Queen1|alt.jpg', 'Queen2.jpg', 'Queen3.jpg', 'Queen4|alt.jpg', 'Queen5.jpg', 'Queen6.jpg', 'Queen_TT_DP.mp4', 'Queen7|alt.jpg'],
        'halloween': ['Halloween1.jpg', 'Halloween2.jpg']
    };

// === JOURNAL DATA ===
    const journalData = {
        'blog': `
            <div class="journal-entry-wrap">
                <h3 class="journal-h3" style="color: #ff3d00;">/// PERSONAL BLOG</h3>
                <p class="journal-note" style="border-color: #ff3d00; color: #ff3d00;">[ ERROR 404 ] MODULE OFFLINE / UNDER CONSTRUCTION</p>
                <p style="color: #ccc; font-size: 16px; line-height: 1.6;">This memory sector is currently unavailable. Work is underway to restore and populate the database.<br><br>Please try connecting later.</p>
            </div>
        `,
        'gaming_exp': `
            <div class="journal-entry-wrap">
                <h3 class="journal-h3">/// GAMING EXPERIENCE</h3>
                <p class="journal-note">SYSTEM NOTE: Partial memory bank dump. Data is incomplete and continuously updating...</p>
                
                <p style="color: #aaa; font-size: 14px; margin-bottom: 20px; font-style: italic;">
                    * The data below is not complete. The database is constantly updated during synchronization with the real world.
                </p>

                <h4 class="journal-h4">1. RPG and Action-RPG</h4>
                <ul class="cv-list">
                    <li>Baldur's Gate (II, 3)</li><li>Dark Souls</li><li>Dark Messiah of Might and Magic</li><li>Darksiders (I, II, III)</li><li>Diablo (I, II: LoD, III, IV)</li><li>Disciples II</li><li>Divine Divinity</li><li>Divinity: Original Sin (I, II)</li><li>Dragon Age (Origins,2, Inquisition)</li><li>Dragon's Dogma 2</li><li>Dungeon Siege (I, II)</li><li>Clair Obscur: Expedition 33</li><li>Cat Quest 1,2,3</li><li>ELEX (I, II)</li><li>Enclave</li><li>Fable (TLC, II)</li><li>Fallout (1, 2, 3, New Vegas, 4)</li><li>Gothic (1, 2: NotR, 3)</li><li>Guild Wars 2</li><li>Hades</li><li>Hellgate: London</li><li>Hogwarts Legacy</li><li>Immortals Fenyx Rising</li><li>Kingdom Come: Deliverance</li><li>Kingdoms of Amalur: Reckoning</li><li>Mass Effect (1, 2, 3)</li><li>Neverwinter (2013), Neverwinter Nights (1, 2)</li><li>NieR: Automata</li><li>Nox</li><li>Overlord (1,2)</li><li>Path of Exile</li><li>Pillars of Eternity (I, II: Deadfire)</li><li>Risen (1,2,3)</li><li>Sacred (1, 2)</li><li>Sekiro: Shadows Die Twice</li><li>Star Wars: KOTOR 1,2</li><li>The Elder Scrolls (Morrowind, Oblivion, Skyrim)</li><li>The Outer Worlds</li><li>The Witcher (1, 2, 3)</li><li>Titan Quest (+ Immortal Throne)</li><li>Torchlight (I, II)</li><li>Vampire: The Masquerade – Bloodlines</li><li>World of Warcraft</li>
                </ul>

                <h4 class="journal-h4">2. Action / Shooters</h4>
                <ul class="cv-list">
                    <li>Alan Wake (I, American Nightmare, II)</li><li>Assassin's Creed (I, II, III, Origins, Odyssey, Valhalla, Mirage)</li><li>Battlefield (1942, 1, 2)</li><li>BioShock (1, 2, Infinite)</li><li>BloodRayne (1,2)</li><li>Borderlands (1, 2)</li><li>Bulletstorm</li><li>Call of Duty (1..MW3)</li><li>Call of Juarez 1,2</li><li>Control</li><li>Counter-Strike 1.6</li><li>Crysis</li><li>Cyberpunk 2077</li><li>Dead Space 1,2,3</li><li>Death Stranding (1, 2)</li><li>Deus Ex</li><li>Dino Crisis (1, 2)</li><li>Dishonored (1, 2)</li><li>Doom (I, II, 3, Eternal)</li><li>Duke Nukem series</li><li>F.E.A.R. 1,2,3</li><li>Far Cry (1, 3, 4)</li><li>Gears of War (1, 2, 3)</li><li>Ghost of Tsushima</li><li>Ghost of Yōtei</li><li>God of War (2018, Ragnarök)</li><li>GoldenEye 007</li><li>GTA (Vice City, San Andreas, IV)</li><li>Half-Life (I, Opposing Force, 2)</li><li>Hellblade: Senua's Sacrifice</li><li>Hitman (Codename 47, 2, Blood Money)</li><li>Horizon (Zero Dawn, Forbidden West)</li><li>Just Cause 1,2</li><li>L.A. Noire</li><li>Legacy of Kain: Soul Reaver</li><li>Mafia (I,II)</li><li>Marvel's Spider-Man (1, Miles Morales, 2)</li><li>Marvel's Guardians of the Galaxy</li><li>Manhunt</li><li>Max Payne (1, 2, 3)</li><li>MechWarrior 2</li><li>Medal of Honor series</li><li>Metal Gear (NES, Solid)</li><li>Metal Slug</li><li>Metro (2033, Last Light)</li><li>Middle-earth: Shadow of Mordor</li><li>Mirror's Edge</li><li>Operation Flashpoint</li><li>Overwatch</li><li>Painkiller</li><li>Perfect Dark</li><li>Prey (2006, 2017)</li><li>Prince of Persia series</li><li>Quake (I, II, III, 4)</li><li>Rainbow Six: Vegas</li><li>Resident Evil (1, 2, 3, Village)</li><li>Silent Hill (1, 2, 3, 4)</li><li>Sniper Elite (V2) / Sniper: Ghost Warrior</li><li>Spider-Man (2000)</li><li>Splinter Cell series</li><li>Star Wars: Battlefront II / Republic Commando / Dark Forces</li><li>Star Wars Jedi: Fallen Order</li><li>Syphon Filter (2, 3)</li><li>System Shock (I, II)</li><li>The Last of Us Part I, II</li><li>Thief (The Dark Project, II, Deadly Shadows)</li><li>Tomb Raider (1996, 2013)</li><li>Turok</li><li>Uncharted 4</li><li>Unreal / Unreal Tournament</li><li>Vigilante 8</li><li>Wolfenstein series</li><li>Will Rock</li>
                </ul>

                <h4 class="journal-h4">3. Strategy and Simulations</h4>
                <ul class="cv-list">
                    <li>Civilization (I, II, IV, V)</li><li>Command & Conquer series</li><li>Company of Heroes</li><li>Cossacks: European Wars</li><li>Dune II</li><li>Heroes of Might and Magic (II, III)</li><li>Homeworld (1, 2)</li><li>Jurassic World: Evolution 1,2</li><li>Microsoft Flight Simulator</li><li>SimCity (1990, 2000)</li><li>StarCraft (I, II)</li><li>The Sims (3,4)</li><li>Warcraft ( II, III: Frozen Throne)</li><li>Warhammer 40,000: Dawn of War (I, II)</li>
                </ul>

                <h4 class="journal-h4">4. Arcade and Platformers</h4>
                <ul class="cv-list">
                    <li>Adventure Island II</li><li>Aladdin</li><li>Astro Bot</li><li>Battle City</li><li>Battletoads</li><li>Chip 'n Dale (1, 2)</li><li>Concrete Genie</li><li>Crash Bandicoot (1, 2, 3, 4)</li><li>Cuphead</li><li>Darkwing Duck</li><li>Donkey Kong Country</li><li>Duck Hunt</li><li>DuckTales 2</li><li>Earthworm Jim 2</li><li>Felix the Cat</li><li>Hollow Knight</li><li>Hollow Knight: SilkSong</li><li>Journey</li><li>Jungle Book</li><li>It Takes Two</li><li>Kena: Bridge of Spirits</li><li>Kirby's Dream Land</li><li>Little Big Adventure</li><li>Ori (Blind Forest, Will of the Wisps)</li><li>Pokémon(Violet)</li><li>Ratchet & Clank (PS4, Rift Apart)</li><li>Rayman (+ Raving Rabbids)</li><li>The Simpsons Hit & Run</li><li>Spyro the Dragon (1, 2, 3)</li><li>Stray</li><li>Super Mario Bros. (3, Wonder)</li><li>TMNT (1990, IV)</li><li>The Legend of Zelda: Breath of the Wild</li><li>Tiny Toon Adventures</li><li>Tunic</li>
                </ul>

                <h4 class="journal-h4">5. Sport, Races, Fightings</h4>
                <ul class="cv-list">
                    <li>2XKO</li><li>Burnout Paradise</li><li>Carmageddon</li><li>Colin McRae Rally 2.0</li><li>CTR</li><li>Cars3</li><li>Destruction Derby</li><li>FlatOut (1, 2)</li><li>Forza Horizon 5</li><li>Hot Wheels Unleashed 1,2</li><li>Gran Turismo 3,7</li><li>Injustice</li><li>Killer Instinct</li><li>Mortal Kombat (I, II, 3, 9, X, 1)</li><li>Need for Speed (III, Underground 1,2, Most Wanted)</li><li>Onrush</li><li>Rocket League</li><li>Street Fighter II</li><li>Tekken (3,7)</li><li>Test Drive Unlimited</li><li>Tony Hawk's</li><li>TrackMania</li><li>Twisted Metal (3, 4)</li><li>Wave Race 64</li><li>Wipeout</li>
                </ul>

                <h4 class="journal-h4">6. Adventure, Horror, etc</h4>
                <ul class="cv-list">
                    <li>Animal Crossing: New Horizons</li><li>Beat Saber</li><li>Brothers: A Tale of Two Sons</li><li>Century: Age of Ashes</li><li>Firewatch</li><li>Harry Potter and the Philosopher's Stone</li><li>Inside</li><li>King's Bounty 1,2</li><li>Lemmings</li><li>Limbo</li><li>Machinarium</li><li>Myst</li><li>Kula World</li><li>Orcs Must Die! 1,2,3</li><li>Plants vs. Zombies 1,2</li><li>RoboCop</li><li>Solitaire</li><li>Sims4</li><li>Spore</li><li>Stardew Valley</li><li>Star Fox</li><li>Subnautica</li><li>Super Meat Boy</li><li>Super Smash Bros. Ultimate</li><li>Syberia 1,2</li><li>The Witness</li><li>This War of Mine</li><li>Trine 1,2,3,4</li><li>Unravel 1,2</li><li>Undertale</li><li>Until Dawn</li><li>World of Goo</li><li>Worms</li>
                </ul>
            </div>
`,
'artist_path': `
            <div class="journal-entry-wrap">
                <h3 class="journal-h3" style="color: #a3cbf5;">/// ARTIST PATH</h3>
                <p class="journal-note" style="border-color: #a3cbf5; color: #a3cbf5;">[ ACCESS DENIED ] DATA ENCRYPTED / DECRYPTION KEY MISSING</p>
                <p style="color: #ccc; font-size: 16px; line-height: 1.6;">
                    This section contains a personal story, notes on skill development, and reasons for choosing the ‘3D Character Artist’ class..
                    <br><br>
                    <span style="color: #888;">Currently, the data is encrypted and unavailable for public reading. The process of defragmenting memories is ongoing... Perhaps decryption will occur in future system patches.</span>
                </p>
            </div>
        `
    };

const journalScreen = document.getElementById('journal-screen');
    const journalSlots = document.querySelectorAll('.journal-slot');
    const journalContent = document.getElementById('journal-content');
    const btnJournalBack = document.getElementById('btn-journal-back');

    journalSlots.forEach(slot => {
        
        // 1. ЛОГІКА ДЛЯ КОМП'ЮТЕРА (ПЕРЕМИКАННЯ ПРИ НАВЕДЕННІ)
        slot.addEventListener('mouseenter', () => {
            if (!isMobile()) {
                if (slot.classList.contains('selected')) return;
                
                journalSlots.forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
                safePlay('snd-hover');
                
                if (journalContent) {
                    journalContent.innerHTML = journalData[slot.dataset.id] || '<div class="vp-placeholder">NO DATA</div>';
                    journalContent.scrollTop = 0;
                }
            }
        });

        // 2. ЛОГІКА ДЛЯ ТЕЛЕФОНУ (ВІДКРИТТЯ ПРИ КЛІКУ)
        slot.addEventListener('click', () => {
            // На комп'ютері клік ігноруємо, бо все вже зробив ховер
            if (!isMobile()) return; 

            journalSlots.forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            safePlay('snd-select');
            
            if (journalContent) {
                journalContent.innerHTML = journalData[slot.dataset.id] || '<div class="vp-placeholder">NO DATA</div>';
                journalContent.scrollTop = 0;
            }

            // Мобільна логіка: Ховаємо ліве меню, показуємо текст
            if(isMobile() && journalScreen) {
                history.pushState({ screen: 'mobile-journal-view' }, '', '');
                const jSidebar = journalScreen.querySelector('.gallery-sidebar');
                const jViewport = journalScreen.querySelector('.gallery-viewport');
                
                if(jSidebar) jSidebar.style.display = 'none';
                if(jViewport) {
                    jViewport.style.display = 'flex';
                    jViewport.classList.add('active-screen');
                }
            }
        });
    });

// Автоматично завантажуємо ARTIST PATH при відкритті сторінки
    if(journalContent && journalData['artist_path']) {
        journalContent.innerHTML = journalData['artist_path'];
    }

// Кнопка НАЗАД для мобільної версії Журналу
    if(btnJournalBack) {
        btnJournalBack.addEventListener('click', () => {
            history.back(); // <--- ДОДАЙ ЦЕЙ РЯДОК
            const jSidebar = journalScreen.querySelector('.gallery-sidebar');
            const jViewport = journalScreen.querySelector('.gallery-viewport');
            if(jViewport) { jViewport.classList.remove('active-screen'); jViewport.style.display = 'none'; }
            if(jSidebar) jSidebar.style.display = 'flex';
            safePlay('snd-select');
        });
    }

/* ============================================================
   === SHOP DATA (PREVIEW PRODUCT) ===
   ------------------------------------------------------------
   Кожен ключ ('doladu', 'psscript'...) має збігатись з data-id
   картки товару в index.html (<div class="shop-item" data-id="...">).

   ЩО МОЖНА РЕДАГУВАТИ:
   badge   — квадратик зліва вгорі. Або 2-3 літери ('PS', 'ART', 'ZB'),
             або картинка: '<img src="assets/твій_логотип.png" alt="NAME">'.
   badgeTone — 'green' / 'dim' міняє колір рамки квадратика (не обов'язково).
   title   — назва товару великими літерами.
   sub     — підзаголовок під назвою.
   status  — плашка справа: {text: 'AVAILABLE', tone: 'ok'|'warn'|'off'}
   tags    — маленькі теги (масив рядків). Можна лишити [].
   images  — МАСИВ КАРТИНОК. Клади файли в assets/images/shop/
             і пиши сюди назви: ['doladu_01.jpg', 'doladu_02.jpg'].
             Якщо масив порожній — покажеться рамка "NO PREVIEW IMAGES".
             Клік по картинці відкриває її на весь екран (лайтбокс).
   desc    — опис товару (звичайний HTML: <p>, <ul><li>, <strong>).
   specs   — таблиця характеристик: [['НАЗВА', 'ЗНАЧЕННЯ'], ...] або [].
   price   — рядок під кнопкою. Можна ''.
   link    — посилання на купівлю. Якщо '' — кнопка буде неактивна.
   btn     — текст кнопки.
   tone    — 'gold' (звичайний), 'green' (комісія), 'dead' (закрито).
   ============================================================ */
    const IMG_SHOP_PATH = 'assets/images/shop/';

    const shopData = {
        'doladu': {
            badge: '<img src="assets/doladu_256.png" alt="DOLADU">',
            title: 'DOLADU',
            sub: 'Software for 3D Pipeline and QA',
            status: { text: 'AVAILABLE', tone: 'ok' },
            tags: ['DESKTOP APP', 'WINDOWS', 'WORKS OFFLINE', 'NO TELEMETRY'],
            images: [],
            desc: `
                <p class="sp-lead">It saves you hours on every project — and your hours are your money.</p>
                <p>A single control center for a 3D project. <strong>DOLADU</strong> ("to put things in order") scans an entire project in one pass, tells you what is broken, and gives you a button to fix it — instead of opening files one by one and hoping.</p>
                <p>Every mistake caught before delivery is a revision you don't do for free, a re-export you don't run at midnight, and a client email you never have to write.</p>
                <p class="sp-section">/// ONE PROJECT AUDIT</p>
                <p>One scan → <strong>10 checks</strong> → a <strong>0–100 delivery score</strong> with a verdict: READY / MINOR ISSUES / NEEDS WORK / BLOCKED. Every finding in the report has its own repair button for that exact file. The scan is cached, so every other tool runs off it instantly.</p>
                <p class="sp-section">/// WHAT'S INSIDE</p>
                <ul>
                    <li><strong>Inspector</strong> — poly count vs. budget, n-gons, open edges, winding consistency, pivot &amp; axis checks, units and bounds, OBJ/FBX metadata, plus one-click fixes (Set Pivot, Fix Axis, Flip Green Channel).</li>
                    <li><strong>3D Viewer</strong> — real-time viewer with SOLID / X-RAY / HIDDEN modes, texel density heatmap, 2D UV layout with UDIM grid and overlap audit, skeletal animation and morph targets.</li>
                    <li><strong>Texture &amp; Mesh analysis</strong> — broken values, gamma, clipped blacks and whites; auto-adaptation of models between engines (orientation, scale, cm/m).</li>
                    <li><strong>Project Tools</strong> — batch renaming to Unreal naming conventions (prefixes, texture suffixes), duplicate and heavy-file finder.</li>
                    <li><strong>LookDev &amp; VFX</strong> — color and EXR analysis, HDRI hotspot finder, motion blur and depth-of-field calculators, color space / LUT checker, sequence gap finder, Copy-as-Python snippets.</li>
                    <li><strong>Moodboard &amp; Project Health</strong> — reference board with automatic palette extraction, plus a visual metrics board for the whole project.</li>
                    <li><strong>Dashboard</strong> — tasks, deadlines, progress and time tracking across <strong>16 DCC apps</strong>, with day / week / month statistics.</li>
                    <li><strong>Team contract</strong> — one <strong>pipeline.json</strong> defines prefixes, poly budgets, required maps and texel density targets. The GUI and the headless CLI validate against the same file, so lead's rules survive all the way into CI.</li>
                    <li><strong>Safety</strong> — every tool that writes to disk is journaled, and the Undo Center explains in plain words what a rollback will restore.</li>
                </ul>
                <p>Runs fully offline. No account, no cloud, no telemetry.</p>
            `,
            specs: [
                ['TOOL ACTIONS', '161'],
                ['WORK TABS', '9 (+ FAVORITES)'],
                ['SUPPORTED FORMATS', '32'],
                ['TEXTURE SUFFIX RULES', '162'],
                ['DCC APPS MONITORED', '16'],
                ['CACHED TOOL RUNTIME', '2.86 s → 0.06 s'],
                ['WHAT IT BUYS YOU', 'HOURS BACK, EVERY PROJECT'],
                ['ROLE', 'PRODUCT OWNER / ARCHITECT / QA']
            ],
            price: 'PRICING <span>— SEE STORE PAGE</span>',
            link: 'https://doladu.lemonsqueezy.com/',
            btn: '[ OPEN STORE ↗ ]',
            tone: 'gold'
        },

        'psscript': {
            badge: 'PS',
            title: 'ULTRA POST-PROCESS PS SCRIPT',
            sub: 'Photoshop automation for render post-production',
            status: { text: 'AVAILABLE', tone: 'ok' },
            tags: ['PHOTOSHOP', 'SCRIPT', 'RENDER POST'],
            images: [],
            desc: `
                <p>My own post-production pipeline, formalized and turned into a script. It takes a raw render to a <strong>cinematic look in about 5 minutes</strong> instead of an hour of repeating the same manual passes.</p>
                <p>Built the same way I build everything: I did the work by hand long enough to know exactly which steps repeat, then removed the repetition.</p>
                <p class="sp-section">/// WHAT IT DOES</p>
                <ul>
                    <li>Sets up the full post-processing stack in one run — no rebuilding layers from scratch on every shot.</li>
                    <li>Keeps the result editable: adjustment layers, not baked pixels.</li>
                    <li>Consistent look across a whole series of renders — the same treatment every time.</li>
                    <li>Works as a starting point you can push further, not a one-button filter.</li>
                </ul>
            `,
            specs: [
                ['SOFTWARE', 'ADOBE PHOTOSHOP'],
                ['TIME PER RENDER', '~5 MIN'],
                ['DELIVERY', 'BUY ME A COFFEE']
            ],
            price: 'SUPPORT PRICE <span>— SEE BMC PAGE</span>',
            link: 'https://buymeacoffee.com/fr0kuc14dn/e/553396',
            btn: '[ BUY ON BMC ↗ ]',
            tone: 'gold'
        },

        'commission': {
            badge: 'ART',
            badgeTone: 'green',
            title: 'COMMISSION: CHARACTER ART',
            sub: 'Full pipeline, concept to final render',
            status: { text: 'SLOTS OPEN', tone: 'ok' },
            tags: ['CHARACTERS', 'CREATURES', 'GAME-READY', 'CINEMATIC'],
            images: [],
            desc: `
                <p>Characters and creatures, realistic or stylized, taken through the whole pipeline: <strong>concept → high poly → retopology → UV → baking → texturing → lookdev → render or engine integration</strong>.</p>
                <p class="sp-section">/// WHAT YOU GET</p>
                <ul>
                    <li>Clean, hand-made retopology and UV/UDIM layout — built to your poly budget, not to whatever the decimator produced.</li>
                    <li>PBR texturing in Substance Painter, hand-painted when the style calls for it.</li>
                    <li>Cloth and garments in Marvelous Designer — backed by 11 years of real textile production, so the fabric behaves like fabric.</li>
                    <li>Grooming in XGen, lookdev in Arnold or Marmoset, or a ready-to-drop asset for Unreal Engine 5.</li>
                    <li>Turntables, breakdowns and presentation edits if you need them for a pitch.</li>
                    <li>3D print preparation for physical production.</li>
                </ul>
                <p>Clear communication, deadlines respected, and a warning about a risk <strong>before</strong> it becomes your problem — not after.</p>
            `,
            specs: [
                ['SPECIALIZATION', 'CHARACTERS / CREATURES'],
                ['STACK', 'ZBRUSH · MAYA · SUBSTANCE · MD'],
                ['DELIVERY', 'GAME-READY OR CINEMATIC'],
                ['STATUS', 'AVAILABLE FOR HIRE']
            ],
            price: 'QUOTE <span>— AFTER A SHORT BRIEF</span>',
            link: '',
            btn: '[ SEND A BRIEF ]',
            tone: 'green'
        },

        'brushes': {
            badge: 'ZB',
            badgeTone: 'dim',
            title: 'ZBRUSH SKIN BRUSHES KIT',
            sub: 'Custom brushes for realistic skin detailing',
            status: { text: 'TEMPORARY CLOSED', tone: 'off' },
            tags: ['ZBRUSH', 'ALPHAS', 'VDM'],
            images: [],
            desc: `
                <p>The set of brushes and alphas I use for skin pores, wrinkles and micro-detail on my own characters — collected over years of sculpting and still being cleaned up for release.</p>
                <p class="sp-note" style="color:#888;">This module is offline. The kit is being assembled and documented before it goes on sale.</p>
            `,
            specs: [
                ['SOFTWARE', 'ZBRUSH'],
                ['STATUS', 'IN PREPARATION']
            ],
            price: '',
            link: '',
            btn: '[ TEMPORARY CLOSED ]',
            tone: 'dead'
        },

        'basemesh': {
            badge: 'BM',
            badgeTone: 'dim',
            title: 'ANATOMY BASEMESH (M/F)',
            sub: 'Optimized topology for production characters',
            status: { text: 'TEMPORARY CLOSED', tone: 'off' },
            tags: ['BASEMESH', 'ANATOMY', 'RETOPO'],
            images: [],
            desc: `
                <p>Male and female base meshes with production-ready topology — correct edge flow for deformation, clean UVs, and a scale that survives the trip between ZBrush, Maya and Unreal.</p>
                <p class="sp-note" style="color:#888;">This module is offline. The meshes are being finalized and tested before release.</p>
            `,
            specs: [
                ['FORMATS', 'PLANNED: OBJ / FBX / ZTL'],
                ['STATUS', 'IN PREPARATION']
            ],
            price: '',
            link: '',
            btn: '[ TEMPORARY CLOSED ]',
            tone: 'dead'
        }
    };

    // === SHOP: РЕНДЕР ВІКНА PREVIEW PRODUCT ===
    function renderShopPreview(id) {
        const item = shopData[id];
        if (!item) return '<div class="vp-placeholder">NO DATA</div>';

        const badgeCls = item.badgeTone ? ` ${item.badgeTone}` : '';
        const statusTone = (item.status && item.status.tone) ? item.status.tone : 'warn';
        const statusHtml = item.status ? `<div class="sp-status ${statusTone}">${item.status.text}</div>` : '';

        const tagsHtml = (item.tags && item.tags.length)
            ? `<div class="sp-tags">${item.tags.map(t => `<span class="sp-tag">${t}</span>`).join('')}</div>`
            : '';

        const imgsHtml = (item.images && item.images.length)
            ? `<div class="sp-gallery">${item.images.map(f => `<img src="${IMG_SHOP_PATH}${f}" alt="${item.title}" loading="lazy">`).join('')}</div>`
            : `<div class="sp-noimg">// NO PREVIEW IMAGES ATTACHED //</div>`;

        const specsHtml = (item.specs && item.specs.length)
            ? `<p class="sp-section">/// SPECS</p><table class="sp-specs">${item.specs.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>`
            : '';

        const toneCls = item.tone === 'green' ? ' green' : (item.tone === 'dead' ? ' dead' : '');
        const btnHtml = item.link
            ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer" class="sp-buy${toneCls}" data-shop-id="${id}">${item.btn}</a>`
            : `<div class="sp-buy${toneCls}" data-shop-id="${id}">${item.btn}</div>`;
        const priceHtml = item.price ? `<div class="sp-price">${item.price}</div>` : '';

        return `
            <div class="shop-preview-wrap">
                <div class="sp-head">
                    <div class="sp-badge${badgeCls}">${item.badge}</div>
                    <div class="sp-titles">
                        <div class="sp-title">${item.title}</div>
                        <div class="sp-sub">${item.sub}</div>
                    </div>
                    ${statusHtml}
                </div>
                ${tagsHtml}
                ${imgsHtml}
                <div class="sp-desc">${item.desc}</div>
                ${specsHtml}
                <div class="sp-actions">${btnHtml}${priceHtml}</div>
            </div>
        `;
    }

    const shopScreen = document.getElementById('shop-screen');
    const shopItems = document.querySelectorAll('.shop-item');
    const shopPreview = document.getElementById('shop-preview');
    const btnShopBack = document.getElementById('btn-shop-back');

    function loadShopItem(slot) {
        if (!shopPreview) return;
        shopItems.forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
        shopPreview.innerHTML = renderShopPreview(slot.dataset.id);
        shopPreview.scrollTop = 0;
    }

    shopItems.forEach(slot => {
        // ДЕСКТОП: наведення миші перемикає прев'ю (як у Журналі)
        slot.addEventListener('mouseenter', () => {
            if (isMobile()) return;
            if (slot.classList.contains('selected')) return;
            safePlay('snd-hover');
            loadShopItem(slot);
        });

        // МОБІЛЬНИЙ: клік відкриває прев'ю на весь екран
        slot.addEventListener('click', (e) => {
            // Клік саме по кнопці купівлі не має відкривати прев'ю
            if (e.target.closest('.shop-btn')) return;
            // На десктопі все вже зробив ховер
            if (!isMobile() && slot.classList.contains('selected')) return;

            safePlay('snd-select');
            loadShopItem(slot);

            if (isMobile() && shopScreen) {
                history.pushState({ screen: 'mobile-shop-view' }, '', '');
                const sSidebar = shopScreen.querySelector('.gallery-sidebar');
                const sViewport = shopScreen.querySelector('.gallery-viewport');
                if (sSidebar) sSidebar.style.display = 'none';
                if (sViewport) {
                    sViewport.style.display = 'flex';
                    sViewport.classList.add('active-screen');
                }
            }
        });
    });

    // Стартовий товар у вікні прев'ю
    if (shopPreview && shopData['doladu']) {
        shopPreview.innerHTML = renderShopPreview('doladu');
    }

    // Кнопка НАЗАД для мобільної версії Магазину
    if (btnShopBack) {
        btnShopBack.addEventListener('click', () => {
            history.back();
            const sSidebar = shopScreen.querySelector('.gallery-sidebar');
            const sViewport = shopScreen.querySelector('.gallery-viewport');
            if (sViewport) { sViewport.classList.remove('active-screen'); sViewport.style.display = 'none'; }
            if (sSidebar) sSidebar.style.display = 'flex';
            safePlay('snd-select');
        });
    }

    // Клік по зображенню товару → лайтбокс
    if (shopPreview) {
        shopPreview.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG' && lightbox && lightboxImg) {
                resetLbZoom();
                lightboxImg.src = e.target.src;
                lightbox.classList.add('active');
                safePlay('snd-select');
                history.pushState({ screen: 'lightbox' }, '', '');
            }
        });
    }


    function loadImages(id) {
        checkExplorer(id);
        if(!vpContent) return;

        // Назва проєкту для alt-тексту (data-original — бо заголовок Queen
        // періодично «розсипається» анімацією scrambleText)
        const titleEl = document.querySelector(`.project-slot[data-id="${id}"] .p-title`);
        const projectName = titleEl
            ? (titleEl.getAttribute('data-original') || titleEl.textContent).trim()
            : id;

        vpContent.style.scrollBehavior = 'auto'; 
        vpContent.scrollTop = 0;                 
        vpContent.style.scrollBehavior = '';     
        vpContent.innerHTML = '';

        if(projectData[id]) {
            projectData[id].forEach((item, index) => {
                if (item.startsWith('youtube:')) {
                    const videoId = item.split(':')[1];
                    const iframe = document.createElement('iframe');
                    if (index >= 4) iframe.setAttribute('loading', 'lazy');
                    iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0&fs=1&playsinline=1`;
                    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen');
                    iframe.setAttribute('allowfullscreen', 'true');
                    iframe.setAttribute('webkitallowfullscreen', 'true');
                    iframe.setAttribute('mozallowfullscreen', 'true');
                    vpContent.appendChild(iframe);
                } else {
                    let fileName = item;
                    let hasAlt = false;

                    if (item.includes('|alt')) {
                        hasAlt = true;
                        fileName = item.replace('|alt', ''); 
                    }

                    const wrapper = document.createElement('div');
                    wrapper.className = 'img-wrapper'; 
                    let mediaEl;

                    if (fileName.endsWith('.mp4')) {
                        mediaEl = document.createElement('video');
                        mediaEl.src = `assets/images/${fileName}`;
                        mediaEl.controls = true; mediaEl.loop = true; mediaEl.muted = true;
                        mediaEl.setAttribute('aria-label', `${projectName} — turntable, 3D art by Dima Pysartsev`);
                        wrapper.appendChild(mediaEl);
                    } else {
                        wrapper.classList.add('skeleton-loader'); 
mediaEl = document.createElement('img');
                        /* ПОВНІСТЮ ВИМИКАЄМО LAZY LOADING: всі картинки вантажаться одразу */
                        mediaEl.decoding = "async"; /* Залишаємо асинхронність, щоб не вішати інтерфейс */
                        
                        mediaEl.style.opacity = '0'; 
                        mediaEl.style.transition = 'opacity 0.3s ease';
                        
                        
                        mediaEl.onload = function() {
                            wrapper.classList.remove('skeleton-loader'); 
                            this.style.opacity = '1'; 
                        };
                        mediaEl.onerror = function() { this.style.display = 'none'; wrapper.style.display = 'none'; };
                        
                        mediaEl.alt = `${projectName} — 3D character art by Dima Pysartsev`;
                        mediaEl.src = `assets/images/${fileName}`;
                        wrapper.appendChild(mediaEl);
                    }

                    if (hasAlt) {
                        const altBtn = document.createElement('div');
                        altBtn.className = 'alt-toggle-btn'; 
                        const iconMesh = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 20 2 20"></polygon><line x1="12" y1="2" x2="12" y2="20"></line><line x1="22" y1="20" x2="12" y2="12"></line><line x1="2" y1="20" x2="12" y2="12"></line></svg>`;
                        const iconRender = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 20 2 20"></polygon></svg>`;
                        
                        altBtn.innerHTML = iconMesh; 
                        let showingAlt = false;
                        const extIdx = fileName.lastIndexOf('.');
                        const altSrc = `assets/images/` + fileName.substring(0, extIdx) + '_alt' + fileName.substring(extIdx);
                        const baseSrc = mediaEl.src;
mediaEl.dataset.baseSrc = baseSrc;
mediaEl.dataset.altSrc = altSrc;

                        altBtn.addEventListener('click', (e) => {
                            e.stopPropagation(); 
                            showingAlt = !showingAlt;
                            mediaEl.src = showingAlt ? altSrc : baseSrc;
                            if (fileName.endsWith('.mp4')) mediaEl.play().catch(()=>{}); 
                            altBtn.innerHTML = showingAlt ? iconRender : iconMesh;
                            safePlay('snd-hover');
                        });
                        
                        altBtn.addEventListener('mouseenter', () => document.body.classList.add('hovered'));
                        altBtn.addEventListener('mouseleave', () => document.body.classList.remove('hovered'));
                        wrapper.appendChild(altBtn);
                    }
                    vpContent.appendChild(wrapper);
                }
            });
        } else {
            vpContent.innerHTML = '<div class="vp-placeholder">NO DATA FOUND (WIP)</div>';
        }
    }





    // === INTERACTION (HOVER INTENT / DEBOUNCE 3D) ===

    // Фікс: після повернення у вкладку скидаємо is-tilted якщо залишився
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            projectSlots.forEach(slot => {
                slot.classList.remove('is-tilted');
                slot.style.transform = '';
            });
        }
    });

    projectSlots.forEach(slot => {
        let hoverTimer = null; // Індивідуальний таймер для кожної картки

        slot.addEventListener('click', () => {
if (slot.classList.contains('journal-slot')) return; // <--- ДОДАЙ ЦЕЙ РЯДОК
            if(!isMobile() && slot.classList.contains('selected')) return; 
            projectSlots.forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            safePlay('snd-select');
            loadImages(slot.dataset.id);
            if(isMobile()) {
                history.pushState({ screen: 'mobile-project-view' }, '', '');
                if(sidebar) sidebar.style.display = 'none';
                if(viewport) {
                    viewport.style.display = 'flex';
                    viewport.classList.add('active-screen');
                }
                if(vpContent) vpContent.scrollTop = 0;
            }
        });

        // === 3D ЗАТРИМКА (DEBOUNCE) ===
        slot.addEventListener('mousemove', (e) => {
            if (isMobile()) return; 
            
            // Скидаємо таймер при кожному русі мишки.
            if (hoverTimer) clearTimeout(hoverTimer);

            hoverTimer = setTimeout(() => {
                const rect = slot.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const pctFromCenter = (e.clientX - centerX) / (rect.width / 2); 
                
                let rotateY = 0;
                
                // Твої ідеальні зони: 10% (2°) / 15% (1°) / 50% (0) / 15% (1°) / 10% (2°)
                if (pctFromCenter < -0.8) rotateY = -2;
                else if (pctFromCenter >= -0.8 && pctFromCenter < -0.5) rotateY = -1;
                else if (pctFromCenter >= -0.5 && pctFromCenter <= 0.5) rotateY = 0;
                else if (pctFromCenter > 0.5 && pctFromCenter <= 0.8) rotateY = 1;
                else if (pctFromCenter > 0.8) rotateY = 2;

                slot.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)'; 
// ДОДАНО: Зберігаємо зсув вправо (translateX 10px), щоб картка не обрізалась ліворуч
slot.style.transform = `perspective(1000px) translateX(10px) rotateX(0deg) rotateY(${rotateY}deg)`;
if (rotateY !== 0) {
    slot.classList.add('is-tilted');
} else {
    slot.classList.remove('is-tilted');
}
            }, 300); // 300мс зупинки курсора
        });

        slot.addEventListener('mouseleave', () => {
            if (isMobile()) return;
            if (hoverTimer) clearTimeout(hoverTimer); // Вбиваємо таймер
            slot.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'; 
            slot.style.transform = '';
slot.classList.remove('is-tilted'); 
        });

        slot.addEventListener('mouseenter', () => {
if (slot.classList.contains('journal-slot')) return; // <--- І ДОДАЙ СЮДИ ТАКОЖ
            if(!isMobile()) {
                if(slot.classList.contains('selected')) return; 
                projectSlots.forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
                safePlay('snd-hover');
                loadImages(slot.dataset.id);
            }
        });
    });

// === ACHIEVEMENTS ===
    let viewedProjects = new Set();
    let explorerUnlocked = false;
    let munchkinUnlocked = false;
    let supporterUnlocked = false;
    let cheaterUnlocked = false; 
    let talentUnlocked = false;
    let journeyUnlocked = false;
    let hackerUnlocked = false;

    // === ЗБЕРЕЖЕННЯ ПРОГРЕСУ МІЖ СЕСІЯМИ ===
    // Ачівки і переглянуті проєкти лежать у localStorage, тож оновлення
    // сторінки більше не обнуляє зібране. Якщо браузер блокує дані сайтів —
    // safeStorage* просто нічого не збереже, і все працює як раніше.
    const ACH_KEY = 'dp_progress';
    const ACH_SLOTS = {
        explorer: 'ach-explorer', journey: 'ach-journey', supporter: 'ach-supporter',
        munchkin: 'ach-munchkin', cheater: 'ach-cheater', hacker: 'ach-hacker',
        talent: 'ach-talent'
    };

    function saveProgress() {
        safeStorageSet(ACH_KEY, JSON.stringify({
            explorer: explorerUnlocked, journey: journeyUnlocked, supporter: supporterUnlocked,
            munchkin: munchkinUnlocked, cheater: cheaterUnlocked, hacker: hackerUnlocked,
            talent: talentUnlocked, viewed: Array.from(viewedProjects)
        }));
    }

    function restoreProgress() {
        let saved;
        try { saved = JSON.parse(safeStorageGet(ACH_KEY)); } catch (e) { saved = null; }
        if (!saved || typeof saved !== 'object') return;

        explorerUnlocked  = !!saved.explorer;
        journeyUnlocked   = !!saved.journey;
        supporterUnlocked = !!saved.supporter;
        munchkinUnlocked  = !!saved.munchkin;
        cheaterUnlocked   = !!saved.cheater;
        hackerUnlocked    = !!saved.hacker;
        talentUnlocked    = !!saved.talent;
        if (Array.isArray(saved.viewed)) viewedProjects = new Set(saved.viewed);

        // Підсвічуємо іконки в панелі Options — тихо, без попапів
        Object.keys(ACH_SLOTS).forEach(key => {
            if (saved[key]) document.getElementById(ACH_SLOTS[key])?.classList.remove('locked');
        });
    }
    restoreProgress();

    // Відслідковуємо кліки по всіх посиланнях у розділі Credits (CV, ArtStation, LinkedIn)
    const creditLinks = document.querySelectorAll('#credits-screen a');
    creditLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (!talentUnlocked) {
                talentUnlocked = true;
                // Невелика затримка, щоб юзер встиг побачити ачівку перед переходом на іншу вкладку
                setTimeout(() => {
                    showAchievement("ACHIEVEMENT UNLOCKED", "FOUND A TALENT (Checked the artist's links)", "🤝");
                }, 500);
            }
        });
    });

function showAchievement(title, desc, icon) {
        if(achievementPopup) {
            const t = achievementPopup.querySelector('.ach-title');
            const d = achievementPopup.querySelector('.ach-desc');
            const i = achievementPopup.querySelector('.ach-icon');
            if(t) t.innerText = title; if(d) d.innerText = desc; if(i) i.innerText = icon;
            achievementPopup.classList.add('show');
            safePlay('snd-achievement');
            setTimeout(() => { achievementPopup.classList.remove('show'); }, 5000);
        }
        
// === РОЗБЛОКУВАННЯ СИЛУЕТУ В ПАНЕЛІ ===
        if (desc.includes("EXPLORER")) document.getElementById('ach-explorer')?.classList.remove('locked');
        if (desc.includes("NEW JOURNEY")) document.getElementById('ach-journey')?.classList.remove('locked');
        if (desc.includes("SUPPORTER")) document.getElementById('ach-supporter')?.classList.remove('locked');
        if (desc.includes("MUNCHKIN")) document.getElementById('ach-munchkin')?.classList.remove('locked');
        if (desc.includes("CHEATER")) document.getElementById('ach-cheater')?.classList.remove('locked');
        if (desc.includes("HACKER MAN")) document.getElementById('ach-hacker')?.classList.remove('locked');
        // ДОДАНО:
        if (desc.includes("FOUND A TALENT")) document.getElementById('ach-talent')?.classList.remove('locked');

        saveProgress();
    }
    
    function checkExplorer(id) {
        if(id && !viewedProjects.has(id)) {
            viewedProjects.add(id);
            if(viewedProjects.size >= 9 && !explorerUnlocked) {
                explorerUnlocked = true;
                showAchievement("ACHIEVEMENT UNLOCKED", "EXPLORER (Viewed all projects)", "🏆");
            } else {
                saveProgress(); // запам'ятовуємо частковий прогрес
            }
        }
    }

    // === MENU ===
    menuItems.forEach((item, index) => {
item.addEventListener('mouseenter', () => {
            if(inSubMenu) return;
            if(dlcBtn) dlcBtn.classList.remove('active-dlc');
            isDlcActive = false;
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentMenuIndex = index;
            safePlay('snd-hover');
            
            // === РАНДОМНИЙ CIPHER ТІЛЬКИ ДЛЯ GALLERY (20% шанс) ===
            if (item.id === 'btn-gallery' && Math.random() > 0.2) {
                scrambleText(item, 400); 
            }
        });
        item.addEventListener('click', () => {
            const target = item.dataset.target;
            const action = item.dataset.action;
            safePlay('snd-select');
            
            if(action === 'email') {
                if (isMobile()) {
                    safePlay('snd-gamestart'); 
                    if (!journeyUnlocked) { journeyUnlocked = true; showAchievement("ACHIEVEMENT UNLOCKED", "NEW JOURNEY (Started a new project)", "🚀"); }
                    setTimeout(() => { window.location.href = "mailto:DPysartsevArt@gmail.com"; }, 2000);
                } else if(emailPopup) emailPopup.style.display = 'flex';
            } else if (action === 'journal') { 
                safePlay('snd-hover');
                if (journalPopup) journalPopup.style.display = 'flex';
            } else if (target) {
                history.pushState({ screen: target }, '', `#${target.replace('-screen', '')}`);
                showScreen(target);
            }
        });
    });

    if(dlcBtn) {
        dlcBtn.addEventListener('mouseenter', () => {
            if(inSubMenu) return;
            menuItems.forEach(i => i.classList.remove('active'));
            dlcBtn.classList.add('active-dlc');
            isDlcActive = true;
            safePlay('snd-hover');
        });
        dlcBtn.addEventListener('click', () => { 
            safePlay('snd-select'); 
            history.pushState({ screen: 'dlc-screen' }, '', '#dlc');
            showScreen('dlc-screen'); 
        });
    }

    if(donateBtn) donateBtn.addEventListener('click', () => {
        if (!supporterUnlocked) { supporterUnlocked = true; showAchievement("ACHIEVEMENT UNLOCKED", "ARTIST SUPPORTER (Coffee bought)", "☕"); }
    });

// Кнопки магазину: і в списку зліва (.shop-btn), і у вікні PREVIEW (.sp-buy).
// Делегування, бо кнопки в прев'ю створюються скриптом на льоту.
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.shop-btn, .sp-buy');
    if (!btn) return;

    // Визначаємо товар: або по картці зліва, або по data-shop-id у прев'ю
    const card = btn.closest('.shop-item');
    const id = card ? card.dataset.id : btn.dataset.shopId;
    const isClosed = card ? card.classList.contains('inactive') : (shopData[id] && shopData[id].tone === 'dead');
    const isCommission = (id === 'commission');

    safePlay('snd-select');

    if (isClosed) {
        // Закритий товар → MUNCHKIN
        if(!munchkinUnlocked) { munchkinUnlocked = true; showAchievement("ACHIEVEMENT UNLOCKED", "MUNCHKIN (Tried to buy a closed item)", "🛒"); }
    } else if (isCommission) {
        // Комісія OPEN → пошта. На телефоні попап примусово схований у CSS
        // (#email-popup { display:none !important }), тому там кнопка була мертва —
        // відкриваємо поштовий клієнт напряму, як це робить "New Game".
        if (isMobile()) {
            window.location.href = "mailto:DPysartsevArt@gmail.com";
        } else if (emailPopup) {
            emailPopup.style.display = 'flex';
        }
    } else {
        // Реальний товар із посиланням → MUNCHKIN
        if(!munchkinUnlocked) { munchkinUnlocked = true; showAchievement("ACHIEVEMENT UNLOCKED", "MUNCHKIN (Visited the item store)", "🛒"); }
    }
});
    
    // POPUP LOGIC
    function closeEmailPopup() { if(emailPopup) emailPopup.style.display = 'none'; }
    if(btnEmailConfirm) btnEmailConfirm.addEventListener('click', () => {
        safePlay('snd-gamestart');
        if (!journeyUnlocked) { journeyUnlocked = true; showAchievement("ACHIEVEMENT UNLOCKED", "NEW JOURNEY (Started a new project)", "🚀"); }
        setTimeout(() => { window.location.href = "mailto:DPysartsevArt@gmail.com"; closeEmailPopup(); }, 2000);
    });
    if(btnEmailCancel) btnEmailCancel.addEventListener('click', () => { safePlay('snd-select'); closeEmailPopup(); });
    if(btnJournalClose) btnJournalClose.addEventListener('click', () => { safePlay('snd-select'); if(journalPopup) journalPopup.style.display = 'none'; });

    // === LIGHTBOX LOGIC ===
let lbScale = 1, lbPanX = 0, lbPanY = 0, lbDragging = false, lbWasDrag = false;
function applyLbTransform() {
    if (lightboxImg) lightboxImg.style.transform = `translate(${lbPanX}px, ${lbPanY}px) scale(${lbScale})`;
}
function resetLbZoom() { lbScale = 1; lbPanX = 0; lbPanY = 0; lbDragging = false; applyLbTransform(); }
function closeLightbox() {
        if(lightbox && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            safePlay('snd-select');
            resetLbZoom();
            setTimeout(() => { lightboxImg.src = ''; }, 300);
            // ДОДАНО: Якщо ми закрили хрестиком, стираємо "крок" з історії
            if(history.state && history.state.screen === 'lightbox') { history.back(); }
        }
    }

    if(lightbox) {
        // Клік по фону — закрити; по зображенню/після тягання — НЕ закривати
        lightbox.addEventListener('click', (e) => {
            if (lbWasDrag) { lbWasDrag = false; return; }
            if (e.target !== lightboxImg) closeLightbox();
        });
        // Зум колесом миші (1x–5x), у точку під курсором
        lightbox.addEventListener('wheel', (e) => {
            if (!lightbox.classList.contains('active')) return;
            e.preventDefault();
            const oldScale = lbScale;
            // вже на 1x і крутимо на зменшення → закрити (як ESC)
            if (e.deltaY > 0 && oldScale <= 1) { closeLightbox(); return; }
            let newScale = Math.min(5, Math.max(1, oldScale + (e.deltaY < 0 ? 0.2 : -0.2)));
            if (newScale === oldScale) return;
            // тримаємо точку під курсором на місці
            if (lightboxImg) {
                const rect = lightboxImg.getBoundingClientRect();
                const dx = e.clientX - (rect.left + rect.width / 2);
                const dy = e.clientY - (rect.top + rect.height / 2);
                const ratio = newScale / oldScale;
                lbPanX += dx * (1 - ratio);
                lbPanY += dy * (1 - ratio);
            }
            lbScale = newScale;
            if (lbScale <= 1) { lbPanX = 0; lbPanY = 0; }   // на 1x — у центр
            applyLbTransform();
            if (lightboxImg) lightboxImg.style.cursor = lbScale > 1 ? 'grab' : 'zoom-in';
        }, { passive: false });
        // DRAG-PAN: тягати збільшене зображення
        if (lightboxImg) {
            lightboxImg.addEventListener('mousedown', (e) => {
                if (lbScale <= 1) return;
                lbDragging = true;
                e.preventDefault();
                lightboxImg.style.cursor = 'grabbing';
                lightboxImg.style.transition = 'none';
            });
        }
        window.addEventListener('mousemove', (e) => {
            if (!lbDragging) return;
            lbPanX += e.movementX;
            lbPanY += e.movementY;
            applyLbTransform();
        });
        window.addEventListener('mouseup', () => {
            if (!lbDragging) return;
            lbDragging = false;
            lbWasDrag = true;   // щоб клік одразу після тягання не закрив
            if (lightboxImg) {
                lightboxImg.style.cursor = lbScale > 1 ? 'grab' : 'zoom-in';
                lightboxImg.style.transition = 'transform 0.12s ease-out';
            }
        });
        if(lightboxClose) {
            lightboxClose.addEventListener('mouseenter', () => document.body.classList.add('hovered'));
            lightboxClose.addEventListener('mouseleave', () => document.body.classList.remove('hovered'));
        }
    }

if(vpContent) {
        vpContent.addEventListener('click', (e) => {
            // Клік по зображенню → лайтбокс: по центру, на повну висоту, з блюр-фоном.
            // Далі зум колесом миші. (Alt-перемикач лишається на мініатюрі у Viewport.)
            if (e.target.tagName === 'IMG' && lightbox && lightboxImg) {
                resetLbZoom();
                lightboxImg.src = e.target.src;
                lightbox.classList.add('active');
                safePlay('snd-select');
                history.pushState({ screen: 'lightbox' }, '', '');
            }
        });
    }

    // KEYBOARD NAV
    document.addEventListener('keydown', (e) => {
       if(e.key === 'Escape') {
            if (lightbox && lightbox.classList.contains('active')) {
                closeLightbox(); 
            } else if (terminal && terminal.classList.contains('active')) {
                terminal.classList.remove('active');
                if(termInput) termInput.blur();
                safePlay('snd-hover');
            } else {
                goBack(); 
            }
        }
        if(!inSubMenu && (!emailPopup || emailPopup.style.display !== 'flex') && (!journalPopup || journalPopup.style.display !== 'flex')) {
            if(e.key === 'ArrowUp') {
                if(isDlcActive) { isDlcActive = false; dlcBtn.classList.remove('active-dlc'); currentMenuIndex = menuItems.length - 1; } 
                else { currentMenuIndex = (currentMenuIndex > 0) ? currentMenuIndex - 1 : 0; }
                updateVisuals(); safePlay('snd-hover');
            }
            if(e.key === 'ArrowDown') {
                if(!isDlcActive) { if(currentMenuIndex < menuItems.length - 1) currentMenuIndex++; else isDlcActive = true; }
                updateVisuals(); safePlay('snd-hover');
            }
            if(e.key === 'Enter') { if(isDlcActive) dlcBtn.click(); else menuItems[currentMenuIndex].click(); }
        }
// === KEYBOARD NAV В ГАЛЕРЕЇ / ЖУРНАЛІ ===
if (inSubMenu) {
    const activeScreen = document.querySelector('.screen.active-screen');
    if (!activeScreen) return;
    
const slots = Array.from(activeScreen.querySelectorAll('.project-slot, .journal-slot, .shop-item'));
    if (!slots.length) return;

    const currentSelected = activeScreen.querySelector('.project-slot.selected, .shop-item.selected');
    let idx = slots.indexOf(currentSelected);
    
if (e.key === 'ArrowUp') {
    e.preventDefault();
    idx = idx <= 0 ? slots.length - 1 : idx - 1;
    slots[idx].dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    slots[idx].click();
    slots[idx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    safePlay('snd-hover');
}
if (e.key === 'ArrowDown') {
    e.preventDefault();
    idx = idx >= slots.length - 1 ? 0 : idx + 1;
    slots[idx].dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    slots[idx].click();
    slots[idx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    safePlay('snd-hover');
}
    if (e.key === 'Enter' && currentSelected) {
        const img = activeScreen.querySelector('#viewport-content img, #viewport-content video');
        if (img) { img.click(); safePlay('snd-select'); }
    }
}
    });
    


    function updateVisuals() {
        menuItems.forEach(i => i.classList.remove('active'));
        if(dlcBtn) dlcBtn.classList.remove('active-dlc');
        if(isDlcActive) dlcBtn.classList.add('active-dlc'); else menuItems[currentMenuIndex].classList.add('active');
    }

    // === HUD WIDGET LOGIC ===
    const sysTimeEl = document.getElementById('sys-time');
    const sysMemEl = document.getElementById('sys-mem');
    if (sysTimeEl && sysMemEl) {
        setInterval(() => {
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            const ss = String(now.getSeconds()).padStart(2, '0');
            sysTimeEl.innerText = `${hh}:${mm}:${ss}`;

            if (Math.random() > 0.7) { 
                const mem = Math.floor(Math.random() * 9) + 38;
                sysMemEl.innerText = mem;
            }
        }, 1000);
    }

    // === TERMINAL EASTER EGG LOGIC ===
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Backquote') {
            e.preventDefault(); 
            if (terminal) {
                if (terminal.classList.contains('active')) {
                    terminal.classList.remove('active');
                    setFavicon(faviconDefault); 
                    if (termInput) termInput.blur();
                    safePlay('snd-hover');
                } else {
                    terminal.classList.add('active');
                    setFavicon(faviconTerminal); 
                    if (termInput) { termInput.value = ''; termInput.focus(); }
                    safePlay('snd-select');
                }
            }
        }
    });

    if (termInput) {
        termInput.addEventListener('keydown', (e) => {
            if (terminal.classList.contains('active')) e.stopPropagation();
            if (e.code === 'Backquote' || e.code === 'Escape') {
                e.preventDefault();
                terminal.classList.remove('active');
                termInput.blur();
                termInput.value = '';
                safePlay('snd-hover');
                return;
            }
            if (e.key === 'Enter' || e.code === 'NumpadEnter') {
                const cmd = termInput.value.trim().toLowerCase();
                termInput.value = ''; 
                if (cmd !== '') {
                    printToTerminal(`user@sys:~$ ${cmd}`, 'term-prompt');
                    processCommand(cmd);
                }
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (terminal && terminal.classList.contains('active') && !terminal.contains(e.target)) {
            terminal.classList.remove('active');
            if (termInput) termInput.blur();
            safePlay('snd-hover');
        }
    });

    function printToTerminal(text, className = '') {
        const div = document.createElement('div');
        div.className = `term-msg ${className}`;
        div.textContent = text;
        termOutput.appendChild(div);
        termOutput.scrollTop = termOutput.scrollHeight; 
    }

function processCommand(cmd) {
        // УЛЬТИМАТИВНА БАЗА ЧІТ-КОДІВ (Без пробілів для терміналу)
        const cheatCodes = [
            // Classic FPS (Doom, Quake, Half-Life)
            'god', 'godmode', 'noclip', 'iddqd', 'idkfa', 'idspispopd',
            // GTA Series (SA, VC, V)
            'hesoyam', 'baguvix', 'aezakmi', 'panzer', 'leavemealone', 'turtle', 'painkiller', 'catchme',
            // Strategies (Warcraft, Starcraft, Age of Empires)
            'greedisgood', 'showmethemoney', 'whosyourdaddy', 'thereisnospoon', 'poweroverwhelming', 'blacksheepwall', 'howdoyouturnthison', 'aegis',
            // Heroes of Might and Magic III
            'nwcwc', 'nwconlyamodel', 'nwcneo', 'nwczion', 'nwctrojanrabbit',
            // RPGs (Skyrim, Fallout)
            'tgm', 'tcl', 'psb',
            // The Sims & Culture
            'motherlode', 'rosebud', 'lumberjack', 'konami', 'konamicode'
        ];

        if (cheatCodes.includes(cmd)) {
            printToTerminal('>>> ILLEGAL CHEAT CODE DETECTED...', 'term-err');
            printToTerminal('God mode activated. (Just kidding, this is a portfolio).', 'term-sys');
            if (!cheaterUnlocked) {
                cheaterUnlocked = true;
                showAchievement("ACHIEVEMENT UNLOCKED", "CHEATER (Used a classic cheat code)", "👾");
                safePlay('snd-gamestart'); 
            }
            return; 
        }

        switch(cmd) {
case 'help':
    printToTerminal('AVAILABLE COMMANDS:', 'term-sys');
    printToTerminal('  whoami  — user profile');
    printToTerminal('  ls      — list directories');
    printToTerminal('  skills  — skill dump');
    printToTerminal('  cv      — open resume PDF');
    printToTerminal('  hire    — recruitment protocol');
    printToTerminal('  doladu  — own QA software specs');
    printToTerminal('  status  — system status');
    printToTerminal('  coffee  — emergency caffeine');
    printToTerminal('  clear   — wipe terminal');
    printToTerminal('  ***     — classic cheats ;)');
    break;
            case 'hire':
                printToTerminal('>>> EXECUTING RECRUITMENT PROTOCOL...', 'term-sys');
                printToTerminal('Opening secure communication channels...');
                setTimeout(() => {
                    terminal.classList.remove('active');
                    // На телефоні #email-popup схований через CSS — там одразу пошта
                    if (isMobile()) {
                        window.location.href = "mailto:DPysartsevArt@gmail.com";
                    } else if (emailPopup) {
                        emailPopup.style.display = 'flex';
                    }
                }, 1500);
                break;
            case 'coffee':
                printToTerminal('WARNING: CAFFEINE OVERLOAD DETECTED.', 'term-err');
                printToTerminal('System performance +50%. Applying Buff...');
                if (!hackerUnlocked) { hackerUnlocked = true; showAchievement("ACHIEVEMENT UNLOCKED", "HACKER MAN (Found the Terminal)", "💻"); }
                safePlay('snd-gamestart');
                break;
            case 'clear':
                termOutput.innerHTML = '<div>Type \'help\' for available commands.</div>';
                break;
case 'whoami':
    printToTerminal('> LOADING USER PROFILE...', 'term-sys');
    printToTerminal('NAME    : Dima Pysartsev');
    printToTerminal('CLASS   : 3D Character Artist');
    printToTerminal('LEVEL   : Mid | Senior');
    printToTerminal('STATUS  : AVAILABLE FOR HIRE');
    printToTerminal('LOCATED : France / Ukraine / Remote');
    printToTerminal('CONTACT : DPysartsevArt@gmail.com');
    break;
case 'ls':
case 'dir':
    printToTerminal('> SCANNING PROJECT DIRECTORY...', 'term-sys');
    printToTerminal('gallery/     journal/     shop/');
    printToTerminal('options/     credits/     dlc/');
    printToTerminal('[9 project files found]');
    break;
case 'skills':
    printToTerminal('> CORE SKILLS DUMP:', 'term-sys');
    printToTerminal('ZBrush [■■■■■] 100%  Maya [■■■■■] 90%');
    printToTerminal('UE5    [■■■■□] 80%   Sub3D [■■■■■] 90%');
    printToTerminal('Arnold [■■■■□] 85%   XGen [■■■□□] 75%');
    break;
case 'cv':
case 'resume':
    printToTerminal('> OPENING PERSONAL FILE...', 'term-sys');
    setTimeout(() => { window.open('assets/cv.pdf', '_blank'); }, 800);
    break;
case 'doladu':
    printToTerminal('> MOUNTING DOLADU SPEC SHEET...', 'term-sys');
    printToTerminal('PRODUCT   : DOLADU — QA & pipeline app for 3D artists');
    printToTerminal('TOOLS     : 161 actions / 9 tabs / 32 formats');
    printToTerminal('CODEBASE  : ~76,600 lines (Python + Qt + Babylon.js)');
    printToTerminal('CORE      : one cached scan → 10 checks → 0-100 score');
    printToTerminal('SPEED     : 2.86s → 0.06s per tool after cache');
    printToTerminal('PAYOFF    : saves hours on every project.', 'term-sys');
    printToTerminal('            your hours are your money.', 'term-sys');
    printToTerminal('ROLE      : product owner / architect / QA');
    printToTerminal('STORE     : doladu.lemonsqueezy.com');
    break;
case 'status':
    printToTerminal('> SYSTEM STATUS REPORT:', 'term-sys');
    printToTerminal(`SYS_TIME  : ${new Date().toLocaleTimeString()}`);
    printToTerminal(`CAFFEINE  : CRITICAL (12%)`);
    printToTerminal(`PROJECTS  : 9 ACTIVE`);
    printToTerminal(`MOOD      : READY TO BUILD`);
    break;
            default:
                printToTerminal(`Command not found: ${cmd}`, 'term-err');
                break;
        }
    }

// === KONAMI CODE ===
const konamiSequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];
let konamiIndex = 0;
document.addEventListener('keydown', (e) => {
    if (e.code === konamiSequence[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiSequence.length) {
            konamiIndex = 0;
            // Глітч-ефект на весь екран
            document.body.classList.add('glitch-transition');
            setTimeout(() => document.body.classList.remove('glitch-transition'), 400);
            // Показуємо термінал з секретним повідомленням
            if (terminal) {
                terminal.classList.add('active');
                if (termInput) termInput.focus();
                setTimeout(() => {
                    printToTerminal('>>> KONAMI CODE ACCEPTED <<<', 'term-err');
                    printToTerminal('Unlocking secret mode...', 'term-sys');
                    printToTerminal('Just kidding. But you are a true gamer. Respect.');
                    printToTerminal('Type "hire" if you want to work with one too ;)');
                }, 200);
            }
            if (!cheaterUnlocked) {
                cheaterUnlocked = true;
                showAchievement("ACHIEVEMENT UNLOCKED", "CHEATER (Used a classic cheat code)", "👾");
            }
            safePlay('snd-gamestart');
        }
    } else {
        konamiIndex = e.code === konamiSequence[0] ? 1 : 0;
    }
});

    // === AUDIO TOGGLE LOGIC ===
    if (audioToggle) {
        audioToggle.addEventListener('click', () => {
            isMuted = !isMuted; 
            safeStorageSet('dp_audio_muted', isMuted);
            
            if (isMuted) {
                audioToggle.innerText = "[ AUDIO : OFF ]";
                audioToggle.classList.add('muted');
            } else {
                audioToggle.innerText = "[ AUDIO : ON  ]";
                audioToggle.classList.remove('muted');
                safePlay('snd-select'); 
            }
        });
        audioToggle.addEventListener('mouseenter', () => document.body.classList.add('hovered'));
        audioToggle.addEventListener('mouseleave', () => document.body.classList.remove('hovered'));
    }

    // === VERTICAL SMART SNAP SCROLL LOGIC ===
    if (vpContent) {
        let isScrolling = false; 
        vpContent.addEventListener('wheel', (e) => {
            if (Math.abs(e.deltaY) > 0) {
                e.preventDefault(); 
                if (isScrolling) return; 
                isScrolling = true;

                const items = Array.from(vpContent.children).filter(child => 
                    child.classList.contains('img-wrapper') || 
                    child.tagName === 'VIDEO' || 
                    child.tagName === 'IFRAME' ||
                    child.classList.contains('vp-placeholder')
                );

                if (items.length === 0) { isScrolling = false; return; }

                const containerRect = vpContent.getBoundingClientRect();
                const containerCenter = containerRect.top + (containerRect.height / 2);

                let closestItem = items[0];
                let minDistance = Infinity;

                items.forEach(item => {
                    const rect = item.getBoundingClientRect();
                    const itemCenter = rect.top + (rect.height / 2);
                    const distance = Math.abs(itemCenter - containerCenter);
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestItem = item;
                    }
                });

                const currentIndex = items.indexOf(closestItem);
                let nextIndex = currentIndex + (e.deltaY > 0 ? 1 : -1);
                
                if (nextIndex < 0) nextIndex = 0;
                if (nextIndex >= items.length) nextIndex = items.length - 1;

                items[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                setTimeout(() => { isScrolling = false; }, 400); 
            }
        }, { passive: false });
    }
});