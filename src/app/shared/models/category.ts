export class Category {
  id: number;
  name: string;
  constructor();
  constructor(category?: any) {
    this.id = (category && category.id) || "";
    this.name = (category && category.name) || "";
  }
}
