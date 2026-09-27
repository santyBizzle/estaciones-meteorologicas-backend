# estaciones-meteorologicas-backend

## Generar Deploy Token en GitLab

> **Disclaimer:** Esta sección fue escrita describiendo los pasos de acuerdo a la fecha en la que fue redactada, pueden existir diferencias de acuerdo a la fecha en la que esté leyendo esto.

Pasos:
1. En la raíz de proyecto ir a **Settings** --> **Repository**
2. En la sección de **Deploy tokens** --> **add token**
3. En **Name** y **Username** colocar **puyu-backend**
4. Coloque la fecha de expiración que considere prudente
5. Seleccionar el **scope** de **read_registry**
6. Guardar el token y copiarlo en un lugar seguro

### Usar el token generado para realizar login

```sh
# Esto es un ejemplo no es el valor del token real
echo gldt-pyWxxxxxxxxxL3n7  | docker login registry.gitlab.com -u puyu-backend --password-stdin
```
De esta forma ya podrá realizar **pull** de las imagenes alojadas en el Container Registry del repositorio.
