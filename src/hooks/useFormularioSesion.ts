import { useCallback, useState } from "react";
import { ApiError } from "@/api/client";
import { useSesion } from "@/session/SessionProvider";
import { validarEmail, validarPassword } from "@/services/validacion";

/** Devuelve el primer error de validación del formulario, o null. */
export function validarFormulario(email: string, password: string, registro: boolean): string | null {
  const errorEmail = validarEmail(email);
  if (errorEmail) return errorEmail;
  if (registro) return validarPassword(password);
  return password ? null : "Escribe tu contraseña.";
}

export function useFormularioSesion() {
  const { iniciarSesion, registrar } = useSesion();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const enviar = useCallback(async () => {
    const invalido = validarFormulario(email, password, modoRegistro);
    if (invalido) return setError(invalido);
    setError(null);
    setCargando(true);
    try {
      await (modoRegistro ? registrar(email, password) : iniciarSesion(email, password));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo iniciar sesión.");
    } finally {
      setCargando(false);
    }
  }, [email, password, modoRegistro, registrar, iniciarSesion]);

  const cambiarModo = useCallback(() => {
    setModoRegistro((m) => !m);
    setError(null);
  }, []);

  return { modoRegistro, email, setEmail, password, setPassword, error, cargando, enviar, cambiarModo };
}
