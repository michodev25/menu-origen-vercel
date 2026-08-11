"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";

type Dish = {
  name: string;
  description: string;
  price: string;
  ingredients?: string;
  note?: boolean;
  subcategory?: string;
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
    id: "entradas",
    label: "Entradas",
    dishes: [
      {
        name: "Pimientos del Piquillo Rellenos",
        description:
          "Pimientos del piquillo asados, rellenos con una preparación rica y delicada.",
        price: "$8.40",
        subcategory: "Vegetariano & Fresco",
      },
      {
        name: "Pan Tostado con Tomate",
        description:
          "Pan crujiente con tomate fresco triturado, aceite de oliva virgen extra y un toque de sal marina.",
        price: "$2.50",
        subcategory: "Vegetariano & Fresco",
      },
      {
        name: "Ensalada Mixta",
        description:
          "Lechuga fresca, tomates maduros y cebolla delicada; ligera, crujiente y naturalmente refrescante.",
        price: "$3.20",
        subcategory: "Vegetariano & Fresco",
      },
      {
        name: "Tabla de Queso Manchego Curado",
        description:
          "Queso manchego maduro, de sabor profundo, notas de frutos secos y textura firme.",
        price: "$7.50",
        subcategory: "Quesos & Ensaladas",
      },
      {
        name: "Ensalada Argentina de Steak",
        description:
          "Ensalada de carne argentina con queso azul y vinagreta Origen; intensa, fresca y refinada.",
        price: "$12.50",
        subcategory: "Quesos & Ensaladas",
      },
      {
        name: "Ensalada César Clásica",
        description:
          "Hojas frescas con salsa César sedosa, queso pecorino, bacon crujiente y croutons.",
        price: "$7.50",
        subcategory: "Quesos & Ensaladas",
      },
      {
        name: "Gambas al Ajillo",
        description:
          "Gambas jugosas cocinadas suavemente con ajo, aceite de oliva y chili.",
        price: "$8.90",
        subcategory: "Pescados & Mariscos",
      },
      {
        name: "Ceviche Estilo Chef",
        description:
          "Pescado blanco fresco curado en lima con mango, ajo, jengibre y cebolla morada, servido con boniato frito crujiente y delicada leche de tigre de ají dulce.",
        price: "$9.50",
        subcategory: "Pescados & Mariscos",
      },
      {
        name: "Ensaladilla Rusa Roja Origen",
        description:
          "Ensaladilla rusa cremosa con pimientos del piquillo, atún y mayonesa; suave y equilibrada.",
        price: "$6.50",
        subcategory: "Pescados & Mariscos",
      },
      {
        name: "Huevos Rotos con Jamón Ibérico",
        description:
          "Patatas y huevo con jamón; suave, sabroso e indulgente.",
        price: "$8.50",
        subcategory: "Cerdo & Ibéricos",
      },
      {
        name: "Chorizo Español al Vino Tinto",
        description:
          "Chorizo español cocinado lentamente en una salsa profunda y aromática de vino tinto.",
        price: "$6.50",
        subcategory: "Cerdo & Ibéricos",
      },
      {
        name: "Empanadas Argentinas de Carne",
        description:
          "Masa dorada rellena de carne argentina premium cocinada lentamente.",
        price: "$3.95",
        subcategory: "Carnes",
      },
      {
        name: "Tapa Andaluza",
        description:
          "Tierno filete de res sellado con setas y un intenso toque de pimentón ahumado.",
        price: "$8.50",
        subcategory: "Carnes",
      },
      {
        name: "BAO Estilo Origen",
        description:
          "Pan bao casero relleno de carne argentina premium y mayonesa picante.",
        price: "$3.95",
        subcategory: "Carnes",
      },
      {
        name: "Albóndigas en Salsa de Tomate Casera",
        description:
          "Albóndigas artesanales en una salsa de tomate profunda y casera.",
        price: "$8.00",
        subcategory: "Carnes",
      },
      {
        name: "Carpaccio Premium de Res Argentina",
        description:
          "Finas láminas de res argentina premium con rúcula, alcaparras, jugo de limón y aceite de oliva virgen extra.",
        price: "$15.00",
        subcategory: "Carnes",
      },
      {
        name: "Tabla Ibérica de Bellota",
        description:
          "Embutidos ibéricos premium de bellota, finamente cortados, ricos y de textura fundente.",
        price: "$16.50",
        subcategory: "Carnes",
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

function getDishes(sectionId: string): Dish[] {
  return menuSections.find((section) => section.id === sectionId)?.dishes ?? [];
}

const cocktailDishes: Dish[] = [
  {
    name: "El Bodegón",
    ingredients: "Vino tinto 120 ml · fresas frescas 60 g · triple sec 10 ml · azúcar 10 g",
    description: "Ponche chileno fresco y frutal. El vino tinto y las fresas se integran en un trago amable, jugoso y refrescante.",
    price: "$3.50",
    subcategory: "Cócteles de Autor",
  },
  {
    name: "Black Widow",
    ingredients: "Tequila blanco 45 ml · zumo de lima 30 ml · néctar de agave 5 ml · 2 moras · 3 hojas de albahaca",
    description: "Intenso, fresco y herbal. La mora aporta fruta y color, mientras la albahaca y la lima afinan el carácter del tequila.",
    price: "$4.20",
    subcategory: "Cócteles de Autor",
  },
  {
    name: "Daiquiri",
    ingredients: "Ron Havana Club 3 Años 60 ml · marasquino 15 ml · zumo de limón 10 ml · azúcar blanca 15 g",
    description: "Clásico cubano: fresco, seco y preciso. Ron blanco, limón y dulzor medido para un trago limpio y muy gastronómico.",
    price: "$3.80",
    subcategory: "Coctelería Nacional",
  },
  {
    name: "Mojito Origen",
    ingredients: "Havana Club 3 Años 60 ml · azúcar blanca 15 g · zumo de limón 10 ml · hierbabuena · 1 dash de angostura",
    description: "Nuestro mojito respeta la raíz cubana y suma un final aromático con angostura. Fresco, herbal y perfecto para abrir mesa.",
    price: "$3.00",
    subcategory: "Coctelería Nacional",
  },
  {
    name: "Canchánchara Origen",
    ingredients: "Aguardiente 60 ml · zumo de limón 30 ml · miel de abejas 30 ml",
    description: "Tradición cubana en vaso: aguardiente, miel y limón. Rústico, noble y con ese golpe antiguo que nunca pasa de moda.",
    price: "$3.50",
    subcategory: "Coctelería Nacional",
  },
  {
    name: "Cuba Libre",
    ingredients: "Ron Havana Club 3 Años 60 ml · refresco de cola 150 ml",
    description: "Un imprescindible de barra: ron cubano y cola, servido frío y largo. Simple cuando debe ser simple; bien hecho, como manda la casa.",
    price: "$3.50",
    subcategory: "Coctelería Nacional",
  },
  {
    name: "Cubata",
    ingredients: "Ron Havana Club 7 Años 60 ml · refresco de cola 150 ml",
    description: "La versión más profunda del Cuba Libre. El ron añejo aporta madera, vainilla y cuerpo, con cola para un trago largo y redondo.",
    price: "$3.90",
    subcategory: "Coctelería Nacional",
  },
  {
    name: "Cubanito",
    ingredients: "Ron blanco 60 ml · jugo de tomate 120 ml · salsa inglesa 5 ml · zumo de limón 5 ml · sal 0.5 g",
    description: "El primo cubano del Bloody Mary. Tomate, ron blanco, limón y sazón: salino, especiado y con mucha personalidad.",
    price: "$3.90",
    subcategory: "Coctelería Nacional",
  },
  {
    name: "Piña Colada Origen",
    ingredients: "Havana Club 3 Años 60 ml · crema de coco 30 ml · zumo de piña 40 ml · azúcar 30 g",
    description: "Coco, piña y ron cubano en clave tropical. Cremosa, amable y festiva, ideal para quien quiere Caribe en estado líquido.",
    price: "$3.50",
    subcategory: "Coctelería Nacional",
  },
  {
    name: "Negroni",
    ingredients: "Ginebra 30 ml · Campari 30 ml · vermouth rosso 30 ml",
    description: "Amargo, intenso y elegante. Un clásico italiano de partes iguales, perfecto para paladares que buscan carácter y final largo.",
    price: "$4.20",
    subcategory: "Coctelería Internacional",
  },
  {
    name: "Old Fashioned",
    ingredients: "Whisky bourbon 60 ml · azúcar 15 g · 3 dash de angostura",
    description: "Whisky al frente, sin maquillaje. Azúcar y angostura integran el bourbon en un trago clásico, serio y de sobremesa.",
    price: "$6.50",
    subcategory: "Coctelería Internacional",
  },
  {
    name: "Margarita",
    ingredients: "Tequila 60 ml · triple sec 15 ml · zumo de limón 15 ml · sal 1 g",
    description: "Ácida, salina y vibrante. Tequila, cítrico y triple sec en una mezcla limpia que despierta el apetito.",
    price: "$3.50",
    subcategory: "Coctelería Internacional",
  },
  {
    name: "Dry Martini",
    ingredients: "Ginebra 60 ml · vermouth dry 10 ml · 1 aceituna",
    description: "Seco, frío y exacto. Ginebra con un velo de vermouth dry y aceituna: minimalismo de barra, sin pedir permiso.",
    price: "$3.50",
    subcategory: "Coctelería Internacional",
  },
  {
    name: "Fernet con Cola",
    ingredients: "Fernet 60 ml · refresco de cola 120 ml",
    description: "Herbal, amargo y popular. El Fernet marca el pulso y la cola lo vuelve largo, refrescante y muy argentino.",
    price: "$3.50",
    subcategory: "Coctelería Internacional",
  },
  {
    name: "Screwdriver",
    ingredients: "Vodka 60 ml · zumo de naranja 120 ml",
    description: "Vodka y naranja en versión directa. Frutal, fácil de beber y perfecto para quien busca frescura sin complicarse.",
    price: "$3.00",
    subcategory: "Coctelería Internacional",
  },
  {
    name: "Aperol Spritz",
    ingredients: "Aperol 60 ml · Prosecco 120 ml · agua gaseada 30 ml",
    description: "Burbujeante, cítrico y luminoso. Aperol, Prosecco y soda para un aperitivo elegante, ligero y con espíritu italiano.",
    price: "$7.90",
    subcategory: "Coctelería Internacional",
  },
];

const principalDishes: Dish[] = [
  {
    name: "Sirloin Steak / 200g",
    description:
      "Sirloin premium, preparado con precisión y presentado sobre una piedra negra caliente.",
    price: "$25.00",
    subcategory: "Cortes a la Piedra",
  },
  {
    name: "Ribeye / 200g",
    description:
      "Ribeye premium sellado y servido sobre piedra negra ardiente, liberando su marmoleo, riqueza y sabor profundo.",
    price: "$25.00",
    subcategory: "Cortes a la Piedra",
  },
  {
    name: "Filete de Res / 200g",
    description:
      "Filete de res premium, sellado y terminado sobre piedra negra ardiente, con ternura excepcional y sabor intenso.",
    price: "$28.50",
    subcategory: "Cortes a la Piedra",
  },
  {
    name: "Servicio incluido",
    description:
      "Todas las selecciones de carne se sirven con patatas fritas doradas, ensalada fresca y chimichurri argentino casero.",
    price: "",
    note: true,
    subcategory: "Cortes a la Piedra",
  },
  {
    name: "Curry Signature Origen",
    description:
      "Pechuga de pollo asada con arroz jazmín y curry rojo artesanal elaborado con ajíes dulces cubanos y leche de coco.",
    price: "$21.50",
    subcategory: "Principales de Autor",
  },
  {
    name: "Burger Signature Origen",
    description:
      "Carne premium, queso fundido, bacon, cebolla crujiente y nuestra famosa mayonesa secreta.",
    price: "$18.50",
    subcategory: "Principales de Autor",
  },
  {
    name: "Pescado Blanco Sedoso",
    description:
      "Pescado blanco fresco sobre salsa de leche de coco, con patatas españolas doradas en un jugo delicado. Servido con arroz jazmín.",
    price: "$19.50",
    subcategory: "Pescados & Mariscos",
  },
];
const navSections: MenuSection[] = [
  {
    id: "cocteleria",
    label: "Coctelería",
    dishes: cocktailDishes,
  },
  {
    id: "entrantes",
    label: "Entrantes",
    dishes: getDishes("entradas"),
  },
  {
    id: "platos-principales",
    label: "Platos Principales",
    dishes: principalDishes,
  },
  {
    id: "postres",
    label: "Postres",
    dishes: getDishes("postres"),
  },
  {
    id: "cafe-aperitivos",
    label: "Café y Aperitivos",
    dishes: [],
  },
];

export default function Home() {
  const [activeSection, setActiveSection] = useState("cocteleria");
  const [navOverflow, setNavOverflow] = useState({ left: false, right: false });
  const [ripples, setRipples] = useState<Record<string, Ripple[]>>({});
  const navRef = useRef<HTMLElement>(null);

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
        {navSections.map((section) => (
          <section
            id={section.id}
            className="menu-section"
            key={section.id}
            aria-labelledby={`${section.id}-title`}
          >
            <h2 id={`${section.id}-title`}>{section.label}</h2>
            <div className="dish-list">
              {section.dishes.map((dish, index) => (
                <Fragment key={dish.name}>
                  {dish.subcategory &&
                    dish.subcategory !==
                      section.dishes[index - 1]?.subcategory && (
                      <h3 className="dish-subcategory">{dish.subcategory}</h3>
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
                      <p className="dish-note">{dish.description}</p>
                    ) : (
                      <>
                        <div className="dish-copy">
                          {dish.subcategory ? (
                            <h4>{dish.name}</h4>
                          ) : (
                            <h3>{dish.name}</h3>
                          )}
                          {dish.ingredients && (
                            <p className="dish-ingredients">
                              <strong>Ing.:</strong> {dish.ingredients}
                            </p>
                          )}
                          <p>{dish.description}</p>
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
        <a className="footer-brand" href="#top" aria-label="Volver al inicio">
          The Origen
        </a>
        <span>La Habana · ESTD 2025</span>
      </footer>
    </main>
  );
}
