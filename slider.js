const slider = document.querySelector ("#slider");
let sliderSection = document.querySelectorAll(".slider__section");
let sliderSectionLast = sliderSection[sliderSection.length -1];

const btnLeft = document.querySelector ("#btn-left");
const btnRight = document.querySelector ("#btn-right");

slider.insertAdjacentElement('afterbegin', sliderSectionLast);

function Next() {
    let sliderSectionFirst = document.querySelectorAll(".slider__section")[0];
    slider.stylemarginLeft = "-200%";
    slider.style.transition = "all 2.5s";
    setTimeout (function() {
        slider.style.transition = "none";
        slider.insertAdjacentElement ('beforeend', sliderSectionFirst);
        slider.stylemarginLeft = "-100%";
    }, 500); 
}

function Prev() {
    let sliderSection = document.querySelectorAll(".slider__section");
    let sliderSectionLast = sliderSection[sliderSection.lenght -1];
    slider.stylemarginLeft = "0%";
    slider.style.transition = "all 2.5s";
    setTimeout (function(){
        slider.style.transition = "none";
        slider.insertAdjacentElement('afterbegin', sliderSectionLast);
        slider.stylemarginLeft = "-100%";
    }, 500); 
}

btnRight.addEventListener('click', function(){
    Next();
});

btnLeft.addEventListener('click', function(){
    Prev();
});

setInterval(function(){
    Next();
}, 2000);



