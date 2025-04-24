# Banexcoin Backend

## Configuración

```bash
cp .env.template .env
```

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm run start
```

## Descripción

Backend de Banexcoin para envío y recepción de transacciones.  
Se realizó en Nest, incluye lógica de **comisiones**, manejo de **colas con BullMQ**, y generación automática de **datos de prueba**.

## Endpoints

Postman: [https://carpincho-dev.postman.co/workspace/Team-Workspace~9d305ede-95c2-4361-8d03-9fda8131ff13/collection/44292263-cceffbd5-aed5-4c1b-bbd5-a653e2a5336a?action=share&creator=44292263](https://carpincho-dev.postman.co/workspace/Team-Workspace~9d305ede-95c2-4361-8d03-9fda8131ff13/collection/44292263-cceffbd5-aed5-4c1b-bbd5-a653e2a5336a?action=share&creator=44292263)

También se puede importar el archivo `Banexcoin.postman_collection.json` en Postman.

## Detalles Técnicos

1. **Balances**  
   - Se recalculan automáticamente mediante *triggers* en la base de datos.  
   - Se asume que no habrá borrado físico de transacciones.

2. **Datos de prueba**  
   - Se insertan automáticamente al iniciar si la base está vacía, mediante un módulo `seed`.

3. **BullMQ + Redis (Redundancia)**  
   - Se usa BullMQ con Redis para garantizar una única transacción en curso.  
   - Se previene el envío sin saldo suficiente.  
   - También se usa una función directa en la DB para validar balances como refuerzo.

## Mejoras Futuras (Sugeridas)

- [ ] Protección contra ataques **DDoS** (ej. `express-rate-limit`)
- [ ] Sistema de **logs avanzado** para errores y eventos
- [ ] Alertas por **email o SMS** ante eventos críticos (envío/aprobación de transacciones)
- [ ] Integrar **Playwright** para pruebas E2E
- [ ] Añadir **WebSocket** para notificaciones en tiempo real (especialmente sobre balances)
