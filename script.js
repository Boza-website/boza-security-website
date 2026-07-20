/* ==========================================
   BOZA SECURITY WEBSITE
   SCRIPT.JS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* Mobile Menu */

    const menuBtn = document.querySelector(".menu-btn");
    const nav = document.querySelector("nav");

    if (menuBtn) {

        menuBtn.addEventListener("click", () => {

            nav.classList.toggle("active");

        });

    }

    /* Smooth Scrolling */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", function(e) {

            e.preventDefault();

            const target = document.querySelector(this.getAttribute("href"));

            if (target) {

                target.scrollIntoView({
                    behavior: "smooth"
                });

            }

            nav.classList.remove("active");

        });

    });

    /* Scroll Animation */

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

            }

        });

    }, {
        threshold: 0.2
    });

    document.querySelectorAll("section").forEach(section => {

        observer.observe(section);

    });

});
