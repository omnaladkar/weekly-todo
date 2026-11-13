import { config } from '../config.js';
import { createBlobRepository } from './blobRepository.js';
import { createFileRepository } from './fileRepository.js';
import { createMongoRepository } from './mongoRepository.js';

let repositoryPromise;

export function getRepository() {
  if (!repositoryPromise) {
    repositoryPromise = (
      config.mongoUri
        ? createMongoRepository(config.mongoUri)
        : config.blobConfigured
          ? createBlobRepository()
          : createFileRepository(config.dataDir)
    ).catch((err) => {
      repositoryPromise = null;
      throw err;
    });
  }
  return repositoryPromise;
}
