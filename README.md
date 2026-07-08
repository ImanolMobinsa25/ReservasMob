Sistema de Reservación de Salas de Juntas — Requisitos

1. Salas y catálogo


Registrar las salas disponibles: Sala de juntas F1, F2, F3 (permitir añadir más desde el panel de Admin/AdminVip).
Mostrar siempre la lista de salas disponibles al momento de crear una solicitud (corregir el bug donde no cargan las salas).
Permitir capturar el motivo de la solicitud como texto libre.


2. Roles y permisos


Definir cuatro niveles de rol: AdminVip, Admin, Corporativo, RH.
Permitir a AdminVip:

Ver todos los usuarios registrados en el sistema.
Asignar rol Admin, Corporativo o RH a cualquier usuario.
Otorgar o revocar el rol AdminVip a otros administradores.



Permitir a Admin:

Acceder a todas las funciones del sistema, excepto la asignación de roles.



Permitir a RH:

Ver el panel de solicitudes generadas por usuarios Corporativo.
Abrir el detalle de cada solicitud y consultar el motivo.
Aceptar o rechazar la solicitud, indicando la razón del rechazo.
Recibir notificaciones de toda solicitud nueva, cancelada o rechazada automáticamente (incluyendo el motivo).



Permitir a Corporativo:

Ver el panel de solicitudes.
Crear su propia solicitud y enviarla para aprobación.
Consultar el estado de sus solicitudes (pendiente, aprobada, rechazada) y el motivo en caso de rechazo.





3. Flujo de creación de solicitudes


Solicitar al usuario: sala, motivo, fecha, hora de inicio, hora de finalización, número de personas y correo de contacto.
Mostrar un calendario para seleccionar la fecha y un selector de hora para el horario.
Registrar automáticamente la fecha y hora exacta en que se creó la solicitud (timestamp de creación), para poder determinar cuál solicitud fue hecha primero en caso de conflicto.
Mostrar una alerta al finalizar la creación, indicando que debe estar atento al estado de su solicitud.
Guardar correctamente cada solicitud en PocketBase y reflejarla de inmediato en la vista de solicitudes (corregir el bug donde la solicitud "se genera" pero no aparece ni en la vista ni en PocketBase).


4. Disponibilidad y validaciones


Mostrar en el calendario los días/horarios ya ocupados por sala.
Impedir seleccionar una sala, fecha y horario ya reservados por otro usuario (corregir el bug que permite elegir horarios ya apartados).
Advertir al usuario, si ya existe una solicitud pendiente para el mismo día y sala, que su solicitud podría ser rechazada por haberse hecho después.
Bloquear automáticamente la selección de un día/sala una vez que exista una solicitud aprobada para ese horario.
Rechazar automáticamente las demás solicitudes pendientes que coincidan con el mismo día/sala una vez aprobada una de ellas, registrando el motivo del rechazo automático.


5. Panel de solicitudes


Mostrar en cada solicitud: sala, fecha, horario solicitado, solicitante, motivo, número de personas, hora de creación de la solicitud y estado actual.
Añadir filtros para ver solicitudes por sala y por estado.
Actualizar la vista en tiempo real (o al menos inmediatamente después de la acción) al aceptar o rechazar una solicitud, sin requerir recargar la página (corregir el bug donde hay que refrescar para ver el cambio de estado).


6. Notificaciones


Notificar a RH de toda solicitud nueva recibida.
Notificar a RH de toda solicitud cancelada o rechazada automáticamente, incluyendo el motivo.
Notificar al solicitante cuando su solicitud sea aceptada o rechazada, incluyendo el motivo en caso de rechazo.
Desactivar temporalmente el envío de confirmaciones por correo electrónico (dejarlo pendiente para una siguiente fase, ya que actualmente no funciona) y sustituirlo por la alerta interna dentro del sistema.


7. Autenticación


Corregir el error 400 (Bad Request) en auth-with-password al iniciar sesión y al registrarse.
Agregar atributos autocomplete correctos a los campos de contraseña y correo en los formularios de login y registro.


8. Diseño e identidad visual


Aplicar diseño minimalista en toda la interfaz.
Usar como colores principales el Azul Eléctrico y el Azul Rey.
Incluir un menú hamburguesa con el logo de la empresa (ubicado en Imágenes/Logo).
Incorporar animaciones limpias y sutiles en las transiciones.
Usar iconografía moderna en todo el sistema.


9. Stack técnico


Construir el frontend con React.
Usar PocketBase como backend y base de datos.