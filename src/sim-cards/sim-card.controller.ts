import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { SimCardService } from "./sim-card.service";
import { CreateSimCardDto } from "./dto/create-sim-card.dto";
import { UpdateSimCardDto } from "./dto/update-sim-card.dto";
import { PaginationDto } from "./dto/pagination.dto";
import { ChangeCustomerDto } from "./dto/change-customer.dto";
import { AuthGuard } from "../auth/guards/auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../auth/decorators/permissions.decorator";

@Controller("simCards")
@UseGuards(AuthGuard, PermissionsGuard)
export class SimCardController {
  constructor(private readonly svc: SimCardService) {}

  @Post()
  @RequirePermission("simcards", "create")
  create(@Body() body: CreateSimCardDto) {
    return this.svc.create(body as any);
  }

  @Post("import")
  @RequirePermission("simcards", "create")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ok =
          /xlsx|csv|spreadsheet/i.test(file.mimetype) ||
          /\.(xlsx|csv)$/i.test(file.originalname);

        if (!ok) {
          return cb(
            new BadRequestException("Only .xlsx or .csv files are allowed"),
            false,
          );
        }

        cb(null, true);
      },
    }),
  )
  import(@UploadedFile() file: any) {
    if (!file || !file.buffer) {
      throw new BadRequestException(
        'File is required. Send multipart/form-data with field name "file"',
      );
    }
    return this.svc.importFromExcel(file.buffer);
  }

  @Get()
  @RequirePermission("simcards", "view")
  list() {
    return this.svc.findAll();
  }

  @Post("paginate")
  @RequirePermission("simcards", "view")
  paginate(@Body() body: PaginationDto) {
    const page = body?.page ?? 1;
    const limit = body?.limit ?? 10;
    return this.svc.findPaginated(Number(page), Number(limit));
  }

  @Get("summary")
  @RequirePermission("simcards", "view")
  summary() {
    return this.svc.summary();
  }

  @Get(":id")
  @RequirePermission("simcards", "view")
  one(@Param("id") id: string) {
    return this.svc.findOne(Number(id));
  }

  @Patch(":id")
  @RequirePermission("simcards", "edit")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateSimCardDto,
  ) {
    return this.svc.update(id, body as any);
  }

  @Patch(":id/change-customer")
  @RequirePermission("simcards", "edit")
  changeCustomer(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: ChangeCustomerDto,
  ) {
    return this.svc.changeCustomer(id, body?.customerId ?? null);
  }

  @Delete(":id")
  @RequirePermission("simcards", "delete")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
