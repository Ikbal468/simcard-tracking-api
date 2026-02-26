import { IsArray, ArrayNotEmpty, IsNumber } from "class-validator";

export class UpdateRolePermissionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  permissionIds: number[];
}
