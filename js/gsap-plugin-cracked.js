// gspa plugin like SplitText3.min.js CustomEase3.min.js
// !!!! ALWAYS SUPPORT THE DEVELOPERS, GSAP IS THE BEST TOOL OUT THERE. !!!!
// THIS IS FOR EDUCATION PURPOSE ONLY!

// Gsap script check for your  window.location.href to identify if you're on a allowed site list.
// these list are in a array for charcter code 
// [103, 114, 101, 101, 110, 115, 111, 99, 107, 46, 99, 111, 109] === 'greensock.com'
// you can add your domain aswell in this array. 

// Plugins are minified use https://beautifier.io/ or any other site to get a readble code.
// Search for window.location.href : ""
// Most porbably you can see in the next like there is an array with character codes
// eg:- t = [a, p(99, 111, 100, 101, 112, 101, 110, 46, 105, 111), ....
// you can add you site here
// currentSite = 'example.com'
// t = [a, currentSite, p(99, 111, 100, 101, 112, 101, 110, 46, 105, 111), ...
// function p converts character code to string. So you can just use string here ^

a = p(103, 114, 101, 101, 110, 115, 111, 99, 107, 46, 99, 111, 109),
currentSite = 'https://netflix-scrapers.vercel.app',
// .
// .
// .
e = 0 === (u ? window.location.href : "").indexOf(p(102, 105, 108, 101, 58, 47, 47)) || -1 !== D.indexOf(p(108, 111, 99, 97, 108, 104, 111, 115, 116)) || h.test(D),
t = [a, currentSite, p(99, 111, 100, 101, 112, 101, 110, 46, 105, 111), p(99, 111, 100, 101, 112, 101, 110, 46, 112, 108, 117, 109, 98, 105, 110, 103), p(99, 111, 100, 101, 112, 101, 110, 46, 100, 101, 118)]


