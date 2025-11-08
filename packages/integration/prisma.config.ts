import { defineConfig } from 'prisma/config';
import { join } from 'node:path';
import 'dotenv/config';

export default defineConfig({
	schema: join('prisma/schema/schema.prisma'),
});
