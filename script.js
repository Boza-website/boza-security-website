/* =========================================================
   JAVASCRIPT SCROLL REVEAL
========================================================= */

.reveal {

    opacity: 0;

    transform: translateY(25px);

    transition:
        opacity 0.7s ease,
        transform 0.7s ease;

}


.reveal.show {

    opacity: 1;

    transform: translateY(0);

}


.site-header.scrolled {

    box-shadow:
        0 8px 25px rgba(0, 0, 0, 0.65);

}


.image-error {

    background: var(--black);

    min-height: 100px;

}
