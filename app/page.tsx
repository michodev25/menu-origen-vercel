"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Dish = {
  name: string;
  description: string;
  price: string;
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
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sections = menuSections
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: "-18% 0px -67% 0px",
        threshold: [0, 0.05, 0.15],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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
                <article className="dish" key={dish.name}>
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
