/**
 * Contract source: https://git.io/JvgAT
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */

import { DatabaseContract } from '@ioc:Adonis/Lucid/Database'

declare module '@ioc:Adonis/Lucid/Database' {
  interface DatabaseContract {
    hasHealthChecksEnabled: boolean
  }
}
