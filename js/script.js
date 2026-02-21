document.addEventListener('DOMContentLoaded', () => {
    
    // === HISTORY API ===
    history.replaceState({ screen: 'main-menu' }, '', '');
    window.addEventListener('popstate', (event) => {
        if (event.state) showScreen(event.state.screen); 
        else showScreen('main-menu');
    });

    // === ЗМІННІ ===
    const preloader = document.getElementById('gallery-preloader');
    const barFill = document.querySelector('.bar-fill');
    const pctText = document.querySelector('.loader-percentage');
    const loaderText = document.querySelector('.loader-text'); 
    const audioToggle = document.getElementById('audio-toggle');
    let isMuted = false;
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
    const shopBtns = document.querySelectorAll('.shop-btn');

    let currentMenuIndex = 0;
    let inSubMenu = false;
    let isDlcActive = false;

    // === SYSTEM BOOT (ЗАПУСК) ===
    function runSystemBoot() {
        if (!preloader) return;
        
        // Показуємо завантажувач
        preloader.classList.remove('hidden');
        preloader.style.display = 'flex';
        preloader.style.opacity = '1';
        
        if(loaderText) loaderText.innerText = "SYSTEM BOOT SEQUENCE...";
        
        let loadPct = 0;
        const interval = setInterval(() => {
            loadPct += Math.floor(Math.random() * 10) + 5; 
            if(loadPct > 100) loadPct = 100;
            
            if(barFill) barFill.style.width = `${loadPct}%`;
            if(pctText) pctText.textContent = `${loadPct}%`;
            
            if(loadPct === 100) {
                clearInterval(interval);
                if(loaderText) loaderText.innerText = "ACCESS GRANTED";
                
                setTimeout(() => {
                    preloader.style.transition = 'opacity 0.5s';
                    preloader.style.opacity = '0';
                    setTimeout(() => {
                        preloader.classList.add('hidden'); // Ховаємо остаточно
                        preloader.style.display = 'none';
                        preloader.style.opacity = '1'; // Скидаємо для наступного разу
                        
                        // Банер на мобільному
                        if (window.innerWidth <= 1000 && banner) {
                             banner.classList.add('active');
                        }
                    }, 500);
                }, 500);
            }
        }, 50);
    }
    
    // Запускаємо!
    runSystemBoot();

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

    // === BANNER ===
    if(closeBanner) {
        closeBanner.addEventListener('click', () => { 
            if(banner) banner.classList.remove('active'); 
            safePlay('snd-select'); 
        });
    }

    // === CURSOR ===
    let mouseX = 0, mouseY = 0, circleX = 0, circleY = 0;
    if (window.matchMedia("(min-width: 1000px)").matches) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX; mouseY = e.clientY;
            if(dot) { dot.style.left = `${mouseX}px`; dot.style.top = `${mouseY}px`; }
            const bg = document.getElementById('parallax-bg');
            if(bg) {
                const moveX = (window.innerWidth / 2 - mouseX) * 0.02; 
                const moveY = (window.innerHeight / 2 - mouseY) * 0.02;
                bg.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }
        });
        function animateCursor() {
            circleX += (mouseX - circleX) * 0.15; circleY += (mouseY - circleY) * 0.15;
            if(circle) { circle.style.left = `${circleX}px`; circle.style.top = `${circleY}px`; }
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
    }

    // === SOUNDS ===
  function safePlay(id) {
        if (isMuted) return; // ЯКЩО ЗВУК ВИМКНЕНО - ВИХОДИМО І НІЧОГО НЕ ГРАЄМО
        const audio = document.getElementById(id);
        if(audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
    }

    // === SCREEN LOGIC ===
    function showScreen(screenId) {
        if(screenId === 'gallery-screen' && !inSubMenu) {
            runGalleryPreloader(() => { activateScreen(screenId); });
        } else {
            activateScreen(screenId);
        }
    }

    function activateScreen(screenId) {
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
            setTimeout(() => target.classList.add('active-screen'), 10); 
        }
        
        inSubMenu = (screenId !== 'main-menu');
        
        if(screenId === 'gallery-screen' && window.innerWidth <= 1000) {
            if(sidebar) sidebar.style.display = 'flex';
            if(viewport) {
                viewport.style.display = 'none';
                viewport.classList.remove('active-screen');
            }
        }
    }

    function goBack() {
        if(emailPopup && emailPopup.style.display === 'flex') { closeEmailPopup(); return; }
        
        if(window.innerWidth <= 1000 && viewport && viewport.classList.contains('active-screen')) {
             viewport.classList.remove('active-screen');
             viewport.style.display = 'none';
             sidebar.style.display = 'flex';
             safePlay('snd-select');
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
            if(viewport) {
                viewport.classList.remove('active-screen');
                viewport.style.display = 'none';
            }
            if(sidebar) sidebar.style.display = 'flex';
            safePlay('snd-select');
        });
    }

    // === DATA & LOADING ===
    const projectData = {
        'wod': ['wod01.jpg', 'wod02.jpg', 'wod03.jpg', 'wod04.jpg', 'wod05.jpg', 'wod06.jpg', 'wod07.jpg', 'wod08.jpg', 'wod_demo.mp4'],
        'jinx': ['jinxr1.jpg', 'jinxr2.jpg', 'jinxr3.jpg', 'jinxr4.jpg', 'jinxr5.jpg'], 
        'sequoia': ['youtube:gPoXD8hg3P0', 'Sequoia01.jpg', 'Sequoia02.jpg', 'Sequoia03.jpg', 'Sequoia04.jpg', 'Sequoia05.jpg'],
        'mermaid': ['Marmeid01.jpg', 'Marmeid02.jpg'],
        'scifi': ['sf01.jpg', 'sf02.jpg', 'sf03.jpg', 'sf04.jpg', 'sf05.jpg', 'scifi_turntable.mp4'],
        'wolverine': ['Wolverine01.jpg', 'Wolverine02.jpg', 'Wolverine03.jpg', 'Wolverine04.jpg', 'Wolverine05.jpg', 'wolv_turntable.mp4'],
        'boy': ['boy1.jpg', 'boy2.jpg', 'boy3.jpg', 'boy4.jpg', 'boy5.jpg', 'boy6.jpg', 'boy7.jpg', 'boy8.jpg'],
        'queen': ['Queen1.jpg', 'Queen2.jpg', 'Queen3.jpg', 'Queen4.jpg', 'Queen5.jpg', 'Queen6.jpg', 'Queen7.jpg', 'Queen8.jpg', 'Queen9.jpg', 'Queen10.jpg'],
        'halloween': ['Halloween1.jpg', 'Halloween2.jpg']
    };

