document.addEventListener('DOMContentLoaded', () => {
    
    // === HISTORY API ===
    history.replaceState({ screen: 'main-menu' }, '', '');
    window.addEventListener('popstate', (event) => {
        if (event.state) showScreen(event.state.screen); 
        else showScreen('main-menu');
    });

    // === ЗМІННІ (Оригінальний набір) ===
    const preloader = document.getElementById('gallery-preloader');
    const barFill = document.querySelector('.bar-fill');
    const pctText = document.querySelector('.loader-percentage');
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
    
    // НОВІ ЗМІННІ ДЛЯ ФІКСІВ
    const donateBtn = document.getElementById('donate-btn');
    const backHints = document.querySelectorAll('.back-hint'); 

    let currentMenuIndex = 0;
    let inSubMenu = false;
    let isDlcActive = false;

    // === МОБІЛЬНИЙ БАНЕР ===
    if (window.innerWidth <= 1000 && banner) banner.classList.add('active');
    if(closeBanner) {
        closeBanner.addEventListener('click', () => {
            if(banner) banner.classList.remove('active');
            safePlay('snd-select');
        });
    }

    // === PRELOADER (ВИПРАВЛЕНИЙ) ===
    function runGalleryPreloader(callback) {
        if(!preloader) { callback(); return; }
        // FIX: Явно видаляємо клас hidden
        preloader.classList.remove('hidden');
        preloader.style.display = 'flex';
        
        let loadPct = 0;
        const interval = setInterval(() => {
            loadPct += Math.floor(Math.random() * 15) + 5; 
            if(loadPct > 100) loadPct = 100;
            if(barFill) barFill.style.width = `${loadPct}%`;
            if(pctText) pctText.textContent = `${loadPct}%`;
            if(loadPct === 100) {
                clearInterval(interval);
                setTimeout(() => {
                    preloader.classList.add('hidden'); // Повертаємо hidden
                    preloader.style.display = 'none';
                    callback();
                }, 300);
            }
        }, 50);
    }

    // === КУРСОР ===
    let mouseX = 0, mouseY = 0;
    let circleX = 0, circleY = 0;

    if (window.matchMedia("(min-width: 1000px)").matches) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if(dot) { dot.style.left = `${mouseX}px`; dot.style.top = `${mouseY}px`; }
            const bg = document.getElementById('parallax-bg');
            if(bg) {
                const moveX = (window.innerWidth / 2 - mouseX) * 0.02; 
                const moveY = (window.innerHeight / 2 - mouseY) * 0.02;
                bg.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }
        });

        function animateCursor() {
            circleX += (mouseX - circleX) * 0.15; 
            circleY += (mouseY - circleY) * 0.15;
            if(circle) { circle.style.left = `${circleX}px`; circle.style.top = `${circleY}px`; }
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
    }

    const interactables = document.querySelectorAll('a, .menu-item, .project-slot, .back-hint, .shop-btn, .dlc-btn, .buy-btn, .vp-link, .wireframe-trigger, .scroll-container, .projects-scroll-area, .mobile-nav-btn, .banner-btn');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovered'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovered'));
    });

    // === ЗВУКИ ===
    function safePlay(id) {
        const audio = document.getElementById(id);
        if(audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
    }

    // === ЛОГІКА ЕКРАНІВ (CRITICAL FIXES HERE) ===
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
            // FIX: Додаємо клас hidden для всіх неактивних, щоб надійно сховати
            if (s.id !== screenId && s.id !== 'email-popup') {
                s.style.display = 'none';
                s.classList.add('hidden');
            }
            
            // Оригінальна логіка центрування DLC
            if (s.id === 'dlc-screen') s.classList.add('dlc-centered'); 
            else s.classList.remove('dlc-centered');
        });

        const target = document.getElementById(screenId);
        if(target) { 
            // FIX: Видаляємо клас hidden, щоб екран точно з'явився (DLC fix)
            target.classList.remove('hidden'); 
            target.style.display = 'flex'; 
            setTimeout(() => target.classList.add('active-screen'), 10); 
        }
        
        // FIX: Навігація. Якщо Головне меню - розблокувати стрілки
        if (screenId === 'main-menu') {
            inSubMenu = false;
        } else {
            inSubMenu = true;
        }
        
        if(screenId === 'gallery-screen' && window.innerWidth <= 1000) {
            if(sidebar) sidebar.style.display = 'flex';
            if(viewport) viewport.style.display = 'none';
        }
    }

    function goBack() {
        if(emailPopup && emailPopup.style.display === 'flex') {
            closeEmailPopup(); return;
        }
        
        if(history.state && history.state.screen !== 'main-menu') {
            history.back(); return;
        }

        screens.forEach(s => { 
            s.classList.remove('active-screen'); 
            if(s.id !== 'main-menu') {
                s.style.display = 'none';
                s.classList.add('hidden');
            }
        });
        
        const menu = document.getElementById('main-menu');
        menu.classList.remove('hidden'); // FIX
        menu.style.display = 'flex'; 
        setTimeout(() => menu.classList.add('active-screen'), 10);
        
        inSubMenu = false; 
        safePlay('snd-select');
        
        if(vpContent) vpContent.innerHTML = '<div class="vp-placeholder">SELECT A PROJECT FILE...</div>';
        projectSlots.forEach(s => s.classList.remove('selected'));
        
        // FIX: Оновлюємо візуальний стан меню
        updateVisuals(); 
    }

    // === КЛІКИ ТА КНОПКИ ===
    menuBackBtns.forEach(btn => btn.addEventListener('click', () => {
        safePlay('snd-select');
        history.back();
    }));

    // FIX: Клік по [ESC] BACK
    backHints.forEach(hint => {
        hint.addEventListener('click', () => {
            safePlay('snd-select');
            goBack();
        });
    });
    
    if(mobileBackBtn) {
        mobileBackBtn.addEventListener('click', () => {
            if(viewport) viewport.style.display = 'none';
            if(sidebar) sidebar.style.display = 'flex';
            safePlay('snd-select');
        });
    }

    // === POPUP EMAIL ===
    function closeEmailPopup() { if(emailPopup) emailPopup.style.display = 'none'; }
    if(btnEmailConfirm) {
        btnEmailConfirm.addEventListener('click', () => {
            safePlay('snd-gamestart');
            
            // --- ДОДАНО: АЧІВКА NEW JOURNEY ---
            showAchievement(
                "ACHIEVEMENT UNLOCKED", 
                "NEW JOURNEY (Started a new project)", 
                "🚀"
            );
            // ----------------------------------

            // Затримка перед відкриттям пошти, щоб користувач побачив ачівку
            setTimeout(() => { 
                window.location.href = "mailto:DPysartsevArt@gmail.com";
                closeEmailPopup();
            }, 2000); 
        });
    }
    // === DATA & ACHIEVEMENTS ===
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
    
    let viewedProjects = new Set();
    let explorerUnlocked = false;
    let supporterUnlocked = false;

    function showAchievement(title, desc, icon) {
        if(achievementPopup) {
            // Безпечна перевірка елементів
            const t = achievementPopup.querySelector('.ach-title');
            const d = achievementPopup.querySelector('.ach-desc');
            const i = achievementPopup.querySelector('.ach-icon');
            if(t) t.innerText = title;
            if(d) d.innerText = desc;
            if(i) i.innerText = icon;
            
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
                    const img = document.createElement('img');
                    img.src = `assets/images/${item}`;
                    img.onerror = function() { this.style.display = 'none'; };
                    vpContent.appendChild(img);
                }
            });
        } else {
            vpContent.innerHTML = '<div class="vp-placeholder">NO DATA FOUND (WIP)</div>';
        }
    }

    // === ГОЛОВНЕ МЕНЮ ===
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
                    safePlay('snd-gamestart'); setTimeout(() => { window.location.href = "mailto:DPysartsevArt@gmail.com"; }, 500);
                } else if(emailPopup) emailPopup.style.display = 'flex';
            } else if (target) {
                history.pushState({ screen: target }, '', `#${target.replace('-screen', '')}`);
                showScreen(target);
            }
        });
    });

    // === DLC BUTTON ===
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

    // FIX: DONATE BUTTON ACHIEVEMENT
    if (donateBtn) {
        donateBtn.addEventListener('click', () => {
            if (!supporterUnlocked) {
                supporterUnlocked = true;
                showAchievement("ACHIEVEMENT UNLOCKED", "ARTIST SUPPORTER (Coffee bought)", "☕");
            }
        });
    }

    // === ГАЛЕРЕЯ ===
    projectSlots.forEach(slot => {
        slot.addEventListener('mouseenter', () => {
            if(window.innerWidth > 1000) {
                projectSlots.forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
                safePlay('snd-hover');
                loadImages(slot.dataset.id);
            }
        });
        slot.addEventListener('click', () => {
            projectSlots.forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            safePlay('snd-select');
            loadImages(slot.dataset.id);
            if(window.innerWidth <= 1000) {
                if(sidebar) sidebar.style.display = 'none';
                if(viewport) viewport.style.display = 'flex';
                if(vpContent) vpContent.scrollTop = 0;
            }
        });
    });

    // === КЛАВІАТУРА ===
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape') goBack();
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
            if(e.key === 'Enter') {
                if(isDlcActive) dlcBtn.click(); else menuItems[currentMenuIndex].click();
            }
        }
    });

    function updateVisuals() {
        menuItems.forEach(i => i.classList.remove('active'));
        if(dlcBtn) dlcBtn.classList.remove('active-dlc');
        if(isDlcActive) dlcBtn.classList.add('active-dlc'); else menuItems[currentMenuIndex].classList.add('active');
    }

});