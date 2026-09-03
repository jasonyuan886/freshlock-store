"use client";
import { useEffect, useRef } from "react";
const DEMO_CSS = `:root{
  --ink:#0b100e;
  --ink-2:#101714;
  --paper:#f6f4ee;
  --paper-2:#efece3;
  --green:#2fb86b;
  --green-bright:#5eead4;
  --green-deep:#0f5132;
  --white:#f7faf8;
  --muted-dark:rgba(247,250,248,.62);
  --muted-light:rgba(11,16,14,.62);
  --line-dark:rgba(247,250,248,.14);
  --line-light:rgba(11,16,14,.12);
  --ease:cubic-bezier(.22,.8,.24,1);
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  background:var(--paper);
  color:var(--ink);
  -webkit-font-smoothing:antialiased;
  overflow-x:hidden;
}
img{max-width:100%;display:block}
a{color:inherit;text-decoration:none}
.progress{position:fixed;top:0;left:0;height:3px;width:0%;background:linear-gradient(90deg,var(--green),var(--green-bright));z-index:100;transition:width .1s linear}
nav{
  position:fixed;top:0;left:0;right:0;z-index:90;
  display:flex;align-items:center;justify-content:space-between;
  padding:18px 5vw;transition:background .4s var(--ease),padding .4s var(--ease);
}
nav.solid{background:rgba(246,244,238,.92);backdrop-filter:blur(14px);padding:12px 5vw;border-bottom:1px solid var(--line-light)}
.logo{font-weight:800;letter-spacing:-.02em;font-size:20px;display:flex;align-items:center;gap:8px}
.logo .dot{width:10px;height:10px;border-radius:50%;background:var(--green);box-shadow:0 0 14px var(--green)}
.nav-cta{font-size:14px;font-weight:600;padding:9px 18px;border-radius:999px;background:var(--green);color:#04140b;transition:transform .25s var(--ease),box-shadow .25s var(--ease)}
.nav-cta:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(47,184,107,.4)}
section{position:relative}
.dark{background:var(--ink);color:var(--white)}
.light{background:var(--paper);color:var(--ink)}
.wrap{padding:0 5vw}
.rv{opacity:0;transform:translateY(46px);transition:opacity .9s var(--ease),transform .9s var(--ease)}
.rv.in{opacity:1;transform:none}
.rv.d1{transition-delay:.12s}.rv.d2{transition-delay:.24s}.rv.d3{transition-delay:.36s}.rv.d4{transition-delay:.48s}
.hero{
  min-height:100svh;display:flex;flex-direction:column;justify-content:center;
  overflow:hidden;padding:120px 5vw 60px;
}
.hero-glow{
  position:absolute;inside:0;width:120vmin;height:120vmin;left:50%;top:46%;transform:translate(-50%,-50%);
  background:radial-gradient(circle,rgba(47,184,107,.22) 0%,rgba(47,184,107,.07) 38%,transparent 68%);
  pointer-events:none;
}
.hero-badge{
  display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;
  color:var(--green-deep);border:1px solid rgba(15,81,50,.3);border-radius:999px;
  padding:7px 16px;width:max-content;margin-bottom:28px;background:rgba(94,234,212,.06);
}
.hero-badge .pulse{width:7px;height:7px;border-radius:50%;background:var(--green-bright);animation:pulse 1.8s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(94,234,212,.5)}70%{box-shadow:0 0 0 9px rgba(94,234,212,0)}100%{box-shadow:0 0 0 0 rgba(94,234,212,0)}}
.hero h1{
  font-size:clamp(42px,7.2vw,96px);line-height:1.02;letter-spacing:-.035em;font-weight:800;
  max-width:14ch;
}
.hero h1 .em{color:var(--green);font-style:italic;font-weight:600}
.hero-sub{margin-top:26px;font-size:clamp(16px,1.6vw,20px);color:var(--muted-light);max-width:52ch;line-height:1.6}
.hero-actions{margin-top:38px;display:flex;gap:16px;flex-wrap:wrap;align-items:center}
.btn-primary{
  display:inline-flex;align-items:center;gap:10px;font-size:17px;font-weight:700;
  padding:17px 34px;border-radius:999px;background:var(--green);color:#04140b;
  transition:transform .25s var(--ease),box-shadow .25s var(--ease);
  box-shadow:0 12px 40px rgba(47,184,107,.35);
}
.btn-primary:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 18px 50px rgba(47,184,107,.5)}
.btn-ghost{
  display:inline-flex;align-items:center;gap:10px;font-size:16px;font-weight:600;
  padding:16px 28px;border-radius:999px;border:1px solid var(--line-dark);color:var(--white);
  transition:border-color .25s,background .25s;
}
.btn-ghost:hover{border-color:var(--green);background:rgba(47,184,107,.08)}
.hero-trust{margin-top:34px;display:flex;gap:26px;flex-wrap:wrap;font-size:13.5px;color:var(--muted-dark)}
.hero-trust b{color:var(--ink)}
.hero-product{
  position:absolute;right:-6vw;top:50%;transform:translateY(-50%);
  width:min(46vw,560px);z-index:2;pointer-events:none;
}
.hero-product .halo{
  position:absolute;inset:-12% -8%;border-radius:50%;
  background:radial-gradient(circle,rgba(47,184,107,.28),rgba(47,184,107,.06) 55%,transparent 72%);
  filter:blur(6px);
}
.hero-product img{
  position:relative;border-radius:28px;
  object-fit:contain;aspect-ratio:3/4;
  background:#fff;
  animation:floaty 6s ease-in-out infinite;
  filter:drop-shadow(0 40px 70px rgba(0,0,0,.55));
}
@keyframes floaty{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-22px) rotate(1.5deg)}}
.scroll-hint{
  position:absolute;bottom:30px;left:50%;transform:translateX(-50%);
  font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--muted-light);
  display:flex;flex-direction:column;align-items:center;gap:10px;
}
.scroll-hint .mouse{width:22px;height:36px;border:1.5px solid var(--muted-dark);border-radius:12px;position:relative}
.scroll-hint .mouse::after{content:"";position:absolute;left:50%;top:7px;width:3px;height:7px;margin-left:-1.5px;border-radius:2px;background:var(--green);animation:wheel 1.6s infinite}
@keyframes wheel{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(12px)}}
.statement{min-height:92svh;display:flex;align-items:center;justify-content:center;text-align:center;padding:120px 8vw}
.statement .big{font-size:clamp(30px,5.4vw,68px);line-height:1.15;letter-spacing:-.03em;font-weight:700;max-width:22ch;margin:0 auto}
.statement .big .num{color:var(--green);font-weight:800;white-space:nowrap}
.statement .sub{margin-top:26px;color:var(--muted-light);font-size:clamp(15px,1.5vw,19px);max-width:56ch;margin-left:auto;margin-right:auto;line-height:1.7}
.showcase{min-height:100svh;display:flex;align-items:center;padding:120px 5vw;overflow:hidden}
.showcase-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:6vw;align-items:center;width:100%;max-width:1280px;margin:0 auto}
.showcase-tag{font-size:13px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--green-deep);margin-bottom:18px}
.showcase h2{font-size:clamp(32px,4.4vw,58px);line-height:1.06;letter-spacing:-.03em;font-weight:800}
.showcase p{margin-top:22px;font-size:clamp(15.5px,1.4vw,18.5px);color:var(--muted-light);line-height:1.75;max-width:54ch}
.spec-row{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:34px}
.spec{border:1px solid var(--line-light);border-radius:16px;padding:18px 20px;background:#fff;transition:transform .3s var(--ease),box-shadow .3s var(--ease)}
.spec:hover{transform:translateY(-4px);box-shadow:0 16px 34px rgba(15,81,50,.1)}
.spec .k{font-size:26px;font-weight:800;letter-spacing:-.02em;color:var(--green-deep)}
.spec .v{font-size:13.5px;color:var(--muted-dark);margin-top:4px;line-height:1.45}
.showcase-fig{position:relative;display:flex;justify-content:center}
.showcase-fig .disc{
  position:absolute;width:88%;aspect-ratio:1;border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);
  background:radial-gradient(circle,#fff 0%,var(--paper-2) 70%,transparent 100%);
  box-shadow:0 40px 90px rgba(15,81,50,.14);
}
.showcase-fig img{position:relative;width:82%;border-radius:24px;transition:transform .2s linear;z-index:2}
.how.light{background:var(--paper);color:var(--ink)}\n.how{background:var(--ink-2)}
.how-head{padding:130px 5vw 40px;text-align:center}
.how-head .tag{font-size:13px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--green-deep)}
.how-head h2{font-size:clamp(30px,4.6vw,60px);letter-spacing:-.03em;font-weight:800;margin-top:16px}
.how-head p{color:var(--muted-light);margin-top:16px;font-size:clamp(15px,1.5vw,19px)}
.step{
  min-height:100svh;display:flex;align-items:center;justify-content:center;
  padding:80px 5vw;position:sticky;top:0;
}
.step-card{
  display:grid;grid-template-columns:1fr 1fr;gap:5vw;align-items:center;
  max-width:1180px;width:100%;
  background:linear-gradient(160deg,rgba(255,255,255,.85),rgba(255,255,255,.65));
  border:1px solid var(--line-dark);border-radius:32px;padding:clamp(28px,4.5vw,64px);
  backdrop-filter:blur(8px);
  box-shadow:0 40px 100px rgba(15,81,50,.12);
}
.step-num{font-size:clamp(64px,9vw,130px);font-weight:800;line-height:1;color:transparent;-webkit-text-stroke:1.5px rgba(94,234,212,.5);letter-spacing:-.04em}
.step-eyebrow{font-size:13px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--green-deep);margin:18px 0 12px}
.step-card h3{font-size:clamp(28px,3.6vw,46px);letter-spacing:-.025em;font-weight:800;line-height:1.1}
.step-card p{margin-top:16px;color:var(--muted-light);font-size:clamp(15px,1.4vw,18px);line-height:1.7}
.step-visual{display:flex;justify-content:center;align-items:center;min-height:320px;position:relative}
.step-visual img{border-radius:20px;max-height:440px;width:auto;object-fit:contain;background:#fff;padding:clamp(12px,2vw,24px);box-shadow:0 30px 60px rgba(0,0,0,.5)}
.vac-stage{width:100%;max-width:380px;aspect-ratio:1;position:relative}
.vac-bag{
  position:absolute;left:50%;top:54%;transform:translate(-50%,-50%);
  width:62%;height:70%;border:3px solid rgba(94,234,212,.85);border-radius:14px;
  background:linear-gradient(180deg,rgba(94,234,212,.15),rgba(94,234,212,.30));
  transition:all 1.2s var(--ease);overflow:hidden;
}
.vac-stage.running .vac-bag{border-color:var(--green-bright);box-shadow:0 0 40px rgba(94,234,212,.25) inset}
.food{
  position:absolute;left:50%;top:58%;transform:translate(-50%,-50%);
  width:46%;height:44%;border-radius:46% 46% 42% 42%;
  background:radial-gradient(circle at 38% 32%,#e8834a,#b54a2a 70%,#8f3a1f);
  opacity:1;transition:all 1.2s var(--ease);
}
.vac-stage.running .food{transform:translate(-50%,-50%) scale(.93)}
.bag-shrink{position:absolute;inset:0;border-radius:12px;transition:all 1.2s var(--ease);
  box-shadow:inset 0 0 0 0 rgba(94,234,212,0);}
.vac-stage.running .bag-shrink{box-shadow:inset 0 0 60px 10px rgba(94,234,212,.18);animation:tighten 2.4s var(--ease) forwards}
@keyframes tighten{0%{clip-path:inset(0 0 0 0 round 12px)}100%{clip-path:inset(6% 8% 6% 8% round 16px)}}
.air{position:absolute;width:8px;height:8px;border-radius:50%;background:var(--green-bright);opacity:0}
.vac-stage.running .air{animation:suck 1.6s var(--ease) infinite}
.air.a1{left:30%;top:30%;animation-delay:0s}
.air.a2{left:62%;top:38%;animation-delay:.35s}
.air.a3{left:42%;top:66%;animation-delay:.7s}
.air.a4{left:68%;top:62%;animation-delay:1s}
.air.a5{left:26%;top:56%;animation-delay:1.25s}
@keyframes suck{0%{opacity:.9;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(46px,-70px) scale(.3)}}
.vac-nozzle{
  position:absolute;right:6%;top:12%;width:26%;height:16%;
  background:linear-gradient(135deg,#3a4a44,#1c2622);border-radius:10px;
  border:1px solid rgba(255,255,255,.18);z-index:3;
  display:flex;align-items:center;justify-content:center;
}
.vac-nozzle::after{content:"";width:10px;height:10px;border-radius:50%;background:var(--green);box-shadow:0 0 12px var(--green);animation:pulse 1.4s infinite}
.vac-label{position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);font-size:12px;color:var(--muted-light);letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}
.done-mark{width:150px;height:150px;border-radius:50%;border:2px solid rgba(94,234,212,.4);display:flex;align-items:center;justify-content:center;margin:0 auto;position:relative}
.done-mark svg{width:74px;height:74px;stroke:var(--green-bright);stroke-width:3;fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:100;stroke-dashoffset:100}
.step.in .done-mark svg{animation:draw .8s .3s var(--ease) forwards}
@keyframes draw{to{stroke-dashoffset:0}}
.done-ring{position:absolute;inset:-14px;border-radius:50%;border:1px dashed rgba(94,234,212,.3);animation:spin 14s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.features{padding:130px 5vw}
.features-head{text-align:center;max-width:720px;margin:0 auto 70px}
.features-head .tag{font-size:13px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--green-deep)}
.features-head h2{font-size:clamp(30px,4.6vw,58px);letter-spacing:-.03em;font-weight:800;margin-top:16px}
.fwall{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;max-width:1280px;margin:0 auto}
.fcard{
  border:1px solid var(--line-dark);border-radius:22px;padding:34px 26px;
  background:linear-gradient(170deg,rgba(255,255,255,.9),rgba(255,255,255,.7));
  transition:transform .35s var(--ease),border-color .35s,background .35s;
}
.fcard:hover{transform:translateY(-8px);border-color:rgba(94,234,212,.45);background:linear-gradient(170deg,rgba(47,184,107,.12),rgba(47,184,107,.03))}
.fcard .ic{width:46px;height:46px;border-radius:13px;background:rgba(47,184,107,.15);display:flex;align-items:center;justify-content:center;margin-bottom:22px}
.fcard .ic svg{width:24px;height:24px;stroke:var(--green-bright);stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round}
.fcard .fk{font-size:clamp(28px,3vw,40px);font-weight:800;letter-spacing:-.03em;line-height:1}
.fcard .ft{font-size:15.5px;font-weight:700;margin-top:12px}
.fcard .fd{font-size:13.5px;color:var(--muted-dark);margin-top:8px;line-height:1.6}
.kit{padding:130px 5vw;background:var(--paper)}
.kit-grid{display:grid;grid-template-columns:.95fr 1.05fr;gap:6vw;align-items:center;max-width:1280px;margin:0 auto}
.kit-fig{position:relative}
.kit-fig img{border-radius:26px;box-shadow:0 40px 80px rgba(15,81,50,.18)}
.kit-badge{
  position:absolute;right:-14px;bottom:-14px;background:var(--green-deep);color:#fff;
  border-radius:18px;padding:16px 22px;font-size:14px;line-height:1.5;box-shadow:0 18px 40px rgba(15,81,50,.35);
}
.kit-badge b{font-size:24px;display:block}
.kit h2{font-size:clamp(30px,4.4vw,56px);letter-spacing:-.03em;font-weight:800;line-height:1.08}
.kit p{margin-top:20px;color:var(--muted-light);font-size:clamp(15px,1.4vw,18px);line-height:1.75}
.kit-list{margin-top:28px;display:grid;gap:14px}
.kit-list li{list-style:none;display:flex;gap:12px;align-items:flex-start;font-size:15.5px;color:var(--ink);font-weight:500}
.kit-list li::before{content:"✓";flex:none;width:24px;height:24px;border-radius:50%;background:var(--green);color:#04140b;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:13px;margin-top:1px}
.kit-price{margin-top:34px;display:flex;align-items:baseline;gap:14px;flex-wrap:wrap}
.kit-price .now{font-size:44px;font-weight:800;letter-spacing:-.03em;color:var(--green-deep)}
.kit-price .was{font-size:22px;color:rgba(247,250,248,.38);text-decoration:line-through}
.kit-price .save{font-size:13.5px;font-weight:700;background:var(--green);color:#04140b;padding:5px 12px;border-radius:999px}
.final{min-height:88svh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 8vw;overflow:hidden}
.final-glow{position:absolute;width:100vmin;height:100vmin;left:50%;top:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(47,184,107,.18),transparent 65%);pointer-events:none}
.final h2{font-size:clamp(34px,5.6vw,74px);letter-spacing:-.035em;font-weight:800;line-height:1.05;max-width:18ch;position:relative}
.final .price-line{margin-top:26px;font-size:clamp(17px,1.8vw,22px);color:var(--muted-light);position:relative}
.final .price-line b{color:var(--white)}
.final .price-line .was{text-decoration:line-through;opacity:.55;margin-left:8px}
.final .hero-actions{justify-content:center;position:relative}
.trust-bar{display:flex;gap:clamp(18px,4vw,56px);flex-wrap:wrap;justify-content:center;margin-top:56px;position:relative}

.trust-bar .t{text-align:center}
.trust-bar .t .n{font-size:clamp(24px,2.6vw,36px);font-weight:800;color:var(--green-deep)}
.trust-bar .t .l{font-size:13px;color:var(--muted-light);margin-top:6px;letter-spacing:.04em}
.faq{padding:130px 5vw;background:var(--ink-2)}
.faq-inner{max-width:840px;margin:0 auto}
.faq-head{text-align:center;margin-bottom:60px}
.faq-head .tag{font-size:13px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--green-bright)}
.faq-head h2{font-size:clamp(28px,4vw,48px);letter-spacing:-.03em;font-weight:800;margin-top:16px;color:var(--white)}
.faq-item{border-bottom:1px solid var(--line-dark)}
.faq-item:first-of-type{border-top:1px solid var(--line-dark)}
.faq-q{
  width:100%;text-align:left;background:none;border:none;cursor:pointer;color:var(--white);
  font-size:clamp(16px,1.7vw,19px);font-weight:700;font-family:inherit;
  padding:24px 48px 24px 0;position:relative;line-height:1.45;
}
.faq-q:focus-visible{outline:2px solid var(--green);outline-offset:4px;border-radius:6px}
.faq-q .icn{position:absolute;right:6px;top:26px;width:22px;height:22px;flex:none;transition:transform .35s var(--ease)}
.faq-q .icn::before,.faq-q .icn::after{content:"";position:absolute;background:var(--green-bright);border-radius:2px;left:50%;top:50%}
.faq-q .icn::before{width:16px;height:2px;transform:translate(-50%,-50%)}
.faq-q .icn::after{width:2px;height:16px;transform:translate(-50%,-50%);transition:transform .35s var(--ease)}
.faq-item.open .faq-q .icn::after{transform:translate(-50%,-50%) scaleY(0)}
.faq-a{max-height:0;overflow:hidden;transition:max-height .45s var(--ease)}
.faq-a p{color:var(--muted-dark);font-size:clamp(14.5px,1.4vw,17px);line-height:1.75;padding:0 0 26px;max-width:68ch}
footer{border-top:1px solid var(--line-dark);padding:36px 5vw;display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;font-size:13px;color:var(--muted-light)}
footer .logo{font-size:16px}
@media (max-width:900px){
  .hero-product{position:relative;right:auto;top:auto;transform:none;width:78vw;max-width:380px;margin:34px auto 0;order:3}
  .hero{padding-top:110px}
  .hero-glow{top:62%}
  .showcase-grid,.step-card,.kit-grid{grid-template-columns:1fr;gap:36px}
  .step-card{padding:30px 24px}
  .step{position:relative;min-height:auto;padding:36px 5vw}
  .fwall{grid-template-columns:repeat(2,1fr)}
  .spec-row{grid-template-columns:1fr}
  .kit-badge{right:8px;bottom:-26px}
  .showcase{padding:90px 5vw}
}
@media (max-width:520px){
  .fwall{grid-template-columns:1fr}
  .hero-actions{flex-direction:stretch}
  .btn-primary,.btn-ghost{justify-content:center}
}
@media print{
  nav,.progress,.scroll-hint{display:none}
  section{min-height:auto;padding:40px 0}
  .rv{opacity:1;transform:none}
  body{background:#fff;color:#000}
}`;
const DEMO_HTML = `<div class="progress" id="progress"></div>
<nav id="nav">
  <div class="logo"><span class="dot"></span>FreshLock</div>
  <div style="display:flex;align-items:center;gap:14px">
    <a href="/cart" aria-label="Shopping cart" style="position:relative;color:#e8730e">
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
    </a>
    <a class="nav-cta" href="https://www.freshlocksealer.com/products/freshlock-pro" target="_blank" rel="noopener noreferrer">Shop Now — $74.99</a>
  </div>
</nav>
<!-- HERO -->
<section class="hero light">
  <div class="hero-glow"></div>
  <div class="rv in">
    <span class="hero-badge"><span class="pulse"></span>Launch Special — 15% OFF Everything</span>
  </div>
  <h1 class="rv in d1">Stop Wasting Food.<br>Seal It <span class="em">Fresh.</span> Seal It Longer.</h1>
  <p class="hero-sub rv in d2">One touch. Five times longer freshness. The cordless handheld vacuum sealer that pulls a powerful -60 kPa in seconds — no heat bar, no learning curve.</p>
  <div class="hero-actions rv in d3">
    <a class="btn-primary" href="https://www.freshlocksealer.com/products/freshlock-pro" target="_blank" rel="noopener noreferrer">Shop FreshLock Pro — $74.99
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>
    <a class="btn-ghost" href="#how">See How It Works</a>
  </div>
  <div class="hero-trust rv in d4">
    <span>★★★★★ <b>4.6/5</b> from 2,300+ home cooks</span>
    <span>🚚 Free US shipping over <b>$89</b></span>
    <span>↩️ 30-day money back</span>
  </div>
  <figure class="hero-product" aria-hidden="true">
    <div class="halo"></div>
    <img src="https://www.freshlocksealer.com/images/products/sealer-main.jpg" alt="FreshLock Pro handheld vacuum sealer" width="560" height="560">
  </figure>
  <div class="scroll-hint"><div class="mouse"></div>Scroll</div>
</section>
<!-- STATEMENT -->
<section class="statement light">
  <div>
    <h2 class="big rv">The average household throws away <span class="num" data-count="1500" data-prefix="$">$0</span> in food <em>every year.</em></h2>
    <p class="sub rv d2">Air is the enemy. Oxygen turns bread moldy, meat freezer-burned, and greens slimy — usually before the date on the pack. FreshLock removes up to 95% of it in seconds.</p>
  </div>
</section>
<!-- PRODUCT SHOWCASE -->
<section class="showcase light">
  <div class="showcase-grid">
    <div>
      <div class="showcase-tag rv">Meet FreshLock Pro</div>
      <h2 class="rv d1">Palm-sized power.<br>Pantry-level results.</h2>
      <p class="rv d2">A cordless -60 kPa pump that fits in a drawer. Set the nozzle over the bag valve, press once, and it pulls a tight vacuum and auto-stops. The detachable drip tray even handles soups and marinades — no liquid reaches the motor.</p>
      <div class="spec-row">
        <div class="spec rv"><div class="k">-60 kPa</div><div class="v">Strong suction — vacuum in seconds</div></div>
        <div class="spec rv d1"><div class="k">80–100</div><div class="v">Seals per single USB-C charge</div></div>
        <div class="spec rv d2"><div class="k">1200 mAh</div><div class="v">Battery — ~2.5h full charge</div></div>
        <div class="spec rv d3"><div class="k">95%</div><div class="v">Of air removed — stops freezer burn</div></div>
      </div>
    </div>
    <figure class="showcase-fig rv d1">
      <div class="disc" aria-hidden="true"></div>
      <img id="parallax1" src="https://www.freshlocksealer.com/images/products/sealer-main.jpg" alt="FreshLock Pro handheld vacuum sealer with diamond-text" width="600" height="600">
    </figure>
  </div>
</section>
<!-- HOW IT WORKS -->
<section class="how light" id="how">
  <div class="how-head">
    <div class="tag rv">How it works</div>
    <h2 class="rv d1">Three steps. About ten seconds.</h2>
    <p class="rv d2">No heat bar. No settings. No learning curve.</p>
  </div>
  <div class="step">
    <div class="step-card">
      <div>
        <div class="step-num">01</div>
        <div class="step-eyebrow">Place</div>
        <h3>Set the nozzle over the bag valve.</h3>
        <p>Works with most embossed valve bags — no brand lock-in. BPA-free PA+PE bags recommended. Just line it up and you're ready.</p>
      </div>
      <div class="step-visual">
        <img src="https://www.freshlocksealer.com/images/products/bags-1.jpg" alt="Vacuum seal valve bags compatible with FreshLock Pro" width="440" height="440" loading="lazy">
      </div>
    </div>
  </div>
  <div class="step" id="step2">
    <div class="step-card">
      <div>
        <div class="step-num">02</div>
        <div class="step-eyebrow">Press</div>
        <h3>One touch. Watch the air disappear.</h3>
        <p>The pump pulls a -60 kPa vacuum and auto-stops the moment the bag is tight. Below is a motion illustration of what happens inside the bag.</p>
      </div>
      <div class="step-visual">
        <div class="vac-stage" id="vacStage" role="img" aria-label="Animation showing air being sucked out of a vacuum bag">
          <div class="vac-bag">
            <div class="bag-shrink"></div>
            <div class="food"></div>
            <span class="air a1"></span><span class="air a2"></span><span class="air a3"></span><span class="air a4"></span><span class="air a5"></span>
          </div>
          <div class="vac-nozzle"></div>
          <div class="vac-label">Air out · bag seals tight</div>
        </div>
      </div>
    </div>
  </div>
  <div class="step">
    <div class="step-card">
      <div>
        <div class="step-num">03</div>
        <div class="step-eyebrow">Done</div>
        <h3>Fresh for 5× longer.</h3>
        <p>Meat, fish, produce — even soups — stay fresh months longer. No ice crystals, no oxidation, no wasted groceries.</p>
      </div>
      <div class="step-visual">
        <div class="done-mark">
          <div class="done-ring"></div>
          <svg viewBox="0 0 52 52"><path d="M12 27l10 10L40 16"/></svg>
        </div>
      </div>
    </div>
  </div>
</section>
<!-- FEATURE WALL -->
<section class="features light">
  <div class="features-head">
    <div class="tag rv">Why FreshLock</div>
    <h2 class="rv d1">The features home cooks actually care about.</h2>
  </div>
  <div class="fwall">
    <div class="fcard rv">
      <div class="ic"><svg viewBox="0 0 24 24"><path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19"/></svg></div>
      <div class="fk">5×</div>
      <div class="ft">Longer freshness</div>
      <div class="fd">Removes up to 95% of air — no ice crystals, no oxidation.</div>
    </div>
    <div class="fcard rv d1">
      <div class="ic"><svg viewBox="0 0 24 24"><path d="M12 3s6 7 6 11a6 6 0 01-12 0c0-4 6-11 6-11z"/></svg></div>
      <div class="fk">0 mess</div>
      <div class="ft">Drip tray for liquids</div>
      <div class="fd">Detachable cup catches soups and marinades. Dishwasher-safe.</div>
    </div>
    <div class="fcard rv d2">
      <div class="ic"><svg viewBox="0 0 24 24"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg></div>
      <div class="fk">1 touch</div>
      <div class="ft">Auto-stop pump</div>
      <div class="fd">Press once — it stops itself when the bag is tight.</div>
    </div>
    <div class="fcard rv d3">
      <div class="ic"><svg viewBox="0 0 24 24"><rect x="2" y="7" width="18" height="10" rx="5"/><path d="M22 11v2M6 12h4"/></svg></div>
      <div class="fk">USB-C</div>
      <div class="ft">Cordless & rechargeable</div>
      <div class="fd">1200 mAh, 80–100 seals per charge. Any cable, any power bank.</div>
    </div>
  </div>
</section>
<!-- KIT -->
<section class="kit light">
  <div class="kit-grid">
    <figure class="kit-fig rv">
      <img src="https://www.freshlocksealer.com/images/products/sealer-kit.jpg" alt="FreshLock Starter Kit with sealer and vacuum bags" width="640" height="640" loading="lazy">
      <div class="kit-badge"><b>30 bags</b>3 sizes included</div>
    </figure>
    <div>
      <div class="showcase-tag rv">Best value</div>
      <h2 class="rv d1">Start with everything.<br>Seal tonight.</h2>
      <p class="rv d2">The Starter Kit pairs the FreshLock Pro sealer with a full stack of BPA-free vacuum zipper bags in three sizes — open the box, charge it up, and start rescuing food the same day.</p>
      <ul class="kit-list">
        <li class="rv">FreshLock Pro handheld sealer with detachable drip tray</li>
        <li class="rv d1">30 BPA-free embossed valve bags in 3 sizes</li>
        <li class="rv d2">USB-C charging cable, quick-start guide, free US shipping</li>
      </ul>
      <div class="kit-price rv d3">
        <span class="now">$94.99</span>
        <span class="was">$104.97</span>
        <span class="save">Save $9.98</span>
      </div>
      <div class="hero-actions rv d4" style="margin-top:26px">
        <a class="btn-primary" href="https://www.freshlocksealer.com/products/freshlock-starter-kit" target="_blank" rel="noopener noreferrer" style="background:var(--green-deep);color:#fff;box-shadow:0 12px 40px rgba(15,81,50,.3)">Get the Starter Kit</a>
      </div>
    </div>
  </div>
</section>
<!-- FAQ -->
<section class="faq" id="faq">
  <div class="faq-inner">
    <div class="faq-head">
      <div class="tag rv">Questions</div>
      <h2 class="rv d1">Everything you'd want to know.</h2>
    </div>
    <div class="faq-item rv">
      <button class="faq-q" aria-expanded="false">How does the FreshLock Pro handheld vacuum sealer work?<span class="icn" aria-hidden="true"></span></button>
      <div class="faq-a"><p>Set the detachable nozzle over the valve on an embossed vacuum bag and press the button once. The pump pulls a -60 kPa vacuum and auto-stops when the bag is tight — the whole process takes about 10 seconds. There is no heat bar and no settings to learn.</p></div>
    </div>
    <div class="faq-item rv">
      <button class="faq-q" aria-expanded="false">What vacuum bags is FreshLock Pro compatible with?<span class="icn" aria-hidden="true"></span></button>
      <div class="faq-a"><p>FreshLock Pro works with most embossed valve-type vacuum bags, so you are not locked into one brand. BPA-free PA+PE valve bags are recommended. The Starter Kit includes BPA-free vacuum zipper bags in three sizes.</p></div>
    </div>
    <div class="faq-item rv">
      <button class="faq-q" aria-expanded="false">How long does the battery last and how do you charge it?<span class="icn" aria-hidden="true"></span></button>
      <div class="faq-a"><p>The built-in 1200 mAh battery delivers 80 to 100 seals per full charge and recharges in about 2.5 hours via USB-C. You can charge it with any USB-C cable, phone charger or power bank.</p></div>
    </div>
    <div class="faq-item rv">
      <button class="faq-q" aria-expanded="false">Can it vacuum seal liquids like soups and marinades?<span class="icn" aria-hidden="true"></span></button>
      <div class="faq-a"><p>Yes. FreshLock Pro has a detachable transparent drip tray that catches soups, marinades and juicy drips before they reach the motor. The tray is dishwasher-safe and the sealer works in any orientation.</p></div>
    </div>
    <div class="faq-item rv">
      <button class="faq-q" aria-expanded="false">How much longer does food stay fresh?<span class="icn" aria-hidden="true"></span></button>
      <div class="faq-a"><p>By removing up to 95% of the air, vacuum sealing keeps food fresh up to 5 times longer than ordinary storage. It prevents freezer burn, ice crystals and oxidation on meat, fish, produce and prepared meals.</p></div>
    </div>
    <div class="faq-item rv">
      <button class="faq-q" aria-expanded="false">What are the shipping and return policies?<span class="icn" aria-hidden="true"></span></button>
      <div class="faq-a"><p>US shipping is free on orders over $89 and delivery typically takes 2 to 5 business days. Every order is covered by a 30-day money-back guarantee — if FreshLock does not work for you, contact support for a full refund.</p></div>
    </div>
  </div>
</section>
<!-- FINAL CTA -->
<section class="final dark">
  <div class="final-glow"></div>
  <h2 class="rv">Your fridge will never look the same.</h2>
  <p class="price-line rv d1"><b>FreshLock Pro — $74.99</b><span class="was">$89.99</span> · Free shipping over $89 · 30-day money back</p>
  <div class="hero-actions rv d2">
    <a class="btn-primary" href="https://www.freshlocksealer.com/products/freshlock-pro" target="_blank" rel="noopener noreferrer">Shop FreshLock Pro
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>
  </div>
  <div class="trust-bar rv d3">
    <div class="t"><div class="n">4.6/5</div><div class="l">2,300+ reviews</div></div>
    <div class="t"><div class="n">30 days</div><div class="l">Money-back guarantee</div></div>
    <div class="t"><div class="n">2–5 days</div><div class="l">US delivery</div></div>
    <div class="t"><div class="n">Secure</div><div class="l">Encrypted checkout</div></div>
  </div>
</section>
<footer>
  <div class="logo"><span class="dot" style="width:8px;height:8px;border-radius:50%;background:var(--green);display:inline-block;margin-right:8px"></span>FreshLock — Qili Technology Co., Ltd.</div>

  <div>Immersive landing demo · 2026-09-03 · Product images from freshlocksealer.com</div>
</footer>
<script>
(function(){
  var prog=document.getElementById('progress'),nav=document.getElementById('nav');
  function onScroll(){
    var h=document.documentElement;
    var scrolled=h.scrollTop/(h.scrollHeight-h.clientHeight);
    prog.style.width=(scrolled*100)+'%';
    if(h.scrollTop>60)nav.classList.add('solid');else nav.classList.remove('solid');
    var p=document.getElementById('parallax1');
    if(p){
      var r=p.getBoundingClientRect();
      var off=(r.top+r.height/2-window.innerHeight/2)*-0.06;
      p.style.transform='translateY('+off+'px)';
    }
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('in');
        e.target.querySelectorAll('[data-count]').forEach(runCount);
        if(e.target.hasAttribute('data-count'))runCount(e.target);
        io.unobserve(e.target);
      }
    });
  },{threshold:.25});
  document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
  function runCount(el){
    if(el.dataset.done)return;el.dataset.done=1;
    var target=parseInt(el.dataset.count,10);
    var prefix=el.dataset.prefix||'',suffix=el.dataset.suffix||'';
    el.textContent=prefix+'0'+suffix;
    var start=null,dur=1400;
    function tick(t){
      if(!start)start=t;
      var p=Math.min((t-start)/dur,1);
      var eased=1-Math.pow(1-p,3);
      var val=Math.round(target*eased);
      el.textContent=prefix+val.toLocaleString('en-US')+suffix;
      if(p<1)requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var stage=document.getElementById('vacStage'),step2=document.getElementById('step2');
  if(stage&&step2){
    var vio=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.intersectionRatio>.45){stage.classList.add('running')}
        else if(e.intersectionRatio<.15){stage.classList.remove('running')}
      });
    },{threshold:[.15,.45]});
    vio.observe(step2);
  }
  document.querySelectorAll('.faq-item').forEach(function(item){
    var q=item.querySelector('.faq-q'),a=item.querySelector('.faq-a');
    q.addEventListener('click',function(){
      var open=item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(o){
        o.classList.remove('open');o.querySelector('.faq-a').style.maxHeight=null;
        o.querySelector('.faq-q').setAttribute('aria-expanded','false');
      });
      if(!open){
        item.classList.add('open');
        a.style.maxHeight=a.scrollHeight+'px';
        q.setAttribute('aria-expanded','true');
      }
    });
  });
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(ev){
      var id=a.getAttribute('href').slice(1);
      var t=document.getElementById(id);
      if(t){ev.preventDefault();t.scrollIntoView({behavior:'smooth'});}
    });
  });
})();
</script>`;
const DEMO_JS = `var prog=document.getElementById('progress'),nav=document.getElementById('nav');
  function onScroll(){
    var h=document.documentElement;
    var scrolled=h.scrollTop/(h.scrollHeight-h.clientHeight);
    prog.style.width=(scrolled*100)+'%';
    if(h.scrollTop>60)nav.classList.add('solid');else nav.classList.remove('solid');
    var p=document.getElementById('parallax1');
    if(p){
      var r=p.getBoundingClientRect();
      var off=(r.top+r.height/2-window.innerHeight/2)*-0.06;
      p.style.transform='translateY('+off+'px)';
    }
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('in');
        e.target.querySelectorAll('[data-count]').forEach(runCount);
        if(e.target.hasAttribute('data-count'))runCount(e.target);
        io.unobserve(e.target);
      }
    });
  },{threshold:.25});
  document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
  function runCount(el){
    if(el.dataset.done)return;el.dataset.done=1;
    var target=parseInt(el.dataset.count,10);
    var prefix=el.dataset.prefix||'',suffix=el.dataset.suffix||'';
    el.textContent=prefix+'0'+suffix;
    var start=null,dur=1400;
    function tick(t){
      if(!start)start=t;
      var p=Math.min((t-start)/dur,1);
      var eased=1-Math.pow(1-p,3);
      var val=Math.round(target*eased);
      el.textContent=prefix+val.toLocaleString('en-US')+suffix;
      if(p<1)requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var stage=document.getElementById('vacStage'),step2=document.getElementById('step2');
  if(stage&&step2){
    var vio=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.intersectionRatio>.45){stage.classList.add('running')}
        else if(e.intersectionRatio<.15){stage.classList.remove('running')}
      });
    },{threshold:[.15,.45]});
    vio.observe(step2);
  }
  document.querySelectorAll('.faq-item').forEach(function(item){
    var q=item.querySelector('.faq-q'),a=item.querySelector('.faq-a');
    q.addEventListener('click',function(){
      var open=item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(o){
        o.classList.remove('open');o.querySelector('.faq-a').style.maxHeight=null;
        o.querySelector('.faq-q').setAttribute('aria-expanded','false');
      });
      if(!open){
        item.classList.add('open');
        a.style.maxHeight=a.scrollHeight+'px';
        q.setAttribute('aria-expanded','true');
      }
    });
  });
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(ev){
      var id=a.getAttribute('href').slice(1);
      var t=document.getElementById(id);
      if(t){ev.preventDefault();t.scrollIntoView({behavior:'smooth'});}
    });
  });`;
export default function ImmersiveHomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const styleInjected = useRef(false);
  useEffect(() => {
    if (!containerRef.current) return;
    if (!styleInjected.current) {
      const styleEl = document.createElement("style");
      styleEl.setAttribute("data-immersive-demo", "true");
      styleEl.textContent = DEMO_CSS;
      document.head.appendChild(styleEl);
      styleInjected.current = true;
    }
    containerRef.current.innerHTML = DEMO_HTML;
    try {
      const fn = new Function(DEMO_JS);
      fn();
    } catch (e) {
      console.error("Immersive demo JS error:", e);
    }
    return () => {
      if (styleInjected.current) {
        const s = document.querySelector('style[data-immersive-demo="true"]');
        if (s) s.remove();
        styleInjected.current = false;
      }
    };
  }, []);
  return <div ref={containerRef} />;
}
