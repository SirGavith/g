export class CustomError extends Error {
    constructor(...message: any[]) {
        super(message.map(m => String(m)).join(' '))
        this.name = this.constructor.name
    }
}