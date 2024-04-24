// ---------- NETFLIX ANIMATION ---------- //

/*
  _   _
 | \ | |
 |  \| |
 | . ` |
 | |\  |
 |_| \_| */
const n_tl = gsap.timeline();
n_tl
    .to("#N1-shadow", {opacity: 0, duration: 0.167}, 0.3)
    .to("#N3-shadow", {opacity: 0, duration: 0.5}, 0.3)

/*
  ______
 |  ____|
 | |__
 |  __|
 | |____
 |______|*/
const e_ogShape = "M255.1 171.6V208.2L250.5 208.5L250 172L255.1 171.6Z";
const e_tl = gsap.timeline();
e_tl
    .from("#E1-base", {morphSVG:{shape: e_ogShape, type: "linear"}, opacity: 0, duration: 0.05}, 0)
    .from("#E2-base", {scaleY: 0, transformOrigin: "50% 100%", duration: 0.033}, 0.11)
    .from("#E3", {scaleX: 0, duration: 0.02}, 0.21)
    .from("#E4", {scaleX: 0, duration: 0.06}, 0.27)
    .to("#E1-shadow, #E2-shadow", {opacity: 0, duration: 0.27}, 0)

/*
  _______
 |__   __|
    | |
    | |
    | |
    |_|*/
const t_tl = gsap.timeline();
t_tl
    .from("#T1", {scaleX: 0, duration: 0.033}, 0)
    .from("#T2-base", {scaleY: 0, duration: 0.0833}, 0.1)
    .to("#T2-shadow", {opacity: 0, duration: 0.41}, 0)

/*
  ______
 |  ____|
 | |__
 |  __|
 | |
 |_|*/
const f_tl = gsap.timeline();
f_tl
    .from("#F1", {scaleX: 0, duration: 0.075}, 0)
    .from("#F2-base", {scaleY: 0, duration: 0.165}, 0.1)
    .from("#F3", {scaleX: 0, duration: 0.05}, 0.28)
    .to("#F2-shadow", {opacity: 0, duration: 0.2867}, 0)

/*
  _
 | |
 | |
 | |
 | |____
 |______|*/
const l_ogShape = "M540.5 167.5L546 167.781V204.371L540.5 204.1V167.5Z";
const l_tl = gsap.timeline();
l_tl
    .from("#L1-base", {scaleY: 0, duration: 0.0733}, 0)
    .from("#L2", {morphSVG:{shape: l_ogShape, type: "linear"}, opacity: 0, duration: 0.033}, 0.2)
    .to("#L1-shadow", {opacity: 0, duration: 0.2767}, 0)

/*
  _____
 |_   _|
   | |
   | |
  _| |_
 |_____|*/
const i_tl = gsap.timeline();
i_tl
    .from("#I", {scaleY: 0, transformOrigin: "50% 100%", duration: 0.06}, 0)

/*
 __   __
 \ \ / /
  \ V /
   > <
  / . \
 /_/ \_\*/
const x1_ogShape = "M733.1 216.8L771.5 220.8L772.5 218.5L734.5 213.5L733.1 216.8Z";
const x2_ogShape = "M737 0L738 2.5H777.5L776.5 0H737Z";
const x_tl = gsap.timeline();
x_tl
    .from("#X1", {morphSVG:{shape: x1_ogShape, type: "linear", shapeIndex: 2}, duration: 0.21}, 0)
    .from("#X1", {opacity: 0, duration: 0.033,}, 0)
    .from("#X2-base", {morphSVG:{shape: x2_ogShape, type: "linear", shapeIndex: 2}, duration: 0.1767}, 0.11)
    .from("#X2-base", {opacity: 0, duration: 0.0033,}, 0.11)
    .to("#X2-shadow", {opacity: 0, duration: 0.4334}, 0)

//Movement Timeline
const movement_tl = gsap.timeline();
movement_tl
    .from("svg", {opacity: 0, duration: 0.2334}, 0)
    .from("svg", {xPercent:50, left:"50%",  duration: 0.6333,  ease: CustomEase.create("custom", "M0,0,C0.358,0.144,0.098,1,1,1")}, 0.7)

//Exit Timeline
const exit_tl = gsap.timeline();
exit_tl
    .to("svg", {opacity: 0, duration: 0.1667})

//Master Timeline
const master_tl = gsap.timeline({repeat: -1, repeatDelay: 0.5});
master_tl
    .add((movement_tl), 0)
    .add((n_tl), 0.7)
    .add((e_tl), 0.8)
    .add((t_tl), 1.08)
    .add((f_tl), 1.18)
    .add((l_tl), 1.33)
    .add((i_tl), 1.63)
    .add((x_tl), 1.7)
    .add((exit_tl), 3)
