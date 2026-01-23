# RESTO+

Sistema de gestión modular para restaurantes.

RESTO+ está diseñado como un **producto escalable**, enfocado en simplicidad operativa, control de inventario y toma de decisiones basada en datos. Permite vender funcionalidades por módulos según el tamaño y necesidades del negocio.

---

## 🧩 Alcance (MVP)

El MVP se enfoca en la operación diaria del restaurante:

* Gestión de usuarios y roles
* Gestión de mesas
* Gestión de productos
* Pedidos y ventas
* Control básico de inventario

---

## 🏗️ Arquitectura

```
RESTO+
│
├── backend/        # Django + Django REST Framework
│   ├── users/
│   ├── mesas/
│   ├── productos/
│   ├── pedidos/
│   ├── ventas/
│   ├── inventario/
│   └── core/
│
├── frontend/       # React
│   ├── admin/
│   ├── mesero/
│   └── cocina/
│
└── infra/          # Docker y despliegue
    ├── docker/
    └── deploy/
```

---

## 🛠️ Tecnologías

### Backend

* Python
* Django
* Django REST Framework
* PostgreSQL

### Frontend

* React

### Infraestructura

* Docker (opcional)
* PostgreSQL en nube o local

---

## ⚙️ Configuración inicial

### 1. Variables de entorno

Crear un archivo `.env` a partir de `.env.ejemplo`:

```
DEBUG=True
SECRET_KEY=dev-secret-key
DB_NAME=restoplus
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
TIME_ZONE=America/Santiago
LANGUAGE_CODE=es-cl
```

> ⚠️ El archivo `.env` **no debe subirse al repositorio**.

---

### 2. Backend (Django)


cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

---

## 🧠 Principios del proyecto

* Arquitectura modular
* Escalabilidad desde el MVP
* Separación clara de responsabilidades
* Pensado como producto comercial

---

## 🚀 Roadmap (alto nivel)

* Inventario avanzado por tipo
* Relación producto–ingrediente
* App móvil para meseros
* Reportes estratégicos y dashboard
* Packs comerciales (básico / intermedio / avanzado)

---

## 📌 Estado

Proyecto en fase de **desarrollo activo (MVP)**.

---

RESTO+ © 2026
