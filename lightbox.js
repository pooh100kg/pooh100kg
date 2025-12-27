function openLightbox(url) {
    if(!url) return;
    const lb = document.getElementById('videoLightbox');
    const frame = document.getElementById('lightboxFrame');
    
    let finalUrl = url;
    if(url.includes('youtube.com') || url.includes('youtu.be')) {
         if(!url.includes('?')) finalUrl += '?autoplay=1&modestbranding=1&rel=0';
         else if(!url.includes('autoplay=1')) finalUrl += '&autoplay=1&modestbranding=1&rel=0';
    }
    frame.src = finalUrl;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden'; 
}

function closeLightbox() {
    const lb = document.getElementById('videoLightbox');
    const frame = document.getElementById('lightboxFrame');
    lb.classList.remove('active');
    document.body.style.overflow = ''; 
    setTimeout(() => { frame.src = ""; }, 400); 
}

document.addEventListener('DOMContentLoaded', () => {
    const lb = document.getElementById('videoLightbox');
    if(lb) {
        lb.addEventListener('click', (e) => {
            if(e.target === lb || e.target.classList.contains('lightbox-content')) closeLightbox();
        });
    }
    document.addEventListener('keydown', (e) => {
        if(e.key === "Escape" && lb && lb.classList.contains('active')) closeLightbox();
    });
});