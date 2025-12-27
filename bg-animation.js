document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;

    // Цвета: Sakura Pink, Deep Magenta, Dark Violet
    const colors = [
        { r: 255, g: 183, b: 197 }, 
        { r: 100, g: 20, b: 80 },   
        { r: 40, g: 10, b: 60 }     
    ];

    const orbs = [];
    const numOrbs = 6;

    class Orb {
        constructor() { this.init(); }
        init() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = (Math.random() * 300) + 200; 
            this.dx = (Math.random() - 0.5) * 0.8; 
            this.dy = (Math.random() - 0.5) * 0.8;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.alpha = Math.random() * 0.5 + 0.2;
            this.targetAlpha = this.alpha;
        }
        update() {
            this.x += this.dx;
            this.y += this.dy;
            if (this.x < -200 || this.x > width + 200) this.dx *= -1;
            if (this.y < -200 || this.y > height + 200) this.dy *= -1;
            if(Math.random() < 0.01) this.targetAlpha = Math.random() * 0.5 + 0.2;
            this.alpha += (this.targetAlpha - this.alpha) * 0.01;
        }
        draw() {
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`);
            gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
            ctx.fillStyle = gradient;
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        orbs.length = 0;
        for (let i = 0; i < numOrbs; i++) orbs.push(new Orb()); 
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'screen'; 
        orbs.forEach(orb => { orb.update(); orb.draw(); });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
});