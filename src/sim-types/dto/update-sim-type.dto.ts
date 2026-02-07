import { PartialType } from "@nestjs/mapped-types";
import { CreateSimTypeDto } from "./create-sim-type.dto";

export class UpdateSimTypeDto extends PartialType(CreateSimTypeDto) {}
