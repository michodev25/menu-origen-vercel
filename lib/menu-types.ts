export type MenuDish = {
  id: string;
  name: string;
  description: string;
  price: string;
  ingredients?: string;
  note?: boolean;
  visible: boolean;
  order: number;
};

export type MenuSubcategory = {
  id: string;
  name: string;
  showHeading: boolean;
  visible: boolean;
  order: number;
  dishes: MenuDish[];
};

export type MenuCategory = {
  id: string;
  name: string;
  visible: boolean;
  order: number;
  subcategories: MenuSubcategory[];
};

export type MenuData = {
  version: 1;
  updatedAt: string;
  updatedBy: string;
  categories: MenuCategory[];
};

export type PublicDish = Omit<MenuDish, "visible" | "order"> & {
  subcategory?: string;
};

export type PublicMenuSection = {
  id: string;
  label: string;
  dishes: PublicDish[];
};
