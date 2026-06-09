import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LeaveService from 'App/Services/LeaveService'
import CreateLeaveRequestValidator from 'App/Validators/CreateLeaveRequestValidator'

export default class LeaveController {
  private leaveService = new LeaveService()

  public async create(ctx: HttpContextContract) {
    const payload = await ctx.request.validate(CreateLeaveRequestValidator)
    const leave = await this.leaveService.createLeaveRequest(ctx.user!.id, payload)

    return ctx.response.created({
      success: true,
      message: 'Leave request submitted successfully',
      data: leave,
    })
  }

  public async index(ctx: HttpContextContract) {
    const page = parseInt(ctx.request.input('page', '1'), 10)
    const limit = parseInt(ctx.request.input('limit', '10'), 10)

    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return ctx.response.badRequest({
        success: false,
        message: 'Invalid pagination parameters. Page and limit must be greater than 0.',
      })
    }

    const leaves = await this.leaveService.listLeaves(ctx.user!, page, limit)
    
    const serialized = leaves.toJSON()

    return ctx.response.ok({
      success: true,
      message: 'Leave requests retrieved successfully',
      data: serialized.data,
      meta: serialized.meta,
    })
  }

  public async show(ctx: HttpContextContract) {
    const id = parseInt(ctx.params.id, 10)
    if (isNaN(id)) {
      return ctx.response.badRequest({
        success: false,
        message: 'Invalid ID format',
      })
    }
    const leave = await this.leaveService.getLeaveById(ctx.user!, id)

    return ctx.response.ok({
      success: true,
      message: 'Leave request retrieved successfully',
      data: leave,
    })
  }

  public async cancel(ctx: HttpContextContract) {
    const id = parseInt(ctx.params.id, 10)
    if (isNaN(id)) {
      return ctx.response.badRequest({
        success: false,
        message: 'Invalid ID format',
      })
    }
    const leave = await this.leaveService.cancelLeaveRequest(ctx.user!, id)

    return ctx.response.ok({
      success: true,
      message: 'Leave request cancelled successfully',
      data: leave,
    })
  }
}
