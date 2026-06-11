import type { InferDisksFromConfig } from '@adonisjs/core/build/config'
import type driveConfig from '../config/drive'

declare module '@ioc:Adonis/Core/Drive' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DisksList extends InferDisksFromConfig<typeof driveConfig> {}
}
