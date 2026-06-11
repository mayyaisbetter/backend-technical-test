import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { inject } from '@adonisjs/fold'
import LeaveService from 'App/Services/LeaveService'
import RejectLeaveValidator from 'App/Validators/RejectLeaveValidator'

@inject()
export default class ApprovalController {
  constructor (private leaveService: LeaveService) {}

  public async approve (ctx: HttpContextContract) {
    const id = parseInt(ctx.params.id, 10)
    if (isNaN(id)) {
      return ctx.response.badRequest({
        success: false,
        message: 'Invalid ID format',
      })
    }
    if (!ctx.user) {
      return ctx.response.unauthorized({
        success: false,
        message: 'Unauthorized: User not found',
      })
    }
    const ipAddress = ctx.request.ip()
    const userAgent = ctx.request.header('user-agent')
    const leave = await this.leaveService.approveLeaveRequest(ctx.user.id, id, { ipAddress, userAgent })

    return ctx.response.ok({
      success: true,
      message: 'Leave request approved successfully',
      data: leave,
    })
  }

  public async reject (ctx: HttpContextContract) {
    const id = parseInt(ctx.params.id, 10)
    if (isNaN(id)) {
      return ctx.response.badRequest({
        success: false,
        message: 'Invalid ID format',
      })
    }
    if (!ctx.user) {
      return ctx.response.unauthorized({
        success: false,
        message: 'Unauthorized: User not found',
      })
    }
    const payload = await ctx.request.validate(RejectLeaveValidator)
    const ipAddress = ctx.request.ip()
    const userAgent = ctx.request.header('user-agent')
    const leave = await this.leaveService.rejectLeaveRequest(
      ctx.user.id,
      id,
      payload.rejection_reason,
      { ipAddress, userAgent }
    )

    return ctx.response.ok({
      success: true,
      message: 'Leave request rejected successfully',
      data: leave,
    })
  }
}
