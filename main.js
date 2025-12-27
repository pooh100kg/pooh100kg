/* --- main.js --- */

/* 
   ТЕХ. ЧАСТЬ №1: Структура данных (JSON-like).
   previewUrl: легкое видео для сетки (лучше 540p, без звука).
   fullUrl: ссылка на полное видео (mp4 или Youtube).
*/
const videoData = {
    horizontal: [
        { title: "Tech Review 2025", category: "YOUTUBE", previewUrl: "promo.mp4", fullUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" }, // Пример YouTube
        { title: "Urban Stories", category: "DOCUMENTARY", previewUrl: "promo2.mp4", fullUrl: "promo2.mp4" },
        { title: "Music Festival", category: "EVENT", previewUrl: "promo3.mp4", fullUrl: "promo3.mp4" }
    ],
    reels: [
        { title: "Reel One", category: "TIKTOK", previewUrl: "promo.mp4", fullUrl: "promo.mp4" },
        { title: "Reel Two", category: "INSTAGRAM", previewUrl: "promo2.mp4", fullUrl: "promo2.mp4" },
        { title: "Reel Three", category: "SHORTS", previewUrl: "promo3.mp4", fullUrl: "promo3.mp4" }
    ],
    special: [
        { title: "Viral Cat", category: "MEME", previewUrl: "promo.mp4", fullUrl: "promo.mp4" },
        { title: "3D Render", category: "MOTION", previewUrl: "promo2.mp4", fullUrl: "promo2.mp4" },
        { title: "Cyberpunk", category: "GLITCH", previewUrl: "promo3.mp4", fullUrl: "promo3.mp4" }
    ]
};

const pageTitles = {
    'horizontal': 'Горизонтальные видео',
    'reels': 'Рилс & Тик-Ток',
    'special': 'Спец. форматы'
};

// ТЕХ. ЧАСТЬ №2: Lazy Loading Observer
// Грузим видео только когда оно появляется во вьюпорте
const videoObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const video = entry.target;
            // Переносим data-src в src
            if (video.dataset.src) {
                video.src = video.dataset.src;
                video.load(); // Важно для запуска загрузки
            }
            observer.unobserve(video);
        }
    });
}, { rootMargin: "100px" });


