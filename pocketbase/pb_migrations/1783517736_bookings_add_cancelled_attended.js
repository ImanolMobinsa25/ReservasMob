/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("bookings");

  collection.fields.add(new Field({ type: "bool", name: "cancelled" }));
  collection.fields.add(new Field({ type: "bool", name: "attended" }));

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("bookings");

  collection.fields.removeByName("cancelled");
  collection.fields.removeByName("attended");

  app.save(collection);
});