import "server-only";

import { copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  MenuCategory,
  MenuData,
  MenuDish,
  MenuSubcategory,
  PublicMenuSection,
} from "./menu-types";

const dataDirectory = path.join(process.cwd(), "data");
const menuPath = path.join(dataDirectory, "menu.json");
const backupPath = path.join(dataDirectory, "menu.backup.json");
let writeQueue: Promise<void> = Promise.resolve();

function byOrder<T extends { order: number }>(a: T, b: T) {
  return a.order - b.order;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireText(value: unknown, field: string, allowEmpty = false) {
  if (typeof value !== "string" || (!allowEmpty && !value.trim())) {
    throw new Error(`${field} no es válido.`);
  }

  return value.trim();
}

function requireBoolean(value: unknown, field: string) {
  if (typeof value !== "boolean") throw new Error(`${field} no es válido.`);
  return value;
}

function requireOrder(value: unknown, field: string) {
  if (!Number.isInteger(value) || Number(value) < 0) {
    throw new Error(`${field} no es válido.`);
  }

  return Number(value);
}

function validateDish(value: unknown, ids: Set<string>, context: string): MenuDish {
  if (!isRecord(value)) throw new Error(`${context} no es válido.`);
  const id = requireText(value.id, `${context}.id`);
  if (ids.has(id)) throw new Error(`El id ${id} está repetido.`);
  ids.add(id);
  const price = requireText(value.price, `${context}.price`, Boolean(value.note));

  if (price && !/^\$\d+(?:\.\d{2})$/.test(price)) {
    throw new Error(`El precio de ${String(value.name)} debe usar el formato $0.00.`);
  }

  return {
    id,
    name: requireText(value.name, `${context}.name`),
    description: requireText(value.description, `${context}.description`),
    price,
    ...(typeof value.ingredients === "string" && value.ingredients.trim()
      ? { ingredients: value.ingredients.trim() }
      : {}),
    ...(value.note === true ? { note: true } : {}),
    visible: requireBoolean(value.visible, `${context}.visible`),
    order: requireOrder(value.order, `${context}.order`),
  };
}

function validateSubcategory(
  value: unknown,
  ids: Set<string>,
  context: string,
): MenuSubcategory {
  if (!isRecord(value) || !Array.isArray(value.dishes)) {
    throw new Error(`${context} no es válida.`);
  }

  const id = requireText(value.id, `${context}.id`);
  if (ids.has(id)) throw new Error(`El id ${id} está repetido.`);
  ids.add(id);
  const names = new Set<string>();
  const dishes = value.dishes.map((dish, index) => {
    const parsed = validateDish(dish, ids, `${context}.dishes[${index}]`);
    const normalized = parsed.name.toLocaleLowerCase("es");
    if (names.has(normalized)) {
      throw new Error(`El plato ${parsed.name} está repetido en la subcategoría.`);
    }
    names.add(normalized);
    return parsed;
  });

  return {
    id,
    name: requireText(value.name, `${context}.name`),
    showHeading: requireBoolean(value.showHeading, `${context}.showHeading`),
    visible: requireBoolean(value.visible, `${context}.visible`),
    order: requireOrder(value.order, `${context}.order`),
    dishes,
  };
}

function validateCategory(
  value: unknown,
  ids: Set<string>,
  context: string,
): MenuCategory {
  if (!isRecord(value) || !Array.isArray(value.subcategories)) {
    throw new Error(`${context} no es válida.`);
  }

  const id = requireText(value.id, `${context}.id`);
  if (ids.has(id)) throw new Error(`El id ${id} está repetido.`);
  ids.add(id);
  const names = new Set<string>();
  const subcategories = value.subcategories.map((subcategory, index) => {
    const parsed = validateSubcategory(
      subcategory,
      ids,
      `${context}.subcategories[${index}]`,
    );
    const normalized = parsed.name.toLocaleLowerCase("es");
    if (names.has(normalized)) {
      throw new Error(`La subcategoría ${parsed.name} está repetida.`);
    }
    names.add(normalized);
    return parsed;
  });

  return {
    id,
    name: requireText(value.name, `${context}.name`),
    visible: requireBoolean(value.visible, `${context}.visible`),
    order: requireOrder(value.order, `${context}.order`),
    subcategories,
  };
}

export function validateMenu(value: unknown): MenuData {
  if (!isRecord(value) || !Array.isArray(value.categories)) {
    throw new Error("La carta no tiene una estructura válida.");
  }

  const ids = new Set<string>();
  const names = new Set<string>();
  const categories = value.categories.map((category, index) => {
    const parsed = validateCategory(category, ids, `categories[${index}]`);
    const normalized = parsed.name.toLocaleLowerCase("es");
    if (names.has(normalized)) throw new Error(`La categoría ${parsed.name} está repetida.`);
    names.add(normalized);
    return parsed;
  });

  return {
    version: 1,
    updatedAt:
      typeof value.updatedAt === "string" ? value.updatedAt : new Date().toISOString(),
    updatedBy: typeof value.updatedBy === "string" ? value.updatedBy : "sistema",
    categories,
  };
}

export async function readMenu(): Promise<MenuData> {
  const raw = await readFile(menuPath, "utf8");
  return validateMenu(JSON.parse(raw) as unknown);
}

export async function writeMenu(value: unknown, username: string): Promise<MenuData> {
  const parsed = validateMenu(value);
  const nextMenu: MenuData = {
    ...parsed,
    updatedAt: new Date().toISOString(),
    updatedBy: username,
  };

  writeQueue = writeQueue.catch(() => undefined).then(async () => {
    await mkdir(dataDirectory, { recursive: true });
    await copyFile(menuPath, backupPath).catch(() => undefined);
    const temporaryPath = `${menuPath}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(nextMenu, null, 2)}\n`, "utf8");
    await rename(temporaryPath, menuPath);
  });

  await writeQueue;
  return nextMenu;
}

export function toPublicMenu(menu: MenuData): PublicMenuSection[] {
  return [...menu.categories]
    .filter((category) => category.visible)
    .sort(byOrder)
    .map((category) => ({
      id: category.id,
      label: category.name,
      dishes: [...category.subcategories]
        .filter((subcategory) => subcategory.visible)
        .sort(byOrder)
        .flatMap((subcategory) =>
          [...subcategory.dishes]
            .filter((dish) => dish.visible)
            .sort(byOrder)
            .map((dish) => ({
              id: dish.id,
              name: dish.name,
              description: dish.description,
              price: dish.price,
              ...(dish.ingredients ? { ingredients: dish.ingredients } : {}),
              ...(dish.note ? { note: true } : {}),
              ...(subcategory.showHeading
                ? { subcategory: subcategory.name }
                : {}),
            })),
        ),
    }))
    .filter((category) => category.dishes.length > 0);
}
