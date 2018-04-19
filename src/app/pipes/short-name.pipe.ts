import { Pipe, PipeTransform } from '@angular/core';
/*
 * Shortens a name to a certain length and appends "..." infront of it
 * Usage:
 *   value | length:number
 * Example:
 *   {{ "some_very_long_string" | length:7 }}
 *   formats to: some_ve...
*/
@Pipe({name: 'shortname'})
export class ShortNamePipe implements PipeTransform {
  transform(value: string, length: number): string {
  		if(value.length > length-3){
  			return value.slice(0, length-3) + "..."
  		}else{
  			return value;
  		}
  }
}