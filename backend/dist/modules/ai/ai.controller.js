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
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const prisma_service_1 = require("../../shared/prisma.service");
let AiController = class AiController {
    constructor(ai, prisma) {
        this.ai = ai;
        this.prisma = prisma;
    }
    roadmap(body) {
        return this.ai.generateRoadmap(body.title);
    }
    async report(userId) {
        const ideas = await this.prisma.idea.findMany({ where: { userId }, include: { tasks: true } });
        const allTasks = ideas.flatMap((i) => i.tasks);
        return this.ai.reviewIdea({ tasks: allTasks });
    }
    async review(ideaId) {
        const idea = await this.prisma.idea.findUniqueOrThrow({ where: { id: ideaId }, include: { tasks: true } });
        return this.ai.reviewIdea(idea);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('roadmap'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "roadmap", null);
__decorate([
    (0, common_1.Get)('report/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "report", null);
__decorate([
    (0, common_1.Post)('review/:ideaId'),
    __param(0, (0, common_1.Param)('ideaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "review", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService, prisma_service_1.PrismaService])
], AiController);
//# sourceMappingURL=ai.controller.js.map