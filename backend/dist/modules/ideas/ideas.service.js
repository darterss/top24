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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdeasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma.service");
let IdeasService = class IdeasService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    createIdea(userId, title, description, tasks) {
        return this.prisma.idea.create({
            data: {
                title,
                description,
                userId,
                tasks: {
                    create: tasks.map((t) => ({ index: t.index, title: t.title })),
                },
            },
            include: { tasks: true },
        });
    }
    listIdeas(userId) {
        return this.prisma.idea.findMany({ where: { userId }, include: { tasks: true } });
    }
    updateTaskStatus(taskId, status) {
        return this.prisma.task.update({ where: { id: taskId }, data: { status } });
    }
};
exports.IdeasService = IdeasService;
exports.IdeasService = IdeasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IdeasService);
//# sourceMappingURL=ideas.service.js.map