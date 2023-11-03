
import { connect } from "@dagger.io/dagger"
// initialize Dagger client
connect(async (client) => {

  const database = client.container().from("postgres:16")
  .withEnvVariable("POSTGRES_PASSWORD", "test")
  .withExec(["postgres"])
  .withExposedPort(5432)
  .asService()
  // get reference to the local project
  const source = client.host().directory(".", { exclude: ["node_modules/"]})

  await client.container().from("node:20")
  .withServiceBinding("db", database) // bind database with the name db
  .withEnvVariable("DB_HOST", "db") // db refers to the service binding
  .withEnvVariable("DB_PASSWORD", "test") // password set in db container
  .withEnvVariable("DB_USER", "postgres") // default user in postgres image
  .withEnvVariable("DB_NAME", "postgres") // default db name in postgres image
  .withDirectory("/src", source)
  .withWorkdir("/src")
  .withMountedCache("node_modules", client.cacheVolume("node"))
  .withExec(["npm", "install"])
  .withEnvVariable("ALWAYS_TEST", Date.now().toString())
  .withExec(["npm", "run", "test"]) // execute npm run test
  .stdout()

}, {LogOutput: process.stdout})






