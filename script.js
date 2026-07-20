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
/* ==========================================
MOBILE MENU
========================================== */

@media(max-width:900px){

nav{

display:none;
width:100%;
margin-top:20px;

}

nav.active{

display:block;

}

nav ul{

flex-direction:column;
align-items:center;

}

.menu-btn{

display:block;

}

}
const hero = document.querySelector(".hero");

const heroImages = [

"images/hero1.jpg",
"images/hero2.jpg",
"images/hero3.jpg",
"images/hero4.jpg",
"images/hero5.jpg"

];

let currentImage = 0;

setInterval(()=>{

currentImage++;

if(currentImage >= heroImages.length){

currentImage = 0;

}

hero.style.backgroundImage =
`linear-gradient(rgba(0,0,0,.70),rgba(0,0,0,.70)),url('${heroImages[currentImage]}')`;

},6000);
