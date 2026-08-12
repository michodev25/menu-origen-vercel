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
        price: "$4.00",
        subcategory: "Vegetariano & Fresco",
      },
      {
        name: "Pan Tostado con Tomate",
        description:
          "Pan crujiente con tomate fresco triturado, aceite de oliva virgen extra y un toque de sal marina.",
        price: "$3.00",
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
        name: "Gazpacho de Remolacha",
        description:
          "Crema fría de remolacha con tomate, pepino y un toque de limón; fresca, ligera y de sabor delicadamente dulce.",
        price: "$1.50",
        subcategory: "Vegetariano & Fresco",
      },
      {
        name: "Tabla de Queso Manchego Curado",
        description:
          "Queso manchego maduro, de sabor profundo, notas de frutos secos y textura firme.",
        price: "$8.00",
        subcategory: "Quesos & Ensaladas",
      },
      {
        name: "Ensalada Argentina de Steak",
        description:
          "Ensalada de carne argentina con queso azul y vinagreta Origen; intensa, fresca y refinada.",
        price: "$12.00",
        subcategory: "Quesos & Ensaladas",
      },
      {
        name: "Ensalada César Clásica",
        description:
          "Hojas frescas con salsa César sedosa, queso pecorino, bacon crujiente y croutons.",
        price: "$7.00",
        subcategory: "Quesos & Ensaladas",
      },
      {
        name: "Ensalada Burrata Ahumada",
        description:
          "Burrata ligeramente ahumada con tomates frescos de temporada y aliño suave que realza su cremosidad.",
        price: "$10.00",
        subcategory: "Quesos & Ensaladas",
      },
      {
        name: "Gambas al Ajillo",
        description:
          "Gambas jugosas cocinadas suavemente con ajo, aceite de oliva y chili.",
        price: "$9.00",
        subcategory: "Pescados & Mariscos",
      },
      {
        name: "Ceviche Estilo Chef",
        description:
          "Pescado blanco fresco curado en lima con mango, ajo, jengibre y cebolla morada, servido con boniato frito crujiente y delicada leche de tigre de ají dulce.",
        price: "$7.00",
        subcategory: "Pescados & Mariscos",
      },
      {
        name: "Ensaladilla Rusa Roja Origen",
        description:
          "Ensaladilla rusa cremosa con pimientos del piquillo, atún y mayonesa; suave y equilibrada.",
        price: "$5.00",
        subcategory: "Pescados & Mariscos",
      },
      {
        name: "Huevos Rotos con Jamón Ibérico",
        description:
          "Patatas y huevo con jamón; suave, sabroso e indulgente.",
        price: "$9.00",
        subcategory: "Cerdo & Ibéricos",
      },
      {
        name: "Chorizo Español al Vino Tinto",
        description:
          "Chorizo español cocinado lentamente en una salsa profunda y aromática de vino tinto.",
        price: "$6.00",
        subcategory: "Cerdo & Ibéricos",
      },
      {
        name: "Empanadas Argentinas de Carne",
        description:
          "Masa dorada rellena de carne argentina premium cocinada lentamente.",
        price: "$6.00",
        subcategory: "Carnes",
      },
      {
        name: "Tapa Andaluza",
        description:
          "Tierno filete de res sellado con setas y un intenso toque de pimentón ahumado.",
        price: "$8.00",
        subcategory: "Carnes",
      },
      {
        name: "BAO Estilo Origen",
        description:
          "Pan bao casero relleno de carne argentina premium y mayonesa picante.",
        price: "$4.00",
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
        price: "$16.00",
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
        name: "Cheesecake de Dulce de Leche Estilo Argentino",
        description:
          "Cheesecake argentino refinado, de textura aterciopelada, terminado con dulce de leche premium.",
        price: "$5.00",
      },
      {
        name: "Tiramisú Deconstruido",
        description:
          "Tiramisú elegante deconstruido con crema suave de mascarpone, bizcocho impregnado de espresso, cacao fino y notas de chocolate, reinterpretando el clásico italiano de forma moderna y refinada.",
        price: "$5.00",
      },
      {
        name: "Coulant de Chocolate",
        description:
          "Bizcocho de chocolate de corazón fundente, servido tibio para una experiencia intensa y cremosa.",
        price: "$6.00",
      },
      {
        name: "Postre del Día",
        description:
          "Consulte con nuestro equipo la selección fresca preparada para hoy.",
        price: "$5.00",
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
    description: "Trago de autor fresco y frutal, elaborado con vino tinto, fresas y un balance amable de dulzor.",
    price: "$5.00",
    subcategory: "Coctelería de Autor",
  },
  {
    name: "Golpe Bajo",
    description: "Tequila blanco, limón, jengibre y angostura en un trago directo, cítrico y especiado.",
    price: "$3.00",
    subcategory: "Coctelería de Autor",
  },
  {
    name: "Coco Bay",
    description: "Cóctel cremoso y tropical con ron, coco, vainilla y un toque de limón.",
    price: "$4.00",
    subcategory: "Coctelería de Autor",
  },
  {
    name: "Marley Sun",
    description: "Vodka, flor de Jamaica y piña en un trago frutal, floral y refrescante.",
    price: "$3.00",
    subcategory: "Coctelería de Autor",
  },
  {
    name: "Natural Origen",
    description: "Creación fresca de la casa con perfil natural, ligero y equilibrado.",
    price: "$4.00",
    subcategory: "Coctelería de Autor",
  },
  {
    name: "Cerveza Cristal Botella",
    description: "Cerveza clara, ligera y refrescante servida en botella.",
    price: "$3.00",
    subcategory: "Bebidas Alcohólicas",
  },
  {
    name: "Cerveza Heineken",
    description: "Lager de perfil limpio, equilibrado y refrescante.",
    price: "$2.50",
    subcategory: "Bebidas Alcohólicas",
  },
  {
    name: "Cerveza Stella",
    description: "Lager europea de cuerpo ligero y final suavemente amargo.",
    price: "$4.00",
    subcategory: "Bebidas Alcohólicas",
  },
  {
    name: "Cuba Libre",
    description: "Ron cubano y refresco de cola servidos fríos en un trago largo.",
    price: "$3.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Aperol Spritz",
    description: "Aperol, Prosecco y soda en un cóctel cítrico, ligero y burbujeante.",
    price: "$8.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Cubetazo Origen",
    description: "Selección de la casa en formato para compartir y disfrutar bien fría.",
    price: "$10.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Old Fashioned",
    description: "Whisky, azúcar y angostura en un clásico intenso y de final profundo.",
    price: "$7.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Gin Tonic",
    description: "Ginebra y tónica servidas con hielo y un toque cítrico.",
    price: "$8.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Long Island Ice Tea",
    description: "Mezcla intensa de destilados, cítricos y cola en un trago largo.",
    price: "$6.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Gin Tonic Terraza",
    description: "Versión fresca de la casa con ginebra, tónica y notas aromáticas.",
    price: "$7.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Calimocho",
    description: "Vino tinto y cola en una mezcla sencilla, fresca y frutal.",
    price: "$6.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Limonada Mega Mix",
    description: "Limonada de la casa con mezcla frutal y carácter refrescante.",
    price: "$4.00",
    subcategory: "Líquidos Origen",
  },
  {
    name: "Fernet con Cola",
    description: "Fernet herbal y amargo suavizado con refresco de cola.",
    price: "$7.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Cubata",
    description: "Ron añejo y cola en un trago largo, profundo y redondo.",
    price: "$4.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Negroni",
    description: "Ginebra, Campari y vermut rojo en un clásico amargo e intenso.",
    price: "$5.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Sangría Origen",
    description: "Vino tinto, frutas y notas cítricas en una sangría fresca de la casa.",
    price: "$6.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Sangría Blanca Origen",
    description: "Vino blanco y frutas frescas en una versión ligera y aromática.",
    price: "$6.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Black Widow",
    description: "Tequila, mora, albahaca y lima en un trago intenso, fresco y herbal.",
    price: "$4.00",
    subcategory: "Coctelería de Autor",
  },
  {
    name: "Canchánchara",
    description: "Aguardiente, miel y limón en un clásico cubano rústico y aromático.",
    price: "$4.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Dry Martini",
    description: "Ginebra y vermut seco en un cóctel frío, limpio y preciso.",
    price: "$5.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Caipirinha",
    description: "Cachaça, lima y azúcar en un clásico brasileño vibrante.",
    price: "$4.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Margarita",
    description: "Tequila, triple sec y limón en una mezcla ácida, salina y refrescante.",
    price: "$5.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Mojito Origen",
    description: "Ron, hierbabuena, limón y azúcar con el toque aromático de la casa.",
    price: "$3.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Screwdriver",
    description: "Vodka y naranja en una combinación directa, frutal y refrescante.",
    price: "$3.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Piña Colada Origen",
    description: "Ron, coco y piña en un cóctel tropical, cremoso y amable.",
    price: "$4.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Limonada Origen",
    description: "Limonada fresca de la casa con un perfil limpio y cítrico.",
    price: "$2.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Caipiroska",
    description: "Vodka, lima y azúcar en una variación fresca de la caipirinha.",
    price: "$4.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Servicio Michelada",
    description: "Preparación especiada y cítrica para acompañar su cerveza.",
    price: "$1.50",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Caipirisma",
    description: "Cóctel cítrico y refrescante inspirado en la caipirinha.",
    price: "$3.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Servicio Chelada",
    description: "Preparación de limón y sal para acompañar su cerveza.",
    price: "$1.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Expresso Martini",
    description: "Vodka, café espresso y licor de café en un cóctel intenso y sedoso.",
    price: "$8.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Daiquiri",
    description: "Ron blanco, limón y azúcar en un clásico cubano limpio y equilibrado.",
    price: "$3.00",
    subcategory: "Coctelería Origen",
  },
  {
    name: "Agua Gaseada",
    description: "Agua refrescante con gas.",
    price: "$5.00",
    subcategory: "Líquidos Origen",
  },
  {
    name: "Pepsi Cola",
    description: "Refresco de cola servido bien frío.",
    price: "$2.50",
    subcategory: "Líquidos Origen",
  },
  {
    name: "Agua Dea (250 ml)",
    description: "Agua mineral en presentación de 250 ml.",
    price: "$2.00",
    subcategory: "Líquidos Origen",
  },
  {
    name: "Jugo Natural",
    description: "Jugo fresco preparado con fruta natural.",
    price: "$2.00",
    subcategory: "Líquidos Origen",
  },
];