document.addEventListener('DOMContentLoaded', () => {
    const pageType = document.body.getAttribute('data-page');
    const container = document.querySelector('.container');

    // --- 1. ШАПКА ---
    if (pageType && container && pageTitles[pageType]) {
        const headerHTML = `
            <div class="glass-card uni-header fade-up">
                <a href="index.html" class="uni-back">← <span>Назад</span></a>
                <div class="uni-title-box">
                    <div class="uni-title-text">${pageTitles[pageType]}</div>
                </div>
                <div class="uni-spacer"></div>
            </div>
        `;
        container.insertAdjacentHTML('afterbegin', headerHTML);
    }

    // --- 2. ГЕНЕРАЦИЯ СЕТКИ ---
    const gridContainer = document.querySelector('.video-grid');
    if (gridContainer && pageType && videoData[pageType]) {
        renderGrid(videoData[pageType]);
        generateSEOSchema(videoData[pageType]); // ТЕХ. ЧАСТЬ №5: SEO Injection
        initTilt();
    }

    function renderGrid(data) {
        gridContainer.innerHTML = '';
        
        data.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'glass-card card tilt-card fade-up';
            card.style.animationDelay = `${index * 0.1}s`;
            
            // ВАЖНО: Добавляем poster (заглушку) и data-src для Lazy Load
            card.innerHTML = `
                <div class="card-media-wrapper" onclick="openLightbox('${item.fullUrl}', ${index}, '${pageType}')">
                    <video class="card-video" loop playsinline muted preload="none" data-src="${item.previewUrl}" poster="poster_placeholder.jpg">
                        <!-- Источник подставится через JS -->
                    </video>
                    <div class="card-overlay"></div>
                    <div class="loading-spinner"></div> <!-- ТЕХ. ЧАСТЬ: Индикатор загрузки -->
                </div>

                <div class="card-meta">
                    <div style="color:var(--accent); font-size:11px; letter-spacing:1px; font-weight:700; margin-bottom:4px;">${item.category}</div>
                    <div style="font-size:16px; font-weight:700; color:#fff; text-shadow:0 2px 10px rgba(0,0,0,0.5);">${item.title}</div>
                </div>

                <div class="mini-controls" onclick="event.stopPropagation()">
                    <div class="progress-wrap">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="controls-row">
                        <span class="time-current">00:00</span>
                        <span class="time-total">--:--</span>
                    </div>
                </div>
            `;
            
            gridContainer.appendChild(card);

            const video = card.querySelector('.card-video');
            const spinner = card.querySelector('.loading-spinner');
            const progressFill = card.querySelector('.progress-fill');
            const progressWrap = card.querySelector('.progress-wrap');
            const timeCurrent = card.querySelector('.time-current');
            const timeTotal = card.querySelector('.time-total');

            // Подключаем Lazy Load
            videoObserver.observe(video);

            // Убираем спиннер когда видео готово
            video.addEventListener('canplay', () => {
                if(spinner) spinner.style.display = 'none';
            });

            // Логика наведения
            card.addEventListener('mouseenter', () => {
                // Если видео еще не загрузилось из-за скролла, форсируем
                if (!video.src && video.dataset.src) video.src = video.dataset.src;
                
                video.muted = true;
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => { console.log("Autoplay blocked by browser"); });
                }
            });

            card.addEventListener('mouseleave', () => {
                video.pause();
            });

            // Скраббинг
            video.addEventListener('timeupdate', () => {
                if(video.duration) {
                    const percent = (video.currentTime / video.duration) * 100;
                    progressFill.style.width = `${percent}%`;
                    timeCurrent.innerText = formatTime(video.currentTime);
                    timeTotal.innerText = formatTime(video.duration);
                }
            });

            progressWrap.addEventListener('click', (e) => {
                e.stopPropagation();
                if(video.duration) {
                    const rect = progressWrap.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    video.currentTime = pos * video.duration;
                }
            });

            // Mouse Move Scrubbing (PC only)
            if(window.matchMedia('(pointer:fine)').matches) {
                progressWrap.addEventListener('mousemove', (e) => {
                   // Можно добавить превью таймкода
                });
            }
        });
    }

    // ТЕХ. ЧАСТЬ №5: Генерация JSON-LD для Google (SEO)
    function generateSEOSchema(data) {
        const schema = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": data.map((item, index) => ({
                "@type": "VideoObject",
                "position": index + 1,
                "name": item.title,
                "description": `Video portfolio work: ${item.category}`,
                "thumbnailUrl": "poster_placeholder.jpg", // Замени на реальное лого
                "uploadDate": new Date().toISOString(),
                "contentUrl": item.fullUrl
            }))
        };
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schema);
        document.head.appendChild(script);
    }

    function formatTime(seconds) {
        if(isNaN(seconds)) return "00:00";
        let m = Math.floor(seconds / 60);
        let s = Math.floor(seconds % 60);
        if(m < 10) m = '0' + m;
        if(s < 10) s = '0' + s;
        return `${m}:${s}`;
    }

    // --- 3. 3D TILT ---
    function initTilt() {
        if (window.matchMedia('(pointer:coarse)').matches) return;
        const cards = document.querySelectorAll('.tilt-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rotateX = ((y / rect.height) - 0.5) * -10;
                const rotateY = ((x / rect.width) - 0.5) * 10;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
            });
        });
    }

    // --- 4. КУРСОР ---
    if (window.matchMedia('(pointer:fine)').matches) {
        const spot = document.createElement('div');
        Object.assign(spot.style, {
            position:'fixed', width:'300px', height:'300px', borderRadius:'50%', pointerEvents:'none',
            background:'radial-gradient(circle, rgba(255,183,197,0.15) 0%, transparent 70%)',
            transform:'translate(-50%, -50%)', zIndex:'9998', mixBlendMode:'screen', transition:'opacity 0.3s'
        });
        document.body.appendChild(spot);
        let mx=0, my=0, cx=0, cy=0;
        window.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
        const loop = () => { cx+=(mx-cx)*0.12; cy+=(my-cy)*0.12; spot.style.left=cx+'px'; spot.style.top=cy+'px'; requestAnimationFrame(loop); };
        loop();
    }

    // --- 5. PRELOADER ---
    const preloader = document.getElementById('preloader');
    if(preloader) window.addEventListener('load', () => { preloader.style.opacity = '0'; setTimeout(() => preloader.remove(), 600); });
    
    // --- CANVAS BG ---
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        // (Оставил твой старый код канваса без изменений для краткости, он был хорош)
        const ctx = canvas.getContext('2d');
        let w, h, orbs = [];
        const colors = [{r:255,g:183,b:197}, {r:100,g:20,b:80}, {r:40,g:10,b:60}];
        const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; orbs = Array(5).fill().map(() => new Orb()); };
        class Orb {
            constructor() { this.x = Math.random() * w; this.y = Math.random() * h; this.r = (Math.random() * 300) + 150; this.vx = (Math.random() - 0.5) * 0.5; this.vy = (Math.random() - 0.5) * 0.5; this.c = colors[Math.floor(Math.random()*3)]; this.a = Math.random()*0.4+0.1; }
            update() { this.x += this.vx; this.y += this.vy; if(this.x<-200||this.x>w+200) this.vx*=-1; if(this.y<-200||this.y>h+200) this.vy*=-1; }
            draw() { const g = ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r); g.addColorStop(0, `rgba(${this.c.r},${this.c.g},${this.c.b},${this.a})`); g.addColorStop(1, 'transparent'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill(); }
        }
        const animate = () => { if(document.hidden) return; ctx.clearRect(0,0,w,h); ctx.globalCompositeOperation = 'screen'; orbs.forEach(o => { o.update(); o.draw(); }); requestAnimationFrame(animate); };
        window.addEventListener('resize', resize); resize(); animate();
    }
});

