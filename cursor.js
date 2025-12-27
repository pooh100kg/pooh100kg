document.addEventListener('DOMContentLoaded', () => {
    const spotlight = document.createElement('div');
    spotlight.style.position = 'fixed';
    spotlight.style.width = '600px';
    spotlight.style.height = '600px';
    spotlight.style.borderRadius = '50%';
    spotlight.style.pointerEvents = 'none';
    spotlight.style.background = 'radial-gradient(circle, rgba(255, 183, 197, 0.15) 0%, rgba(255, 255, 255, 0) 70%)';
    spotlight.style.transform = 'translate(-50%, -50%)';
    spotlight.style.zIndex = '9998'; 
    spotlight.style.mixBlendMode = 'screen'; 
    spotlight.style.transition = 'opacity 0.5s ease';
    document.body.appendChild(spotlight);

    let mouseX = 0, mouseY = 0, currentX = 0, currentY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
    });

    function animateSpotlight() {
        const speed = 0.1;
        currentX += (mouseX - currentX) * speed;
        currentY += (mouseY - currentY) * speed;
        spotlight.style.left = `${currentX}px`;
        spotlight.style.top = `${currentY}px`;
        requestAnimationFrame(animateSpotlight);
    }
    animateSpotlight();
});