import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { Role, STUDENT_IMPORT_FILE_FIELD } from '@lms/shared';
import type {
  CreatedStudentResponse,
  PaginatedResult,
  StudentDetail,
  StudentImportResult,
} from '@lms/shared';

import { Actor } from '../../../common/decorators/actor.decorator.js';
import { NoStore } from '../../../common/decorators/no-store.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { UuidParam } from '../../../common/decorators/uuid-param.decorator.js';
import { CreateStudentDto, StudentListQueryDto, UpdateStudentDto } from '../dto/admin-users.dto.js';
import { StudentAccountsService } from '../services/student-accounts.service.js';
import { StudentImportService } from '../services/student-import.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { UploadedCsvFile } from '../admin-users.types.js';

/**
 * Studentlar — super admin va admin (docs/12 §2, docs/01 §2.1). Vaqtinchalik parollar qaytadigan
 * javoblar keshlanmaydi. CSV import — `multipart/form-data`, fayl maydoni `file` (hajm — multer
 * limiti, `AdminUsersModule`).
 */
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@Controller('admin/students')
export class AdminStudentsController {
  constructor(
    private readonly students: StudentAccountsService,
    private readonly importer: StudentImportService,
  ) {}

  @Get()
  list(@Query() query: StudentListQueryDto): Promise<PaginatedResult<StudentDetail>> {
    return this.students.list(query);
  }

  @Post()
  @NoStore()
  create(
    @Body() body: CreateStudentDto,
    @Actor() actor: ActorContext,
  ): Promise<CreatedStudentResponse> {
    return this.students.create(body, actor);
  }

  @Post('import')
  @NoStore()
  @UseInterceptors(FileInterceptor(STUDENT_IMPORT_FILE_FIELD))
  import(
    @UploadedFile() file: UploadedCsvFile | undefined,
    @Actor() actor: ActorContext,
  ): Promise<StudentImportResult> {
    return this.importer.import(file, actor);
  }

  @Get(':id')
  get(@UuidParam('id') id: string): Promise<StudentDetail> {
    return this.students.get(id);
  }

  @Patch(':id')
  update(
    @UuidParam('id') id: string,
    @Body() body: UpdateStudentDto,
    @Actor() actor: ActorContext,
  ): Promise<StudentDetail> {
    return this.students.update(id, body, actor);
  }
}
