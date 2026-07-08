/// <reference path="../pb_data/types.d.ts" />
// El solicitante ahora puede hacer update para cancelar su reserva (cancelled)
// y confirmar asistencia (attended). La validación fina se delega al hook
// onRecordUpdateRequest en pb_hooks/bookings.pb.js.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("bookings");

  collection.updateRule =
    "@request.auth.role = 'rh' || requested_by = @request.auth.id";

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("bookings");

  collection.updateRule = "@request.auth.role = 'rh'";

  app.save(collection);
});