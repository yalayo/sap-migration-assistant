import { Container, getRandom } from "@cloudflare/containers";

const INSTANCE_COUNT = 3;

// Export the Durable Object class so Wrangler recognizes it
export class Backend extends Container {
	defaultPort = 8080;
	sleepAfter = "1h";
}

// Export the default fetch handler
export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		// Use getRandom to select a container instance
		const containerInstance = getRandom(env.BACKEND, INSTANCE_COUNT);
		return containerInstance.fetch(request);
	},
};