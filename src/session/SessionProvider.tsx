import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { alExpirarSesion } from "@/api/client";
import * as endpoints from "@/api/endpoints";
import { borrarSesion, guardarEmail, guardarTokens, leerEmail, leerTokens } from "@/api/tokens";
import { limpiarDatosLocales } from "@/services/listaService";

type Estado = "cargando" | "anonimo" | "autenticado";

type Sesion = {
  estado: Estado;
  email: string | null;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  registrar: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
};

const Contexto = createContext<Sesion | null>(null);

export function useSesion(): Sesion {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useSesion debe usarse dentro de SessionProvider");
  return ctx;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [email, setEmail] = useState<string | null>(null);

  const cerrarSesion = useCallback(async () => {
    await borrarSesion();
    await limpiarDatosLocales().catch(() => undefined);
    setEmail(null);
    setEstado("anonimo");
  }, []);

  useEffect(() => {
    // La sesión se restaura sin red: la lista local funciona sin conexión.
    (async () => {
      const tokens = await leerTokens();
      setEmail(await leerEmail());
      setEstado(tokens ? "autenticado" : "anonimo");
    })().catch(() => setEstado("anonimo"));
    alExpirarSesion(() => {
      setEmail(null);
      setEstado("anonimo");
    });
    return () => alExpirarSesion(null);
  }, []);

  const abrir = useCallback(async (promesa: Promise<endpoints.SesionApi>) => {
    const s = await promesa;
    await guardarTokens({ token: s.token, refreshToken: s.refreshToken });
    await guardarEmail(s.usuario.email);
    setEmail(s.usuario.email);
    setEstado("autenticado");
  }, []);

  const valor = useMemo<Sesion>(
    () => ({
      estado,
      email,
      iniciarSesion: (e, p) => abrir(endpoints.login(e.trim(), p)),
      registrar: (e, p) => abrir(endpoints.registro(e.trim(), p)),
      cerrarSesion,
    }),
    [estado, email, abrir, cerrarSesion],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}
