/**
 * Contract source: https://git.io/JTm6U
 */

declare module '@ioc:Adonis/Core/Env' {
  type CustomTypes = typeof import('../env').default

  interface EnvTypes extends CustomTypes {
    [key: string]: never
  }
}
