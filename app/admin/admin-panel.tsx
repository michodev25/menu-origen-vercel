"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import type { MenuCategory, MenuData } from "@/lib/menu-types";

type EditorTarget =
  | { kind: "category"; categoryId?: string }
  | { kind: "subcategory"; categoryId: string; subcategoryId?: string }
  | {
      kind: "dish";
      categoryId: string;
      subcategoryId: string;
      dishId?: string;
    };

type EditorValues = {
  name: string;
  description?: string;
  price?: string;
  ingredients?: string;
  note?: boolean;
  showHeading?: boolean;
};

function ordered<T extends { order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.order - b.order);
}

function normalizeOrders(menu: MenuData) {
  menu.categories.forEach((category, categoryIndex) => {
    category.order = categoryIndex;
    category.subcategories.forEach((subcategory, subcategoryIndex) => {
      subcategory.order = subcategoryIndex;
      subcategory.dishes.forEach((dish, dishIndex) => {
        dish.order = dishIndex;
      });
    });
  });
  return menu;
}

function moveItem<T extends { id: string }>(items: T[], id: string, direction: -1 | 1) {
  const index = items.findIndex((item) => item.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= items.length) return;
  [items[index], items[target]] = [items[target], items[index]];
}

function createId(prefix: string) {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  return `${prefix}-${random}`;
}

function visibilityLabel(visible: boolean) {
  return visible ? "Visible" : "Oculto";
}

