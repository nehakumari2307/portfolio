'use strict';

var TxtType = function (el, toRotate, period) {
    this.toRotate = toRotate;
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 1000;
    this.txt = '';
    this.tick();
    this.isDeleting = false;
};

TxtType.prototype.tick = function () {
    var i = this.loopNum % this.toRotate.length;
    var fullTxt = this.toRotate[i];

    if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';

    var that = this;
    var delta = 200 - Math.random() * 100;

    if (this.isDeleting) { delta /= 2; }

    if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        delta = 300;
    }

    setTimeout(function () {
        that.tick();
    }, delta);
};

window.onload = function () {
    var elements = document.getElementsByClassName('txt-rotate');
    for (var i = 0; i < elements.length; i++) {
        var toRotate = elements[i].getAttribute('data-rotate');
        var period = elements[i].getAttribute('data-period');
        if (toRotate) {
            new TxtType(elements[i], JSON.parse(toRotate), period);
        }
    }
    // INJECT CSS
    // var css = document.createElement("style");
    // css.type = "text/css";
    // css.innerHTML = ".typewrite > .wrap { border-right: 0.08em solid #fff}";
    // document.body.appendChild(css);
};

/**
 * element toggle function
 */

const elemToggleFunc = function (elem) { elem.classList.toggle("active"); }



/**
 * header sticky & go to top
 */

const header = document.querySelector("[data-header]");
const goTopBtn = document.querySelector("[data-go-top]");

window.addEventListener("scroll", function () {

    if (window.scrollY >= 10) {
        header.classList.add("active");
        goTopBtn.classList.add("active");
    } else {
        header.classList.remove("active");
        goTopBtn.classList.remove("active");
    }

});



/**
 * navbar toggle
 */

const navToggleBtn = document.querySelector("[data-nav-toggle-btn]");
const navbar = document.querySelector("[data-navbar]");

navToggleBtn.addEventListener("click", function () {

    elemToggleFunc(navToggleBtn);
    elemToggleFunc(navbar);
    elemToggleFunc(document.body);

});



/**
 * skills toggle
 */

const toggleBtnBox = document.querySelector("[data-toggle-box]");
const toggleBtns = document.querySelectorAll("[data-toggle-btn]");
const skillsBox = document.querySelector("[data-skills-box]");

for (let i = 0; i < toggleBtns.length; i++) {
    toggleBtns[i].addEventListener("click", function () {

        elemToggleFunc(toggleBtnBox);
        for (let i = 0; i < toggleBtns.length; i++) { elemToggleFunc(toggleBtns[i]); }
        elemToggleFunc(skillsBox);

    });
}



/**
 * dark & light theme toggle
 */

const themeToggleBtn = document.querySelector("[data-theme-btn]");

themeToggleBtn.addEventListener("click", function () {

    elemToggleFunc(themeToggleBtn);

    if (themeToggleBtn.classList.contains("active")) {
        document.body.classList.remove("dark_theme");
        document.body.classList.add("light_theme");

        localStorage.setItem("theme", "light_theme");
    } else {
        document.body.classList.add("dark_theme");
        document.body.classList.remove("light_theme");

        localStorage.setItem("theme", "dark_theme");
    }

});

/**
 * check & apply last time selected theme from localStorage
 */

if (localStorage.getItem("theme") === "light_theme") {
    themeToggleBtn.classList.add("active");
    document.body.classList.remove("dark_theme");
    document.body.classList.add("light_theme");
} else {
    themeToggleBtn.classList.remove("active");
    document.body.classList.remove("light_theme");
    document.body.classList.add("dark_theme");
}

/**
 * magnify images
 */

const parseHTML = htmlStr => {
    const range = document.createRange()
    range.selectNode(document.body) // required in Safari
    return range.createContextualFragment(htmlStr)
}

// pass this function any image element to add magnifying functionality
const makeImgMagnifiable = img => {
    const magnifierFragment = parseHTML(`
      <div class="magnifier-container">
        <div class="magnifier">
          <img class="magnifier__img" src="${img.src}"/>
        </div>
      </div>
    `)

    // This preserves the original element reference instead of cloning it.
    img.parentElement.insertBefore(magnifierFragment, img)
    const magnifierContainerEl = document.querySelector('.magnifier-container')
    img.remove()
    magnifierContainerEl.appendChild(img)

    // query the DOM for the newly added elements
    const magnifierEl = magnifierContainerEl.querySelector('.magnifier')
    const magnifierImg = magnifierEl.querySelector('.magnifier__img')

    // set up the transform object to be mutated as mouse events occur
    const transform = {
        translate: [0, 0],
        scale: 1,
    }

    // shortcut function to set the transform css property
    const setTransformStyle = (el, { translate, scale }) => {
        const [xPercent, yRawPercent] = translate
        const yPercent = yRawPercent < 0 ? 0 : yRawPercent

        // make manual pixel adjustments to better center
        // the magnified area over the cursor.
        const [xOffset, yOffset] = [
            `calc(-${xPercent}% + 250px)`,
            `calc(-${yPercent}% + 70px)`,
        ]

        el.style = `
        transform: scale(${scale}) translate(${xOffset}, ${yOffset});
      `
    }

    // show magnified thumbnail on hover
    img.addEventListener('mousemove', event => {
        const [mouseX, mouseY] = [event.pageX + 40, event.pageY - 20]
        const { top, left, bottom, right } = img.getBoundingClientRect()
        transform.translate = [
            ((mouseX - left) / right) * 100,
            ((mouseY - top) / bottom) * 100,
        ]
        magnifierEl.style = `
        display: block;
        top: ${mouseY}px;
        left: ${mouseX}px;
      `
        setTransformStyle(magnifierImg, transform)
    })

    // zoom in/out with mouse wheel
    img.addEventListener('wheel', event => {
        event.preventDefault()
        const scrollingUp = event.deltaY < 0
        const { scale } = transform
        transform.scale = scrollingUp && scale < 3
            ? scale + 0.1
            : !scrollingUp && scale > 1
                ? scale - 0.1
                : scale
        setTransformStyle(magnifierImg, transform)
    })

    // reset after mouse leaves
    img.addEventListener('mouseleave', () => {
        magnifierEl.style = ''
        magnifierImg.style = ''
    })


}

// const img = document.querySelector('.image-preview-js')
// makeImgMagnifiable(img)