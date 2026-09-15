# Server Actions

Aquí vivirán las mutaciones del dominio (`"use server"`):

- reservas públicas
- cambios de estado de citas
- CRUD de servicios, profesionales y horarios
- configuración del salón

Convención: validar con Zod, autorizar con `assertAdminSession` cuando aplique, y persistir solo a través de `lib/data`.
