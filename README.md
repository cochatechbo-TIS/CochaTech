# Sistema-OhSanSI
🧰 Requisitos del entorno de desarrollo para Sistema Oh! SanSI

Cada miembro del equipo debe tener instalado:

✅ Visual Studio Code
   - Extensiones recomendadas:
     - ESLint
     - Prettier
     - Docker
     - GitLens
     - Laravel Blade Snippets
     - PHP Intelephense

✅ Git
   - Verifica con: git --version

✅ Node.js v20+
   - Incluye npm
   - Verifica con: node -v y npm -v

✅ Composer
   - Verifica con: composer -V

✅ Docker Desktop
   - Incluye Docker Compose
   - Verifica con: docker -v

✅ PHP 8.2 (opcional si Laravel se corre fuera de Docker)
   - Verifica con: php -v

✅ Postman o Insomnia (para probar la API RESTful)

✅ DBeaver o TablePlus (para visualizar la base de datos PostgreSQL)

Opcional:
🔧 WSL2 (Windows Subsystem for Linux) para mejor compatibilidad con Docker

🧪 Script de verificación automática:
Ejecuta `scripts/verificar-entorno.ps1` desde PowerShell para validar tu entorno.

Write-Host "🔍 Verificando entorno de desarrollo..."

# Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "✅ Node.js:" (node -v)
} else {
    Write-Host "❌ Node.js no está instalado."
}

# npm
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "✅ npm:" (npm -v)
} else {
    Write-Host "❌ npm no está instalado."
}

# Git
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "✅ Git:" (git --version)
} else {
    Write-Host "❌ Git no está instalado."
}

# Composer
if (Get-Command composer -ErrorAction SilentlyContinue) {
    Write-Host "✅ Composer:" (composer -V)
} else {
    Write-Host "❌ Composer no está instalado."
}

# Docker
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "✅ Docker:" (docker -v)
} else {
    Write-Host "❌ Docker no está instalado."
}

# PHP
if (Get-Command php -ErrorAction SilentlyContinue) {
    Write-Host "✅ PHP:" (php -v | Select-String "PHP")
} else {
    Write-Host "❌ PHP no está instalado (solo necesario si no usas Docker para Laravel)."
}

Write-Host "`n✅ Verificación completada."
# CochaTech
Proyecto de TIS

# CochaTech Sistema - Gestión de Olimpiadas

Sistema web para la gestión integral de inscripciones, evaluaciones, certificados y medallero en competencias académicas.

## 🏗️ Arquitectura del Sistema

- **Backend**: Laravel 11 (PHP 8.2) - Arquitectura MVC por capas
- **Frontend**: React 18 + TypeScript + Vite
- **Base de Datos**: PostgreSQL 15
- **Servidor Web**: Apache 2.4.62
- **Cache**: Redis 7
- **Containerización**: Docker + Docker Compose

##  Metodología de Desarrollo

- **Metodología**: Scrum (Sprints de 3 semanas)
- **Control de Versiones**: Git Flow
- **Estándares**: PSR-12 (Backend), ESLint + Prettier (Frontend)
- **Testing**: PHPUnit (Backend), Jest + React Testing Library (Frontend)
- **CI/CD**: GitHub Actions

##  Instalación Rápida

\\\ash
# Clonar repositorio
git clone <repository-url>
cd cochatech-sistema

# Levantar servicios
docker-compose up --build -d

# Configurar Laravel
docker-compose exec backend php artisan key:generate
docker-compose exec backend php artisan migrate --seed
\\\

##  URLs de Desarrollo

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Sistema Completo**: http://localhost
- **Base de Datos (Adminer)**: http://localhost:8080
- **Documentación API**: http://localhost:8000/docs

##  Equipo de Desarrollo

**CochaTech Technology Group**
- Bozo Jose Guillermo
- Fernández Lazcano Oscar Rolando
- Huarachi Ismael
- Jachacollo Montaño Romane
- Orellana Balderrama Axel
- Yucra Tovar Andrea Rebeca

**Docente**: Ing. Corina Justina Flores Villarroel

##  Documentación

- [Estándares de Codificación](docs/coding-standards.md)
- [Guía de Contribución](docs/contributing.md)
- [Documentación de API](docs/api/README.md)
- [Manual de Despliegue](docs/deployment/README.md)

##  Sprints de Desarrollo

- **Sprint 0** (8-12 Sept): Análisis y Diseño
- **Sprint 1** (15 Sept-3 Oct): Módulo de Inscritos + Carga CSV/Excel
- **Sprint 2** (6-24 Oct): Módulo de Evaluaciones
- **Sprint 3** (27 Oct-14 Nov): Módulo de Certificados y Reportes
- **Sprint 4** (17-28 Nov): Medallero + Log de Cambios + Testing

##  Contacto

**Email**: cochatech.bo@gmail.com  
**Teléfono**: 65306460
--------------------------------------------------------------------------------------
Documentación para el equipo
Crea un archivo README.md con instrucciones claras. Aquí tienes una plantilla adaptada a tu entorno:
# 🛠️ Cochatech Sistema - Entorno de Desarrollo Dockerizado

Este entorno incluye:

- Laravel 11 (PHP 8.2)
- PostgreSQL 15
- Redis
- React + Vite + TypeScript
- Apache 2.4 con proxy hacia Laravel
- Adminer para gestión de base de datos

## ✅ Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado
- Git instalado
- Acceso a este repositorio

## 🚀 Pasos para iniciar

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/cochatech-sistema.git
cd cochatech-sistema


- Copia el archivo .env.example y renómbralo a .env (si aplica)
- Levanta el entorno:
docker-compose up --build -d
- Accede a los servicios:
- Laravel API: http://localhost:8000
- Frontend: http://localhost:3000
- Adminer: http://localhost:8080
- Apache (proxy): http://localhost
🧪 VerificaciónPuedes ejecutar:docker-compose ps
Todos los servicios deben estar en estado Up.🧹 MantenimientoPara limpiar el entorno:docker-compose down
docker builder prune --force
👥 3. Recomendaciones para el equipo- Usar editores como VS Code con extensiones para Docker, PHP, y TypeScript.
- Configurar Git con nombre y correo para commits colaborativos.
- Evitar modificar directamente los contenedores; usar docker-compose exec para comandos internos.
- Documentar cambios en scripts, configuraciones y estructura de carpetas.

