document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initActiveNavLink();
    initScrollReveal();
    initSliders();
    initHeroMotion();
    initContactForm();
});

function initMobileMenu() {
    const nav = document.querySelector("header nav");
    if (!nav) return;

    const menuList = nav.querySelector("ul");
    if (!menuList) return;

    if (!menuList.id) {
        menuList.id = "primary-menu";
    }

    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "menu-toggle";
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.setAttribute("aria-controls", menuList.id);
    toggleButton.textContent = "Menu";

    nav.insertBefore(toggleButton, menuList);

    const syncMenuState = () => {
        const isMobile = window.matchMedia("(max-width: 767px)").matches;
        if (!isMobile) {
            menuList.classList.remove("menu-collapsed");
            toggleButton.setAttribute("aria-expanded", "false");
            return;
        }

        if (toggleButton.getAttribute("aria-expanded") !== "true") {
            menuList.classList.add("menu-collapsed");
        }
    };

    toggleButton.addEventListener("click", () => {
        const expanded = toggleButton.getAttribute("aria-expanded") === "true";
        toggleButton.setAttribute("aria-expanded", String(!expanded));
        menuList.classList.toggle("menu-collapsed", expanded);
    });

    window.addEventListener("resize", syncMenuState);
    syncMenuState();
}

function initActiveNavLink() {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach((link) => {
        const linkPath = link.getAttribute("href")?.split("/").pop();
        if (linkPath === currentPath) {
            link.classList.add("is-active");
            link.setAttribute("aria-current", "page");
        }
    });
}

function initScrollReveal() {
    const revealElements = document.querySelectorAll("main section, .hero");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    revealElements.forEach((el, index) => {
        el.classList.add("reveal-on-scroll");
        el.style.transitionDelay = `${Math.min(index * 40, 180)}ms`;
    });

    if (prefersReducedMotion) {
        revealElements.forEach((el) => el.classList.add("is-visible"));
        return;
    }

    if (!("IntersectionObserver" in window)) {
        revealElements.forEach((el) => el.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                obs.unobserve(entry.target);
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach((el) => observer.observe(el));
}

function initSliders() {
    const sliders = document.querySelectorAll(".js-slider");
    sliders.forEach((slider) => new SimpleSlider(slider));
}

function initHeroMotion() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const hero = document.querySelector(".hero");
    const visual = document.querySelector(".hero-visual img");
    const bg = document.querySelector(".hero-bg");
    if (!hero || !visual || !bg) return;

    hero.addEventListener("mousemove", (event) => {
        const rect = hero.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        visual.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
        bg.style.transform = `scale(1.02) translate(${x * -8}px, ${y * -8}px)`;
    });

    hero.addEventListener("mouseleave", () => {
        visual.style.transform = "";
        bg.style.transform = "";
    });
}

function initContactForm() {
    const form = document.querySelector("form[data-formspree='true']");
    if (!form) return;

    const status = form.querySelector(".form-status");
    const submitButton = form.querySelector("button[type='submit']");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (!submitButton) return;
        submitButton.disabled = true;
        if (status) status.textContent = "Bezig met versturen...";

        try {
            const endpoint = form.getAttribute("action") || "";
            if (endpoint.includes("REPLACE_WITH_YOUR_FORM_ID")) {
                throw new Error("Formspree endpoint is nog niet ingesteld.");
            }

            const response = await fetch(endpoint, {
                method: "POST",
                body: new FormData(form),
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Versturen is mislukt.");
            }

            form.reset();
            if (status) status.textContent = "Bedankt! Je aanvraag is succesvol verzonden.";
        } catch (error) {
            if (status) {
                status.textContent = "Versturen lukt nu niet. Controleer je Formspree form-ID of probeer later opnieuw.";
            }
        } finally {
            submitButton.disabled = false;
        }
    });
}

class SimpleSlider {
    constructor(root) {
        this.root = root;
        this.slides = Array.from(root.querySelectorAll(".js-slide"));
        this.prevButton = root.querySelector(".js-prev");
        this.nextButton = root.querySelector(".js-next");
        this.intervalMs = Number(root.dataset.interval) || 4500;
        this.index = 0;
        this.timer = null;

        if (this.slides.length < 2) return;

        this.show(0);
        this.attachEvents();
        this.start();
    }

    attachEvents() {
        if (this.prevButton) {
            this.prevButton.addEventListener("click", () => {
                this.show(this.index - 1);
                this.restart();
            });
        }

        if (this.nextButton) {
            this.nextButton.addEventListener("click", () => {
                this.show(this.index + 1);
                this.restart();
            });
        }

        this.root.addEventListener("mouseenter", () => this.stop());
        this.root.addEventListener("mouseleave", () => this.start());
    }

    show(targetIndex) {
        this.index = (targetIndex + this.slides.length) % this.slides.length;

        this.slides.forEach((slide, i) => {
            const active = i === this.index;
            slide.classList.toggle("is-active", active);
            slide.setAttribute("aria-hidden", String(!active));
        });
    }

    start() {
        if (this.timer) return;
        this.timer = window.setInterval(() => this.show(this.index + 1), this.intervalMs);
    }

    stop() {
        if (!this.timer) return;
        window.clearInterval(this.timer);
        this.timer = null;
    }

    restart() {
        this.stop();
        this.start();
    }
}
