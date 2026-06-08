import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LeaveService from 'App/Services/LeaveService'
import RejectLeaveValidator from 'App/Validators/RejectLeaveValidator'

export default class ApprovalController {
  private leaveService = new LeaveService()

  public async approve(ctx: HttpContextContract) {
    const id = ctx.params.id
    const leave = await this.leaveService.approveLeaveRequest(ctx.user!.id, id)

    return ctx.response.ok({
      success: true,
      message: 'Leave request approved successfully',
      data: leave,
    })
  }

  public async reject(ctx: HttpContextContract) {
    const id = ctx.params.id
    const payload = await ctx.request.validate(RejectLeaveValidator)
    const leave = await this.leaveService.rejectLeaveRequest(
      ctx.user!.id,
      id,
      payload.rejection_reason
    )

    return ctx.response.ok({
      success: true,
      message: 'Leave request rejected successfully',
      data: leave,
    })
  }
}
