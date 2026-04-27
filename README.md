# 🏦 SmartWallet - Gestión de Gastos Inteligente

SmartWallet es una solución integral diseñada para el registro, categorización y control de gastos personales en tiempo real. Este proyecto ha sido desarrollado como parte del curso **Gestión de Proyectos de TI (GPTI)** de la **Pontificia Universidad Católica de Chile**.

---

## 🛠️ Arquitectura del Sistema

El proyecto utiliza una estructura de **Monorepositorio**, lo que permite una integración fluida y el uso de tipos compartidos entre el cliente y el servidor.

### Estructura de Directorios:
* **`/mobile`**: Aplicación móvil nativa desarrollada con **React Native** y **Expo**.
* **`/Backend`**: Servidor API REST construido con **Node.js**, **Express** y **TypeScript**.
* **`/shared`**: Módulo de lógica y tipos compartidos para garantizar la integridad de los datos (Interfaces de TypeScript).

---

## 🚀 Guía de Instalación y Uso

Sigue estos pasos para levantar el entorno de desarrollo local:

### 1. Requisitos Previos
* [Node.js](https://nodejs.org/) (v18 o superior)
* [Expo Go](https://expo.dev/client) instalado en un dispositivo móvil.

### 2. Levantar el Backend (Servidor)
```bash
cd Backend
npm install
npm run dev ```

El servidor estará disponible en http://localhost:3000.

### 3. Levantar el Frontend (App Móvil)
```Bash
cd mobile
npm install
npx expo start -c ```
Escanea el código QR generado con la aplicación Expo Go en tu celular.

## ⚙️ Estándares Técnicos y Calidad

*  Separación de Responsabilidades (SoC): Extracción de estilos a módulos independientes (App.styles.ts) para mejorar la mantenibilidad.

*  Conventional Commits: Uso de mensajes de Git estructurados (feat:, refactor:, fix:) para una trazabilidad clara del historial.

*  Shared Types: Implementación de interfaces comunes en /shared para sincronizar los esquemas de datos entre Front y Back.

*  Local Mocking: Estrategia de persistencia de datos en memoria para validación rápida de flujos de usuario sin dependencias externas.

