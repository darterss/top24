"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdeasController = void 0;
const common_1 = require("@nestjs/common");
const ideas_service_1 = require("./ideas.service");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class TaskItemDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TaskItemDto.prototype, "title", void 0);
class CreateIdeaDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIdeaDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIdeaDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIdeaDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TaskItemDto),
    __metadata("design:type", Array)
], CreateIdeaDto.prototype, "tasks", void 0);
class UpdateTaskDto {
}
__decorate([
    (0, class_validator_1.IsIn)(['TODO', 'IN_PROGRESS', 'DONE']),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "status", void 0);
let IdeasController = class IdeasController {
    constructor(ideasService) {
        this.ideasService = ideasService;
    }
    create(dto) {
        const tasks = (dto.tasks ?? []).map((t, idx) => ({ index: idx + 1, title: t.title }));
        return this.ideasService.createIdea(dto.userId, dto.title, dto.description, tasks);
    }
    list(userId) {
        return this.ideasService.listIdeas(userId);
    }
    updateTask(taskId, dto) {
        return this.ideasService.updateTaskStatus(taskId, dto.status);
    }
};
exports.IdeasController = IdeasController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateIdeaDto]),
    __metadata("design:returntype", void 0)
], IdeasController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IdeasController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)('task/:taskId'),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateTaskDto]),
    __metadata("design:returntype", void 0)
], IdeasController.prototype, "updateTask", null);
exports.IdeasController = IdeasController = __decorate([
    (0, common_1.Controller)('ideas'),
    __metadata("design:paramtypes", [ideas_service_1.IdeasService])
], IdeasController);
//# sourceMappingURL=ideas.controller.js.map