/* 
   ТЕХ. ЧАСТЬ №3: Универсальный Лайтбокс Логика
   (Работает и с YouTube, и с MP4)
*/
let currentLbIndex = 0;
let currentLbCategory = '';

function openLightbox(url, index, category) {
    if(!url) return;
    currentLbIndex = index;
    currentLbCategory = category;
    
    const lb = document.getElementById('videoLightbox');
    const lbContent = lb.querySelector('.lb-content');
    const vidEl = document.getElementById('lightboxVideo');
    const iframeEl = document.getElementById('lightboxFrame');

    // Сброс
    vidEl.classList.remove('active');
    vidEl.pause();
    iframeEl.classList.remove('active');
    iframeEl.src = "";

    // Определение типа контента
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');

    // Настройка пропорций лайтбокса (9:16 для рилс, 16:9 для горизонта)
    if(category === 'reels') {
        lbContent.style.aspectRatio = '9/16';
        lbContent.style.maxWidth = '50vh'; // Чтобы влезало на экран по высоте
    } else if (category === 'special') {
        lbContent.style.aspectRatio = '4/5';
        lbContent.style.maxWidth = '60vh';
    } else {
        lbContent.style.aspectRatio = '16/9';
        lbContent.style.maxWidth = '1000px';
    }

    if (isYoutube) {
        // Логика YouTube
        let ytUrl = url;
        if(!ytUrl.includes('?')) ytUrl += '?autoplay=1&modestbranding=1&rel=0';
        else if(!ytUrl.includes('autoplay=1')) ytUrl += '&autoplay=1';
        
        iframeEl.src = ytUrl;
        iframeEl.classList.add('active');
    } else {
        // Логика MP4
        vidEl.src = url;
        vidEl.classList.add('active');
        vidEl.muted = false; 
        vidEl.volume = 0.7;
        vidEl.play().catch(e => console.log("Autoplay blocked"));
    }

    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lb = document.getElementById('videoLightbox');
    const vidEl = document.getElementById('lightboxVideo');
    const iframeEl = document.getElementById('lightboxFrame');
    
    lb.classList.remove('active'); 
    document.body.style.overflow = '';
    
    // Очистка
    setTimeout(() => { 
        vidEl.pause(); 
        vidEl.src = ""; 
        iframeEl.src = ""; 
    }, 300);
}

function navLightbox(direction) {
    const list = videoData[currentLbCategory];
    let newIndex = currentLbIndex + direction;
    
    if (newIndex < 0) newIndex = list.length - 1; 
    if (newIndex >= list.length) newIndex = 0;
    
    if (list[newIndex].fullUrl) {
        openLightbox(list[newIndex].fullUrl, newIndex, currentLbCategory);
    }
}

// Управление клавиатурой и свайпом
document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('videoLightbox');
    if(!lb.classList.contains('active')) return;
    
    if(e.key === "Escape") closeLightbox();
    if(e.key === "ArrowRight") navLightbox(1);
    if(e.key === "ArrowLeft") navLightbox(-1);
});