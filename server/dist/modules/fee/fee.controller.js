"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeController = void 0;
const fee_service_1 = require("./fee.service");
const apiResponse_1 = require("../../shared/utils/apiResponse");
class FeeController {
}
exports.FeeController = FeeController;
_a = FeeController;
FeeController.pay = async (req, res) => {
    const adminId = req.user?._id;
    if (!adminId) {
        return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }
    const id = req.params.id;
    const { notes } = req.body;
    try {
        const installment = await fee_service_1.FeeService.payInstallment(id, notes, adminId);
        if (!installment) {
            return (0, apiResponse_1.sendError)(res, 'Installment not found', 404, 'NOT_FOUND');
        }
        return (0, apiResponse_1.sendSuccess)(res, installment, 'Installment payment recorded successfully');
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, error.message || 'Payment execution failed', 400);
    }
};
FeeController.getStudentInstallments = async (req, res) => {
    const studentId = req.params.studentId;
    const installments = await fee_service_1.FeeService.getStudentInstallments(studentId);
    return (0, apiResponse_1.sendSuccess)(res, installments, 'Installments list fetched successfully');
};
FeeController.report = async (req, res) => {
    const reportData = await fee_service_1.FeeService.getFeeReport(req.query);
    return (0, apiResponse_1.sendSuccess)(res, reportData, 'Fee collection report generated successfully');
};
FeeController.getOverdue = async (req, res) => {
    const overdueList = await fee_service_1.FeeService.getOverdueInstallments();
    return (0, apiResponse_1.sendSuccess)(res, overdueList, 'Overdue installments fetched successfully');
};
FeeController.getAllStudentsFeeBoard = async (req, res) => {
    const { class: className, section, search } = req.query;
    const studentFeeBoard = await fee_service_1.FeeService.getAllStudentsWithFeeStatus({
        class: className,
        section,
        search,
    });
    return (0, apiResponse_1.sendSuccess)(res, studentFeeBoard, 'Student fee board list fetched successfully');
};
FeeController.sendManualReminder = async (req, res) => {
    const id = req.params.id;
    const result = await fee_service_1.FeeService.sendManualFeeReminder(id);
    return (0, apiResponse_1.sendSuccess)(res, result, 'Fee reminder sent successfully');
};
//# sourceMappingURL=fee.controller.js.map