/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("amd8yyqz2vl1e21")

  collection.name = "posts"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("amd8yyqz2vl1e21")

  collection.name = "todos"

  return dao.saveCollection(collection)
})
