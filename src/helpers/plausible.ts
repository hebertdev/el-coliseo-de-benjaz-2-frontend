/**
 * Helper para disparar eventos personalizados en Plausible Analytics
 */
export function trackPlausibleEvent(
  eventName: string,
  options?: { props?: Record<string, string | number | boolean>; callback?: () => void }
) {
  if (typeof window === "undefined") return;

  try {
    const win = window as unknown as {
      plausible?: {
        (name: string, opt?: object): void;
        q?: unknown[];
      };
    };

    // Inicializar cola si Plausible aún no ha terminado de cargar su script
    win.plausible =
      win.plausible ||
      function () {
        // eslint-disable-next-line prefer-rest-params
        (win.plausible!.q = win.plausible!.q || []).push(arguments);
      };

    win.plausible(eventName, options);
  } catch {
    // Ignorar errores en navegadores con adblock o extensiones
  }
}
