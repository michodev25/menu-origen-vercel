"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "No se pudo iniciar sesión.");
      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "No se pudo iniciar sesión.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-login-page">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <p className="admin-eyebrow">THE ORIGEN · LA HABANA</p>
        <div className="admin-login-heading">
          <span aria-hidden="true" />
          <h1 id="admin-login-title">Administración</h1>
          <span aria-hidden="true" />
        </div>
        <p className="admin-login-copy">
          Accede para organizar categorías, actualizar precios y controlar qué se
          muestra en la carta.
        </p>
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label>
            Usuario
            <input
              autoCapitalize="none"
              autoComplete="username"
              name="username"
              required
              spellCheck={false}
            />
          </label>
          <label>
            Contraseña
            <input
              autoComplete="current-password"
              name="password"
              required
              type="password"
            />
          </label>
          <p className="admin-form-error" role="alert" aria-live="polite">
            {error}
          </p>
          <button className="admin-primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Comprobando…" : "Entrar al panel"}
          </button>
        </form>
        <Link className="admin-back-link" href="/">
          ← Volver a la carta
        </Link>
      </section>
    </div>
  );
}
