import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor (protected app: ApplicationContract) {
  }

  public register () {
    this.app.container.bind('App/Repositories/Contracts/UserRepository', () => {
      const { default: UserRepository } = require('../app/Repositories/Lucid/UserRepository')
      return new UserRepository()
    })

    this.app.container.bind('App/Repositories/Contracts/LeaveRequestRepository', () => {
      const { default: LeaveRequestRepository } = require('../app/Repositories/Lucid/LeaveRequestRepository')
      return new LeaveRequestRepository()
    })

    this.app.container.bind('App/Repositories/Contracts/AuditLogRepository', () => {
      const { default: AuditLogRepository } = require('../app/Repositories/Lucid/AuditLogRepository')
      return new AuditLogRepository()
    })
  }

  public async boot () {
  }

  public async ready () {
  }

  public async shutdown () {
  }
}
