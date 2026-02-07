import { PartialType } from "@nestjs/mapped-types";
import { CreateSimCardDto } from "./create-sim-card.dto";

export class UpdateSimCardDto extends PartialType(CreateSimCardDto) {}
