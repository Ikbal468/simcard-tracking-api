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
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { SimCardService } from "./sim-card.service";
import { CreateSimCardDto } from "./dto/create-sim-card.dto";
import { UpdateSimCardDto } from "./dto/update-sim-card.dto";
import { PaginationDto } from "./dto/pagination.dto";
import { ChangeCustomerDto } from "./dto/change-customer.dto";

@Controller("simCards")
export class SimCardController {
  constructor(private readonly svc: SimCardService) {}

  @Post()
  create(@Body() body: CreateSimCardDto) {
    return this.svc.create(body as any);
  }

  @Post("import")
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
  list() {
    return this.svc.findAll();
  }

  @Post("paginate")
  paginate(@Body() body: PaginationDto) {
    const page = body?.page ?? 1;
    const limit = body?.limit ?? 10;
    return this.svc.findPaginated(Number(page), Number(limit));
  }

  @Get("summary")
  summary() {
    return this.svc.summary();
  }

  @Get(":id")
  one(@Param("id") id: string) {
    return this.svc.findOne(Number(id));
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateSimCardDto,
  ) {
    return this.svc.update(id, body as any);
  }

  @Patch(":id/change-customer")
  changeCustomer(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: ChangeCustomerDto,
  ) {
    return this.svc.changeCustomer(id, body?.customerId ?? null);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