const principalDishes: Dish[] = [
  {
    name: "Sirloin Steak / 200g",
    description:
      "Sirloin premium, preparado con precisión y presentado sobre una piedra negra caliente.",
    price: "$28.00",
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
    price: "$25.00",
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
    name: "Sopa de Curry con Mariscos",
    description:
      "Cremosa sopa de mariscos en caldo de coco y curry aromático, con un sutil toque de hierbas frescas.",
    price: "$10.00",
    subcategory: "Principales de Autor",
  },
  {
    name: "Burger Signature Origen",
    description:
      "Carne premium, queso fundido, bacon, cebolla crujiente y nuestra famosa mayonesa secreta.",
    price: "$15.00",
    subcategory: "Principales de Autor",
  },
  {
    name: "Pescado Blanco Sedoso",
    description:
      "Pescado blanco fresco sobre salsa de leche de coco, con patatas españolas doradas en un jugo delicado. Servido con arroz jazmín.",
    price: "$15.00",
    subcategory: "Pescados & Mariscos",
  },
];

const coffeeDishes: Dish[] = [
  {
    name: "Espresso",
    description: "Corto, intenso y aromático.",
    price: "$2.00",
    subcategory: "Cafés Clásicos",
  },
  {
    name: "Cortado",
    description: "Espresso con un toque de leche.",
    price: "$2.00",
    subcategory: "Cafés Clásicos",
  },
  {
    name: "Café Americano",
    description: "Largo, suave y equilibrado.",
    price: "$2.00",
    subcategory: "Cafés Clásicos",
  },
  {
    name: "Café con Leche",
    description: "Café y leche caliente en proporción clásica.",
    price: "$3.00",
    subcategory: "Cafés Clásicos",
  },
  {
    name: "Café Bombón",
    description: "Espresso con leche condensada, dulce y cremoso.",
    price: "$5.00",
    subcategory: "Cafés Clásicos",
  },
  {
    name: "Mocha",
    description: "Café, leche y cacao con textura sedosa.",
    price: "$5.00",
    subcategory: "Cafés Clásicos",
  },
  {
    name: "Cappuccino",
    description: "Espresso, leche vaporizada y espuma cremosa.",
    price: "$4.00",
    subcategory: "Cafés Clásicos",
  },
  {
    name: "Carajillo",
    description: "Espresso con licor intenso, cálido y digestivo.",
    price: "$5.00",
    subcategory: "Cafés con Licor",
  },
  {
    name: "Café Irlandés",
    description: "Café, whisky, azúcar y crema suave.",
    price: "$5.00",
    subcategory: "Cafés con Licor",
  },
  {
    name: "Café Calypso",
    description: "Café con ron y caramelo.",
    price: "$5.00",
    subcategory: "Cafés con Licor",
  },
  {
    name: "Café Royal",
    description: "Café con brandy o coñac; elegante y profundo.",
    price: "$5.00",
    subcategory: "Cafés con Licor",
  },
  {
    name: "Café Baileys",
    description: "Café con crema irlandesa; suave y goloso.",
    price: "$6.00",
    subcategory: "Cafés con Licor",
  },
  {
    name: "Frangelico",
    description: "Licor de avellanas dulce, aromático y perfecto para la sobremesa.",
    price: "$6.00",
    subcategory: "Licores & Digestivos",
  },
  {
    name: "Licor Pazo Pondal Café",
    description: "Licor de café aromático, dulce y de final intenso.",
    price: "$5.00",
    subcategory: "Licores & Digestivos",
  },
  {
    name: "Licor Baileys",
    description: "Crema irlandesa dulce y cremosa para disfrutar después de la comida.",
    price: "$4.00",
    subcategory: "Licores & Digestivos",
  },
  {
    name: "Crema Ruavieja Original",
    description: "Crema de licor suave, dulce y aterciopelada.",
    price: "$4.00",
    subcategory: "Licores & Digestivos",
  },
  {
    name: "Brandy Torres 15",
    description: "Brandy añejo de perfil cálido, profundo y elegante.",
    price: "$4.00",
    subcategory: "Licores & Digestivos",
  },
  {
    name: "Amaretto",
    description: "Licor dulce de almendras y especias, ideal para la sobremesa.",
    price: "$3.00",
    subcategory: "Licores & Digestivos",
  },
  {
    name: "Licor Anís del Mono",
    description: "Digestivo anisado, aromático y suave.",
    price: "$3.00",
    subcategory: "Licores & Digestivos",
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
    id: "cafe-digestivos",
    label: "Café & Digestivos",
    dishes: coffeeDishes,
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
