# Panel de Administración — Bacru Inmobiliaria

Entrada: `tudominio.com/admin` (también el punto "·" casi invisible del footer).

## Acceso
El correo y la contraseña **no están en el proyecto**. Viven únicamente como variables
de entorno en Vercel: `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_SECRET`.
Para cambiarlos: Vercel → Settings → Environment Variables → editar → **Redeploy**.

Más asesores con acceso: panel → pestaña Asesores → dar acceso a un correo
(usan la misma contraseña del panel).

## Datos
Propiedades, asesores, testimonios y leads se guardan en la base de datos (Upstash Redis)
y los archivos en Vercel Blob. Guía completa: **DEPLOY-VERCEL.md**.

## Funciones
Propiedades (alta, edición, vendida/activa, borrar), asesores con foto, testimonios
con video, leads (formularios y chatbot) y accesos al panel.
