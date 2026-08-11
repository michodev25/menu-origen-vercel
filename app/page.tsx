"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Dish = {
  name: string;
  description: string;
  price: string;
};

type Ripple = {
  id: number;
  x: number;
  y: number;
  size: number;
};

type MenuSection = {
  id: string;
  label: string;
  dishes: Dish[];
};

const menuSections: MenuSection[] = [
  {
    id: "hamburguesas",
    label: "Hamburguesas",
    dishes: [
      {
        name: "Hamburguesa americana",
        description:
          "6 oz de carne, queso cheddar, tomate, lechuga, cebolla y pepinillos agridulces.",
        price: "$12.00",
      },
      {
        name: "Hamburguesa de hongos",
        description:
          "6 oz de carne, queso Suizo, hongos, cebolla caramelizada, mayonesa, sal y pimienta.",
        price: "$11.99",
      },
      {
        name: "Hamburguesa hawaiana",
        description:
          "6 oz de carne, queso Mozzarella, piña en rodajas, salsa barbacoa, lechuga y tocino.",
        price: "$11.99",
      },
      {
        name: "Hamburguesa vegetariana",
        description:
          "6 oz de carne vegetal de lentejas, queso cheddar, tomate, lechuga, cebolla y pepinillos.",
        price: "$10.99",
      },
    ],
  },
  {
    id: "entradas",
    label: "Entradas",
    dishes: [
      {
        name: "Bolitas de yuca",
        description:
          "Esferas de yuca rellenas de queso Mozzarella y queso parmesano rayado.",
        price: "$8.99",
      },
      {
        name: "Nachos",
        description:
          "Totopos de maíz con frijoles negros, aguacate, pico de gallo y queso.",
        price: "$8.99",
      },
      {
        name: "Ceviche de pescado",
        description:
          "Filetes de corvina, bañados en limón, acompañados con maíz y camote.",
        price: "$10.99",
      },
      {
        name: "Aros de cebolla",
        description:
          "Crujientes aros de cebolla acompañados con salsa de mostaza.",
        price: "$7.00",
      },
    ],
  },
  {
    id: "sandwiches",
    label: "Sándwiches",
    dishes: [
      {
        name: "Sándwich club",
        description:
          "Emparedado tradicional con filete, queso americano, bacon, lechuga, tomate y huevo.",
        price: "$10.99",
      },
      {
        name: "Sándwich de pollo",
        description:
          "Emparedado tradicional con pollo crujiente, lechuga, pepinillos y mayonesa picante.",
        price: "$10.99",
      },
      {
        name: "Sándwich italiano",
        description:
          "Emparedado de pan integral con rodajas de tomate, queso mozzarella, pollo y pesto.",
        price: "$8.99",
      },
      {
        name: "Sándwich Monte Cristo",
        description:
          "Rebanadas de pan, jamón de pavo, queso Suizo, salsa de mostaza y mermelada de frambuesas.",
        price: "$8.99",
      },
    ],
  },
  {
    id: "bebidas",
    label: "Bebidas",
    dishes: [
      {
        name: "Limonada tradicional",
        description:
          "Jugo de limón con un toque de menta, endulzado con estevia o azúcar.",
        price: "$4.99",
      },
      {
        name: "Limonada de jengibre",
        description:
          "Jugo de limón con jengibre y fresa o piña, con un toque de canela.",
        price: "$5.00",
      },
      {
        name: "Soda",
        description:
          "Sabor de fresa, naranja, manzana, uva, jengibre o limón.",
        price: "$3.99",
      },
      {
        name: "Agua",
        description: "Agua con gas, sabor a limón o fresa, agua natural.",
        price: "$2.75",
      },
    ],
  },
  {
    id: "postres",
    label: "Postres",
    dishes: [
      {
        name: "Cheesecake de limón",
        description:
          "Base crujiente de galletas de coco, queso crema, leche condensada, limón verde y menta.",
        price: "$5.99",
      },
      {
        name: "Churros",
        description:
          "Churros tradicionales con salsa aparte o churros rellenos con dulce de leche.",
        price: "$4.00",
      },
      {
        name: "Crepas rellenas",
        description:
          "Crepa rellena de fresas y plátano, bañadas con sirope de chocolate o dulce de leche.",
        price: "$6.00",
      },
      {
        name: "Pastel de tres leches",
        description:
          "Clásico bizcocho bañado en leche evaporada, crema de leche y leche condensada.",
        price: "$5.99",
      },
    ],
  },
];

const navSections = ["entradas", "hamburguesas", "sandwiches", "bebidas", "postres"]
  .map((id) => menuSections.find((section) => section.id === id))
  .filter((section): section is MenuSection => Boolean(section));

export default function Home() {
  const [activeSection, setActiveSection] = useState("hamburguesas");
  const [navOverflow, setNavOverflow] = useState({ left: false, right: false });
  const [ripples, setRipples] = useState<Record<string, Ripple[]>>({});
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sections = menuSections
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
  }, []);

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
      id: Date.now(),
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
      <header className="brand-header" aria-label="Origen La Habana">
        <Image
          className="brand-logo"
          src="/assets/origen-logo.png"
          alt="The Origen, La Habana, establecido en 2025"
          width={762}
          height={699}
          priority
        />
      </header>

      <h1 className="menu-title">Menú</h1>

      <div
        className={`category-nav-wrap${navOverflow.left ? " has-left-overflow" : ""}${navOverflow.right ? " has-right-overflow" : ""}`}
      >
        <button
          type="button"
          className="category-edge category-edge-left"
          aria-label="Ver categorías anteriores"
          onClick={() => scrollCategories(-1)}
        >
          {"\u2039"}
        </button>
        <nav
          ref={navRef}
          className="category-nav"
          aria-label="Categorías del menú"
        >
          {navSections.map((section) => (
            <a
              key={section.id}
              className={activeSection === section.id ? "active" : undefined}
              href={`#${section.id}`}
              aria-current={activeSection === section.id ? "location" : undefined}
              onClick={() => selectCategory(section.id)}
            >
              {section.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="category-edge category-edge-right"
          aria-label="Ver más categorías"
          onClick={() => scrollCategories(1)}
        >
          {"\u203a"}
        </button>
      </div>

      <div className="menu-content">
        {menuSections.map((section) => (
          <section
            id={section.id}
            className="menu-section"
            key={section.id}
            aria-labelledby={`${section.id}-title`}
          >
            <h2 id={`${section.id}-title`}>{section.label}</h2>
            <div className="dish-list">
              {section.dishes.map((dish) => (
                <article
                  className="dish"
                  key={dish.name}
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
                  <div className="dish-copy">
                    <h3>{dish.name}</h3>
                    <p>{dish.description}</p>
                  </div>
                  <span className="dish-price">{dish.price}</span>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="site-footer">
        <a className="footer-brand" href="#top" aria-label="Volver al inicio">
          The Origen
        </a>
        <span>La Habana · ESTD 2025</span>
      </footer>
    </main>
  );
}
