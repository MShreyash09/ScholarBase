/**
 * Mirrors the first line of src/main.ts. class-transformer's @Type decorator
 * reads design-time type metadata via Reflect.getMetadata, which only exists
 * once this polyfill is loaded — without it, importing any DTO throws.
 */
import "reflect-metadata";
