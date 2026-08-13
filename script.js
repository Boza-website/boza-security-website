/* =========================================================
   BOZA SATELLITE & SECURITY
   MAIN JAVASCRIPT
   MENU • ANIMATIONS • SCROLL EFFECTS
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const menuToggle = document.getElementById("menu-toggle");
    const navbar = document.getElementById("navbar");
    const header = document.querySelector(".site-header");


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    function openMenu() {

        if (!navbar || !menuToggle) return;

        navbar.classList.add("active");
        menuToggle.classList.add("active");

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        menuToggle.setAttribute(
            "aria-label",
            "Close navigation menu"
        );

    }


    function closeMenu() {

        if (!navbar || !menuToggle) return;

        navbar.classList.remove("active");
        menuToggle.classList.remove("active");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        menuToggle.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

    }


    function toggleMenu() {

        if (!navbar) return;

        if (navbar.classList.contains("active")) {

            closeMenu();

        } else {

            openMenu();

        }

    }


    if (menuToggle && navbar) {

        menuToggle.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                toggleMenu();

            }
        );


        const navLinks =
            navbar.querySelectorAll("a");


        navLinks.forEach(function (link) {

            link.addEventListener(
                "click",
                function () {

                    closeMenu();

                }
            );

        });


        document.addEventListener(
            "click",
            function (event) {

                if (
                    navbar.classList.contains("active") &&
                    !navbar.contains(event.target) &&
                    !menuToggle.contains(event.target)
                ) {

                    closeMenu();

                }

            }
        );


        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape" &&
                    navbar.classList.contains("active")
                ) {

                    closeMenu();

                    menuToggle.focus();

                }

            }
        );


        window.addEventListener(
            "resize",
            function () {

                if (
                    window.innerWidth > 768 &&
                    navbar.classList.contains("active")
                ) {

                    closeMenu();

                }

            }
        );

    }


    /* =====================================================
       HEADER SCROLL EFFECT
    ===================================================== */

    if (header) {

        function updateHeader() {

            if (window.scrollY > 30) {

                header.classList.add("scrolled");

            } else {

                header.classList.remove("scrolled");

            }

        }


        window.addEventListener(
            "scroll",
            updateHeader,
            { passive: true }
        );


        updateHeader();

    }


    /* =====================================================
       SCROLL REVEAL
       
       IMPORTANT:
       Elements already visible when the page loads
       are shown immediately.
       
       Elements further down still animate when
       the visitor scrolls to them.
    ===================================================== */

    const revealElements =
        document.querySelectorAll(
            [
                ".section-title",
                ".about-grid",
                ".service-card",
                ".why-card",
                ".gallery-grid img",
                ".brands-list span",
                ".contact-card"
            ].join(", ")
        );


    if (
        revealElements.length &&
        "IntersectionObserver" in window
    ) {

        const observer =
            new IntersectionObserver(

                function (entries, observer) {

                    entries.forEach(function (entry) {

                        if (entry.isIntersecting) {

                            entry.target.classList.add("show");

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },

                {
                    threshold: 0.05,

                    rootMargin:
                        "0px 0px -20px 0px"
                }

            );


        revealElements.forEach(
            function (element, index) {

                element.classList.add("reveal");


                /* -----------------------------------------
                   STAGGERED CARD ANIMATION
                ----------------------------------------- */

                if (
                    element.classList.contains("service-card") ||
                    element.classList.contains("why-card") ||
                    element.classList.contains("contact-card") ||
                    element.closest(".gallery-grid")
                ) {

                    const delay =
                        Math.min(index * 45, 250);

                    element.style.setProperty(
                        "--reveal-delay",
                        delay + "ms"
                    );

                }


                /* -----------------------------------------
                   IMPORTANT FIX

                   If the element is already visible
                   when the page opens, reveal it now.
                ----------------------------------------- */

                const rect =
                    element.getBoundingClientRect();


                if (
                    rect.top <
                    window.innerHeight * 0.95
                ) {

                    element.classList.add("show");

                } else {

                    observer.observe(element);

                }

            }
        );


    } else {

        /* Older browser fallback */

        revealElements.forEach(
            function (element) {

                element.classList.add("show");

            }
        );

    }


    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    const yearElements =
        document.querySelectorAll(".current-year");


    yearElements.forEach(
        function (element) {

            element.textContent =
                new Date().getFullYear();

        }
    );


    /* =====================================================
       SMOOTH INTERNAL NAVIGATION
    ===================================================== */

    const internalLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    internalLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    const targetId =
                        link.getAttribute("href");


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {

                        return;

                    }


                    event.preventDefault();


                    const headerHeight =
                        header
                            ? header.offsetHeight
                            : 0;


                    const targetPosition =
                        target.getBoundingClientRect().top +
                        window.pageYOffset -
                        headerHeight;


                    window.scrollTo({

                        top: targetPosition,

                        behavior: "smooth"

                    });

                }
            );

        }
    );


    /* =====================================================
       ACCESSIBILITY
    ===================================================== */

    if (menuToggle) {

        menuToggle.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    toggleMenu();

                }

            }
        );

    }


    /* =====================================================
       PAGE READY
    ===================================================== */

    document.body.classList.add("js-ready");

});
