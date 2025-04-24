# Banexcoin

## Descripción
Proyecto de prueba para Banexcoin compuesto por:
- **Backend**: `back-banexcoin`
- **Frontend**: `front-banexcoin`

> 📄 *Revisar los README de cada servicio antes de continuar.*

## Instalación

1. Asegúrate de tener Docker instalado.
2. Configura las variables de entorno según lo indicado en los README.
3. Levanta los servicios con:

```bash
docker-compose up
```

## Sobre Docker Compose

Se usa `docker-compose` para simplificar la instalación. Incluye:

- **PostgreSQL**: levanta la estructura de la base con `sql/init.sql`.
- **Redis**: usado como sistema de colas.
- **Node 22 (backend)**: ejecuta el backend y carga datos de prueba (ver `Dockerfile` y `.env`).
- **Node 22 (frontend)**: ejecuta el frontend (ver `Dockerfile` y `.env.local`).

## Consideraciones para producción

Actualmente todos los servicios exponen puertos para facilitar el desarrollo.  
➡️ **En producción se recomienda desactivar los puertos expuestos.**