function loadImages(id) {
        checkExplorer(id);
        if(!vpContent) return;
        vpContent.innerHTML = '';
        if(projectData[id]) {
            projectData[id].forEach(item => {
                if (item.startsWith('youtube:')) {
                    const videoId = item.split(':')[1];
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://www.youtube.com/embed/${videoId}`;
                    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                    iframe.allowFullscreen = true;
                    vpContent.appendChild(iframe);
                } else if (item.endsWith('.mp4')) {
                    const v = document.createElement('video');
                    v.src = `assets/images/${item}`;
                    v.controls = true; v.loop = true; v.muted = true; 
                    vpContent.appendChild(v);
                } else {
                    // === ЛОГІКА ДЛЯ АЛЬТЕРНАТИВНИХ КАРТИНОК ===
                    let fileName = item;
                    let hasAlt = false;

                    // Якщо в масиві є позначка |alt
                    if (item.includes('|alt')) {
                        fileName = item.split('|')[0];
                        hasAlt = true;
                    }

                    const wrapper = document.createElement('div');
                    wrapper.className = 'img-wrapper';

                    const img = document.createElement('img');
                    img.src = `assets/images/${fileName}`;
                    img.onerror = function() { this.style.display = 'none'; wrapper.style.display = 'none'; };
                    wrapper.appendChild(img);

                    if (hasAlt) {
                        const altBtn = document.createElement('div');
                        altBtn.className = 'alt-toggle-btn';
                        altBtn.innerText = '[ VIEW MESH ]';
                        let showingAlt = false;

                        // Створюємо ім'я файлу з _alt (наприклад, file_alt.jpg)
                        const extIdx = fileName.lastIndexOf('.');
                        const altSrc = `assets/images/` + fileName.substring(0, extIdx) + '_alt' + fileName.substring(extIdx);
                        const baseSrc = img.src;

                        altBtn.addEventListener('click', (e) => {
                            e.stopPropagation(); // Щоб не відкривався Fullscreen по кліку на кнопку
                            showingAlt = !showingAlt;
                            img.src = showingAlt ? altSrc : baseSrc;
                            altBtn.innerText = showingAlt ? '[ VIEW RENDER ]' : '[ VIEW MESH ]';
                            safePlay('snd-hover');
                        });
                        
                        // Додаємо ховер для курсора
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

    // === INTERACTION ===
    projectSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            projectSlots.forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            safePlay('snd-select');
            loadImages(slot.dataset.id);
            if(window.innerWidth <= 1000) {
                if(sidebar) sidebar.style.display = 'none';
                if(viewport) {
                    viewport.style.display = 'flex';
                    viewport.classList.add('active-screen');
                }
                if(vpContent) vpContent.scrollTop = 0;
            }
        });
        slot.addEventListener('mouseenter', () => {
            if(window.innerWidth > 1000) {
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
    }
    
    function checkExplorer(id) {
        if(id && !viewedProjects.has(id)) {
            viewedProjects.add(id);
            if(viewedProjects.size === 9 && !explorerUnlocked) {
                explorerUnlocked = true;
                showAchievement("ACHIEVEMENT UNLOCKED", "EXPLORER (Viewed all projects)", "🏆");
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
        });
        item.addEventListener('click', () => {
            const target = item.dataset.target;
            const action = item.dataset.action;
            safePlay('snd-select');
            if(action === 'email') {
                if (window.innerWidth <= 1000) {
                    safePlay('snd-gamestart'); 
                    showAchievement("ACHIEVEMENT UNLOCKED", "NEW JOURNEY (Started a new project)", "🚀");
                    setTimeout(() => { window.location.href = "mailto:DPysartsevArt@gmail.com"; }, 2000);
                } else if(emailPopup) emailPopup.style.display = 'flex';
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

    shopBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.shop-item');
            if (item && !item.classList.contains('inactive')) {
                safePlay('snd-select');
                if(!munchkinUnlocked) { munchkinUnlocked = true; showAchievement("ACHIEVEMENT UNLOCKED", "MUNCHKIN (Bought a shop item)", "🛒"); }
            }
        });
    });
    
    // POPUP LOGIC
    function closeEmailPopup() { if(emailPopup) emailPopup.style.display = 'none'; }
    if(btnEmailConfirm) btnEmailConfirm.addEventListener('click', () => {
        safePlay('snd-gamestart'); showAchievement("ACHIEVEMENT UNLOCKED", "NEW JOURNEY (Started a new project)", "🚀");
        setTimeout(() => { window.location.href = "mailto:DPysartsevArt@gmail.com"; closeEmailPopup(); }, 2000);
    });
    if(btnEmailCancel) btnEmailCancel.addEventListener('click', () => { safePlay('snd-select'); closeEmailPopup(); });
// === LIGHTBOX LOGIC ===
    function closeLightbox() {
        if(lightbox && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            safePlay('snd-select');
            setTimeout(() => { lightboxImg.src = ''; }, 300); // Очищуємо після зникнення
        }
    }

    if(lightbox) {
        // Закриваємо по кліку куди завгодно на цьому екрані
        lightbox.addEventListener('click', closeLightbox);
        
        // Додаємо ховер-ефект для курсора на закриття
        if(lightboxClose) {
            lightboxClose.addEventListener('mouseenter', () => document.body.classList.add('hovered'));
            lightboxClose.addEventListener('mouseleave', () => document.body.classList.remove('hovered'));
        }
    }

    // Слухаємо кліки по картинках усередині галереї
    if(vpContent) {
        vpContent.addEventListener('click', (e) => {
            // Перевіряємо, чи клікнули саме на картинку (IMG)
            if(e.target.tagName === 'IMG') {
                if (lightbox && lightboxImg) {
                    lightboxImg.src = e.target.src; // Беремо джерело картинки
                    lightbox.classList.add('active'); // Показуємо екран
                    safePlay('snd-select');
                }
            }
        });
    }
    // KEYBOARD NAV
    document.addEventListener('keydown', (e) => {
       if(e.key === 'Escape') {
            if (lightbox && lightbox.classList.contains('active')) {
                closeLightbox(); // 1. Закриваємо фото на весь екран
            } else if (terminal && terminal.classList.contains('active')) {
                // 2. Закриваємо термінал, якщо він відкритий
                terminal.classList.remove('active');
                if(termInput) termInput.blur();
                safePlay('snd-hover');
            } else {
                goBack(); // 3. Інакше повертаємось в попереднє меню
            }
        }
        if(!inSubMenu && (!emailPopup || emailPopup.style.display !== 'flex')) {
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
        // Запускаємо оновлення кожну секунду (1000 мілісекунд)
        setInterval(() => {
            // 1. Оновлення реального часу
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            const ss = String(now.getSeconds()).padStart(2, '0');
            sysTimeEl.innerText = `${hh}:${mm}:${ss}`;

            // 2. Фейкове коливання "пам'яті" (від 38% до 46%)
            // Оновлюємо не кожну секунду, а з ймовірністю 30%, щоб виглядало природніше
            if (Math.random() > 0.7) { 
                const mem = Math.floor(Math.random() * 9) + 38;
                sysMemEl.innerText = mem;
            }
        }, 1000);
    }

// === TERMINAL EASTER EGG LOGIC ===
  // === TERMINAL EASTER EGG LOGIC ===
    
    // 1. Глобальне Відкриття/Закриття по клавіші ~ (Тільда)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Backquote') {
            e.preventDefault(); 
            if (terminal) {
                if (terminal.classList.contains('active')) {
                    terminal.classList.remove('active');
                    if (termInput) termInput.blur();
                    safePlay('snd-hover');
                } else {
                    terminal.classList.add('active');
                    if (termInput) {
                        termInput.value = '';
                        termInput.focus();
                    }
                    safePlay('snd-select');
                }
            }
        }
    });

    // 2. Логіка всередині поля вводу
    if (termInput) {
        termInput.addEventListener('keydown', (e) => {
            // Зупиняємо "спливання" подій, щоб натискання клавіш не перемикали головне меню на фоні
            if (terminal.classList.contains('active')) {
                e.stopPropagation();
            }

            // Закриваємо термінал, якщо натиснуто Тільду або ESC прямо під час друку команди
            if (e.code === 'Backquote' || e.code === 'Escape') {
                e.preventDefault();
                terminal.classList.remove('active');
                termInput.blur();
                termInput.value = '';
                safePlay('snd-hover');
                return;
            }

            // Обробка команди при натисканні Enter
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

    // 3. Закриття по кліку мишкою в порожнє місце (поза терміналом)
    document.addEventListener('click', (e) => {
        if (terminal && terminal.classList.contains('active')) {
            // Перевіряємо, чи клік був НЕ по вікну терміналу
            if (!terminal.contains(e.target)) {
                terminal.classList.remove('active');
                if (termInput) termInput.blur();
                safePlay('snd-hover');
            }
        }
    });

    function printToTerminal(text, className = '') {
        const div = document.createElement('div');
        div.className = `term-msg ${className}`;
        div.textContent = text;
        termOutput.appendChild(div);
        termOutput.scrollTop = termOutput.scrollHeight; // Автоматично скролимо вниз
    }

   function processCommand(cmd) {
        // База класичних чіт-кодів
        const cheatCodes = [
            'god', 'godmode', 'noclip', // Універсальні (Source / Quake)
            'iddqd', 'idkfa', 'idspispopd', 'lumberjack',         // 
            'hesoyam', 'baguvix', 'aezakmi', 'panzer', 'leavemealone', // GTA (SA / VC)
            'motherlode', 'greedisgood', 'showmethemoney' // The Sims, Warcraft, Starcraft
        ];

        // Перевіряємо, чи введений текст є чіт-кодом
        if (cheatCodes.includes(cmd)) {
            printToTerminal('>>> ILLEGAL CHEAT CODE DETECTED...', 'term-err');
            printToTerminal('God mode activated. (Just kidding, this is a portfolio).', 'term-sys');
            
            if (!cheaterUnlocked) {
                cheaterUnlocked = true;
                showAchievement("ACHIEVEMENT UNLOCKED", "CHEATER (Used a classic cheat code)", "👾");
                safePlay('snd-gamestart'); // Звук як при початку гри
            }
            return; // Зупиняємо функцію, щоб не спрацював default
        }

        // Звичайні команди
        switch(cmd) {
            case 'help':
                printToTerminal('AVAILABLE COMMANDS:', 'term-sys');
                printToTerminal('- help   : Display this message');
                printToTerminal('- hire   : Initialize recruitment protocol');
                printToTerminal('- coffee : Dispense emergency caffeine');
                printToTerminal('- clear  : Wipe terminal output');
                printToTerminal('- *** : Do you remember any c*****? ;) ');
                break;

            case 'hire':
                printToTerminal('>>> EXECUTING RECRUITMENT PROTOCOL...', 'term-sys');
                printToTerminal('Opening secure communication channels...');
                setTimeout(() => {
                    terminal.classList.remove('active');
                    if(emailPopup) emailPopup.style.display = 'flex';
                }, 1500);
                break;
            case 'coffee':
                printToTerminal('WARNING: CAFFEINE OVERLOAD DETECTED.', 'term-err');
                printToTerminal('System performance +50%. Applying Buff...');
                showAchievement("ACHIEVEMENT UNLOCKED", "HACKER MAN (Found the Terminal)", "💻");
                safePlay('snd-gamestart');
                break;
            case 'clear':
                termOutput.innerHTML = '<div>Type \'help\' for available commands.</div>';
                break;
            default:
                printToTerminal(`Command not found: ${cmd}`, 'term-err');
                break;
        }
    }
// === AUDIO TOGGLE LOGIC ===
    if (audioToggle) {
        audioToggle.addEventListener('click', () => {
            isMuted = !isMuted; // Перемикаємо статус
            if (isMuted) {
                audioToggle.innerText = "[ AUDIO : OFF ]";
                audioToggle.classList.add('muted');
            } else {
                audioToggle.innerText = "[ AUDIO : ON ]";
                audioToggle.classList.remove('muted');
                safePlay('snd-select'); // Програємо звук, щоб підтвердити увімкнення
            }
        });

        // Додаємо курсору реакцію на наведення
        audioToggle.addEventListener('mouseenter', () => document.body.classList.add('hovered'));
        audioToggle.addEventListener('mouseleave', () => document.body.classList.remove('hovered'));
    }
});