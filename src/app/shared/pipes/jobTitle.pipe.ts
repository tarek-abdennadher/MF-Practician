import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "JobTitle"
})
export class JobtitlePipe implements PipeTransform {
    transform(value: string, args?: any): string {
        return value === "Monsieur"
            ? "M"
            : value === "Madame"
                ? "Mme"
                : value === "Docteur"
                    ? "Dr"
                    : value === "Professeur"
                        ? "Pr"
                        : "";
    }
}
