import { createClient } from "redis";

export async function publishBuildStatus(id) {
  try {
    const publisher = createClient();
    await publisher.connect();

    // Add the `id` to the "build-queue" list
    await publisher.lPush("build-queue", id);
    console.log(`Pushed ${id} to build-queue`);

    // Set the `id` status as "uploaded" in the "status" hash
    await publisher.hSet("status", id, "uploaded");
    console.log(`Set status of ${id} to "uploaded"`);

    // Disconnect from Redis after operations
    await publisher.quit();
  } catch (error) {
    console.error("Error while publishing:", error);
  }
}

// Example usage with a dynamically generated ID
// const id = 'build_12345';
// publishBuildStatus(id);
