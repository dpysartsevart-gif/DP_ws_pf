document.addEventListener('DOMContentLoaded', () => {
    
    // === PRELOADER & CURSOR ===
    const preloader = document.getElementById('gallery-preloader');
    const barFill = document.querySelector('.bar-fill');
    const pctText = document.querySelector('.loader-percentage');
    const dot = document.querySelector('.cursor-dot');
    const circle = document.querySelector('.cursor-circle');
    
    function runGalleryPreloader(callback) {
        if(!preloader) { callback(); return; }
        preloader.classList.remove('hidden');
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
                    callback();
                }, 300);
            }
        }, 50);
    }

    let mouseX = 0, mouseY = 0;
    let circleX = 0, circleY = 0;

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

    const interactables = document.querySelectorAll('a, .menu-item, .project-slot, .back-hint, .shop-btn, .dlc-btn, .buy-btn, .vp-link, .wireframe-trigger, .scroll-container, .projects-scroll-area');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovered'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovered'));
    });

    // === CORE LOGIC ===
    const screens = document.querySelectorAll('.screen');
    const menuItems = document.querySelectorAll('.menu-item');
    const dlcBtn = document.querySelector('.dlc-btn');
    const projectSlots = document.querySelectorAll('.project-slot');
    const vpContent = document.getElementById('viewport-content');
    const achievementPopup = document.getElementById('achievement-popup');
    const donateBtn = document.getElementById('donate-btn');

    let currentMenuIndex = 0;
    let inSubMenu = false;
    let isDlcActive = false;

    // Achievement Logic
    const totalProjects = 9; 
    let viewedProjects = new Set();
    let explorerUnlocked = false;
    let supporterUnlocked = false;

    function showAchievement(title, desc, icon) {
        if(achievementPopup) {
            const achTitle = achievementPopup.querySelector('.ach-title');
            const achDesc = document.getElementById('ach-desc');
            const achIcon = document.getElementById('ach-icon');
            if(achTitle) achTitle.innerText = title;
            if(achDesc) achDesc.innerText = desc;
            if(achIcon) achIcon.innerText = icon;
            achievementPopup.classList.add('show');
            safePlay('snd-achievement');
            setTimeout(() => { achievementPopup.classList.remove('show'); }, 5000);
        }
    }

    function checkExplorer(id) {
        if(explorerUnlocked) return;
        viewedProjects.add(id);
        if(viewedProjects.size === totalProjects) {
            explorerUnlocked = true;
            showAchievement("ACHIEVEMENT UNLOCKED", "EXPLORER (Viewed all projects)", "🏆");
        }
    }

    if(donateBtn) {
        donateBtn.addEventListener('click', () => {
            if(!supporterUnlocked) {
                supporterUnlocked = true;
                setTimeout(() => {
                    showAchievement("ACHIEVEMENT UNLOCKED", "ARTIST SUPPORTER (Thank you!)", "❤️");
                }, 500);
            }
        });
    }

    function safePlay(id) {
        const audio = document.getElementById(id);
        if(audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
    }

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

    document.addEventListener('click', () => { }, { once: true });

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
            if (s.id === 'dlc-screen') s.classList.add('dlc-centered'); else s.classList.remove('dlc-centered');
            if (s.id !== screenId) s.style.display = 'none';
        });
        const target = document.getElementById(screenId);
        if(target) { target.style.display = 'flex'; setTimeout(() => target.classList.add('active-screen'), 10); }
        inSubMenu = true;
    }

    function goBack() {
        screens.forEach(s => { s.classList.remove('active-screen'); if(s.id !== 'main-menu') s.style.display = 'none'; });
        const menu = document.getElementById('main-menu');
        menu.style.display = 'flex'; setTimeout(() => menu.classList.add('active-screen'), 10);
        inSubMenu = false; safePlay('snd-select');
        if(vpContent) vpContent.innerHTML = '<div class="vp-placeholder">SELECT A PROJECT FILE...</div>';
    }

    function loadImages(id) {
        checkExplorer(id);
        if(!vpContent) return;
        vpContent.innerHTML = '';
        if(projectData[id] && projectData[id].length > 0) {
            projectData[id].forEach(item => {
                if (item.startsWith('youtube:')) {
                    const videoId = item.split(':')[1];
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://www.youtube.com/embed/${videoId}`;
                    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                    iframe.allowFullscreen = true;
                    vpContent.appendChild(iframe);
                } 
                else if (item.endsWith('.mp4')) {
                    const video = document.createElement('video');
                    video.src = `assets/images/${item}`;
                    video.controls = true; video.loop = true; video.muted = true; 
                    vpContent.appendChild(video);
                }
                else {
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
                safePlay('snd-gamestart');
                setTimeout(() => { window.location.href = "mailto:DPysartsevArt@gmail.com"; }, 1000);
            } else if (target) {
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
        dlcBtn.addEventListener('click', () => { safePlay('snd-select'); showScreen('dlc-screen'); });
    }

    projectSlots.forEach(slot => {
        slot.addEventListener('mouseenter', () => {
            projectSlots.forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            safePlay('snd-hover');
            loadImages(slot.dataset.id);
        });
    });

    document.querySelectorAll('.back-hint').forEach(btn => {
        btn.addEventListener('click', goBack);
    });

    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && inSubMenu) goBack();
        if(!inSubMenu) {
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