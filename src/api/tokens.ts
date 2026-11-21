import * as SecureStore from "expo-secure-store";

// Los tokens viven solo en expo-secure-store (nunca en AsyncStorage).
const K_TOKEN = "token";
const K_REFRESH = "refreshToken";
const K_EMAIL = "email";

export type Tokens = { token: string; refreshToken: string };

export async function leerTokens(): Promise<Tokens | null> {
  const [token, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(K_TOKEN),
    SecureStore.getItemAsync(K_REFRESH),
  ]);
  return token && refreshToken ? { token, refreshToken } : null;
}

export async function guardarTokens(t: Tokens): Promise<void> {
  await SecureStore.setItemAsync(K_TOKEN, t.token);
  await SecureStore.setItemAsync(K_REFRESH, t.refreshToken);
}

export async function leerEmail(): Promise<string | null> {
  return SecureStore.getItemAsync(K_EMAIL);
}

export async function guardarEmail(email: string): Promise<void> {
  await SecureStore.setItemAsync(K_EMAIL, email);
}

export async function borrarSesion(): Promise<void> {
  await Promise.all([K_TOKEN, K_REFRESH, K_EMAIL].map((k) => SecureStore.deleteItemAsync(k)));
}
