/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");

  // Preferencia de tema (claro/oscuro) ligada a la cuenta, para que se
  // mantenga al iniciar sesión en otro navegador o dispositivo (no solo en
  // el almacenamiento local del navegador actual).
  collection.fields.add(new Field({
    type: "select",
    name: "theme",
    required: false,
    maxSelect: 1,
    values: ["light", "dark"],
  }));

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");

  collection.fields.removeByName("theme");

  app.save(collection);
});
