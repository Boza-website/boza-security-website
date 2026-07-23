// ==========================
// MOBILE MENU
// ==========================

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("nav");

if(menuToggle){

menuToggle.addEventListener("click",()=>{

nav.classList.toggle("active");

});

}

// Close menu after clicking a link

document.querySelectorAll("nav a").forEach(link=>{

link.addEventListener("click",()=>{

nav.classList.remove("active");

});

});
// ==========================
// SCROLL ANIMATION
// ==========================

const sections=document.querySelectorAll("section");

const observer=new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.style.opacity="1";
entry.target.style.transform="translateY(0)";

}

});

},{threshold:0.15});

sections.forEach(section=>{

section.style.opacity="0";
section.style.transform="translateY(40px)";
section.style.transition="all .8s ease";

observer.observe(section);

});
