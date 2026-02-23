document.addEventListener('DOMContentLoaded', () => {

    // === HISTORY API ===
    history.replaceState({ screen: 'main-menu' }, '', '');
    window.addEventListener('popstate', (event) => {
// ДОДАНО: Закриваємо картинку при свайпі назад на телефоні
        const lightboxOverlay = document.getElementById('lightbox-overlay');
        if (lightboxOverlay && lightboxOverlay.classList.contains('active')) {
            lightboxOverlay.classList.remove('active');
            setTimeout(() => { if(document.getElementById('lightbox-img')) document.getElementById('lightbox-img').src = ''; }, 300);
            return; // Зупиняємо код, щоб галерея не закрилася
        }
        if (window.innerWidth <= 1000 && document.querySelector('.gallery-viewport').classList.contains('active-screen')) {
            const viewport = document.querySelector('.gallery-viewport');
            const sidebar = document.querySelector('.gallery-sidebar');
            const vpContent = document.getElementById('viewport-content');
            
            viewport.classList.remove('active-screen');
            viewport.style.display = 'none';
            sidebar.style.display = 'flex';
            
            if(vpContent) vpContent.innerHTML = '<div class="vp-placeholder">SELECT A PROJECT FILE...</div>';
            document.querySelectorAll('.project-slot').forEach(s => s.classList.remove('selected'));
            return;
        }

        if (event.state && event.state.screen && event.state.screen !== 'mobile-project-view') {
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
    
    let isMuted = localStorage.getItem('dp_audio_muted') === 'true';

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
    const shopBtns = document.querySelectorAll('.shop-btn');
    const journalPopup = document.getElementById('journal-popup'); 
    const btnJournalClose = document.getElementById('btn-journal-close'); 

    let currentMenuIndex = 0;
    let inSubMenu = false;
    let isDlcActive = false;

    // === DYNAMIC FAVICON LOGIC ===
    const faviconDefault = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f7d53e" rx="20"/><text y="70" x="15" fill="black" font-family="monospace" font-size="60" font-weight="bold">DP</text></svg>';
    const faviconTerminal = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23ff3d00" rx="20"/><text y="65" x="15" fill="white" font-family="monospace" font-size="55">>_</text></svg>';

    function setFavicon(url) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = url;
    }
    setFavicon(faviconDefault);

// === SYSTEM BOOT ===
    // Стартовий екран завантаження вимкнено. Одразу показуємо мобільний банер, якщо треба.
    if (window.innerWidth <= 1000 && banner) {
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

    if(closeBanner) {
        closeBanner.addEventListener('click', () => { 
            if(banner) banner.classList.remove('active'); 
            safePlay('snd-select'); 
        });
    }

    // === CURSOR & DUST ===
    let mouseX = 0, mouseY = 0, circleX = 0, circleY = 0;
    if (window.matchMedia("(min-width: 1000px)").matches) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX; mouseY = e.clientY;
            if(dot) { dot.style.left = `${mouseX}px`; dot.style.top = `${mouseY}px`; }

            const target = e.target.closest('.menu-item, .dlc-btn, .buy-btn, .alt-toggle-btn, .project-slot, .vp-link, .lightbox-close');
            if (target) {
                if(circle) circle.classList.add('magnetic');
            } else {
                if(circle) circle.classList.remove('magnetic');
            }

            const bg = document.getElementById('parallax-bg');
            if(bg) {
                const moveX = (window.innerWidth / 2 - mouseX) * 0.02; 
                const moveY = (window.innerHeight / 2 - mouseY) * 0.02;
                bg.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }

            // === РОЗУМНИЙ ПИЛ (М'ЯКИЙ РОЗЛІТ) ===
            document.querySelectorAll('.dust-speck').forEach(speck => {
                const rect = speck.getBoundingClientRect();
                const speckX = rect.left + rect.width / 2;
                const speckY = rect.top + rect.height / 2;
                const dist = Math.hypot(mouseX - speckX, mouseY - speckY);
                
                if (dist < 90) {
                    const angle = Math.atan2(speckY - mouseY, speckX - mouseX);
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

        function animateCursor() {
            circleX += (mouseX - circleX) * 0.15; 
            circleY += (mouseY - circleY) * 0.15;
            if(circle) { circle.style.left = `${circleX}px`; circle.style.top = `${circleY}px`; }
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
    }

    // === SOUNDS ===
    function safePlay(id) {
        if (isMuted) return; 
        const audio = document.getElementById(id);
        if(audio) { 
            audio.volume = 0.15; 
            audio.currentTime = 0; 
            audio.play().catch(() => {}); 
        }
    }

    // === SCREEN LOGIC ===
    function showScreen(screenId) {
        if(screenId === 'gallery-screen' && !inSubMenu) {
            runGalleryPreloader(() => { activateScreen(screenId); });
        } else {
            activateScreen(screenId);
        }
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
        
        if (screenId !== 'gallery-screen') {
            if(vpContent) vpContent.innerHTML = '<div class="vp-placeholder">SELECT A PROJECT FILE...</div>';
            projectSlots.forEach(s => s.classList.remove('selected'));
        }
        
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
        if(journalPopup && journalPopup.style.display === 'flex') { journalPopup.style.display = 'none'; return; }
        
        if(window.innerWidth <= 1000 && viewport && viewport.classList.contains('active-screen')) {
             viewport.classList.remove('active-screen');
             viewport.style.display = 'none';
             sidebar.style.display = 'flex';
             safePlay('snd-select');
             if(vpContent) vpContent.innerHTML = '<div class="vp-placeholder">SELECT A PROJECT FILE...</div>';
             projectSlots.forEach(s => s.classList.remove('selected'));
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
        'wod': ['wod01.jpg', 'wod02.jpg', 'wod03.jpg', 'wod04.jpg', 'wod05|alt.jpg', 'wod06.jpg', 'wod07.jpg', 'wod08.jpg', 'wod09.jpg', 'wod_demo.mp4'],
        'jinx': ['jinxr1.jpg', 'jinxr2.jpg', 'jinxr3.jpg', 'jinxr4.jpg', 'jinxr5.jpg'], 
        'sequoia': ['youtube:gPoXD8hg3P0', 'Sequoia01.jpg', 'Sequoia02|alt.jpg', 'Sequoia03|alt.jpg', 'Sequoia04.jpg', 'Sequoia05.jpg'],
        'mermaid': ['Marmeid01.jpg', 'Marmeid02.jpg', 'Marmeid03.jpg', 'Mermaid_tt.mp4'],
        'scifi': ['sf01|alt.jpg', 'sf02.jpg', 'sf03.jpg', 'sf04.jpg', 'sf05.jpg', 'scifi_turntable.mp4'],
        'wolverine': ['Wolverine01.jpg', 'Wolverine02.jpg', 'Wolverine03.jpg', 'Wolverine04.jpg', 'Wolverine05.jpg', 'wolv_turntable|alt.mp4'],
        'boy': ['boy1.jpg', 'boy2|alt.jpg', 'boy3.jpg', 'boy4.jpg', 'boy5.jpg', 'boy6.jpg', 'boy7.jpg', 'boy8.jpg'],
        'queen': ['Queen1.jpg', 'Queen2.jpg', 'Queen3.jpg', 'Queen4.jpg', 'Queen5.jpg', 'Queen6.jpg', 'Queen7.jpg', 'Queen8.jpg', 'Queen9.jpg', 'Queen10.jpg'],
        'halloween': ['Halloween1.jpg', 'Halloween2.jpg']
    };

    function loadImages(id) {
        checkExplorer(id);
        if(!vpContent) return;

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
                        wrapper.appendChild(mediaEl);
                    } else {
                        wrapper.classList.add('skeleton-loader'); 
mediaEl = document.createElement('img');
                        // ПРО РІВЕНЬ: Перші 5 картинки вантажаться миттєво, інші - економлять трафік
                        if (index >= 5) mediaEl.setAttribute('loading', 'lazy'); 
                        mediaEl.decoding = "async";
                        
                        mediaEl.style.opacity = '0'; 
                        mediaEl.style.transition = 'opacity 0.3s ease';
                        
                        mediaEl.onload = function() {
                            wrapper.classList.remove('skeleton-loader'); 
                            this.style.opacity = '1'; 
                        };
                        mediaEl.onerror = function() { this.style.display = 'none'; wrapper.style.display = 'none'; };
                        
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
    projectSlots.forEach(slot => {
        let hoverTimer = null; // Індивідуальний таймер для кожної картки

        slot.addEventListener('click', () => {
            if(window.innerWidth > 1000 && slot.classList.contains('selected')) return; 
            projectSlots.forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            safePlay('snd-select');
            loadImages(slot.dataset.id);
            if(window.innerWidth <= 1000) {
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
            if (window.innerWidth <= 1000) return; 
            
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
            }, 300); // 300мс зупинки курсора
        });

        slot.addEventListener('mouseleave', () => {
            if (window.innerWidth <= 1000) return;
            if (hoverTimer) clearTimeout(hoverTimer); // Вбиваємо таймер
            slot.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'; 
            slot.style.transform = ''; 
        });

        slot.addEventListener('mouseenter', () => {
            if(window.innerWidth > 1000) {
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
    let talentUnlocked = false; // НОВА ЗМІННА

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
    if(btnJournalClose) btnJournalClose.addEventListener('click', () => { safePlay('snd-select'); if(journalPopup) journalPopup.style.display = 'none'; });

    // === LIGHTBOX LOGIC ===
function closeLightbox() {
        if(lightbox && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            safePlay('snd-select');
            setTimeout(() => { lightboxImg.src = ''; }, 300);
            // ДОДАНО: Якщо ми закрили хрестиком, стираємо "крок" з історії
            if(history.state && history.state.screen === 'lightbox') { history.back(); }
        }
    }

    if(lightbox) {
        lightbox.addEventListener('click', closeLightbox);
        if(lightboxClose) {
            lightboxClose.addEventListener('mouseenter', () => document.body.classList.add('hovered'));
            lightboxClose.addEventListener('mouseleave', () => document.body.classList.remove('hovered'));
        }
    }

if(vpContent) {
        vpContent.addEventListener('click', (e) => {
            if(e.target.tagName === 'IMG') {
                if (lightbox && lightboxImg) {
                    lightboxImg.src = e.target.src; 
                    lightbox.classList.add('active'); 
                    safePlay('snd-select');
                    history.pushState({ screen: 'lightbox' }, '', '');

                    // ДИНАМІЧНИЙ ТРИКУТНИК ДЛЯ LIGHTBOX
                    let lbAltBtn = document.getElementById('lb-alt-btn');
                    if (!lbAltBtn) {
                        lbAltBtn = document.createElement('div');
                        lbAltBtn.id = 'lb-alt-btn';
                        lbAltBtn.className = 'alt-toggle-btn';
                        lbAltBtn.style.cssText = 'position: absolute; top: 30px; left: 40px; z-index: 30005; width: 36px !important; height: 36px !important;';
                        lightbox.appendChild(lbAltBtn);
                    }

                    if (e.target.dataset.baseSrc && e.target.dataset.altSrc) {
                        lbAltBtn.style.display = 'flex';
                        let showingAlt = (e.target.src.includes('_alt.jpg')); 
                        const iconMesh = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 20 2 20"></polygon><line x1="12" y1="2" x2="12" y2="20"></line><line x1="22" y1="20" x2="12" y2="12"></line><line x1="2" y1="20" x2="12" y2="12"></line></svg>`;
                        const iconRender = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 20 2 20"></polygon></svg>`;
                        
                        lbAltBtn.innerHTML = showingAlt ? iconRender : iconMesh;

                        lbAltBtn.onclick = (event) => {
                            event.stopPropagation();
                            showingAlt = !showingAlt;
                            lightboxImg.src = showingAlt ? e.target.dataset.altSrc : e.target.dataset.baseSrc;
                            lbAltBtn.innerHTML = showingAlt ? iconRender : iconMesh;
                            
                            // Синхронізуємо картинку в галереї під лайтбоксом
                            e.target.src = lightboxImg.src;
                            const originalBtn = e.target.parentElement.querySelector('.alt-toggle-btn');
                            if (originalBtn) originalBtn.innerHTML = lbAltBtn.innerHTML;
                            
                            safePlay('snd-hover');
                        };
                    } else {
                        lbAltBtn.style.display = 'none';
                    }
                }
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
                printToTerminal('- help   : Display this message');
                printToTerminal('- hire   : Initialize recruitment protocol');
                printToTerminal('- coffee : Dispense emergency caffeine');
                printToTerminal('- clear  : Wipe terminal output');
                printToTerminal('- *** : Do you remember any classic cheats? ;)');
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
            isMuted = !isMuted; 
            localStorage.setItem('dp_audio_muted', isMuted);
            
            if (isMuted) {
                audioToggle.innerText = "[ AUDIO : OFF ]";
                audioToggle.classList.add('muted');
            } else {
                audioToggle.innerText = "[ AUDIO : ON ]";
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