export default function AdminPanel({
  initialMenu,
  username,
}: {
  initialMenu: MenuData;
  username: string;
}) {
  const router = useRouter();
  const [menu, setMenu] = useState(initialMenu);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    ordered(initialMenu.categories)[0]?.id ?? "",
  );
  const [editor, setEditor] = useState<EditorTarget | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const selectedCategory = menu.categories.find(
    (category) => category.id === selectedCategoryId,
  );
  const statistics = useMemo(() => {
    const subcategories = menu.categories.flatMap((category) => category.subcategories);
    const dishes = subcategories.flatMap((subcategory) => subcategory.dishes);
    return {
      categories: menu.categories.length,
      dishes: dishes.length,
      hidden: dishes.filter((dish) => !dish.visible).length,
    };
  }, [menu]);

  useEffect(() => {
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [dirty]);

  function mutate(change: (draft: MenuData) => void) {
    setMenu((current) => {
      const next = structuredClone(current);
      change(next);
      return normalizeOrders(next);
    });
    setDirty(true);
    setStatus("Cambios pendientes de guardar");
  }

  function saveEditor(target: EditorTarget, values: EditorValues) {
    mutate((draft) => {
      if (target.kind === "category") {
        if (target.categoryId) {
          const category = draft.categories.find((item) => item.id === target.categoryId);
          if (category) category.name = values.name;
        } else {
          const category: MenuCategory = {
            id: createId("categoria"),
            name: values.name,
            visible: true,
            order: draft.categories.length,
            subcategories: [],
          };
          draft.categories.push(category);
          setSelectedCategoryId(category.id);
        }
        return;
      }

      const category = draft.categories.find((item) => item.id === target.categoryId);
      if (!category) return;

      if (target.kind === "subcategory") {
        if (target.subcategoryId) {
          const subcategory = category.subcategories.find(
            (item) => item.id === target.subcategoryId,
          );
          if (subcategory) {
            subcategory.name = values.name;
            subcategory.showHeading = values.showHeading ?? true;
          }
        } else {
          category.subcategories.push({
            id: createId(`${category.id}-subcategoria`),
            name: values.name,
            showHeading: values.showHeading ?? true,
            visible: true,
            order: category.subcategories.length,
            dishes: [],
          });
        }
        return;
      }

      const subcategory = category.subcategories.find(
        (item) => item.id === target.subcategoryId,
      );
      if (!subcategory) return;
      const dishValues = {
        name: values.name,
        description: values.description ?? "",
        price: values.note ? "" : (values.price ?? "$0.00"),
        ...(values.ingredients ? { ingredients: values.ingredients } : {}),
        ...(values.note ? { note: true } : {}),
      };

      if (target.dishId) {
        const dish = subcategory.dishes.find((item) => item.id === target.dishId);
        if (dish) {
          delete dish.ingredients;
          delete dish.note;
          Object.assign(dish, dishValues);
        }
      } else {
        subcategory.dishes.push({
          id: createId(`${subcategory.id}-plato`),
          ...dishValues,
          visible: true,
          order: subcategory.dishes.length,
        });
      }
    });
    setEditor(null);
  }

  function toggleCategory(categoryId: string) {
    mutate((draft) => {
      const category = draft.categories.find((item) => item.id === categoryId);
      if (category) category.visible = !category.visible;
    });
  }

  function toggleSubcategory(categoryId: string, subcategoryId: string) {
    mutate((draft) => {
      const subcategory = draft.categories
        .find((category) => category.id === categoryId)
        ?.subcategories.find((item) => item.id === subcategoryId);
      if (subcategory) subcategory.visible = !subcategory.visible;
    });
  }

  function toggleDish(categoryId: string, subcategoryId: string, dishId: string) {
    mutate((draft) => {
      const dish = draft.categories
        .find((category) => category.id === categoryId)
        ?.subcategories.find((subcategory) => subcategory.id === subcategoryId)
        ?.dishes.find((item) => item.id === dishId);
      if (dish) dish.visible = !dish.visible;
    });
  }

  async function saveMenu() {
    setSaving(true);
    setStatus("Guardando la carta…");
    try {
      const response = await fetch("/api/admin/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menu),
      });
      const result = (await response.json()) as MenuData & { error?: string };
      if (response.status === 401) {
        router.refresh();
        return;
      }
      if (!response.ok) throw new Error(result.error ?? "No se pudo guardar.");
      setMenu(result);
      setDirty(false);
      setStatus(`Carta guardada por ${result.updatedBy}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo guardar la carta.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    if (dirty && !window.confirm("Hay cambios sin guardar. ¿Quieres cerrar sesión?")) return;
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="admin-app-shell">
      <header className="admin-topbar">
        <div>
          <p className="admin-eyebrow">THE ORIGEN · CARTA LOCAL</p>
          <h1>Índice de servicio</h1>
        </div>
        <div className="admin-session-actions">
          <a href="/" target="_blank" rel="noreferrer">Ver carta ↗</a>
          <span>Sesión: {username}</span>
          <button type="button" onClick={logout}>Salir</button>
        </div>
      </header>

      <div className="admin-workspace">
        <aside className="admin-category-index" aria-label="Categorías de la carta">
          <div className="admin-index-heading">
            <h2>Categorías</h2>
            <button
              className="admin-small-button"
              type="button"
              onClick={() => setEditor({ kind: "category" })}
            >
              + Nueva
            </button>
          </div>
          <div className="admin-category-list">
            {ordered(menu.categories).map((category, index) => (
              <button
                className={`admin-category-tab${category.id === selectedCategoryId ? " is-active" : ""}`}
                key={category.id}
                type="button"
                onClick={() => setSelectedCategoryId(category.id)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{category.name}</strong>
                {!category.visible && <em>Oculta</em>}
              </button>
            ))}
          </div>
          <dl className="admin-index-stats">
            <div><dt>Categorías</dt><dd>{statistics.categories}</dd></div>
            <div><dt>Platos</dt><dd>{statistics.dishes}</dd></div>
            <div><dt>Ocultos</dt><dd>{statistics.hidden}</dd></div>
          </dl>
        </aside>

        <main className="admin-menu-editor">
          {selectedCategory ? (
            <>
              <section className="admin-category-heading">
                <div>
                  <p className="admin-section-kicker">Categoría seleccionada</p>
                  <h2>{selectedCategory.name}</h2>
                  <span className={`admin-status-pill${selectedCategory.visible ? "" : " is-hidden"}`}>
                    {visibilityLabel(selectedCategory.visible)}
                  </span>
                </div>
                <div className="admin-heading-actions">
                  <button type="button" onClick={() => mutate((draft) => moveItem(draft.categories, selectedCategory.id, -1))}>↑ Subir</button>
                  <button type="button" onClick={() => mutate((draft) => moveItem(draft.categories, selectedCategory.id, 1))}>↓ Bajar</button>
                  <button type="button" onClick={() => setEditor({ kind: "category", categoryId: selectedCategory.id })}>Editar</button>
                  <button type="button" onClick={() => toggleCategory(selectedCategory.id)}>
                    {selectedCategory.visible ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </section>

              <div className="admin-section-toolbar">
                <p>{selectedCategory.subcategories.length} subcategorías</p>
                <button
                  className="admin-primary-button admin-primary-button--compact"
                  type="button"
                  onClick={() => setEditor({ kind: "subcategory", categoryId: selectedCategory.id })}
                >
                  + Agregar subcategoría
                </button>
              </div>

              <div className="admin-subcategory-list">
                {ordered(selectedCategory.subcategories).map((subcategory) => (
                  <section
                    className={`admin-subcategory-card${subcategory.visible ? "" : " is-hidden"}`}
                    key={subcategory.id}
                  >
                    <header>
                      <div>
                        <h3>{subcategory.name}</h3>
                        <span>{visibilityLabel(subcategory.visible)} · {subcategory.dishes.length} elementos</span>
                      </div>
                      <div className="admin-row-actions">
                        <button type="button" aria-label={`Subir ${subcategory.name}`} onClick={() => mutate((draft) => moveItem(draft.categories.find((item) => item.id === selectedCategory.id)?.subcategories ?? [], subcategory.id, -1))}>↑</button>
                        <button type="button" aria-label={`Bajar ${subcategory.name}`} onClick={() => mutate((draft) => moveItem(draft.categories.find((item) => item.id === selectedCategory.id)?.subcategories ?? [], subcategory.id, 1))}>↓</button>
                        <button type="button" onClick={() => setEditor({ kind: "subcategory", categoryId: selectedCategory.id, subcategoryId: subcategory.id })}>Editar</button>
                        <button type="button" onClick={() => toggleSubcategory(selectedCategory.id, subcategory.id)}>{subcategory.visible ? "Ocultar" : "Mostrar"}</button>
                      </div>
                    </header>

                    <div className="admin-dish-list">
                      {ordered(subcategory.dishes).map((dish) => (
                        <article className={`admin-dish-row${dish.visible ? "" : " is-hidden"}`} key={dish.id}>
                          <div className="admin-dish-order">
                            <button type="button" aria-label={`Subir ${dish.name}`} onClick={() => mutate((draft) => moveItem(draft.categories.find((item) => item.id === selectedCategory.id)?.subcategories.find((item) => item.id === subcategory.id)?.dishes ?? [], dish.id, -1))}>↑</button>
                            <button type="button" aria-label={`Bajar ${dish.name}`} onClick={() => mutate((draft) => moveItem(draft.categories.find((item) => item.id === selectedCategory.id)?.subcategories.find((item) => item.id === subcategory.id)?.dishes ?? [], dish.id, 1))}>↓</button>
                          </div>
                          <div className="admin-dish-copy">
                            <h4>{dish.name}</h4>
                            <p>{dish.description}</p>
                          </div>
                          <strong className="admin-dish-price">{dish.price || "Nota"}</strong>
                          <span className={`admin-status-dot${dish.visible ? "" : " is-hidden"}`} title={visibilityLabel(dish.visible)} />
                          <div className="admin-row-actions">
                            <button type="button" onClick={() => setEditor({ kind: "dish", categoryId: selectedCategory.id, subcategoryId: subcategory.id, dishId: dish.id })}>Editar</button>
                            <button type="button" onClick={() => toggleDish(selectedCategory.id, subcategory.id, dish.id)}>{dish.visible ? "Ocultar" : "Mostrar"}</button>
                          </div>
                        </article>
                      ))}
                      {subcategory.dishes.length === 0 && (
                        <p className="admin-empty-message">Todavía no hay platos en esta subcategoría.</p>
                      )}
                    </div>
                    <button
                      className="admin-add-dish"
                      type="button"
                      onClick={() => setEditor({ kind: "dish", categoryId: selectedCategory.id, subcategoryId: subcategory.id })}
                    >
                      + Agregar plato
                    </button>
                  </section>
                ))}
                {selectedCategory.subcategories.length === 0 && (
                  <div className="admin-empty-state">
                    <h3>La categoría está vacía</h3>
                    <p>Agrega una subcategoría para comenzar a organizar sus platos.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="admin-empty-state">
              <h2>No hay categorías</h2>
              <p>Crea la primera categoría para comenzar.</p>
            </div>
          )}
        </main>
      </div>

      <footer className="admin-save-bar">
        <p aria-live="polite">{status || `Último guardado: ${new Date(menu.updatedAt).toLocaleString("es-CU")}`}</p>
        <button className="admin-primary-button" disabled={!dirty || saving} type="button" onClick={saveMenu}>
          {saving ? "Guardando…" : dirty ? "Guardar cambios" : "Carta actualizada"}
        </button>
      </footer>

      {editor && (
        <EditorDialog
          key={`${editor.kind}-${"categoryId" in editor ? editor.categoryId : "new"}-${"subcategoryId" in editor ? editor.subcategoryId : ""}-${"dishId" in editor ? editor.dishId : ""}`}
          editor={editor}
          menu={menu}
          onClose={() => setEditor(null)}
          onSave={saveEditor}
        />
      )}
    </div>
  );
}

function EditorDialog({
  editor,
  menu,
  onClose,
  onSave,
}: {
  editor: EditorTarget;
  menu: MenuData;
  onClose: () => void;
  onSave: (target: EditorTarget, values: EditorValues) => void;
}) {
  const category = "categoryId" in editor
    ? menu.categories.find((item) => item.id === editor.categoryId)
    : undefined;
  const subcategory = "subcategoryId" in editor
    ? category?.subcategories.find((item) => item.id === editor.subcategoryId)
    : undefined;
  const dish = "dishId" in editor
    ? subcategory?.dishes.find((item) => item.id === editor.dishId)
    : undefined;
  const existing = editor.kind === "category" ? category : editor.kind === "subcategory" ? subcategory : dish;
  const [note, setNote] = useState(dish?.note ?? false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const rawPrice = String(form.get("price") ?? "").replace("$", "").trim();
    const numericPrice = Number(rawPrice);
    onSave(editor, {
      name: String(form.get("name") ?? "").trim(),
      ...(editor.kind === "subcategory"
        ? { showHeading: form.get("showHeading") === "on" }
        : {}),
      ...(editor.kind === "dish"
        ? {
            description: String(form.get("description") ?? "").trim(),
            price: note && !rawPrice
              ? ""
              : Number.isFinite(numericPrice)
                ? `$${numericPrice.toFixed(2)}`
                : rawPrice,
            ingredients: String(form.get("ingredients") ?? "").trim(),
            note,
          }
        : {}),
    });
  }

  const noun = editor.kind === "category" ? "categoría" : editor.kind === "subcategory" ? "subcategoría" : "plato";

  return (
    <div className="admin-dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title">
        <header>
          <div>
            <p className="admin-section-kicker">{existing ? "Editar" : "Nuevo elemento"}</p>
            <h2 id="admin-dialog-title">{existing ? `Editar ${noun}` : `Agregar ${noun}`}</h2>
          </div>
          <button className="admin-dialog-close" type="button" aria-label="Cerrar" onClick={onClose}>×</button>
        </header>
        <form onSubmit={submit}>
          <label>
            Nombre
            <input autoFocus defaultValue={existing?.name ?? ""} name="name" required />
          </label>

          {editor.kind === "subcategory" && (
            <label className="admin-checkbox-label">
              <input defaultChecked={subcategory?.showHeading ?? true} name="showHeading" type="checkbox" />
              Mostrar el encabezado en la carta pública
            </label>
          )}

          {editor.kind === "dish" && (
            <>
              <label>
                Descripción
                <textarea defaultValue={dish?.description ?? ""} name="description" required rows={4} />
              </label>
              <div className="admin-form-grid">
                <label>
                  Precio USD
                  <input defaultValue={dish?.price.replace("$", "") ?? ""} disabled={note} inputMode="decimal" name="price" required={!note} placeholder="0.00" />
                </label>
                <label>
                  Ingredientes <small>opcional</small>
                  <input defaultValue={dish?.ingredients ?? ""} name="ingredients" />
                </label>
              </div>
              <label className="admin-checkbox-label">
                <input checked={note} type="checkbox" onChange={(event) => setNote(event.target.checked)} />
                Es una nota informativa sin precio
              </label>
            </>
          )}

          <footer>
            <button className="admin-secondary-button" type="button" onClick={onClose}>Cancelar</button>
            <button className="admin-primary-button" type="submit">Guardar en borrador</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
