export class FieldInfo {
    constructor() {
        this.Floor = 1;
        this.Name = "Test";
    }

    get id() {
        return this.Floor + '-' + this.Name;
    }
}