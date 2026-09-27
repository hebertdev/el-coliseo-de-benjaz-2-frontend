/**
 * Variable global para habilitar o deshabilitar la publicidad y banners de anuncios (Ads) en el sitio web.
 *
 * Configuración:
 * - `false`: Oculta todos los banners de publicidad (Modal publicitario, Banner flotante inferior, Banner VIP de patrocinador).
 * - `true`: Muestra la publicidad activa.
 *
 * Por defecto está en `false` según la directriz del proyecto.
 * Puede sobreescribirse opcionalmente con la variable de entorno NEXT_PUBLIC_ENABLE_ADS="true".
 */
export const ENABLE_ADS: boolean =
  process.env.NEXT_PUBLIC_ENABLE_ADS === "true";

export const SHOW_ADS: boolean = ENABLE_ADS;
export const ADS_ENABLED: boolean = ENABLE_ADS;
