# Manual de instalación

## Requisitos

Para continuar con la instalación del proyecto se necesita contar con las siguientes instalaciones ya realizadas:

1. [NodeJS](https://github.com/nodesource/distributions/blob/master/README.md): Versión ^16
2. [NVM](https://github.com/nvm-sh/nvm) Se recomienda NVM solo para ambientes de DESARROLLO.

## Instalando el proyecto

Siga los siguientes pasos:
Clonar el proyecto:

```bash
# Clonación del proyecto
git clone git@gitlab.justicia.gob.bo:proyectos-vjdf/frontend-internacional-vjdf.git


# Ingresamos dentro de la carpeta del proyecto
cd frontend-internacional-vjdf

# Configura GitFlow en el repositorio local
git flow init

# Cambiamos a la rama develop
git checkout develop
```

### Instalar dependencias

```bash
yarn
```
con NPM:
```bash
npm install
```

### Iniciar en modo desarrollo

```bash
quasar dev
```