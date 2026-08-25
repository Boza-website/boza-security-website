/* ================================================
   BOZA SECURITY - LIGHTWEIGHT JAVASCRIPT
   Mobile Menu | Year Update | Smooth Scrolling
   ================================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // Set current year
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
    
    // Mobile menu toggle
    const menuBtn = document.getElementById('menuBtn');
    const nav = document.getElementById('nav');
    
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            menuBtn.classList.toggle('active');
            nav.classList.toggle('active');
            menuBtn.setAttribute('aria-expanded', nav.classList.contains('active'));
        });
        
        // Close menu when link clicked
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                menuBtn.classList.remove('active');
                nav.classList.remove('active');
                menuBtn.setAttribute('aria-expanded', 'false');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (nav.classList.contains('active') && !nav.contains(e.target) && !menuBtn.contains(e.target)) {
                menuBtn.classList.remove('active');
                nav.classList.remove('active');
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close menu on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                menuBtn.classList.remove('active');
                nav.classList.remove('active');
                menuBtn.setAttribute('aria-expanded', 'false');
                menuBtn.focus();
            }
        });
        
        // Close menu on resize to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && nav.classList.contains('active')) {
                menuBtn.classList.remove('active');
                nav.classList.remove('active');
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                    const targetPos = target.offsetTop - headerHeight;
                    window.scrollTo({
                        top: targetPos,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});
