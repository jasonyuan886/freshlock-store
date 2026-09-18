"use client";
import { useEffect, useRef } from "react";

export default function HomeInteractions() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const prog = document.getElementById("progress") as HTMLElement | null;
    const nav = document.getElementById("nav") as HTMLElement | null;

    // --- Scroll: progress bar + nav solid + parallax ---
    function onScroll() {
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
      if (prog) prog.style.width = scrolled * 100 + "%";
      if (nav) {
        if (h.scrollTop > 60) nav.classList.add("solid");
        else nav.classList.remove("solid");
      }
      const p = document.getElementById("parallax1") as HTMLElement | null;
      if (p) {
        const r = p.getBoundingClientRect();
        const off = (r.top + r.height / 2 - window.innerHeight / 2) * -0.06;
        p.style.transform = `translateY(${off}px)`;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // --- IntersectionObserver for .rv elements ---
    function runCount(el: HTMLElement) {
      if (el.dataset.done) return;
      el.dataset.done = "1";
      const target = parseInt(el.dataset.count || "0", 10);
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      el.textContent = prefix + "0" + suffix;
      let start: number | null = null;
      const dur = 1400;
      function tick(t: number) {
        if (!start) start = t;
        const p = Math.min((t - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(target * eased);
        el.textContent = prefix + val.toLocaleString("en-US") + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            e.target.querySelectorAll("[data-count]").forEach((el) => runCount(el as HTMLElement));
            if (e.target.hasAttribute("data-count")) runCount(e.target as HTMLElement);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    document.querySelectorAll(".rv").forEach((el) => io.observe(el));

    // --- Vacuum bag animation ---
    const stage = document.getElementById("vacStage");
    const step2 = document.getElementById("step2");
    if (stage && step2) {
      const vio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.intersectionRatio > 0.45) stage.classList.add("running");
            else if (e.intersectionRatio < 0.15) stage.classList.remove("running");
          });
        },
        { threshold: [0.15, 0.45] }
      );
      vio.observe(step2);
    }

    // --- FAQ accordion ---
    document.querySelectorAll(".faq-item").forEach((item) => {
      const q = item.querySelector(".faq-q") as HTMLButtonElement | null;
      const a = item.querySelector(".faq-a") as HTMLElement | null;
      if (!q || !a) return;
      q.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        document.querySelectorAll(".faq-item.open").forEach((o) => {
          o.classList.remove("open");
          const ans = o.querySelector(".faq-a") as HTMLElement | null;
          if (ans) ans.style.maxHeight = "";
          const btn = o.querySelector(".faq-q") as HTMLButtonElement | null;
          if (btn) btn.setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          item.classList.add("open");
          a.style.maxHeight = a.scrollHeight + "px";
          q.setAttribute("aria-expanded", "true");
        }
      });
    });

    // --- Smooth anchor scroll ---
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (ev: Event) => {
        const href = (a as HTMLAnchorElement).getAttribute("href");
        if (!href) return;
        const id = href.slice(1);
        const target = document.getElementById(id);
        if (target) {
          ev.preventDefault();
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    // --- Cleanup ---
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return null;
}
