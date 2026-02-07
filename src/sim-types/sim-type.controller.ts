import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from "@nestjs/common";
import { SimTypeService } from "./sim-type.service";
import { CreateSimTypeDto } from "./dto/create-sim-type.dto";
import { UpdateSimTypeDto } from "./dto/update-sim-type.dto";

@Controller("simTypes")
export class SimTypeController {
  constructor(private readonly svc: SimTypeService) {}

  @Post()
  create(@Body() body: CreateSimTypeDto) {
    return this.svc.create(body);
  }

  @Get()
  list() {
    return this.svc.findAll();
  }

  @Get(":id")
  one(@Param("id", ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateSimTypeDto,
  ) {
    return this.svc.update(id, body as any);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
