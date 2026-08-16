"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  languageOptions,
  translations,
  type LanguageCode,
} from "./menu-translations";
import type { PublicMenuSection } from "@/lib/menu-types";

type Ripple = {
  id: number;
  x: number;
  y: number;
  size: number;
};

export default function MenuClient({
  sections,
}: {
  sections: PublicMenuSection[];
}) {
  const navSections = sections;
  const [activeSection, setActiveSection] = useState("cocteleria");
  const [navOverflow, setNavOverflow] = useState({ left: false, right: false });
  const [ripples, setRipples] = useState<Record<string, Ripple[]>>({});
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("ES");
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const rippleIdRef = useRef(0);
  const selectedLanguageOption =
    languageOptions.find((language) => language.code === selectedLanguage) ??
    languageOptions[0];
  const selectedLanguageLabel = selectedLanguageOption.label;

  function translate(text: string) {
    return translations[selectedLanguage][text] ?? text;
  }

  useEffect(() => {
    document.documentElement.lang = selectedLanguageOption.locale;
  }, [selectedLanguageOption.locale]);

  useEffect(() => {
    const sections = navSections
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    let animationFrame = 0;

    const updateActiveSection = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const navHeight = navRef.current?.offsetHeight ?? 70;
        const activationLine =
          navHeight + Math.min(window.innerHeight * 0.3, 190);
        const isAtPageEnd =
          window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight - 2;
        let nextSection = sections[0]?.id;

        if (isAtPageEnd) {
          nextSection = sections[sections.length - 1]?.id;
        } else {
          for (const section of sections) {
            if (section.getBoundingClientRect().top <= activationLine) {
              nextSection = section.id;
            } else {
              break;
            }
          }
        }

        if (nextSection) {
          setActiveSection((current) =>
            current === nextSection ? current : nextSection,
          );
        }
      });
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [navSections]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const updateOverflow = () => {
      const maxScrollLeft = nav.scrollWidth - nav.clientWidth;
      setNavOverflow({
        left: nav.scrollLeft > 4,
        right: nav.scrollLeft < maxScrollLeft - 4,
      });
    };

    updateOverflow();
    nav.addEventListener("scroll", updateOverflow, { passive: true });
    window.addEventListener("resize", updateOverflow);

    return () => {
      nav.removeEventListener("scroll", updateOverflow);
      window.removeEventListener("resize", updateOverflow);
    };
  }, []);

  useEffect(() => {
    if (!isLanguageMenuOpen) return;

    const closeLanguageMenu = (event: PointerEvent) => {
      if (!languageMenuRef.current?.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsLanguageMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeLanguageMenu);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeLanguageMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isLanguageMenuOpen]);

  useEffect(() => {
    const activeLink = navRef.current?.querySelector<HTMLAnchorElement>(
      `[href="#${activeSection}"]`,
    );

    if (activeLink && navRef.current) {
      const nav = navRef.current;
      const targetLeft =
        activeLink.offsetLeft - nav.clientWidth / 2 + activeLink.clientWidth / 2;
      nav.scrollTo({ left: targetLeft, behavior: "smooth" });
    }
  }, [activeSection]);

  function selectCategory(id: string) {
    setActiveSection(id);
  }

  function scrollCategories(direction: -1 | 1) {
    const nav = navRef.current;
    if (!nav) return;

    nav.scrollBy({
      left: direction * nav.clientWidth * 0.72,
      behavior: "smooth",
    });
  }

  function createDishRipple(
    event: React.PointerEvent<HTMLElement>,
    dishName: string,
  ) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const size = Math.max(bounds.width, bounds.height) * 1.35;
    const ripple = {
      id: ++rippleIdRef.current,
      x: event.clientX - bounds.left - size / 2,
      y: event.clientY - bounds.top - size / 2,
      size,
    };

    setRipples((current) => ({
      ...current,
      [dishName]: [...(current[dishName] ?? []), ripple],
    }));

    window.setTimeout(() => {
      setRipples((current) => ({
        ...current,
        [dishName]: (current[dishName] ?? []).filter(
          (item) => item.id !== ripple.id,
        ),
      }));
    }, 560);
  }

  return (
    <main id="top">
      <header className="brand-header" aria-label={translate("The Origen, La Habana, establecido en 2025")}>
        <div className="language-switcher" ref={languageMenuRef}>
          <button
            type="button"
            className="language-trigger"
            aria-expanded={isLanguageMenuOpen}
            aria-controls="language-options"
            aria-label={`${translate("Seleccionar idioma")}: ${selectedLanguageLabel}`}
            onClick={() => setIsLanguageMenuOpen((current) => !current)}
          >
            {selectedLanguage}
            <span aria-hidden="true">⌄</span>
          </button>
          {isLanguageMenuOpen && (
            <div id="language-options" className="language-options">
              {languageOptions.map((language) => (
                <button
                  type="button"
                  className={
                    language.code === selectedLanguage ? "is-selected" : undefined
                  }
                  key={language.code}
                  lang={language.locale}
                  aria-pressed={language.code === selectedLanguage}
                  onClick={() => {
                    setSelectedLanguage(language.code);
                    setIsLanguageMenuOpen(false);
                  }}
                >
                  {language.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <Image
          className="brand-logo"
          src="/assets/origen-logo.png"
          alt={translate("The Origen, La Habana, establecido en 2025")}
          width={762}
          height={699}
          priority
        />
      </header>

      <h1 className="menu-title">{translate("Menú")}</h1>

      <div
        className={`category-nav-wrap${navOverflow.left ? " has-left-overflow" : ""}${navOverflow.right ? " has-right-overflow" : ""}`}
      >
        <button
          type="button"
          className="category-edge category-edge-left"
          aria-label={translate("Ver categorías anteriores")}
          onClick={() => scrollCategories(-1)}
        >
          {"\u2039"}
        </button>
        <nav
          ref={navRef}
          className="category-nav"
          aria-label={translate("Categorías del menú")}
        >
          {navSections.map((section) => (
            <a
              key={section.id}
              className={activeSection === section.id ? "active" : undefined}
              href={`#${section.id}`}
              aria-current={activeSection === section.id ? "location" : undefined}
              onClick={() => selectCategory(section.id)}
            >
              {translate(section.label)}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="category-edge category-edge-right"
          aria-label={translate("Ver más categorías")}
          onClick={() => scrollCategories(1)}
        >
          {"\u203a"}
        </button>
      </div>

      <div className="menu-content">
        {navSections.map((section) => (
          <section
            id={section.id}
            className="menu-section"
            key={section.id}
            aria-labelledby={`${section.id}-title`}
          >
            <h2 id={`${section.id}-title`}>{translate(section.label)}</h2>
            <div className="dish-list">
              {section.dishes.map((dish, index) => (
                <Fragment key={dish.name}>
                  {dish.subcategory &&
                    dish.subcategory !==
                      section.dishes[index - 1]?.subcategory && (
                      <h3 className="dish-subcategory">
                        {translate(dish.subcategory)}
                      </h3>
                    )}
                  <article
                    className="dish"
                    onPointerDown={(event) => createDishRipple(event, dish.name)}
                  >
                    {(ripples[dish.name] ?? []).map((ripple) => (
                      <span
                        aria-hidden="true"
                        className="dish-ripple"
                        key={ripple.id}
                        style={{
                          height: ripple.size,
                          left: ripple.x,
                          top: ripple.y,
                          width: ripple.size,
                        }}
                      />
                    ))}
                    {dish.note ? (
                      <p className="dish-note">{translate(dish.description)}</p>
                    ) : (
                      <>
                        <div className="dish-copy">
                          {dish.subcategory ? (
                            <h4>{translate(dish.name)}</h4>
                          ) : (
                            <h3>{translate(dish.name)}</h3>
                          )}
                          {dish.ingredients && (
                            <p className="dish-ingredients">
                              <strong>{translate("Ingredientes")}:</strong>{" "}
                              {translate(dish.ingredients)}
                            </p>
                          )}
                          <p>{translate(dish.description)}</p>
                        </div>
                        <span className="dish-price">{dish.price}</span>
                      </>
                    )}
                  </article>
                </Fragment>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="site-footer">
        <a
          className="footer-brand"
          href="#top"
          aria-label={translate("Volver al inicio")}
        >
          The Origen
        </a>
        <span>{translate("La Habana · ESTD 2025")}</span>
      </footer>
    </main>
  );
}
