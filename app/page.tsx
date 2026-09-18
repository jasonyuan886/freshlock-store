import type { Metadata } from "next";
import "./home.css";
import HomeInteractions from "./HomeInteractions";

export const metadata: Metadata = {
  title: "FreshLock Pro — Handheld Vacuum Sealer",
  description: "One touch. Five times longer freshness. The cordless handheld vacuum sealer that pulls a powerful -60 kPa in seconds — no heat bar, no learning curve.",
};

export default function HomePage() {
  return (
    <>
      <div className="progress" id="progress"></div>
<nav id="nav">
  <div className="logo"><span className="dot"></span>FreshLock</div>
  <div style={{display: "flex", alignItems: "center", gap: "14px"}}>
    <a href="/cart" aria-label="Shopping cart" style={{position: "relative", color: "#e8730e"}}>
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
    </a>
    <a className="nav-cta" href="https://www.freshlocksealer.com/products/freshlock-pro" target="_blank" rel="noopener noreferrer">Shop Now — $74.99</a>
  </div>
</nav>

<section className="hero light">
  <div className="hero-glow"></div>
  <div className="rv in">
    <span className="hero-badge"><span className="pulse"></span>Launch Special — 15% OFF Everything</span>
  </div>
  <h1 className="rv in d1">Stop Wasting Food.<br>Seal It <span className="em">Fresh.</span> Seal It Longer.</h1>
  <p className="hero-sub rv in d2">One touch. Five times longer freshness. The cordless handheld vacuum sealer that pulls a powerful -60 kPa in seconds — no heat bar, no learning curve.</p>
  <div className="hero-actions rv in d3">
    <a className="btn-primary" href="https://www.freshlocksealer.com/products/freshlock-pro" target="_blank" rel="noopener noreferrer">Shop FreshLock Pro — $74.99
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>
    <a className="btn-ghost" href="#how">See How It Works</a>
  </div>
  <div className="hero-trust rv in d4">
    <span>★★★★★ <b>4.6/5</b> from 2,300+ home cooks</span>
    <span>🚚 Free US shipping over <b>$89</b></span>
    <span>↩️ 30-day money back</span>
  </div>
  <figure className="hero-product" aria-hidden="true">
    <div className="halo"></div>
    <img src="https://www.freshlocksealer.com/images/products/sealer-main.jpg" alt="FreshLock Pro handheld vacuum sealer" width="560" height="560" />
  </figure>
  <div className="scroll-hint"><div className="mouse"></div>Scroll</div>
</section>

<section className="statement light">
  <div>
    <h2 className="big rv">The average household throws away <span className="num" data-count="1500" data-prefix="$">$0</span> in food <em>every year.</em></h2>
    <p className="sub rv d2">Air is the enemy. Oxygen turns bread moldy, meat freezer-burned, and greens slimy — usually before the date on the pack. FreshLock removes up to 95% of it in seconds.</p>
  </div>
</section>

<section className="showcase light">
  <div className="showcase-grid">
    <div>
      <div className="showcase-tag rv">Meet FreshLock Pro</div>
      <h2 className="rv d1">Palm-sized power.<br>Pantry-level results.</h2>
      <p className="rv d2">A cordless -60 kPa pump that fits in a drawer. Set the nozzle over the bag valve, press once, and it pulls a tight vacuum and auto-stops. The detachable drip tray even handles soups and marinades — no liquid reaches the motor.</p>
      <div className="spec-row">
        <div className="spec rv"><div className="k">-60 kPa</div><div className="v">Strong suction — vacuum in seconds</div></div>
        <div className="spec rv d1"><div className="k">80–100</div><div className="v">Seals per single USB-C charge</div></div>
        <div className="spec rv d2"><div className="k">1200 mAh</div><div className="v">Battery — ~2.5h full charge</div></div>
        <div className="spec rv d3"><div className="k">95%</div><div className="v">Of air removed — stops freezer burn</div></div>
      </div>
    </div>
    <figure className="showcase-fig rv d1">
      <div className="disc" aria-hidden="true"></div>
      <img id="parallax1" src="https://www.freshlocksealer.com/images/products/sealer-main.jpg" alt="FreshLock Pro handheld vacuum sealer with diamond-text" width="600" height="600" />
    </figure>
  </div>
</section>

<section className="how light" id="how">
  <div className="how-head">
    <div className="tag rv">How it works</div>
    <h2 className="rv d1">Three steps. About ten seconds.</h2>
    <p className="rv d2">No heat bar. No settings. No learning curve.</p>
  </div>
  <div className="step">
    <div className="step-card">
      <div>
        <div className="step-num">01</div>
        <div className="step-eyebrow">Place</div>
        <h3>Set the nozzle over the bag valve.</h3>
        <p>Works with most embossed valve bags — no brand lock-in. BPA-free PA+PE bags recommended. Just line it up and you're ready.</p>
      </div>
      <div className="step-visual">
        <img src="https://www.freshlocksealer.com/images/products/bags-1.jpg" alt="Vacuum seal valve bags compatible with FreshLock Pro" width="440" height="440" loading="lazy" />
      </div>
    </div>
  </div>
  <div className="step" id="step2">
    <div className="step-card">
      <div>
        <div className="step-num">02</div>
        <div className="step-eyebrow">Press</div>
        <h3>One touch. Watch the air disappear.</h3>
        <p>The pump pulls a -60 kPa vacuum and auto-stops the moment the bag is tight. Below is a motion illustration of what happens inside the bag.</p>
      </div>
      <div className="step-visual">
        <div className="vac-stage" id="vacStage" role="img" aria-label="Animation showing air being sucked out of a vacuum bag">
          <div className="vac-bag">
            <div className="bag-shrink"></div>
            <div className="food"></div>
            <span className="air a1"></span><span className="air a2"></span><span className="air a3"></span><span className="air a4"></span><span className="air a5"></span>
          </div>
          <div className="vac-nozzle"></div>
          <div className="vac-label">Air out · bag seals tight</div>
        </div>
      </div>
    </div>
  </div>
  <div className="step">
    <div className="step-card">
      <div>
        <div className="step-num">03</div>
        <div className="step-eyebrow">Done</div>
        <h3>Fresh for 5× longer.</h3>
        <p>Meat, fish, produce — even soups — stay fresh months longer. No ice crystals, no oxidation, no wasted groceries.</p>
      </div>
      <div className="step-visual">
        <div className="done-mark">
          <div className="done-ring"></div>
          <svg viewBox="0 0 52 52"><path d="M12 27l10 10L40 16"/></svg>
        </div>
      </div>
    </div>
  </div>
</section>

<section className="features light">
  <div className="features-head">
    <div className="tag rv">Why FreshLock</div>
    <h2 className="rv d1">The features home cooks actually care about.</h2>
  </div>
  <div className="fwall">
    <div className="fcard rv">
      <div className="ic"><svg viewBox="0 0 24 24"><path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19"/></svg></div>
      <div className="fk">5×</div>
      <div className="ft">Longer freshness</div>
      <div className="fd">Removes up to 95% of air — no ice crystals, no oxidation.</div>
    </div>
    <div className="fcard rv d1">
      <div className="ic"><svg viewBox="0 0 24 24"><path d="M12 3s6 7 6 11a6 6 0 01-12 0c0-4 6-11 6-11z"/></svg></div>
      <div className="fk">0 mess</div>
      <div className="ft">Drip tray for liquids</div>
      <div className="fd">Detachable cup catches soups and marinades. Dishwasher-safe.</div>
    </div>
    <div className="fcard rv d2">
      <div className="ic"><svg viewBox="0 0 24 24"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg></div>
      <div className="fk">1 touch</div>
      <div className="ft">Auto-stop pump</div>
      <div className="fd">Press once — it stops itself when the bag is tight.</div>
    </div>
    <div className="fcard rv d3">
      <div className="ic"><svg viewBox="0 0 24 24"><rect x="2" y="7" width="18" height="10" rx="5"/><path d="M22 11v2M6 12h4"/></svg></div>
      <div className="fk">USB-C</div>
      <div className="ft">Cordless & rechargeable</div>
      <div className="fd">1200 mAh, 80–100 seals per charge. Any cable, any power bank.</div>
    </div>
  </div>
</section>

<section className="kit light">
  <div className="kit-grid">
    <figure className="kit-fig rv">
      <img src="https://www.freshlocksealer.com/images/products/sealer-kit.jpg" alt="FreshLock Starter Kit with sealer and vacuum bags" width="640" height="640" loading="lazy" />
      <div className="kit-badge"><b>30 bags</b>3 sizes included</div>
    </figure>
    <div>
      <div className="showcase-tag rv">Best value</div>
      <h2 className="rv d1">Start with everything.<br>Seal tonight.</h2>
      <p className="rv d2">The Starter Kit pairs the FreshLock Pro sealer with a full stack of BPA-free vacuum zipper bags in three sizes — open the box, charge it up, and start rescuing food the same day.</p>
      <ul className="kit-list">
        <li className="rv">FreshLock Pro handheld sealer with detachable drip tray</li>
        <li className="rv d1">30 BPA-free embossed valve bags in 3 sizes</li>
        <li className="rv d2">USB-C charging cable, quick-start guide, free US shipping</li>
      </ul>
      <div className="kit-price rv d3">
        <span className="now">$94.99</span>
        <span className="was">$104.97</span>
        <span className="save">Save $9.98</span>
      </div>
      <div className="hero-actions rv d4" style={{marginTop: "26px"}}>
        <a className="btn-primary" href="https://www.freshlocksealer.com/products/freshlock-starter-kit" target="_blank" rel="noopener noreferrer" style={{background: "var(--green-deep)", color: "#fff", boxShadow: "0 12px 40px rgba(15,81,50,.3)"}}>Get the Starter Kit</a>
      </div>
    </div>
  </div>
</section>

<section className="faq" id="faq">
  <div className="faq-inner">
    <div className="faq-head">
      <div className="tag rv">Questions</div>
      <h2 className="rv d1">Everything you'd want to know.</h2>
    </div>
    <div className="faq-item rv">
      <button className="faq-q" aria-expanded="false">How does the FreshLock Pro handheld vacuum sealer work?<span className="icn" aria-hidden="true"></span></button>
      <div className="faq-a"><p>Set the detachable nozzle over the valve on an embossed vacuum bag and press the button once. The pump pulls a -60 kPa vacuum and auto-stops when the bag is tight — the whole process takes about 10 seconds. There is no heat bar and no settings to learn.</p></div>
    </div>
    <div className="faq-item rv">
      <button className="faq-q" aria-expanded="false">What vacuum bags is FreshLock Pro compatible with?<span className="icn" aria-hidden="true"></span></button>
      <div className="faq-a"><p>FreshLock Pro works with most embossed valve-type vacuum bags, so you are not locked into one brand. BPA-free PA+PE valve bags are recommended. The Starter Kit includes BPA-free vacuum zipper bags in three sizes.</p></div>
    </div>
    <div className="faq-item rv">
      <button className="faq-q" aria-expanded="false">How long does the battery last and how do you charge it?<span className="icn" aria-hidden="true"></span></button>
      <div className="faq-a"><p>The built-in 1200 mAh battery delivers 80 to 100 seals per full charge and recharges in about 2.5 hours via USB-C. You can charge it with any USB-C cable, phone charger or power bank.</p></div>
    </div>
    <div className="faq-item rv">
      <button className="faq-q" aria-expanded="false">Can it vacuum seal liquids like soups and marinades?<span className="icn" aria-hidden="true"></span></button>
      <div className="faq-a"><p>Yes. FreshLock Pro has a detachable transparent drip tray that catches soups, marinades and juicy drips before they reach the motor. The tray is dishwasher-safe and the sealer works in any orientation.</p></div>
    </div>
    <div className="faq-item rv">
      <button className="faq-q" aria-expanded="false">How much longer does food stay fresh?<span className="icn" aria-hidden="true"></span></button>
      <div className="faq-a"><p>By removing up to 95% of the air, vacuum sealing keeps food fresh up to 5 times longer than ordinary storage. It prevents freezer burn, ice crystals and oxidation on meat, fish, produce and prepared meals.</p></div>
    </div>
    <div className="faq-item rv">
      <button className="faq-q" aria-expanded="false">What are the shipping and return policies?<span className="icn" aria-hidden="true"></span></button>
      <div className="faq-a"><p>US shipping is free on orders over $89 and delivery typically takes 2 to 5 business days. Every order is covered by a 30-day money-back guarantee — if FreshLock does not work for you, contact support for a full refund.</p></div>
    </div>
  </div>
</section>

<section className="final dark">
  <div className="final-glow"></div>
  <h2 className="rv">Your fridge will never look the same.</h2>
  <p className="price-line rv d1"><b>FreshLock Pro — $74.99</b><span className="was">$89.99</span> · Free shipping over $89 · 30-day money back</p>
  <div className="hero-actions rv d2">
    <a className="btn-primary" href="https://www.freshlocksealer.com/products/freshlock-pro" target="_blank" rel="noopener noreferrer">Shop FreshLock Pro
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>
  </div>
  <div className="trust-bar rv d3">
    <div className="t"><div className="n">4.6/5</div><div className="l">2,300+ reviews</div></div>
    <div className="t"><div className="n">30 days</div><div className="l">Money-back guarantee</div></div>
    <div className="t"><div className="n">2–5 days</div><div className="l">US delivery</div></div>
    <div className="t"><div className="n">Secure</div><div className="l">Encrypted checkout</div></div>
  </div>
</section>
<footer>
  <div className="logo"><span className="dot" style={{width: "8px", height: "8px", borderRadius: "50%", background: "var(--green)", display: "inline-block", marginRight: "8px"}}></span>FreshLock — Qili Technology Co., Ltd.</div>

  <div>Immersive landing demo · 2026-09-03 · Product images from freshlocksealer.com</div>
</footer>
      <HomeInteractions />
    </>
  );
}
