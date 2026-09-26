-- ========================================================
-- ESTRUCTURA DE LA BASE DE DATOS (CREATE TABLES)
-- ========================================================

-- 1. Tabla Rol
CREATE TABLE IF NOT EXISTS public.rol (
    id SERIAL PRIMARY KEY,
    descripcion text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

-- 2. Tabla Usuario
CREATE TABLE IF NOT EXISTS public.usuario (
    id SERIAL PRIMARY KEY,
    nombre varchar(255) NOT NULL,
    correo varchar(255) NOT NULL UNIQUE,
    clave varchar(255) NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now(),
    "rolId" integer REFERENCES public.rol(id) ON DELETE SET NULL
);

-- 3. Tabla Unidad
CREATE TABLE IF NOT EXISTS public.unidad (
    id SERIAL PRIMARY KEY,
    descripcion text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

-- 4. Tabla Tipo Medicion
CREATE TABLE IF NOT EXISTS public.tipo_medicion (
    id SERIAL PRIMARY KEY,
    nombre varchar(255) NOT NULL,
    formato varchar(255),
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now(),
    "unidadId" integer REFERENCES public.unidad(id) ON DELETE SET NULL
);

-- 5. Tabla Estacion
CREATE TABLE IF NOT EXISTS public.estacion (
    id SERIAL PRIMARY KEY,
    numero_serie varchar(255) NOT NULL,
    modelo varchar(255) NOT NULL,
    descripcion text NOT NULL,
    latitud varchar(255) NOT NULL,
    longitud varchar(255) NOT NULL,
    variables text NOT NULL,
    estado integer NOT NULL DEFAULT 0,
    informacion_adicional text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

-- 6. Tabla Medicion
CREATE TABLE IF NOT EXISTS public.medicion (
    id SERIAL PRIMARY KEY,
    valor double precision,
    created_at_label timestamp NOT NULL DEFAULT now(),
    created_at timestamp NOT NULL DEFAULT now(),
    "tipoMedicionId" integer REFERENCES public.tipo_medicion(id) ON DELETE SET NULL,
    "estacionId" integer REFERENCES public.estacion(id) ON DELETE CASCADE
);

-- 7. Tabla Medicion Historico
CREATE TABLE IF NOT EXISTS public.medicion_historico (
    id SERIAL PRIMARY KEY,
    valor double precision,
    created_at timestamp NOT NULL DEFAULT now(),
    fecha_paso_historico timestamp NOT NULL DEFAULT now(),
    "tipoMedicionId" integer REFERENCES public.tipo_medicion(id) ON DELETE SET NULL,
    "estacionId" integer REFERENCES public.estacion(id) ON DELETE CASCADE
);

-- 8. Tabla Informe
CREATE TABLE IF NOT EXISTS public.informe (
    id SERIAL PRIMARY KEY,
    informacion_adicional text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now(),
    "usuarioId" integer REFERENCES public.usuario(id) ON DELETE SET NULL
);

-- 9. Tabla Informe Estacion
CREATE TABLE IF NOT EXISTS public.informe_estacion (
    id SERIAL PRIMARY KEY,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now(),
    "informeId" integer REFERENCES public.informe(id) ON DELETE CASCADE,
    "estacionId" integer REFERENCES public.estacion(id) ON DELETE CASCADE
);

-- ========================================================
-- DATOS INICIALES (INSERT STATEMENTS)
-- ========================================================

INSERT INTO public.rol (descripcion, created_at, updated_at) VALUES
('Administrador', now(), now()),
('Usuario', now(), now());

INSERT INTO public.usuario (nombre, correo, clave, activo, created_at, updated_at, "rolId") VALUES
('admin.em@gmail.com', 'admin.em@gmail.com', 'D@N1l01995P1', true, now(), now(), 1);

INSERT INTO public.unidad (id, descripcion, created_at, updated_at) VALUES
(1, 'm/s', '2025-02-03 06:08:28.487986', '2025-02-03 06:08:28.487986'),
(2, 'mW/cm²', '2025-02-03 06:08:28.487986', '2025-02-03 06:08:28.487986'),
(3, '%', '2025-02-03 06:08:28.487986', '2025-02-03 06:08:28.487986'),
(4, 'hPa', '2025-02-03 06:08:28.487986', '2025-02-03 06:08:28.487986'),
(5, '°C', '2025-02-03 06:08:28.487986', '2025-02-03 06:08:28.487986'),
(6, 'msn', '2025-02-03 06:08:28.487986', '2025-02-03 06:08:28.487986'),
(7, 'COV', '2025-02-03 06:08:28.487986', '2025-02-03 06:08:28.487986');

SELECT setval('public.unidad_id_seq', (SELECT MAX(id) FROM public.unidad));

INSERT INTO public.tipo_medicion (id, nombre, formato, created_at, updated_at, "unidadId") VALUES
(1, 'Velocidad Viento', '%08d', '2025-02-03 06:08:28.487986', '2025-02-03 06:08:28.487986', 1),
(2, 'Radiación', '%08d', '2025-02-03 06:08:28.487986', '2025-02-03 06:08:28.487986', 2),
(3, 'Humedad Relativa', '%015.6f', '2025-02-03 06:08:28.487986', '2025-02-03 06:08:28.487986', 3),
(4, 'Presión', '%08d', '2025-02-03 06:08:28.487986', '2025-02-03 06:08:28.487986', 4),
(5, 'Temperatura', '%015.6f', '2025-02-03 06:08:28.487986', '2025-02-03 06:08:28.487986', 5),
(6, 'Altitud', '%08d', '2025-02-03 06:08:28.487986', '2025-02-03 06:08:28.487986', 6),
(7, 'Calidad Aire', '%015.6f', '2025-02-03 06:08:28.487986', '2025-02-03 06:08:28.487986', 7);

SELECT setval('public.tipo_medicion_id_seq', (SELECT MAX(id) FROM public.tipo_medicion));

INSERT INTO public.estacion (numero_serie, modelo, descripcion, latitud, longitud, variables, estado, informacion_adicional, created_at, updated_at) VALUES
('2232330000888802', '2232330000888802', '2232330000888802', '0.5', '0.5', '', 1, '', now(), now());