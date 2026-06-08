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
    const page = ctx.request.input('page', 1)
    const limit = ctx.request.input('limit', 10)
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
    const id = ctx.params.id
    const leave = await this.leaveService.getLeaveById(ctx.user!, id)

    return ctx.response.ok({
      success: true,
      message: 'Leave request retrieved successfully',
      data: leave,
    })
  }

  public async cancel(ctx: HttpContextContract) {
    const id = ctx.params.id
    const leave = await this.leaveService.cancelLeaveRequest(ctx.user!, id)

    return ctx.response.ok({
      success: true,
      message: 'Leave request cancelled successfully',
      data: leave,
    })
  }
}
