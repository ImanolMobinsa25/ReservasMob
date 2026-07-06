/// <reference path="../pb_data/types.d.ts" />
// Antes se pedía el correo del solicitante en el formulario (para un correo de
// confirmación que ya no se envía). Se reemplaza por su Nombre, más útil para
// que RH/Admin identifiquen quién pidió la sala sin depender del email.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("bookings");

  collection.fields.add(new Field({
    type: "text",
    name: "requester_name",
    required: true,
    min: 1,
  }));

  app.save(collection);

  // Rellena registros existentes con el nombre (o correo, si no tiene nombre)
  // del usuario que los creó, para que el campo requerido no quede vacío.
  const bookings = app.findRecordsByFilter("bookings", "requester_name = ''", "", 0, 0);
  for (const booking of bookings) {
    try {
      const requester = app.findRecordById("users", booking.get("requested_by"));
      booking.set("requester_name", requester.get("name") || requester.get("email"));
      app.save(booking);
    } catch (err) {
      console.log("No se pudo rellenar requester_name para", booking.id, err);
    }
  }
}, (app) => {
  const collection = app.findCollectionByNameOrId("bookings");
  collection.fields.removeByName("requester_name");
  app.save(collection);
});
