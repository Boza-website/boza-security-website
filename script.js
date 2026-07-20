/* ==========================================
   BOZA SECURITY WEBSITE
   SCRIPT.JS
========================================== */

// Smooth scrolling for navigation links

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

anchor.addEventListener("click", function(e){

e.preventDefault();

const target=document.querySelector(this.getAttribute("href"));

if(target){

target.scrollIntoView({

behavior:"smooth"

});

}

});

});

// Header shadow while scrolling

window.addEventListener("scroll",()=>{

const header=document.querySelector("header");

if(window.scrollY>50){

header.style.boxShadow="0 5px 25px rgba(0,0,0,.45)";

}else{

header.style.boxShadow="none";

}

});

// Fade in sections

const observer=new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

});

document.querySelectorAll("section").forEach(section=>{

observer.observe(section);

});

// Counter animation

const counters=document.querySelectorAll(".stat h3");

counters.forEach(counter=>{

const updateCounter=()=>{

const target=+counter.innerText.replace("+","").replace("%","");

const count=+counter.getAttribute("data-count")||0;

const speed=25;

if(count<target){

counter.setAttribute("data-count",count+1);

counter.innerText=count+1+(counter.innerText.includes("%")?"%":"+");

setTimeout(updateCounter,speed);

}

};

updateCounter();

});
section{
opacity:0;
transform:translateY(50px);
transition:1s;
}

section.show{
opacity:1;
transform:translateY(0);
   }
